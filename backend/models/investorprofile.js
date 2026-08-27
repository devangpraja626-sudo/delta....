const mongoose = require("mongoose");

const investorProfileSchema = new mongoose.Schema(
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

        organization: {
            type: String,
            default: ""
        },

        location: {
            type: String,
            default: ""
        },

        investorType: {
            type: String,
            enum: [
                "",
                "angel",
                "venture-capital",
                "private-equity",
                "family-office",
                "corporate"
            ],
            default: ""
        },

        industries: [{
            type: String
        }],

        preferredStages: [{
            type: String
        }],

        website: {
            type: String,
            default: ""
        }
    },

    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "InvestorProfile",
        investorProfileSchema
    );