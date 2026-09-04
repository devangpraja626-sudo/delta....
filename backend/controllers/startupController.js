const Startup = require("../models/Startup");

const getMyStartup = async (req, res) => {
    try {
        const startup = await Startup.findOne({
            founder: req.user.id
        });

        return res.json({
            success: true,
            startup
        });

    } catch (error) {
        console.error("Get startup error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch startup"
        });
    }
};


const createOrUpdateStartup = async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "logo",
            "tagline",
            "description",
            "industry",
            "stage",
            "location",
            "website",
            "foundedYear"
        ];

        const startupData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                startupData[field] = req.body[field];
            }
        });

        startupData.founder = req.user.id;

        const startup = await Startup.findOneAndUpdate(
            { founder: req.user.id },
            startupData,
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return res.json({
            success: true,
            message: "Startup profile saved successfully",
            startup
        });

    } catch (error) {
        console.error("Save startup error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save startup profile"
        });
    }
};


module.exports = {
    getMyStartup,
    createOrUpdateStartup
};