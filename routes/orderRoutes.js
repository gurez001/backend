const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRols } = require('../middleware/auth');
const { createOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrders } = require('../controllers/orederController');



router.route('/order/new').post(isAuthenticatedUser,createOrder);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/orders/me').get(isAuthenticatedUser,myOrders);
router.route('/admin/orders').get(isAuthenticatedUser, authorizeRols('admin'), getAllOrders);
router.route('/admin/order/:id').put(isAuthenticatedUser, authorizeRols('admin'), updateOrder)
router.route('/admin/order/:id').delete(isAuthenticatedUser,authorizeRols('admin'), deleteOrders);


module.exports = router