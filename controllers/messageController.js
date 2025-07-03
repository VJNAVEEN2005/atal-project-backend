const Message = require('../models/messageModel');

// Get all messages sorted by order
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ order: 1 });
    // Convert binary images to base64
    const messagesWithPhotos = messages.map(message => {
      if (message.photo && message.photo.data) {
        const base64Image = message.photo.data.toString('base64');
        return {
          ...message._doc,
          photo: `data:${message.photo.contentType};base64,${base64Image}`
        };
      }
      return message;
    });
    
    res.status(200).json({ 
      success: true,
      messages: messagesWithPhotos 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Create new message
exports.createMessage = async (req, res) => {
  try {
    const { name, role, occupation, company, message } = req.body;
    const photo = req.file ? {
      data: req.file.buffer,
      contentType: req.file.mimetype
    } : null;

    // Get current max order value
    const maxOrderMessage = await Message.findOne().sort('-order');
    const newOrder = maxOrderMessage ? maxOrderMessage.order + 1 : 0;

    const newMessage = new Message({
      name,
      role,
      occupation,
      company,
      message,
      photo,
      order: newOrder
    });

    await newMessage.save();
    res.status(201).json({
      success: true,
      message: 'Message created successfully',
      createdMessage: newMessage
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update message
exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, occupation, company, message } = req.body;
    const photo = req.file ? {
      data: req.file.buffer,
      contentType: req.file.mimetype
    } : null;

    const updateData = {
      name,
      role,
      occupation,
      company,
      message,
      ...(photo && { photo })
    };

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      updatedMessage
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Reorder remaining messages
    const remainingMessages = await Message.find().sort({ order: 1 });
    const updateOperations = remainingMessages.map((message, index) => 
      Message.findByIdAndUpdate(message._id, { order: index }, { new: true })
    );

    await Promise.all(updateOperations);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Reorder messages
exports.reorderMessages = async (req, res) => {
  try {
    const { messages } = req.body;
    
    const bulkOps = messages.map(({ _id, order }) => ({
      updateOne: {
        filter: { _id },
        update: { $set: { order } }
      }
    }));

    await Message.bulkWrite(bulkOps);
    res.status(200).json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};