const express = require("express");

const {
    getMyStartup,
    createOrUpdateStartup
} = require("../controllers/startupController");

const authMiddleware = require("../middleware/authMiddleware");
const founderMiddleware = require("../middleware/founderMiddleware");

const router = express.Router();

router.get(
    "/me",
    authMiddleware,
    founderMiddleware,
    getMyStartup
);

router.put(
    "/me",
    authMiddleware,
    founderMiddleware,
    createOrUpdateStartup
);

module.exports = router;