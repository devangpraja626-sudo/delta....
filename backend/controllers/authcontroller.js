const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }
    );
};


/* ================ REGISTER ================ */

const register = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        if (
            !name ||
            !email ||
            !password ||
            !role
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }


        const existingUser =
            await User.findOne({
                email
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }


        const hashedPassword =
            await bcrypt.hash(password, 12);


        const user =
            await User.create({

                name,

                email,

                password: hashedPassword,

                role

            });


        const token =
            generateToken(user);


        res.status(201).json({

            success: true,

            message:
                "Account created successfully",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
};


/* ================= LOGIN ================= */

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const user =
            await User.findOne({
                email
            });


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }


        const token =
            generateToken(user);


        res.json({

            success: true,

            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};


module.exports = {
    register,
    login
};