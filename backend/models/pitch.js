const mongoose = require("mongoose");

const pitchSchema = new mongoose.Schema(
    {
        founder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        startupName: {
            type: String,
            required: true,
            trim: true
        },

        tagline: {
            type: String,
            maxlength: 160,
            default: ""
        },

        problem: {
            type: String,
            required: true
        },

        solution: {
            type: String,
            required: true
        },

        targetMarket: {
            type: String,
            default: ""
        },

        businessModel: {
            type: String,
            default: ""
        },

        traction: {
            type: String,
            default: ""
        },

        fundingStage: {
            type: String,
            enum: [
                "idea",
                "pre-seed",
                "seed",
                "early-stage",
                "growth"
            ],
            default: "idea"
        },

        fundingRequired: {
            type: Number,
            default: 0
        },

        industry: {
            type: String,
            default: ""
        },

        pitchDeckUrl: {
            type: String,
            default: ""
        },

        websiteUrl: {
            type: String,
            default: ""
        },

        isPublished: {
            type: Boolean,
            default: false
        },

        views: {
            type: Number,
            default: 0
        },

        interestedInvestors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        comments: [
            {
                consultant: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },

                text: {
                    type: String,
                    required: true
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },

    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Pitch",
        pitchSchema
    );