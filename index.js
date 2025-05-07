import express from 'express';
import 'dotenv/config';
import authRoutes from './src/routes/authRoutes.js';
import bookRoutes from './src/routes/bookRoutes.js';
import { connectDB } from './src/lib/db.js';
import job from './src/lib/cron.js';


const app = express();
// Kích hoạt công việc cron đã định nghĩa trong cron.js
job.start();
// Thêm middleware này để xử lý JSON trong request body
app.use(express.json());
// Nếu cần nhận form-url-encoded (không bắt buộc cho JSON)
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})