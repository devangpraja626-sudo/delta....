const Post = require("../models/Post");
const User = require("../models/User");


// ================= CREATE POST =================

const createPost = async (req, res) => {
    try {
        const { type, content, mediaUrl } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Post content is required"
            });
        }

        const allowedTypes = [
            "Idea",
            "Update",
            "Achievement",
            "Question",
            "Opportunity"
        ];

        const postType = allowedTypes.includes(type)
            ? type
            : "Idea";

        const post = await Post.create({
            author: req.user.id,
            type: postType,
            content: content.trim(),
            mediaUrl: mediaUrl ? mediaUrl.trim() : ""
        });

        const populatedPost = await Post.findById(post._id)
            .populate("author", "name email role");

        return res.status(201).json({
            success: true,
            message: "Post published successfully",
            post: populatedPost
        });

    } catch (error) {
        console.error("Create post error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to publish post"
        });
    }
};


// ================= FOUNDER FEED =================

const getFounderFeed = async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate("author", "name email role")
            .sort({ createdAt: -1 })
            .limit(100);

        return res.json({
            success: true,
            posts
        });

    } catch (error) {
        console.error("Get founder feed error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load founder feed"
        });
    }
};


// ================= LIKE / UNLIKE =================

const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const userId = req.user.id;

        const alreadyLiked = post.likes.some(
            (user) => user.toString() === userId.toString()
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                (user) => user.toString() !== userId.toString()
            );
        } else {
            post.likes.push(userId);
        }

        await post.save();

        return res.json({
            success: true,
            liked: !alreadyLiked,
            likesCount: post.likes.length
        });

    } catch (error) {
        console.error("Toggle like error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update like"
        });
    }
};


// ================= GET SINGLE POST =================

const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name email role");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        return res.json({
            success: true,
            post
        });