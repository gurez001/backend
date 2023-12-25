const express = require('express');
const { isAuthenticatedUser, authorizeRols } = require('../middleware/auth');
const { proccessPayment, paymentApiKey, paymentVerification, payentDataApi} = require('../controllers/paymentControler');
const router = express.Router();

router.route('/payment/process').post(proccessPayment)
router.route('/paymentverification').post(paymentVerification)
router.route('/getkey').get(isAuthenticatedUser, authorizeRols("admin"), paymentApiKey)
router.route('/paymentData').post(payentDataApi)
// router.route('/stripeapikey').get(isAuthenticatedUser,sendApi)

module.exports = router;