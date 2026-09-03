const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ================= TOKEN =================

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


// ================= REGISTER =================

const register = async (req, res) => {

    try {

        const { name, email, password, role } = req.body;


        // Required fields

        if (!name || !email || !password || !role) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }


        // Validate role

        const allowedRoles = [
            "Founder",
            "Investor",
            "Consultant"
        ];

        if (!allowedRoles.includes(role)) {

            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });

        }


        // Clean email

        const cleanEmail = email
            .trim()
            .toLowerCase();


        // Check existing user

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });

        }


        // Hash password

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );


        // Create user

        const user = await User.create({

            name: name.trim(),

            email: cleanEmail,

            password: hashedPassword,

            role

        });


        // Generate token

        const token = generateToken(user);


        // Response

        return res.status(201).json({

            success: true,

            message: "Account created successfully",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Registration failed"

        });

    }

};


// ================= LOGIN =================

const login = async (req, res) => {

    try {

        const { email, password } = req.body;


        // Required fields

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required"

            });

        }


        // Clean email

        const cleanEmail = email
            .trim()
            .toLowerCase();


        // Find user

        const user = await User.findOne({
            email: cleanEmail
        });


        if (!user) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password"

            });

        }


        // Check password

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


        // Generate token

        const token = generateToken(user);


        // Response

        return res.json({

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

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Login failed"

        });

    }

};


// ================= EXPORT =================

module.exports = {
    register,
    login
};