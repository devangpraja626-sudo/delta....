const express = require("express");

const {
    createPost,
    getFounderFeed,
    toggleLike,
    getPost
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");
const founderMiddleware = require("../middleware/founderMiddleware");

const router = express.Router();


// Founder Feed
router.get(
    "/feed",
    authMiddleware,
    founderMiddleware,
    getFounderFeed
);


// Create Post
router.post(
    "/",
    authMiddleware,
    founderMiddleware,
    createPost
);


// Like / Unlike
router.post(
    "/:id/like",
    authMiddleware,
    founderMiddleware,
    toggleLike
);


// Get Single Post
router.get(
    "/:id",
    authMiddleware,
    founderMiddleware,
    getPost
);


module.exports = router;