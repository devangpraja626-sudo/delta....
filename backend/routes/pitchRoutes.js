const express = require("express");

const {
    createPitch,
    getMyPitches,
    getPublishedPitches,
    updatePitch,
    deletePitch
} = require("../controllers/pitchController");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const router = express.Router();


// Published pitches
router.get(
    "/published",
    getPublishedPitches
);


// Create pitch
router.post(
    "/",
    authMiddleware,
    createPitch
);


// My pitches
router.get(
    "/my",
    authMiddleware,
    getMyPitches
);


// Update pitch
router.put(
    "/:id",
    authMiddleware,
    updatePitch
);


// Delete pitch
router.delete(
    "/:id",
    authMiddleware,
    deletePitch
);


module.exports = router;