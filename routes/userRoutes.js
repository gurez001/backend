const express = require('express');
const { singupUser,
    loginUser,
    logOut,
    // forgotPassword,
    resetPassword,
    getUserDetails,
    updateUserPassword,
    updateUserProfile,
    getSingleUsers,
    getAllUsers,
    updateAdminUserRole,
    deleteAdminUserRole,
    otpVerification,
    reSendOtp,
    forgotPassword,
    changePassword
} = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRols } = require('../middleware/auth');
const upload = require('../middleware/multer');
const router = express.Router();


router.route('/register').post(upload.single('avatar'),singupUser)

router.route('/login').post(loginUser)
router.route('/otp').put(otpVerification)
router.route('/resend-otp').post(reSendOtp)

router.route('/logout').get(logOut)

router.route('/password/reset/:token').put(changePassword)
router.route('/profie').get(isAuthenticatedUser, getUserDetails)

router.route('/password/forgot').post(forgotPassword)
// router.route('/password/forgot/:token').put(changePassword)




router.route('/password/update').put(isAuthenticatedUser, updateUserPassword)

router.route('/profile/update').put(isAuthenticatedUser,upload.single('avatar'), updateUserProfile)

router.route('/admin/users').get(isAuthenticatedUser, authorizeRols('admin'), getAllUsers);

router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRols('admin'), getSingleUsers)
.put(isAuthenticatedUser, authorizeRols('admin'), updateAdminUserRole)
.delete(isAuthenticatedUser, authorizeRols('admin'), deleteAdminUserRole);


module.exports = router;