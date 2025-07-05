const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const stream = require('stream');

let gfs;

mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'tenderFiles'
  });
});

exports.uploadFileStream = (filename, metadata = {}) => {
  return gfs.openUploadStream(filename, {
    ...metadata,
    chunkSizeBytes: 1024 * 255, // Optimal chunk size
  });
};

exports.getFileStream = (fileId) => {
  return gfs.openDownloadStream(fileId);
};

exports.deleteFile = (fileId) => {
  return gfs.delete(fileId);
};

exports.getFileInfo = async (fileId) => {
  const files = await gfs.find({ _id: fileId }).toArray();
  return files[0] || null;
};

// Helper function to convert buffer to stream
exports.bufferToStream = (buffer) => {
  const readable = new stream.PassThrough();
  readable.end(buffer);
  return readable;
};