const founderMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.role !== "Founder") {
        return res.status(403).json({
            success: false,
            message: "Founder access required"
        });
    }

    next();
};

module.exports = founderMiddleware;