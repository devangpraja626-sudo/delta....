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


// IMPORTANT:
// Keep /conversations BEFORE /:userId

router.get(
    "/conversations",
    authMiddleware,
    getMyConversations
);


router.get(
    "/:userId",
    authMiddleware,
    getConversation
);


router.post(
    "/:userId",
    authMiddleware,
    sendMessage
);


module.exports = router;