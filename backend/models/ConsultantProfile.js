const mongoose = require("mongoose");

const consultantProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        expertise: {
            type: [String],
            default: []
        },

        experience: {
            type: String,
            trim: true,
            default: ""
        },

        hourlyRate: {
            type: String,
            trim: true,
            default: ""
        },

        location: {
            type: String,
            trim: true,
            default: ""
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        website: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ConsultantProfile",
    consultantProfileSchema
);