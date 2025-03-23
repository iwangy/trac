const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    mentorCode: {
      type: String,
      required: function () {
        return this.isNew && this.role === 'mentor';
      },
      validate: {
        validator: async function (v) {
          if (this.role !== 'mentor' || this.isNew) return true;
          if (!process.env.MENTOR_CODE) {
            throw new Error('MENTOR_CODE environment variable is not set');
          }
          return v === process.env.MENTOR_CODE;
        },
        message: 'Invalid mentor code',
      },
    },
    adminCode: {
      type: String,
      required: function () {
        return this.isNew && this.role === 'admin';
      },
      validate: {
        validator: async function (v) {
          if (this.isNew || this.role !== 'admin') return true;
          if (!process.env.ADMIN_CODE) {
            throw new Error('ADMIN_CODE environment variable is not set');
          }
          return v === process.env.ADMIN_CODE;
        },
        message: 'Invalid admin code',
      },
    },
    contactInfo: {
      phone: String,
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
