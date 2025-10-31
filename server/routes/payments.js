const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


const UserCtrl = require('../controllers/user');
const PaymentCtrl = require('../controllers/payment');


router.get('', UserCtrl.authMiddleware, PaymentCtrl.getPendingPayments);
router.post('/accept', UserCtrl.authMiddleware, PaymentCtrl.confirmPayment);
router.post('/decline', UserCtrl.authMiddleware, PaymentCtrl.declinePayment); 

module.exports = router;
