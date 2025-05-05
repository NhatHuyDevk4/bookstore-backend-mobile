
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profileImage: {
        type: String,
        default: ""
    }
});

const User = mongoose.model("User", userSchema); 
// Này là cách tạo model trong mongoose, nó sẽ tự động tạo collection trong MongoDB với tên là "users" (số nhiều của "user").

export default User;
// Đoạn code này định nghĩa một schema cho người dùng với các trường như username, email, password và profileImage.