
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
// Đoạn code này sử dụng mongoose để kết nối và tương tác với MongoDB, và bcryptjs để mã hóa mật khẩu người dùng.
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

userSchema.pre("save", async function (next) {
    // if(this.isModified("password")) {
    //     return next();
    // } // Nếu mật khẩu không thay đổi thì không cần mã hóa lại modified là đã sửa đổi
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

const User = mongoose.model("User", userSchema);
// Này là cách tạo model trong mongoose, nó sẽ tự động tạo collection trong MongoDB với tên là "users" (số nhiều của "user").
export default User;
// Đoạn code này định nghĩa một schema cho người dùng với các trường như username, email, password và profileImage.