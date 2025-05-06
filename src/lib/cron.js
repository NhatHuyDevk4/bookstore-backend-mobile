// Nhập thư viện 'cron' để sử dụng chức năng lập lịch chạy tự động
import cron from 'cron';

// Nhập module 'https' để gửi yêu cầu HTTP qua HTTPS
import https from 'https';

// Tạo một công việc cron mới, chạy theo chu kỳ mỗi 14 phút
const job = new cron.CronJob("*/14 * * * *", function() {
    // Gửi một yêu cầu GET đến địa chỉ URL lấy từ biến môi trường API_URL
    https.get(process.env.API_URL, (res) => {
        // Nếu mã trạng thái HTTP không phải 200 (OK), in lỗi ra console
        if(res.statusCode !== 200) {
            console.error(`Error: ${res.statusCode}`);
        } else {
            // Nếu mã trạng thái HTTP là 200, in thành công ra console
            console.log(`Success: ${res.statusCode}`);
        }
    }).on('error', (e) => {
        // Nếu có lỗi trong quá trình gửi yêu cầu (ví dụ: không kết nối được), in thông báo lỗi ra console
        console.error(`Got error: ${e.message}`);
    });
})

// Xuất `job` để có thể được sử dụng và kích hoạt từ nơi khác trong ứng dụng
export default job;
