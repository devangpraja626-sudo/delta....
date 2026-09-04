const Post = require("../models/Post");
const User = require("../models/User");


// ================= CREATE POST =================

const createPost = async (req, res) => {
    try {

        const { content, imageUrl } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Post content is required"
            });
        }

        const post = await Post.create({
            author: req.user.id,
            content: content.trim(),
            imageUrl: imageUrl ? imageUrl.trim() : ""
        });

        await post.populate(
            "author",
            "name role email"
        );

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post
        });

    } catch (error) {

        console.error(
            "Create post error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to create post"
        });
    }
};


// ================= MY POSTS =================

const getMyPosts = async (req, res) => {
    try {

        const posts = await Post.find({
            author: req.user.id
        })
        .populate(
            "author",
            "name role email"
        )
        .sort({
            createdAt: -1
        });

        return res.json({
            success: true,
            posts
        });

    } catch (error) {

        console.error(
            "Get my posts error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch your posts"
        });
    }
};


// ================= PUBLIC FEED =================

const getFeed = async (req, res) => {
    try {

        const posts = await Post.find({})
            .populate(
                "author",
                "name role"
            )
            .sort({
                createdAt: -1
            })
            .limit(30);

        const formattedPosts = posts.map(post => ({
            ...post.toObject(),
            likesCount: post.likes.length
        }));

        return res.json({
            success: true,
            posts: formattedPosts
        });

    } catch (error) {

        console.error(
            "Get feed error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch feed"
        });
    }
};


// ================= USER POSTS =================

const getUserPosts = async (req, res) => {
    try {

        const user = await User.findById(
            req.params.userId
        ).select("name role");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const posts = await Post.find({
            author: user._id
        })
        .populate(
            "author",
            "name role"
        )
        .sort({
            createdAt: -1
        });

        return res.json({
            success: true,
            user,
            posts
        });

    } catch (error) {

        console.error(
            "Get user posts error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch user posts"
        });
    }
};


// ================= LIKE / UNLIKE =================

const toggleLike = async (req, res) => {
    try {

        const post = await Post.findById(
            req.params.id
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const userId = req.user.id.toString();

        const alreadyLiked = post.likes.some(
            id => id.toString() === userId
        );

        if (alreadyLiked) {

            post.likes = post.likes.filter(
                id => id.toString() !== userId
            );

        } else {

            post.likes.push(req.user.id);

        }

        await post.save();

        return res.json({
            success: true,
            liked: !alreadyLiked,
            likesCount: post.likes.length,
            postId: post._id
        });

    } catch (error) {

        console.error(
            "Toggle like error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update like"
        });
    }
};


// ================= DELETE POST =================

const deletePost = async (req, res) => {
    try {

        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            author: req.user.id
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found or not owned by you"
            });
        }

        return res.json({
            success: true,
            message: "Post deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete post error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to delete post"
        });
    }
};


module.exports = {
    createPost,
    getMyPosts,
    getFeed,
    getUserPosts,
    toggleLike,
    deletePost
};