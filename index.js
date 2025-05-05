import express from 'express';
import 'dotenv/config';
import authRoutes from './src/routes/authRoutes.js';
import { connectDB } from './src/lib/db.js';



const app = express();
// Thêm middleware này để xử lý JSON trong request body
app.use(express.json());
// Nếu cần nhận form-url-encoded (không bắt buộc cho JSON)
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})