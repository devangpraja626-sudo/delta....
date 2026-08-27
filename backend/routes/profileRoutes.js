const express = require("express");

const protect =
    require("../middleware/authMiddleware");

const {
    saveProfile,
    getMyProfile,
    getProfiles
} = require("../controllers/profileController");

const router = express.Router();


router.post(
    "/",
    protect,
    saveProfile
);


router.get(
    "/me",
    protect,
    getMyProfile
);


router.get(
    "/discover",
    protect,
    getProfiles
);


module.exports = router;