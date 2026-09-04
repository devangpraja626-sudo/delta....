const mongoose = require("mongoose");

const startupSchema = new mongoose.Schema(
    {
        founder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        name: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
        },

        logo: {
            type: String,
            trim: true,
            default: ""
        },

        tagline: {
            type: String,
            trim: true,
            maxlength: 250,
            default: ""
        },

        description: {
            type: String,
            trim: true,
            maxlength: 5000,
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

        foundedYear: {
            type: Number,
            min: 1900,
            max: new Date().getFullYear(),
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Startup", startupSchema);