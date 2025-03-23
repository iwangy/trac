const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0,
    },
    meetingType: {
      type: String,
      required: true,
    },
    customMeetingType: {
      type: String,
      required: function () {
        return this.meetingType === 'Custom';
      },
    },
    location: {
      type: String,
      default: 'Warehouse',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate duration when checking out
attendanceSchema.pre('save', function (next) {
  if (this.checkOut && this.checkIn) {
    this.duration = Math.round((this.checkOut - this.checkIn) / 1000 / 60); // Convert to minutes
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
