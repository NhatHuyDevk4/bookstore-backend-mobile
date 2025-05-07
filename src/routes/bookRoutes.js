import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Book from '../model/Book.js';
import protectRoute from '../middleware/auth.middleware.js';
// import multer from 'multer';
const router = express.Router();


// Configure multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// const upload = multer({ storage });

// create 
router.post('/create', protectRoute, async (req, res) => {
    try {

        const { title, caption, rating, image } = req.body;
        if (!title || !caption || !image || !rating) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        // Validate rating
        const parsedRating = parseFloat(rating);
        if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 0 and 5' });
        }

        // Upload image to Cloudinary
        // let imageUrl;
        // try {
        //     const uploadResponse = await cloudinary.uploader.upload(req.file.path);
        //     console.log('Cloudinary upload response:', uploadResponse);
        //     if (!uploadResponse.secure_url) {
        //         throw new Error('Cloudinary did not return a secure URL');
        //     }
        //     imageUrl = uploadResponse.secure_url;

        //     // Clean up temporary file
        //     const fs = require('fs');
        //     fs.unlinkSync(req.file.path);
        // } catch (cloudinaryError) {
        //     console.error('Cloudinary upload error:', cloudinaryError.message, cloudinaryError);
        //     return res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
        // }

        // Create new book
        const newBook = new Book({
            title,
            caption,
            image,
            rating: parsedRating,
            user: req.user._id, // req.user._id là ID người dùng đã xác thực
        });

        // Save to MongoDB
        console.log('Saving book:', newBook);
        await newBook.save();
        console.log('Book saved successfully:', newBook);

        res.status(201).json({
            message: 'Book created successfully',
            newBook,
        });
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// get
router.post("/", protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1; // Lấy số trang từ query string, mặc định là 1
        const limit = req.query.limit || 5; // Lấy số lượng bản ghi trên mỗi trang từ query string, mặc định là 5
        const skip = (page - 1) * limit; // Tính toán số bản ghi cần bỏ qua

        const books = await Book.find({})
            .sort({ createdAt: -1 })
            .skip(skip) // Bỏ qua số bản ghi đã tính toán
            .limit(limit) // Giới hạn số bản ghi trả về
            .populate("user", "username profileImage") // Thay thế ID người dùng bằng thông tin người dùng

        const totalBooks = await Book.countDocuments(); // Đếm tổng số bản ghi trong collection
        res.send(
            {
                books,
                currentPage: page,
                totalBooks,
                totalPages: Math.ceil(totalBooks / limit), // Tính toán tổng số trang
            }
        );

    } catch (error) {
        console.error("Error getting all books:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// recommended
router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5); // Lấy 5 sách có rating cao nhất
        res.json(books);
    } catch (error) {
        console.error("Error getting recommended books:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// [DELETE]/[id]
router.delete("/:id", protectRoute, async (req, res) => {

    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Kiểm tra nếu người dùng là người tạo sách
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Xóa ảnh khỏi Cloudinary nếu cần thiết
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0]; // Lấy public ID từ URL
                await cloudinary.uploader.destroy(publicId); // Xóa ảnh khỏi Cloudinary
            } catch (deleteError) {
                console.error("Error deleting image from Cloudinary:", deleteError);
                return res.status(500).json({ message: "Failed to delete image from Cloudinary" });
            }
        }

        await Book.deleteOne();
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// delete

export default router;