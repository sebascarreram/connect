const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// ROUTES

// SIGNUP
// router.route('/signup').post(authController.signup);
// When there is only a post, it can use only .post() without .route() so like down:
router.post('/signup', authController.signup);
//
// LOGIN
router.post('/login', authController.login);

// Forgot Password
// Which will only receive the email address
router.post('/forgotPassword', authController.forgotPassword);

// Reset Password
// Which will receive the token as well as the new password
router.patch('/resetPassword/:token', authController.resetPassword);

// Updating Password
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);
// Updating my data personal
router.patch('/updateMe', authController.protect, userController.updateMe);

router.delete('/deleteMe', authController.protect, userController.deleteMe);

// It also keep these routes here down so the ones in a more REST format
// Because there's also the possibility of a system administrator updating or
// deleting or getting all users based on their ID.
router
  .route('/')
  .get(userController.getAllUsers) // Get all users
  .post(userController.createUser); // Create a user

router
  .route('/:id')
  .get(userController.getUser) // Get an users by ID
  .patch(userController.updateUser) // Update a user by ID
  .delete(userController.deleteUser); // Delete a user by ID

module.exports = router;
