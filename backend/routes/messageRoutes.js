const express = require("express");

const {
    getConversation,
    sendMessage,
    getMyConversations
} = require("../controllers/messageController");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const router = express.Router();


// Get all my conversations

router.get(
    "/conversations",
    authMiddleware,
    getMyConversations
);


// Get messages with a specific user

router.get(
    "/:userId",
    authMiddleware,
    getConversation
);


// Send message to a specific user

router.post(
    "/:userId",
    authMiddleware,
    sendMessage
);


module.exports = router;