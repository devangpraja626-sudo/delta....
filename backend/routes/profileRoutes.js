const express = require("express");

const {
    getProfile,
    updateProfile
} = require("../controllers/profileController");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const router = express.Router();


// Get current user's profile
router.get(
    "/me",
    authMiddleware,
    getProfile
);


// Update current user's profile
router.put(
    "/me",
    authMiddleware,
    updateProfile
);


module.exports = router;