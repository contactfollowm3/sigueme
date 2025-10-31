const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  rating: { 
    type: Number, 
    required: [true, 'Rating is required'],
    min: [1, 'Rating cannot be less than 1'],
    max: [5, 'Rating cannot be greater than 5'],
    validate: {
      validator: function(v) {
        // Allow whole and half numbers (1, 1.5, 2, 2.5, etc.)
        return v >= 1 && v <= 5 && (v % 0.5 === 0);
      },
      message: props => `${props.value} is not a valid rating. Must be between 1 and 5 in 0.5 increments`
    }
  },
  text: { 
    type: String, 
    required: [true, 'Review text is required'],
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  tmer: { 
    type: Schema.Types.ObjectId, 
    ref: 'Tmer',
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add any virtuals or methods if needed
reviewSchema.virtual('formattedRating').get(function() {
  return this.rating.toFixed(1); // Formats rating to 1 decimal place
});

// Add indexes if needed
reviewSchema.index({ user: 1, tmer: 1 }, { unique: false });

module.exports = mongoose.model('Review', reviewSchema);