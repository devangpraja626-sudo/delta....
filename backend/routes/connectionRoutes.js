const express = require("express");

const {
    discoverUsers,
    sendRequest,
    getConnections,
    acceptRequest,
    rejectRequest
} = require("../controllers/connectionController");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const router = express.Router();


// Discover
router.get(
    "/discover",
    authMiddleware,
    discoverUsers
);


// My connections
router.get(
    "/",
    authMiddleware,
    getConnections
);


// Send request
router.post(
    "/request/:userId",
    authMiddleware,
    sendRequest
);


// Accept
router.put(
    "/:id/accept",
    authMiddleware,
    acceptRequest
);


// Reject
router.put(
    "/:id/reject",
    authMiddleware,
    rejectRequest
);


module.exports = router;