# SKY Locket Filter Probe V1.0

## Mục đích
Đây là **file .sgmodule thật** dùng để kiểm tra đường kết nối Shadowrocket → API của Locket khi thao tác với camera/chú thích. Không phải bộ lọc đã được tích hợp vào camera Locket.

**RAW URL:** https://raw.githubusercontent.com/phamduykhanh31082006-star/shad/main/modules/Locket_Filter_Probe.sgmodule

## Cách thử
1. Shadowrocket → Cấu hình/Configuration → Module → dấu + → dán URL RAW trên → tải về và bật.
2. Chỉ nếu bạn đồng ý dùng MITM trên thiết bị của mình và đã hiểu rủi ro riêng tư, dùng chứng chỉ CA tự tạo/của bạn và bật giải mã HTTPS theo thiết lập Shadowrocket. Không dùng chứng chỉ lạ chia sẻ bởi người khác.
3. Mở Locket gốc, lần lượt truy cập các mục chú thích, filter và camera, rồi xem **nhật ký script Shadowrocket**.
4. Tìm dòng `[SKY Locket Filter Probe]`; ghi nhận số lượng và loại `possible-filter-api`, `other-api`, `upload-related`. Không gửi bản chụp log chứa request URL, header, token hoặc dữ liệu cá nhân.
5. Tắt module sau khi kiểm thử; nếu gặp lỗi kết nối, tắt HTTPS decryption và module, rồi khởi động lại Locket.

## Kết quả có thể kết luận
- Module import được: **PASS cấu hình Shadowrocket**, không phải PASS Photobooth.
- Có dòng `possible-filter-api`: chỉ gợi ý có endpoint tên liên quan đến filter/chú thích; không chứng minh có schema nạp giao diện.
- Không có dòng: có thể ứng dụng xử lý nội bộ, đang dùng hostname khác, có certificate pinning hoặc không kết nối; không đủ bằng chứng kết luận.
- Có `upload-related`: chỉ cho thấy hoạt động gọi API liên quan đăng ảnh, **không** truy cập hay sửa ảnh.
- Photobooth native 4 ảnh và nút Aa+: **CHƯA HOẠT ĐỘNG**.

## Quyền riêng tư
Script **không đọc body, không đọc headers, không thay đổi request, không thêm phần tử UI**. Chỉ tính phân loại dựa trên phần path của URL và ghi một nhãn chung vào nhật ký thiết bị. Dù vậy, HTTPS MITM ở tầng proxy có thể xử lý lưu lượng nhạy cảm, nên chỉ kích hoạt khi thật sự cần và tắt sau khi thử.

## Mã nguồn filter
- `js/Photobooth.js`: compositor & bản kiểm thử camera HTML.
- `js/PhotoboothFilter.js`: máy trạng thái 4 khung, phụ thuộc ứng dụng cung cấp ảnh.
- `js/CaptionFilters.js`: 40 preset chú thích.
- Module này không thể làm các file trên chạy bên trong app Locket native. Không đưa mã filter vào `script-path` khi thiếu cơ chế nhận ảnh và giao diện.
