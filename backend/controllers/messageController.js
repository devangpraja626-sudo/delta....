const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Connection = require("../models/Connection");
const User = require("../models/User");


// ================= CHECK ACCEPTED CONNECTION =================

const checkAcceptedConnection = async (
    userA,
    userB
) => {
    return await Connection.findOne({
        status: "accepted",
        $or: [
            {
                sender: userA,
                receiver: userB
            },
            {
                sender: userB,
                receiver: userA
            }
        ]
    });
};


// ================= GET CONVERSATION =================

const getConversation = async (req, res) => {
    try {

        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;

        if (
            currentUserId.toString() ===
            otherUserId.toString()
        ) {
            return res.status(400).json({
                success: false,
                message: "You cannot message yourself"
            });
        }

        const otherUser = await User.findById(
            otherUserId
        ).select("name email role");

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // MUST be connected
        const connection =
            await checkAcceptedConnection(
                currentUserId,
                otherUserId
            );

        if (!connection) {
            return res.status(403).json({
                success: false,
                message:
                    "You must have an accepted connection before messaging this user."
            });
        }

        let conversation =
            await Conversation.findOne({
                participants: {
                    $all: [
                        currentUserId,
                        otherUserId
                    ]
                }
            });

        if (!conversation) {

            conversation =
                await Conversation.create({
                    participants: [
                        currentUserId,
                        otherUserId
                    ]
                });
        }

        const messages =
            await Message.find({
                conversation: conversation._id
            })
            .populate(
                "sender",
                "name role"
            )
            .populate(
                "receiver",
                "name role"
            )
            .sort({
                createdAt: 1
            });

        return res.json({
            success: true,
            conversation,
            user: otherUser,
            messages
        });

    } catch (error) {

        console.error(
            "Get conversation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load conversation"
        });
    }
};


// ================= SEND MESSAGE =================

const sendMessage = async (req, res) => {
    try {

        const currentUserId = req.user.id;
        const receiverId = req.params.userId;

        const { text } = req.body;

        if (
            !text ||
            !text.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty"
            });
        }

        if (
            currentUserId.toString() ===
            receiverId.toString()
        ) {
            return res.status(400).json({
                success: false,
                message: "You cannot message yourself"
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

        // ================= SECURITY CHECK =================
        // User MUST have an accepted connection

        const connection =
            await checkAcceptedConnection(
                currentUserId,
                receiverId
            );

        if (!connection) {
            return res.status(403).json({
                success: false,
                message:
                    "You must have an accepted connection before messaging this user."
            });
        }

        // Find existing conversation

        let conversation =
            await Conversation.findOne({
                participants: {
                    $all: [
                        currentUserId,
                        receiverId
                    ]
                }
            });

        // Create conversation if needed

        if (!conversation) {

            conversation =
                await Conversation.create({
                    participants: [
                        currentUserId,
                        receiverId
                    ]
                });
        }

        // Create message

        const message =
            await Message.create({
                conversation:
                    conversation._id,

                sender:
                    currentUserId,

                receiver:
                    receiverId,

                text:
                    text.trim()
            });

        await message.populate(
            "sender",
            "name role"
        );

        await message.populate(
            "receiver",
            "name role"
        );

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message
        });

    } catch (error) {

        console.error(
            "Send message error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to send message"
        });
    }
};


// ================= GET MY CONVERSATIONS =================

const getMyConversations = async (
    req,
    res
) => {
    try {

        const conversations =
            await Conversation.find({
                participants: req.user.id
            })
            .populate(
                "participants",
                "name email role"
            )
            .sort({
                updatedAt: -1
            });

        return res.json({
            success: true,
            conversations
        });

    } catch (error) {

        console.error(
            "Get conversations error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch conversations"
        });
    }
};


module.exports = {
    getConversation,
    sendMessage,
    getMyConversations
};