const mongoose = require("mongoose");

const pitchSchema = new mongoose.Schema(
    {
        founder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
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

        fundingRequired: {
            type: String,
            trim: true,
            default: ""
        },

        website: {
            type: String,
            trim: true,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "Draft",
                "Published",
                "Closed"
            ],
            default: "Draft"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Pitch",
    pitchSchema
);