const Pitch = require("../models/Pitch");


/* ================= CREATE PITCH ================= */

const createPitch = async (req, res) => {

    try {

        if (req.user.role !== "founder") {

            return res.status(403).json({
                success: false,
                message:
                    "Only founders can create pitches"
            });
        }


        const pitch =
            await Pitch.create({

                founder: req.user.id,

                ...req.body

            });


        res.status(201).json({

            success: true,

            message:
                "Pitch created successfully",

            pitch

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to create pitch"
        });
    }
};


/* ================= GET ALL PUBLISHED PITCHES ================= */

const getPitches = async (req, res) => {

    try {

        const pitches =
            await Pitch
                .find({
                    isPublished: true
                })
                .populate(
                    "founder",
                    "name email"
                )
                .sort({
                    createdAt: -1
                });


        res.json({

            success: true,

            count: pitches.length,

            pitches

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Unable to load pitches"
        });
    }
};


/* ================= MY PITCHES ================= */

const getMyPitches = async (req, res) => {

    try {

        const pitches =
            await Pitch
                .find({
                    founder: req.user.id
                })
                .sort({
                    createdAt: -1
                });


        res.json({

            success: true,

            pitches

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Unable to load your pitches"
        });
    }
};


/* ================= PUBLISH PITCH ================= */

const publishPitch = async (req, res) => {

    try {

        const pitch =
            await Pitch.findOne({
                _id: req.params.id,
                founder: req.user.id
            });


        if (!pitch) {

            return res.status(404).json({
                success: false,
                message: "Pitch not found"
            });
        }


        pitch.isPublished = true;

        await pitch.save();


        res.json({

            success: true,

            message:
                "Pitch published successfully",

            pitch

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Unable to publish pitch"
        });
    }
};


/* ================= ADD CONSULTANT FEEDBACK ================= */

const addFeedback = async (req, res) => {

    try {

        if (req.user.role !== "consultant") {

            return res.status(403).json({
                success: false,
                message:
                    "Only consultants can provide feedback"
            });
        }


        const pitch =
            await Pitch.findById(
                req.params.id
            );


        if (!pitch) {

            return res.status(404).json({
                success: false,
                message: "Pitch not found"
            });
        }


        pitch.comments.push({

            consultant: req.user.id,

            text: req.body.text

        });


        await pitch.save();


        res.json({

            success: true,

            message:
                "Feedback added successfully",

            pitch

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Unable to add feedback"
        });
    }
};


module.exports = {
    createPitch,
    getPitches,
    getMyPitches,
    publishPitch,
    addFeedback
};