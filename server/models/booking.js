const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  startAt: { type: Date, required: 'Starting date is required' },
  endAt: { type: Date, required: 'Ending date is required' },
  totalPrice: Number,
  hours: Number, // Changed from days to hours
  guests: Number,
  createdAt: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  tmer: { type: Schema.Types.ObjectId, ref: 'Tmer' },
  payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
  status: { type: String, default: 'pending' },
  review: { type: Schema.Types.ObjectId, ref: 'Review' }
});

module.exports = mongoose.model('Booking', bookingSchema);