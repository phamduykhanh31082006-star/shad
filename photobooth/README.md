# Photobooth Free V1.1

Bộ mã xử lý ảnh Photobooth viết mới, miễn phí 100%, không quảng cáo, không tài khoản, không gửi ảnh lên máy chủ. Mã nguồn độc lập với Locket và `vuong2023/shad`.

## Kiểm tra mã nguồn gốc

Repository được đối chiếu: https://github.com/vuong2023/shad (nhánh `main`, commit `36c7ed8823299c86aefe918e8689f3dd4f1797de`). Đã xem 16 tệp: 6 JavaScript, 6 .sgmodule, 4 tài liệu/cấu hình.

- `modules/Locket_ohb.sgmodule`: script request/response chỉ khớp tên miền `api.revenuecat.com`.
- `js/Locket_Ohoang7.js`: giả lập dữ liệu entitlement/subscription trong JSON trả về.
- `js/deleteHeader.js`: điều chỉnh `X-RevenueCat-ETag`.
- Không có hook camera, giao diện iOS hoặc trình nạp giao diện bổ sung.

## Hỗ trợ tính năng

- Camera trước/sau (nếu trình duyệt và thiết bị cho phép), chụp tự động 4 ảnh và chụp từng ảnh.
- Hẹn giờ 3 / 5 / 10 giây, chụp lại từng ô, nhập 4 ảnh từ thư viện.
- 3 bố cục: Lưới 2×2, Dải đôi, Nổi bật.
- 5 bộ lọc ảnh: Gốc, đen trắng, Digicam, phim, mộng mơ.
- Màu khung, 8 họa tiết, 5 chủ đề theo mùa, tùy chọn PNG overlay tự thiết kế.
- Chữ ngày chụp, chữ riêng, cả hai hoặc không có; 4 nhóm phông.
- Lưu ảnh PNG, chia sẻ theo khả năng của thiết bị, xuất GIF và video (nếu thiết bị hỗ trợ MediaRecorder).
- Mọi công cụ đều mở khóa sẵn; không có bất kỳ tính năng trả phí nào trong mã này.

## Cách chạy bản kiểm thử

Đây không phải sản phẩm website đã triển khai; `preview.html` chỉ là bộ kiểm thử mã JavaScript. Trong thư mục gốc repository chạy:

```bash
python3 -m http.server 8000
```

Sau đó truy cập `http://localhost:8000/photobooth/preview.html` bằng trình duyệt trên máy đang chạy server và nhấn **Xem ảnh minh họa**, hoặc bật camera nếu HTTPS/localhost được hỗ trợ.

Có thể nhúng `js/Photobooth.js` vào một trang HTML hoặc ứng dụng có WebView do bạn sở hữu, rồi tạo `new PhotoboothFree.Photobooth({ target: '#app' })`.

## Tích hợp nhãn miễn phí

`preview.html` hiện sử dụng `CaptionFilters.js` để chọn 40 nhãn, chỉnh chữ và ghép nhãn trên ảnh/GIF/video qua bộ render chung. Phần này không tạo nút trong Locket gốc.

## Giới hạn phải biết

1. File JavaScript này yêu cầu DOM, HTML Canvas và `getUserMedia`. Runtime JavaScript của Shadowrocket trong quy tắc `http-request`/`http-response` không có các API giao diện đó.
2. Chứng chỉ CA và MITM cho phép can thiệp lưu lượng HTTPS phù hợp, **không** làm thay đổi giao diện native hoặc thực thi JS trong camera iOS.
3. Không có bằng chứng rằng Locket iOS gốc chứa Photobooth ẩn hoặc hỗ trợ một extension ở tầng network. Vì thế không thể tạo `.sgmodule` Photobooth **hoạt động bên trong Locket gốc** chỉ từ repository tham khảo. Không kèm module giả để tránh cài vô ích.
4. Chia sẻ tệp đến Locket cần hỗ trợ từ ứng dụng đích; không tự thực hiện gửi ảnh qua tài khoản Locket.
5. Xuất video tùy theo hỗ trợ codec của trình duyệt; GIF có thể dùng thay thế. Chưa kiểm thử trên iPhone thật.
6. Các họa tiết tạo bằng thuật toán gốc, không sao chép nhân vật/khung trả phí trong ảnh tham khảo.

## An toàn

Không có mã thu thập mật khẩu, không dùng token Locket, không cần root/jailbreak, không truy cập API RevenueCat. Chỉ sử dụng tài sản bạn có quyền sử dụng và không sử dụng mã để vượt thanh toán của dịch vụ bên thứ ba.