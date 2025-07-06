const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Partner name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Partner type is required'],
    enum: ['Academic', 'Corporate', 'IP Partners', 'Mentors', 'External Investors'],
    default: 'Academic'
  },
  role: {
    type: String,
    trim: true
  },
  expertise: [{
    type: String,
    trim: true
  }],
   companyName: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        // Only validate if website is provided and this is a company type
        if (!v || !['Academic', 'Corporate', 'IP Partners'].includes(this.type)) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid website URL'
    }
  },
  email: {
    type: String,
    validate: {
      validator: function(v) {
        // Only validate if email is provided and this is a person type
        if (!v || ['Academic', 'Corporate', 'IP Partners'].includes(this.type)) return true;
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  linkedin: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(v);
      },
      message: 'Please provide a valid LinkedIn URL'
    }
  },
  details: {
    type: String,
    maxlength: [500, 'Details cannot exceed 500 characters']
  },
  // For companies (Academic, Corporate, IP Partners)
  logo: {
    data: Buffer,
    contentType: String
  },
  // For individuals (Mentors, External Investors)
  photo: {
    data: Buffer,
    contentType: String
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
}, {
  timestamps: true
});

// Index for efficient querying
partnerSchema.index({ type: 1, order: 1 });

// Virtual to determine if this is a company or individual
partnerSchema.virtual('isCompany').get(function() {
  return ['Academic', 'Corporate', 'IP Partners'].includes(this.type);
});

// Pre-save middleware to ensure proper image field
partnerSchema.pre('save', function(next) {
  if (this.isCompany) {
    // For companies, remove photo if exists
    this.photo = undefined;
  } else {
    // For individuals, remove logo if exists
    this.logo = undefined;
  }
  next();
});

module.exports = mongoose.model('Partner', partnerSchema);