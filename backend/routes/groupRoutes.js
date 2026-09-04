const express = require("express");

const {
    getGroups,
    createGroup,
    joinGroup,
    getGroup
} = require("../controllers/groupController");

const authMiddleware = require("../middleware/authMiddleware");
const founderMiddleware = require("../middleware/founderMiddleware");

const router = express.Router();


// ================= GET ALL GROUPS =================

router.get(
    "/",
    authMiddleware,
    founderMiddleware,
    getGroups
);


// ================= CREATE GROUP =================

router.post(
    "/",
    authMiddleware,
    founderMiddleware,
    createGroup
);


// ================= JOIN GROUP =================

router.post(
    "/:id/join",
    authMiddleware,
    founderMiddleware,
    joinGroup
);


// ================= GET SINGLE GROUP =================

router.get(
    "/:id",
    authMiddleware,
    founderMiddleware,
    getGroup
);


module.exports = router;