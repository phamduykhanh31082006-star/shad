# CaptionFilters Free V1.0

Bộ dữ liệu nhãn/chú thích, template và hàm vẽ Canvas **mới được tự xây dựng** cho dự án \`shad\`. Toàn bộ preset là miễn phí; không có mua hàng, khóa tính năng, quảng cáo hoặc thu thập dữ liệu.

## Tính năng có trong mã

- 40 preset tiếng Việt/tiếng Anh ở 5 nhóm: Chung, Holiday, Decorative, In Love, Gen Z Life.
- Tìm kiếm không phân biệt dấu tiếng Việt, lọc theo nhóm.
- Nhãn gradient 2 màu, biểu tượng, chữ, văn bản tùy chỉnh.
- Nhãn giờ và streak theo dữ liệu do người dùng cung cấp; vị trí/thời tiết **không tự thu thập**.
- Bộ dựng Canvas 2D cho ứng dụng có giao diện/Canvas để tạo nhãn lên ảnh.
- \`custom()\` tạo nhãn tùy phối không có paywall.

## Kiểm tra

\`\`\`sh
node photobooth/test-captions.cjs
\`\`\`

## Trạng thái tích hợp vào Locket native

**CHƯA TÍCH HỢP.** Không cần tải lại các module Locket cũ vì không có file nào của chúng bị sửa.

Script \`js/CaptionFilters.js\` không dùng API Locket và không được chạy từ \`.sgmodule\`. Mã có thể tạo danh sách/nhãn trong môi trường có giao diện đồ họa nhưng **Shadowrocket chỉ có điểm can thiệp HTTP request/response**, không có quyền chèn nút Aa+ hay Photobooth vào UIKit/SwiftUI đã biên dịch. Chỉ bổ sung file vào GitHub, thêm \`script-path\`, cài CA hoặc bật VPN không thể tạo được giao diện native.

Ảnh tham khảo trên \`locket.elingo.app\` là website Safari, không chứng minh có thể chèn vào bản Locket từ App Store. Không sao chép mã hay asset của trang này.

**Điều kiện để mở rộng native qua MITM:** phải tìm được endpoint thực tế và một tính năng **đã được Locket triển khai sẵn** nhận dữ liệu schema tương ứng từ server. Chưa tìm thấy bằng chứng đó. Không được thử thay đổi JSON thiếu schema, intercept token/ảnh riêng tư, hoặc gắn module giả hoạt động.

Nguồn đã tham khảo:
- \`https://github.com/vuong2023/shad\` – cơ chế RevenueCat, không có camera hook.
- \`https://github.com/llygad/Shadowrocket-modules/blob/main/LocketCamera.sgmodule\` – một module khác cũng chỉ hook RevenueCat.
- \`https://github.com/hanngoc1406/naive-locket\` – ứng dụng SwiftUI **riêng** đăng ảnh qua Locket API; không phải module UI native.

Không thêm quy tắc MITM mới vào Locket cho đến khi có kiểm thử với đầu vào thực tế và xác định rõ quyền riêng tư.
