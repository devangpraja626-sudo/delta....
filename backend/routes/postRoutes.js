const express = require("express");

const {
    createPost,
    getMyPosts,
    getFeed,
    getUserPosts,
    toggleLike,
    deletePost
} = require("../controllers/postController");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const router = express.Router();


// ================= PUBLIC FEED =================

router.get(
    "/feed",
    getFeed
);


// ================= CREATE =================

router.post(
    "/",
    authMiddleware,
    createPost
);


// ================= MY POSTS =================

router.get(
    "/my",
    authMiddleware,
    getMyPosts
);


// ================= USER POSTS =================

router.get(
    "/user/:userId",
    getUserPosts
);


// ================= LIKE / UNLIKE =================

router.post(
    "/:id/like",
    authMiddleware,
    toggleLike
);


// ================= DELETE =================

router.delete(
    "/:id",
    authMiddleware,
    deletePost
);


module.exports = router;