const express = require('express');
const router = express.Router();
const User = require('../controllers/user');
const mongoose = require('mongoose');



router.patch('/:id/password', User.authMiddleware, User.updatePassword);

router.put('/:id', User.authMiddleware, User.updateUser);
router.get('/:id', User.authMiddleware, User.getUser);
        
router.post('/auth', User.auth );

router.post('/register', User.register );

module.exports = router;
