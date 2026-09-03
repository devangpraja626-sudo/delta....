const Pitch = require("../models/Pitch");


// ================= CREATE PITCH =================

const createPitch = async (req, res) => {
    try {

        if (req.user.role !== "Founder") {
            return res.status(403).json({
                success: false,
                message: "Only founders can create pitches"
            });
        }

        const {
            title,
            description,
            industry,
            stage,
            fundingRequired,
            website,
            status
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required"
            });
        }

        const pitch = await Pitch.create({
            founder: req.user.id,
            title,
            description,
            industry,
            stage,
            fundingRequired,
            website,
            status: status || "Draft"
        });

        return res.status(201).json({
            success: true,
            message: "Pitch created successfully",
            pitch
        });

    } catch (error) {

        console.error(
            "Create pitch error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to create pitch"
        });
    }
};


// ================= GET MY PITCHES =================

const getMyPitches = async (req, res) => {
    try {

        const pitches = await Pitch.find({
            founder: req.user.id
        }).sort({
            createdAt: -1
        });

        return res.json({
            success: true,
            pitches
        });

    } catch (error) {

        console.error(
            "Get pitches error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch pitches"
        });
    }
};


// ================= GET PUBLISHED PITCHES =================

const getPublishedPitches = async (req, res) => {
    try {

        const pitches = await Pitch.find({
            status: "Published"
        })
        .populate(
            "founder",
            "name email role"
        )
        .sort({
            createdAt: -1
        });

        return res.json({
            success: true,
            pitches
        });

    } catch (error) {

        console.error(
            "Get published pitches error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch pitches"
        });
    }
};


// ================= UPDATE PITCH =================

const updatePitch = async (req, res) => {
    try {

        const pitch = await Pitch.findOne({
            _id: req.params.id,
            founder: req.user.id
        });

        if (!pitch) {
            return res.status(404).json({
                success: false,
                message: "Pitch not found"
            });
        }

        Object.assign(
            pitch,
            req.body
        );

        await pitch.save();

        return res.json({
            success: true,
            message: "Pitch updated successfully",
            pitch
        });

    } catch (error) {

        console.error(
            "Update pitch error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update pitch"
        });
    }
};


// ================= DELETE PITCH =================

const deletePitch = async (req, res) => {
    try {

        const pitch = await Pitch.findOneAndDelete({
            _id: req.params.id,
            founder: req.user.id
        });

        if (!pitch) {
            return res.status(404).json({
                success: false,
                message: "Pitch not found"
            });
        }

        return res.json({
            success: true,
            message: "Pitch deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete pitch error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to delete pitch"
        });
    }
};


module.exports = {
    createPitch,
    getMyPitches,
    getPublishedPitches,
    updatePitch,
    deletePitch
};