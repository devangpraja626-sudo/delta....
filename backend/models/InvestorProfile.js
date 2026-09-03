const mongoose = require("mongoose");

const investorProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        firmName: {
            type: String,
            trim: true,
            default: ""
        },

        investmentFocus: {
            type: String,
            trim: true,
            default: ""
        },

        industries: {
            type: [String],
            default: []
        },

        ticketSize: {
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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "InvestorProfile",
    investorProfileSchema
);