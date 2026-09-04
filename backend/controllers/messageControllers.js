const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");


// ================= GET CONVERSATIONS =================

const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        })
            .populate("participants", "name email role")
            .populate({
                path: "lastMessage",
                select: "sender content createdAt"
            })
            .sort({ updatedAt: -1 });

        return res.json({
            success: true,
            conversations
        });

    } catch (error) {
        console.error("Get conversations error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load conversations"
        });
    }
};


// ================= START CONVERSATION =================

const startConversation = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        if (userId.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot message yourself"
            });
        }

        const otherUser = await User.findById(userId);

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Only founders can use Founder messaging
        if (otherUser.role !== "Founder") {
            return res.status(403).json({
                success: false,
                message: "You can only message founders"
            });
        }

        let conversation = await Conversation.findOne({
            participants: {
                $all: [
                    req.user.id,
                    userId
                ]
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [
                    req.user.id,
                    userId
                ]
            });
        }

        conversation = await Conversation.findById(
            conversation._id
        ).populate(
            "participants",
            "name email role"
        );

        return res.json({
            success: true,
            conversation
        });

    } catch (error) {
        console.error("Start conversation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to start conversation"
        });
    }
};


// ================= GET MESSAGES =================

const getMessages = async (req, res) => {
    try {
        const conversation = await Conversation.findById(
            req.params.id
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        const isParticipant = conversation.participants.some(
            (participant) =>
                participant.toString() === req.user.id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const messages = await Message.find({
            conversation: conversation._id
        })
            .populate("sender", "name email role")
            .sort({ createdAt: 1 });

        return res.json({
            success: true,
            conversation,
            messages
        });

    } catch (error) {
        console.error("Get messages error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load messages"
        });
    }
};


// ================= SEND MESSAGE =================

const sendMessage = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty"
            });
        }

        const conversation = await Conversation.findById(
            req.params.id
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        const isParticipant = conversation.participants.some(
            (participant) =>
                participant.toString() === req.user.id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const message = await Message.create({
            conversation: conversation._id,
            sender: req.user.id,
            content: content.trim()
        });

        conversation.lastMessage = message._id;
        await conversation.save();

        const populatedMessage = await Message.findById(
            message._id
        ).populate(
            "sender",
            "name email role"
        );

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: populatedMessage
        });

    } catch (error) {
        console.error("Send message error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send message"
        });
    }
};


module.exports = {
    getConversations,
    startConversation,
    getMessages,
    sendMessage
};