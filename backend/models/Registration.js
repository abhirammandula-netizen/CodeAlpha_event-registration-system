const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    user_email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate registrations for same event + email
RegistrationSchema.index({ user_email: 1, event_id: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
