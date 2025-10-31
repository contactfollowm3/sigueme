const User = require('../models/user');
const Booking = require('../models/booking');
const Tmer = require('../models/tmer');
const Payment = require('../models/payment');
const mongoose = require('mongoose');
const { normalizeErrors } = require('../helpers/mongoose'); // Now properly imported

const config = require('../config');
const stripe = require('stripe')(config.STRIPE_SK);

exports.getPendingPayments = async function(req, res) {
    try {
        const user = res.locals.user;

        const foundPayments = await Payment
            .find({ toUser: user })
            .populate({
                path: 'booking',
                populate: { path: 'tmer' }
            })
            .populate('fromUser')
            .exec();

        return res.json(foundPayments);
    } catch (err) {
        return res.status(422).send({
            errors: normalizeErrors(err.errors || err)
        });
    }
}


exports.confirmPayment = async function (req, res) {
    try {
        const payment = await Payment.findById(req.body._id)
            .populate('toUser')
            .populate('booking');

        if (!payment) {
            return res.status(404).send({ errors: [{ title: 'Invalid Data', detail: 'Payment not found.' }] });
        }

       

        if (payment.status !== 'pending') {
            return res.status(400).send({ errors: [{ title: 'Invalid Payment Status', detail: 'Payment is not pending.' }] });
        }

        const charge = await stripe.charges.create({
            amount: payment.booking.totalPrice * 100,
            currency: 'usd',
            customer: req.body.fromStripeCustomerId,
            description: `Payment for booking ID: ${payment.booking._id}`,
        });

        payment.charge = charge;
        payment.status = 'paid';
        await payment.save();

        await Booking.updateOne({ _id: payment.booking._id }, { status: 'active' });

        await User.updateOne({ _id: payment.toUser }, { $inc: { revenue: payment.amount } });

        return res.json({ status: 'paid' });

    } catch (error) {
        
        return res.status(500).send({ errors: [{ title: 'Server Error', detail: error.message }] });
    }
};




exports.declinePayment = async function (req, res) {
    const payment = req.body;
    const { booking } = payment;

    try {
        const deletedBooking = await Booking.deleteOne({ _id: booking._id });
        if (deletedBooking.deletedCount === 0) {
            return res.status(404).send({ errors: [{ title: 'Booking Not Found', detail: 'Could not find the booking to delete.' }] });
        }

        const updatedPayment = await Payment.updateOne({ _id: payment._id }, { status: 'declined' });
        if (updatedPayment.modifiedCount === 0 && updatedPayment.matchedCount > 0) {
            console.warn('Payment status was already declined or not updated.');
        } else if (updatedPayment.matchedCount === 0) {
            return res.status(404).send({ errors: [{ title: 'Payment Not Found', detail: 'Could not find the payment to update.' }] });
        }

        const updatedTmer = await Tmer.updateOne(
            { _id: booking.tmer },
            { $pull: { bookings: booking._id } }
        );
        if (updatedTmer.modifiedCount === 0 && updatedTmer.matchedCount > 0) {
            console.warn('Booking ID was not found in the Tmer\'s bookings array.');
        } else if (updatedTmer.matchedCount === 0) {
            console.warn('Tmer not found for the booking.');
        }

        return res.json({ status: 'declined', bookingStatus: 'deleted' });

    } catch (err) {
        return res.status(422).send({ errors: normalizeErrors(err.errors || err) });
    }
};


