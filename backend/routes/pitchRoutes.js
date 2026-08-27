const express = require("express");

const protect =
    require("../middleware/authMiddleware");

const {
    createPitch,
    getPitches,
    getMyPitches,
    publishPitch,
    addFeedback
} = require("../controllers/pitchController");

const router = express.Router();


router.post(
    "/",
    protect,
    createPitch
);


router.get(
    "/",
    protect,
    getPitches
);


router.get(
    "/my",
    protect,
    getMyPitches
);


router.patch(
    "/:id/publish",
    protect,
    publishPitch
);


router.post(
    "/:id/feedback",
    protect,
    addFeedback
);


module.exports = router;