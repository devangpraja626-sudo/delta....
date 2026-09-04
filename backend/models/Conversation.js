const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ]
    },
    {
        timestamps: true
    }
);


// Prevent duplicate 1-to-1 conversations
conversationSchema.index(
    {
        participants: 1
    }
);


module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);