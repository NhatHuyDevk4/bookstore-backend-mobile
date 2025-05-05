import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Book from '../model/Book.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();
// create 

router.post("/", protectRoute, async (req, res) => {
    try {

        const { title, caption, image, rating, user } = req.body;
        if (!title || !caption || !image || !rating || !user) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        // Upload ảnh lên cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url; // Lấy URL của ảnh đã upload

        const newBook = new Book({
            title,
            caption,
            image: imageUrl, // Sử dụng URL đã upload
            rating,
            user: req.user._id // Sử dụng ID của người dùng đã xác thực
        })

        await newBook.save();

        res.status(201).json({
            message: "Book created successfully",
            newBook
        })


    } catch (error) {
        console.error("Error creating book:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// delete

export default router;