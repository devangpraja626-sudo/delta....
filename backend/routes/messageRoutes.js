const express = require("express");

const {
    getConversations,
    startConversation,
    getMessages,
    sendMessage
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");
const founderMiddleware = require("../middleware/founderMiddleware");

const router = express.Router();


// ================= CONVERSATIONS =================

// Get all conversations
router.get(
    "/conversations",
    authMiddleware,
    founderMiddleware,
    getConversations
);

// Start or open conversation
router.post(
    "/conversations",
    authMiddleware,
    founderMiddleware,
    startConversation
);


// ================= MESSAGES =================

// Get messages in a conversation
router.get(
    "/conversations/:id",
    authMiddleware,
    founderMiddleware,
    getMessages
);

// Send a message
router.post(
    "/conversations/:id",
    authMiddleware,
    founderMiddleware,
    sendMessage
);


module.exports = router;