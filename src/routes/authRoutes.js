import express from 'express';
import User from '../model/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
}

router.post("/register", async (req, res) => {

    try {
        const { email, username, password } = req.body;

        if (email == undefined || !username || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        if (username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters" });
        }

        const invalidCharRegex = /[^\x00-\x7F]|[\s]/;
        if (invalidCharRegex.test(username)) {
            return res.status(400).json({ message: "Username must not contain Vietnamese characters or spaces" });
        }

        // Check if email or username already exists
        const existingUsername = await User.findOne({ email })
        if (existingUsername) {
            return res.status(400).json({ message: "Email or username already exists" });
        }

        const existingEmail = await User.findOne({ username })
        if (existingEmail) {
            return res.status(400).json({ message: "Email or username already exists" });
        }

        // get random avatar
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const newUser = new User({
            email,
            username,
            password,
            profileImage: profileImage,
        });

        await newUser.save();
        const token = generateToken(newUser._id);

        res.status(201).json({
            token,
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profileImage: newUser.profileImage,
            },
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            },
            message: "User logged in successfully"
        });

    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

export default router;

// status 400 là lỗi client, tức là có gì đó sai sai ở phía client, ví dụ như không điền đủ thông tin.