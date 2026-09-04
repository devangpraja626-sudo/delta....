const mongoose = require("mongoose");

const founderProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        profilePhoto: {
            type: String,
            trim: true,
            default: ""
        },

        startup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Startup",
            default: null
        },

        // Kept for compatibility with the existing Delta system
        startupName: {
            type: String,
            trim: true,
            default: ""
        },

        idea: {
            type: String,
            trim: true,
            default: ""
        },

        industry: {
            type: String,
            trim: true,
            default: ""
        },

        stage: {
            type: String,
            trim: true,
            default: ""
        },

        location: {
            type: String,
            trim: true,
            default: ""
        },

        website: {
            type: String,
            trim: true,
            default: ""
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "FounderProfile",
    founderProfileSchema
);