const mongoose = require("mongoose");

const consultantProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        profilePhoto: {
            type: String,
            default: ""
        },

        headline: {
            type: String,
            maxlength: 120,
            default: ""
        },

        bio: {
            type: String,
            maxlength: 1000,
            default: ""
        },

        professionalTitle: {
            type: String,
            default: ""
        },

        company: {
            type: String,
            default: ""
        },

        location: {
            type: String,
            default: ""
        },

        expertise: [{
            type: String
        }],

        industries: [{
            type: String
        }],

        experienceYears: {
            type: Number,
            min: 0,
            default: 0
        },

        website: {
            type: String,
            default: ""
        },

        linkedin: {
            type: String,
            default: ""
        },

        services: [{
            type: String
        }],

        availableFor: [{
            type: String,
            enum: [
                "feedback",
                "mentoring",
                "strategy",
                "business-consulting",
                "fundraising",
                "marketing",
                "product",
                "technology"
            ]
        }]
    },

    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "ConsultantProfile",
        consultantProfileSchema
    );