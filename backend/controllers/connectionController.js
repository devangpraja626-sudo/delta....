const Connection = require("../models/Connection");
const User = require("../models/User");


// ================= DISCOVER USERS =================

const discoverUsers = async (req, res) => {
    try {

        const { role } = req.query;

        const filter = {
            _id: {
                $ne: req.user.id
            }
        };

        if (
            role &&
            ["Founder", "Investor", "Consultant"].includes(role)
        ) {
            filter.role = role;
        }

        const users = await User.find(filter)
            .select("name email role createdAt")
            .sort({
                createdAt: -1
            })
            .limit(100);

        return res.json({
            success: true,
            users
        });

    } catch (error) {

        console.error(
            "Discover users error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to discover users"
        });
    }
};


// ================= SEND REQUEST =================

const sendRequest = async (req, res) => {
    try {

        const receiverId = req.params.userId;

        if (receiverId === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot connect with yourself"
            });
        }

        const receiver = await User.findById(
            receiverId
        );

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const existing = await Connection.findOne({
            $or: [
                {
                    sender: req.user.id,
                    receiver: receiverId
                },
                {
                    sender: receiverId,
                    receiver: req.user.id
                }
            ]
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: `Connection already exists: ${existing.status}`
            });
        }

        const connection = await Connection.create({
            sender: req.user.id,
            receiver: receiverId
        });

        return res.status(201).json({
            success: true,
            message: "Connection request sent",
            connection
        });

    } catch (error) {

        console.error(
            "Send connection error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to send connection request"
        });
    }
};


// ================= MY CONNECTIONS =================

const getConnections = async (req, res) => {
    try {

        const connections = await Connection.find({
            $or: [
                {
                    sender: req.user.id
                },
                {
                    receiver: req.user.id
                }
            ]
        })
        .populate(
            "sender",
            "name email role"
        )
        .populate(
            "receiver",
            "name email role"
        )
        .sort({
            createdAt: -1
        });

        return res.json({
            success: true,
            connections
        });

    } catch (error) {

        console.error(
            "Get connections error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch connections"
        });
    }
};


// ================= ACCEPT REQUEST =================

const acceptRequest = async (req, res) => {
    try {

        const connection = await Connection.findOne({
            _id: req.params.id,
            receiver: req.user.id
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found"
            });
        }

        connection.status = "accepted";

        await connection.save();

        return res.json({
            success: true,
            message: "Connection accepted",
            connection
        });

    } catch (error) {

        console.error(
            "Accept connection error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to accept request"
        });
    }
};


// ================= REJECT REQUEST =================

const rejectRequest = async (req, res) => {
    try {

        const connection = await Connection.findOne({
            _id: req.params.id,
            receiver: req.user.id
        });

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found"
            });
        }

        connection.status = "rejected";

        await connection.save();

        return res.json({
            success: true,
            message: "Connection rejected"
        });

    } catch (error) {

        console.error(
            "Reject connection error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to reject request"
        });
    }
};


module.exports = {
    discoverUsers,
    sendRequest,
    getConnections,
    acceptRequest,
    rejectRequest
};