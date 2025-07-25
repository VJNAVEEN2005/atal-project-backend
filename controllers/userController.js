const multer = require('multer');
const userModel = require('../models/userModel');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const { resetPasswordMailDesign } = require('../utils/mailStyle');

const JWT_SECRET = process.env.JWT_SECRET;

// Configure multer for memory storage (this stores files in memory as Buffer objects)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB size limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Middleware for image upload
exports.uploadMiddleware = upload.single('profilePhoto');

// Controller function to upload profile image
exports.uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Prepare image data to store in MongoDB
    const imageData = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      fileName: req.file.originalname
    };

    // Update user with the image data
    const updatedUser = await userModel.findByIdAndUpdate(
      _id,
      { profilePhoto: imageData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Don't send the image binary data in the response
    const userResponse = updatedUser.toObject();
    if (userResponse.profilePhoto && userResponse.profilePhoto.data) {
      userResponse.profilePhoto = {
        ...userResponse.profilePhoto,
        data: "Binary data not included in response" // Replace binary data with message
      };
    }

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      user: userResponse
    });

  } catch (err) {
    console.error("Error uploading profile image:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Controller function to get profile image
exports.getProfileImage = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await userModel.findById(userId);

    if (!user || !user.profilePhoto || !user.profilePhoto.data) {
      return res.status(404).json({ success: false, message: "Profile image not found" });
    }

    // Set content type header and send the image data
    res.set('Content-Type', user.profilePhoto.contentType);
    return res.send(user.profilePhoto.data);

  } catch (err) {
    console.error("Error fetching profile image:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Controller function to delete profile image
exports.deleteProfileImage = async (req, res, next) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Update user document to remove the profile photo
    const updatedUser = await userModel.findByIdAndUpdate(
      _id,
      { $unset: { profilePhoto: "" } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error("Error deleting profile image:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const user = req.body;

    const existingUser = await userModel.findOne({ email: user.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    } else {
      const newUser = await userModel.create(user);
      return res.status(201).json({ success: true, message: "User registered successfully", user: newUser });
    }

  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(400).json({ success: false, message: "User not found" });
    } else if (existingUser.password !== password) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    } else {
      // Generate JWT token
      const token = jwt.sign({ id: existingUser._id, name: existingUser.name, email: existingUser.email, admin: existingUser.admin }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({ success: true, message: "Login successful", user: existingUser, token: token });
    }
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

exports.authenticateToken = (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. Token missing." });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add decoded payload to request
    return res.status(200).json({ success: true, message: "Token is valid", user: decoded });

  }
  catch (err) {
    console.error("Error in authenticateToken:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }


};

exports.getUser = async (req, res, next) => {
  try {
    const { _id } = req.body;
    const user = await userModel.findById(_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    } else {
      return res.status(200).json({ success: true, message: "User retrieved successfully", user });
    }
  } catch (err) {
    console.error("Error getting user:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

exports.updateUser = async (req, res, next) => {
  try {
    const { _id, ...updateData } = req.body;

    if (!_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find the user and update with the new data
    const updatedUser = await userModel.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true } // returns the updated document and runs validators
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.find().select('-password -confirmPassword');

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: users
    });
  } catch (err) {
    console.error("Error getting users:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Controller function to get users with pagination
exports.getUsersPaginated = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count of users
    const totalUsers = await userModel.countDocuments();
    
    // Get users for current page
    const users = await userModel.find()
      .select('-password -confirmPassword -profilePhoto')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: users,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalUsers: totalUsers,
        usersPerPage: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage
      }
    });
  } catch (err) {
    console.error("Error getting users with pagination:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Controller function to update admin status
exports.updateAdminStatus = async (req, res, next) => {
  try {
    const { _id, admin } = req.body;

    if (!_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Validate admin value is 0, 1, or 2
    if (![0, 1, 2].includes(admin)) {
      return res.status(400).json({ success: false, message: "Invalid admin level" });
    }

    // Update user admin status
    const updatedUser = await userModel.findByIdAndUpdate(
      _id,
      { admin: admin },
      { new: true, runValidators: true }
    ).select('-password -confirmPassword');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Admin status updated successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error("Error updating admin status:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Controller function to handle forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "15m" });

    const resetLink = `http://aic-project.netlify.app/reset-password/${resetToken}`;

    const htmlContent = resetPasswordMailDesign(resetLink);
    console.log("Reset link:", resetLink);
    console.log("HTML Content:", htmlContent);

    const emailSent = await sendEmail(email, "Reset Your Password", htmlContent);

    if (!emailSent) {
      return res.status(500).json({ success: false, message: "Failed to send email" });
    }

    return res.status(200).json({ success: true, message: "Reset link sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Controller function to reset password using the reset token
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    const userId = decoded.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid token or user" });
    }

    user.password = newPassword; // make sure to hash it before saving
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset token error:", err);
    res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
};

// verify reset token
exports.verifyResetToken = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    return res.status(200).json({ success: true, message: "Token is valid", userId: decoded.id });
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
}


// valid userId which is not the objectId
exports.validUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userModel.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "Valid user ID" });
  } catch (err) {
    console.error("Error validating user ID:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all team members
exports.getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await userModel.find({ domain: 'Team Member' }).select('-password -confirmPassword -profilePhoto');
    if (teamMembers.length === 0) {
      return res.status(404).json({ success: false, message: "No team members found" });
    }
    return res.status(200).json({ success: true, message: "Team members retrieved successfully", teamMembers });
  } catch (err) {
    console.error("Error getting team members:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// Get user by domain
exports.getUsersByDomain = async (req, res) => {
  try {
    const { domain } = req.params;
    const users = await userModel.find({ domain: domain }).select('-password -confirmPassword -profilePhoto');
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found for this domain" });
    }
    return res.status(200).json({ success: true, message: "Users retrieved successfully", users });
  } catch (err) {
    console.error("Error getting users by domain:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get users by domain with pagination
exports.getUsersByDomainPaginated = async (req, res) => {
  try {
    const { domain } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count of users in domain
    const totalUsers = await userModel.countDocuments({ domain: domain });
    
    if (totalUsers === 0) {
      return res.status(404).json({ success: false, message: "No users found for this domain" });
    }

    // Get users for current page
    const users = await userModel.find({ domain: domain })
      .select('-password -confirmPassword -profilePhoto')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: users,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalUsers: totalUsers,
        usersPerPage: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        domain: domain
      }
    });
  } catch (err) {
    console.error("Error getting users by domain with pagination:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Search users with pagination
exports.searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!search || search.trim() === '') {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    // Create search criteria using regex for case-insensitive search
    const searchRegex = new RegExp(search.trim(), 'i');
    const searchCriteria = {
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { domain: { $regex: searchRegex } },
        { userId: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
        { organization: { $regex: searchRegex } },
        { designation: { $regex: searchRegex } }
      ]
    };

    // Get total count of matching users
    const totalUsers = await userModel.countDocuments(searchCriteria);
    
    if (totalUsers === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No users found matching the search criteria",
        searchQuery: search
      });
    }

    // Get users for current page
    const users = await userModel.find(searchCriteria)
      .select('-password -confirmPassword -profilePhoto')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      message: "Users found successfully",
      users: users,
      searchQuery: search,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalUsers: totalUsers,
        usersPerPage: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage
      }
    });
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Advanced search users with filters and pagination
exports.advancedSearchUsers = async (req, res) => {
  try {
    const { 
      search, 
      domain, 
      admin, 
      dateFrom, 
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build search criteria
    let searchCriteria = {};

    // Text search across multiple fields
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      searchCriteria.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { userId: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
        { organization: { $regex: searchRegex } },
        { designation: { $regex: searchRegex } }
      ];
    }

    // Domain filter
    if (domain && domain.trim() !== '') {
      searchCriteria.domain = new RegExp(domain.trim(), 'i');
    }

    // Admin level filter
    if (admin !== undefined && admin !== '') {
      searchCriteria.admin = parseInt(admin);
    }

    // Date range filter
    if (dateFrom || dateTo) {
      searchCriteria.createdAt = {};
      if (dateFrom) {
        searchCriteria.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        searchCriteria.createdAt.$lte = new Date(dateTo);
      }
    }

    // Get total count of matching users
    const totalUsers = await userModel.countDocuments(searchCriteria);
    
    if (totalUsers === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No users found matching the search criteria",
        searchCriteria: {
          search: search || '',
          domain: domain || '',
          admin: admin || '',
          dateFrom: dateFrom || '',
          dateTo: dateTo || ''
        }
      });
    }

    // Build sort criteria
    const sortCriteria = {};
    sortCriteria[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get users for current page
    const users = await userModel.find(searchCriteria)
      .select('-password -confirmPassword -profilePhoto')
      .skip(skip)
      .limit(limit)
      .sort(sortCriteria);

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      message: "Users found successfully",
      users: users,
      searchCriteria: {
        search: search || '',
        domain: domain || '',
        admin: admin || '',
        dateFrom: dateFrom || '',
        dateTo: dateTo || '',
        sortBy: sortBy,
        sortOrder: sortOrder
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalUsers: totalUsers,
        usersPerPage: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage
      }
    });
  } catch (err) {
    console.error("Error in advanced search users:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};