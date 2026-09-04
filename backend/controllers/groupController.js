const Group = require("../models/Group");
const User = require("../models/User");


// ================= GET ALL GROUPS =================

const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({})
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 })
            .limit(100);

        return res.json({
            success: true,
            groups
        });

    } catch (error) {
        console.error("Get groups error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load groups"
        });
    }
};


// ================= CREATE GROUP =================

const createGroup = async (req, res) => {
    try {
        const {
            name,
            category,
            description
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Group name is required"
            });
        }

        if (!category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: "Group category is required"
            });
        }

        const group = await Group.create({
            name: name.trim(),
            category: category.trim(),
            description: description
                ? description.trim()
                : "",
            createdBy: req.user.id,
            members: [req.user.id]
        });

        const populatedGroup = await Group.findById(
            group._id
        )
            .populate(
                "createdBy",
                "name email role"
            )
            .populate(
                "members",
                "name email role"
            );

        return res.status(201).json({
            success: true,
            message: "Group created successfully",
            group: populatedGroup
        });

    } catch (error) {
        console.error("Create group error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create group"
        });
    }
};


// ================= JOIN GROUP =================

const joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(
            req.params.id
        );

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        const alreadyMember = group.members.some(
            member =>
                member.toString() ===
                req.user.id.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: "You are already a member of this group"
            });
        }

        group.members.push(req.user.id);

        await group.save();

        const populatedGroup = await Group.findById(
            group._id
        )
            .populate(
                "createdBy",
                "name email role"
            )
            .populate(
                "members",
                "name email role"
            );

        return res.json({
            success: true,
            message: "Joined group successfully",
            group: populatedGroup
        });

    } catch (error) {
        console.error("Join group error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to join group"
        });
    }
};


// ================= GET SINGLE GROUP =================

const getGroup = async (req, res) => {
    try {
        const group = await Group.findById(
            req.params.id
        )
            .populate(
                "createdBy",
                "name email role"
            )
            .populate(
                "members",
                "name email role"
            );

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        return res.json({
            success: true,
            group
        });

    } catch (error) {
        console.error("Get group error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch group"
        });
    }
};


module.exports = {
    getGroups,
    createGroup,
    joinGroup,
    getGroup
};