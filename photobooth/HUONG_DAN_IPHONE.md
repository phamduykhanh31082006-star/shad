# SKY Photobooth — Chạy trên iPhone

## Nền tảng đã chọn
Trang web tĩnh **tự xử lý ảnh trong Safari**, không cần cài ứng dụng và không có tài khoản.

1. Mở trang SKY Photobooth qua HTTPS.
2. Cấp quyền camera nếu muốn chụp, hoặc nhấn **Thêm ảnh** để lấy ảnh trong thư viện.
3. Chọn mẫu 2×2, Dải đôi hoặc Nổi bật, bộ lọc, khung, màu, chú thích miễn phí.
4. Nhấn **Lưu ảnh PNG**. Trên iPhone, tùy trình duyệt, mở ảnh đã tải rồi **Lưu vào Ảnh**.
5. Mở Locket và dùng tùy chọn chọn ảnh từ thư viện **nếu tài khoản Locket hỗ trợ** để đăng ảnh đã ghép.

Đây là phương án cho ra sản phẩm thực tế, **không** phải tính năng được cấy trực tiếp vào camera native của Locket, không cần Shadowrocket, MITM hay chứng chỉ CA.

## Xuất bản qua GitHub Pages

Chỉ tài khoản chủ repository mới có thể bật Pages trong GitHub Settings.
1. Mở repository `shad` → **Settings** → **Pages**.
2. Ở **Build and deployment**, chọn **Deploy from a branch**.
3. Chọn `main` và thư mục `/(root)`, sau đó **Save**.
4. Khi GitHub Pages báo website đã phát hành, đường dẫn mặc định sẽ là:
   `https://phamduykhanh31082006-star.github.io/shad/`
5. Mở link trên iPhone và thử demo trước khi cấp quyền camera.

**Lưu ý:** URL nêu trên là địa chỉ dự kiến theo quy tắc GitHub Pages; chỉ sử dụng sau khi GitHub Pages báo đã xuất bản. Nếu tài khoản chưa bật Pages thì URL có thể trả 404. Không tự nhận website đã hoạt động khi chưa xác nhận.

## Kiểm thử

GitHub Actions hiện có kiểm tra JavaScript, 40 mẫu chú thích, tích hợp Photobooth và đầu trang.
Kiểm thử đầu ra qua browser/iPhone (đặc biệt chức năng tải video) vẫn phải thực hiện trên thiết bị thật.

## Bảo mật
Ảnh ghép được xử lý cục bộ trên trình duyệt; mã hiện tại không gửi file ảnh lên máy chủ hoặc kết nối tài khoản Locket.
