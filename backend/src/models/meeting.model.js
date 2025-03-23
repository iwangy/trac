const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
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
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentsPresent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Meeting', meetingSchema);
