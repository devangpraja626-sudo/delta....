const User = require("../models/User");

const FounderProfile = require(
    "../models/FounderProfile"
);

const InvestorProfile = require(
    "../models/InvestorProfile"
);

const ConsultantProfile = require(
    "../models/ConsultantProfile"
);


// ================= GET PROFILE =================

const getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let profile = null;

        if (user.role === "Founder") {
            profile = await FounderProfile.findOne({
                user: user._id
            });
        }

        if (user.role === "Investor") {
            profile = await InvestorProfile.findOne({
                user: user._id
            });
        }

        if (user.role === "Consultant") {
            profile = await ConsultantProfile.findOne({
                user: user._id
            });
        }

        return res.json({
            success: true,
            user,
            profile
        });

    } catch (error) {

        console.error(
            "Get profile error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch profile"
        });
    }
};


// ================= UPDATE PROFILE =================

const updateProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let ProfileModel;

        if (user.role === "Founder") {
            ProfileModel = FounderProfile;
        }

        if (user.role === "Investor") {
            ProfileModel = InvestorProfile;
        }

        if (user.role === "Consultant") {
            ProfileModel = ConsultantProfile;
        }

        const profile = await ProfileModel.findOneAndUpdate(
            {
                user: user._id
            },
            {
                user: user._id,
                ...req.body
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return res.json({
            success: true,
            message: "Profile updated successfully",
            profile
        });

    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update profile"
        });
    }
};


module.exports = {
    getProfile,
    updateProfile
};