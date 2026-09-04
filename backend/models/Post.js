const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "Idea",
                "Update",
                "Achievement",
                "Question",
                "Opportunity"
            ],
            default: "Idea"
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },

        mediaUrl: {
            type: String,
            trim: true,
            default: ""
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Post", postSchema);