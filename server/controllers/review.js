const User = require('../models/user');
const Tmer = require('../models/tmer');
const Booking = require('../models/booking');
const Review = require('../models/review');
const moment = require('moment');
const { normalizeErrors } = require('../helpers/mongoose');

exports.createReview = async (req, res) => {
  console.log('[BACKEND - Review Controller] Inside createReview function');
  console.log('[BACKEND - Review Controller] Request body:', req.body);
  console.log('[BACKEND - Review Controller] Request query:', req.query);
  console.log('[BACKEND - Review Controller] User from locals:', res.locals.user);

  try {
    const reviewData = req.body;
    const { bookingId } = req.query;
    const user = res.locals.user;

    if (!reviewData.rating || !reviewData.text) {
     
      return res.status(422).send({
        errors: [{
          title: 'Missing data!',
          detail: 'Please provide both rating and text for the review.'
        }]
      });
    }

    console.log('[BACKEND - Review Controller] Finding booking with ID:', bookingId);
    const foundBooking = await Booking.findById(bookingId)
      .populate({
        path: 'tmer',
        populate: { path: 'user' }
      })
      .populate('review')
      .populate('user');

    if (!foundBooking) {
      
      return res.status(404).send({
        errors: [{
          title: 'Not Found!',
          detail: 'Booking not found.'
        }]
      });
    }

    const { tmer } = foundBooking;
   

    if (tmer.user.id.toString() === user._id.toString()) {
    
      return res.status(422).send({
        errors: [{
          title: 'Invalid User!',
          detail: 'Cannot create review on your own listing.'
        }]
      });
    }

    if (foundBooking.user.id.toString() !== user._id.toString()) {
      
      return res.status(403).send({
        errors: [{
          title: 'Unauthorized!',
          detail: 'Cannot create review for someone else\'s booking.'
        }]
      });
    }

    if (moment().isBefore(moment(foundBooking.endAt))) {
      
      return res.status(422).send({
        errors: [{
          title: 'Invalid Timing!',
          detail: 'You can only review after the booking has ended.'
        }]
      });
    }

    if (foundBooking.review) {

      const existingReview = await Review.findById(foundBooking.review);

      existingReview.text = reviewData.text;
      existingReview.rating = reviewData.rating;
      existingReview.updatedAt = new Date();

      await existingReview.save();

      const populatedReview = await Review.findById(existingReview._id)
        .populate('user', 'username')
        .populate('tmer', 'title');

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        review: populatedReview
      });
    }

    console.log('[BACKEND - Review Controller] Creating a new review');
    const review = new Review({
      ...reviewData,
      user: user._id,
      tmer: tmer._id
    });

    foundBooking.review = review._id;

    await Promise.all([
      review.save(),
      foundBooking.save()
    ]);

    const populatedNewReview = await Review.findById(review._id)
      .populate('user', 'username')
      .populate('tmer', 'title');

    return res.status(201).json({
      success: true,
      review: populatedNewReview
    });

  } catch (err) {
  

    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(422).send({
        errors: normalizeErrors(err.errors)
      });
    }

    return res.status(500).send({
      errors: [{
        title: 'Server Error!',
        detail: err.message || 'Something went wrong. Please try again.'
      }]
    });
  }
};

// Optional: Add this if you want to support GET /reviews with logging
exports.getReviews = async (req, res) => {
  try {
    const { tmerId } = req.query;
    let query = {};

    if (tmerId) {
      query.tmer = tmerId;
      console.log(`Fetching reviews for tmer: ${tmerId}`);
    }

    const reviews = await Review.find(query)
      .populate('user', 'username image')
      .populate('tmer', 'title')
      .sort({ createdAt: -1 });

    return res.json(reviews);

  } catch (err) {
    
    return res.status(500).json({
      errors: [{ title: 'Server Error', detail: 'Failed to fetch reviews' }]
    });
  }
};

const mongoose = require('mongoose');

exports.getTmerRating = async (req, res) => {
  const tmerId = req.params.id;

  // Validate the tmerId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(tmerId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Tmer ID format'
    });
  }

  try {
    const result = await Review.aggregate([
      {
        $match: {
          tmer: new mongoose.Types.ObjectId(tmerId) // Convert string to ObjectId
        }
      },
      {
        $group: {
          _id: null, // Group all documents together
          ratingAvg: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.json({
        success: true,
        ratingAvg: 0,
        reviewCount: 0,
        message: 'No reviews found for this tmer'
      });
    }

    // Round to nearest 0.5 to match your rating validation
    const roundedRating = Math.round(result[0].ratingAvg * 2) / 2;

    return res.json({
      success: true,
      ratingAvg: roundedRating,
      reviewCount: result[0].reviewCount
    });

  } catch (err) {
    
    return res.status(500).json({
      success: false,
      message: 'Error calculating tmer rating',
      error: err.message
    });
  }
};


exports.getTmerRating = async (req, res) => {
  const tmerId = req.params.id;

  // Validate the tmerId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(tmerId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Tmer ID format'
    });
  }

  try {
    const result = await Review.aggregate([
      {
        $match: {
          tmer: new mongoose.Types.ObjectId(tmerId)
        }
      },
      {
        $group: {
          _id: null,
          ratingAvg: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.json({
        success: true,
        ratingAvg: 0,
        reviewCount: 0,
        message: 'No reviews found for this tmer'
      });
    }

    // Round to nearest 0.5 to match your rating validation
    const roundedRating = Math.round(result[0].ratingAvg * 2) / 2;

    return res.json({
      success: true,
      ratingAvg: roundedRating,
      reviewCount: result[0].reviewCount
    });

  } catch (err) {
   
    return res.status(500).json({
      success: false,
      message: 'Error calculating tmer rating',
      error: err.message
    });
  }
};

/* 
exports.getTmerRating = async (req, res) => { 
  const tmerId = req.params.id; 


  Review.aggregate([
    { "$unwind": "$tmer" },
    {
      "$group": {
        "_id": tmerId,
        "ratingAvg": { "$avg": "$rating" },
      }
    }], function (err, result) { 
    if (err) { 
      return res.status(422).send({errors: normalizeErrors(err.errors)}); 
    }
    return res.json(result[0] ['ratingAvg'])
    })
} */