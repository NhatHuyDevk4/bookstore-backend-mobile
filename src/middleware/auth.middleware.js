import jwt from "jsonwebtoken";
import User from "../model/User.js";


// const response = await fetch(`https://localhost:3000/api/books`, {
//     method: "POST",
//     body: JSON.stringify({
//         title,
//         caption
//     }),
//     headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//     },
// })

const protectRoute = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers("Authorization").replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // Verify token
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by id
        const user = await User.findById(decode.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = user; // là đối tượng user đã được tìm thấy từ cơ sở dữ liệu
        next(); // tiếp tục đến middleware tiếp theo hoặc route handler
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
}

export default protectRoute;