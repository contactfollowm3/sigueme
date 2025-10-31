const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Tmer = require('../models/tmer');
const User = require('../models/user');

const UserCtrl = require('../controllers/user');

router.get('/secret', UserCtrl.authMiddleware, function(req, res) {
  res.json({"secret": true});
});

// Manage endpoint
router.get('/manage', UserCtrl.authMiddleware, function (req, res) {
  const user = res.locals.user;
  Tmer.where({ user })
    .populate('bookings')
    .exec()
    .then(foundTmers => {
      return res.json(foundTmers);
    })
    .catch(err => {
      return res.status(422).json({ error: 'Validation Error', details: err.message });
    });
});



router.get('/:id/verify-user', UserCtrl.authMiddleware, function (req, res) {
  const user = res.locals.user;

  Tmer
    .findById(req.params.id)
    .populate('user')
    .exec()
    .then(foundTmer => {
      if (!foundTmer) {
        return res.status(422).json({ error: 'Could not find Tmer' });
      }
      if (foundTmer.user.id !== user.id) {
        return res.status(422).json({ error: 'Invalid User!', details: 'You are not the Tmer owner' });
      }

      return res.json({ status: 'verified' });
    })
    .catch(err => {
      return res.status(500).json({ error: 'Server error', details: err.message });
    });
});



router.get('/:id', async function (req, res) {
  try {
    const tmerId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(tmerId)) {
      return res.status(400).json({ error: 'Invalid Tmer ID' });
    }

    const foundTmer = await Tmer.findById(tmerId, '-bookings')
      .populate('user', 'username -_id')
      .populate({
        path: 'bookings',
        select: 'startAt endAt -_id',
      })
      .exec();

    if (!foundTmer) {
      return res.status(404).json({ error: 'Could not find Tmer' });
    }

    // Extract bookings, createdAt, and other fields
    const { bookings, createdAt, ...rest } = foundTmer._doc;

    // Create a new response structure
    const response = {
      bookings: bookings,
      createdAt: createdAt,
      ...rest,
    };

    return res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/:id', UserCtrl.authMiddleware, async function (req, res) {
  const tmerData = req.body;
  const user = res.locals.user;

  try {
    const foundTmer = await Tmer.findById(req.params.id).populate('user').exec();

    if (!foundTmer) {
      return res.status(422).json({ error: 'Tmer not found' });
    }
    if (foundTmer.user.id !== user.id.toString()) {
      return res.status(422).json({ error: 'Invalid User!', details: 'You are not the Tmer owner' });
    }

    foundTmer.set(tmerData);

    await foundTmer.save();
    return res.status(200).send(foundTmer);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.delete('/:id', UserCtrl.authMiddleware, function (req, res) {
  const user = res.locals.user;
  Tmer.findById(req.params.id)
    .populate('user') // Populate the user field
    .populate({
      path: 'bookings',
      select: 'startAt',
      match: { startAt: { $gt: new Date() } }
    })
    .exec()
    .then(foundTmer => {
      if (!foundTmer) {
        return res.status(404).json({ error: 'Tmer not found' });
      }

      // Check if user is not present or if user.id is undefined
      if (!foundTmer.user || !foundTmer.user.id) {
        return res.status(422).json({ error: 'Invalid User!', details: 'User information is missing or invalid' });
      }

      if (user.id !== foundTmer.user.id.toString()) { // Ensure to convert user.id to string for comparison
        return res.status(422).json({ error: 'Invalid User!', details: 'You are not the Tmer owner' });
      }

      if (foundTmer.bookings.length > 0) {
        return res.status(422).json({ error: 'Active bookings!', details: 'Cannot delete Tmer with active bookings!' });
      }

      // Remove the tmer document
      return foundTmer.deleteOne()
        .then(() => {
          return res.status(200).json({ message: 'Tmer deleted successfully' });
        })
        .catch(err => {
          throw err;
        });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.post('', UserCtrl.authMiddleware, function (req, res) {
  const { title, city, street, category, image, shared, bedrooms, description, dailyRate } = req.body;
  const user = res.locals.user;

  const tmer = new Tmer({ title, city, street, category, image, shared, bedrooms, description, dailyRate });
  tmer.user = user;

  Tmer.create(tmer)
    .then(newTmer => {
      // Update the user's tmers
      return User.updateOne({ _id: user.id }, { $push: { tmers: newTmer._id }})
        .then(() => {
          return res.json(newTmer);
        })
        .catch(err => {
          throw err; // handle the error here or log it
        });
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        return res.status(422).json({ error: 'Validation Error' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.get('', async function (req, res) {
  try {
    const city = req.query.city;
    const query = city ? { city: city.toLowerCase() } : {};

    const foundTmers = await Tmer.find(query).select('-booking').exec();

    if (city && foundTmers.length === 0) {
      return res.status(404).json({
        title: 'Could not find Tmers',
        detail: `There are no Tmers for city ${city}`,
      });
    }

    return res.json(foundTmers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}); 

module.exports = router;


