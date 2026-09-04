const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },

        imageUrl: {
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