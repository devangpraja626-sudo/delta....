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

        location: {
            type: String,
            default: ""
        },

        skills: [{
            type: String
        }],

        interests: [{
            type: String
        }],

        startupName: {
            type: String,
            default: ""
        },

        startupStage: {
            type: String,
            enum: [
                "",
                "idea",
                "pre-seed",
                "seed",
                "early-stage",
                "growth"
            ],
            default: ""
        },

        industry: {
            type: String,
            default: ""
        },

        website: {
            type: String,
            default: ""
        },

        lookingFor: [{
            type: String,
            enum: [
                "cofounder",
                "investor",
                "consultant",
                "employees",
                "customers",
                "partnerships",
                "mentors"
            ]
        }]
    },

    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "FounderProfile",
        founderProfileSchema
    );