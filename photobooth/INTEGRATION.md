# Integration / nghiệm thu

## Đã có trong repository
- `js/Photobooth.js`: bộ mã chụp 4 khung, 3 bố cục, đếm ngược, bộ lọc ảnh, màu/khung, chữ, PNG/GIF/video, dùng Canvas.
- `js/CaptionFilters.js`: 40 preset chú thích miễn phí, tìm kiếm, tùy phối, vẽ gradient, dữ liệu động do người dùng cung cấp.
- `photobooth/preview.html`: môi trường kiểm thử Photobooth cục bộ.
- `photobooth/test-captions.cjs`: kiểm thử mã chú thích.

## Chưa có – không giả lập kết quả
- Bộ xử lý ảnh hoặc tùy biến UI **bên trong Locket iOS gốc** thông qua Shadowrocket.
- Nút Photobooth, Aa+ hoặc panel captions trong Locket native.
- Khả năng tự động gửi ảnh Photobooth vào Locket native.
- Kiểm thử camera iPhone, codec video và phản hồi API Locket trên thiết bị thật.

## Vì sao
`modules/Locket_ohb.sgmodule` chỉ hook `api.revenuecat.com` để sửa entitlement JSON. Shadowrocket xử lý request/response HTTPS tại tầng mạng. Nó không tạo được camera view, điều khiển chụp 4 frame hoặc dựng UIKit/SwiftUI nếu binary Locket không có extension point/feature flag nhận dạng sẵn.

Mã `Photobooth.js` và `CaptionFilters.js` là **image filters and data**, không phải **Shadowrocket HTTP filters**. Đổi tên file thành `.sgmodule` không biến nó thành extension native.

## Điều kiện kỹ thuật để tiếp tục
1. Xác minh một endpoint camera/caption hoặc remote configuration của **Locket native trên phiên bản iOS đang sử dụng**.
2. Chứng minh bằng phản hồi không chứa bí mật rằng client có hỗ trợ schema danh sách nhãn/giao diện tự động. Không đụng đến mật khẩu, ảnh cá nhân hoặc token.
3. Viết bài kiểm thử mẫu local, rồi tạo module MITM chỉ khớp hostname/path chính xác với fail-open và giới hạn kích thước.
4. Kiểm thử native trên iPhone: nút mới xuất hiện, chụp 4 khung, gửi ảnh, lỗi mạng, khởi động lại, tắt module, rollback.
5. Chỉ đánh dấu PASS sau khi trên thiết bị thật sử dụng được; nếu không có extension point, **không thể đạt mục tiêu native chỉ bằng Shadowrocket**.

Không thay đổi các script hiện tại hoặc thêm hostname MITM rộng khi chưa có bằng chứng.
