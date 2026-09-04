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


// ================= FOUNDER FEED =================

router.get(
    "/feed",
    authMiddleware,
    founderMiddleware,
    getFounderFeed
);


// ================= CREATE POST =================

router.post(
    "/",
    authMiddleware,
    founderMiddleware,
    createPost
);


// ================= LIKE / UNLIKE =================

router.post(
    "/:id/like",
    authMiddleware,
    founderMiddleware,
    toggleLike
);


// ================= SINGLE POST =================

router.get(
    "/:id",
    authMiddleware,
    founderMiddleware,
    getPost
);


module.exports = router;