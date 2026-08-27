const User = require("../models/User");

const FounderProfile =
    require("../models/FounderProfile");

const InvestorProfile =
    require("../models/InvestorProfile");

const ConsultantProfile =
    require("../models/ConsultantProfile");


/* ================= CREATE / UPDATE PROFILE ================= */

const saveProfile = async (req, res) => {

    try {

        const userId = req.user.id;

        const user =
            await User.findById(userId);


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        let ProfileModel;


        if (user.role === "founder") {

            ProfileModel =
                FounderProfile;

        } else if (user.role === "investor") {

            ProfileModel =
                InvestorProfile;

        } else if (user.role === "consultant") {

            ProfileModel =
                ConsultantProfile;

        } else {

            return res.status(400).json({
                success: false,
                message: "Invalid user role"
            });
        }


        const profile =
            await ProfileModel.findOneAndUpdate(

                {
                    user: userId
                },

                {
                    user: userId,
                    ...req.body
                },

                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            );


        user.profileCompleted = true;

        await user.save();


        res.json({

            success: true,

            message:
                "Profile saved successfully",

            profile

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to save profile"
        });
    }
};


/* ================= GET MY PROFILE ================= */

const getMyProfile = async (req, res) => {

    try {

        const userId = req.user.id;

        const user =
            await User.findById(userId);


        let ProfileModel;


        if (user.role === "founder") {

            ProfileModel =
                FounderProfile;

        } else if (user.role === "investor") {

            ProfileModel =
                InvestorProfile;

        } else {

            ProfileModel =
                ConsultantProfile;
        }


        const profile =
            await ProfileModel.findOne({
                user: userId
            });


        res.json({

            success: true,

            profile

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Unable to load profile"
        });
    }
};


/* ================= DISCOVER PROFILES ================= */

const getProfiles = async (req, res) => {

    try {

        const {
            role
        } = req.query;


        let profiles;


        if (role === "founder") {

            profiles =
                await FounderProfile
                    .find()
                    .populate(
                        "user",
                        "name email"
                    );

        } else if (role === "investor") {

            profiles =
                await InvestorProfile
                    .find()
                    .populate(
                        "user",
                        "name"
                    );

        } else if (role === "consultant") {

            profiles =
                await ConsultantProfile
                    .find()
                    .populate(
                        "user",
                        "name"
                    );

        } else {

            return res.status(400).json({
                success: false,
                message: "Provide a valid role"
            });
        }


        res.json({

            success: true,

            count: profiles.length,

            profiles

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Unable to load profiles"
        });
    }
};


module.exports = {
    saveProfile,
    getMyProfile,
    getProfiles
};