const express = require('express');
const { registerUser, loginUser, getUser, updateUser, getProfileImage, deleteProfileImage, uploadProfileImage, uploadMiddleware } = require('../controllers/userController');
const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser); 
router.route('/getUser').post(getUser);
router.route('/updateUser').post(updateUser);
router.route('/uploadProfileImage').post(uploadMiddleware, uploadProfileImage); // Add this line to define the route for updating the profile image
router.route('/deleteProfileImage').post(deleteProfileImage); // Add this line to define the route for deleting the profile image
router.route('/profileImage/:userId').get(getProfileImage); // Add this line to define the route for getting the profile image 

module.exports = router;