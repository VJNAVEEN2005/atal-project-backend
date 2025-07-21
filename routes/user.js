const express = require('express');
const { registerUser, loginUser, authenticateToken, getUser, updateUser, getProfileImage, deleteProfileImage, uploadProfileImage, uploadMiddleware, getAllUsers, updateAdminStatus, forgotPassword, resetPassword, verifyResetToken, validUserId, getAllTeamMembers, deleteUser, getUsersByDomain } = require('../controllers/userController');
const { getTeamMembers } = require('../controllers/teamController');
const adminAuthentication = require('../middleware/adminAuthentication');
const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/authenticate').post(authenticateToken); // Add this line to define the route for token authentication
router.route('/getUser').post(getUser);
router.route('/updateUser').post(updateUser);
router.route('/uploadProfileImage').post(uploadMiddleware, uploadProfileImage); // Add this line to define the route for updating the profile image
router.route('/deleteProfileImage').post(deleteProfileImage); // Add this line to define the route for deleting the profile image
router.route('/profileImage/:userId').get(getProfileImage); // Add this line to define the route for getting the profile image 

router.route('/getAllUsers').get(getAllUsers);
router.route('/updateAdminStatus').post(updateAdminStatus);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword').post(resetPassword);
router.route('/verifyResetToken').post(verifyResetToken);

router.route('/validUserId/:userId').get(validUserId); // Add this line to define the route for validating user ID

router.route('/teamMembers').get(getAllTeamMembers); // Add this line to define the route for getting team members
router.route('/deleteUser/:userId').delete(adminAuthentication, deleteUser); // Add this line to define the route for deleting a user by ID

router.route('/users/domain/:domain').get(getUsersByDomain); // Add this line to define the route for getting users by domain

module.exports = router;