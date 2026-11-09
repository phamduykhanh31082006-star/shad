// Locket_Photobooth_Injector.js (Dành cho Frida / Runtime Injection)
// Hook trực tiếp vào CameraViewController của Locket để tạo hiệu ứng chụp liên tiếp & ghép ảnh
if (ObjC.available) {
    console.log("[ZIDWI] Bắt đầu inject Photobooth vào Locket...");

    var frameCount = 4; // Số lượng ảnh (2/3/4)
    var capturedImages = [];
    
    // Tìm class xử lý Camera của Locket (Tên class có thể bị obfuscate, ở đây dùng mock class name chuẩn của iOS Camera/Locket)
    var captureSession = ObjC.classes.AVCapturePhotoOutput;
    
    Interceptor.attach(captureSession["- capturePhotoWithSettings:delegate:"].implementation, {
        onEnter: function(args) {
            console.log("[ZIDWI] Bắt sự kiện chụp ảnh. Lần chụp thứ: " + (capturedImages.length + 1));
            // Lưu lại reference của delegate để gửi ảnh sau khi ghép
            this.delegate = args[3];
        }
    });

    // Hook hàm xử lý ảnh sau khi chụp để gom đủ 4 frame
    var photoDelegate = ObjC.classes.NSObject; // Thay bằng class delegate thực tế của Locket
    Interceptor.attach(photoDelegate["- captureOutput:didFinishProcessingPhoto:error:"].implementation, {
        onEnter: function(args) {
            var photo = new ObjC.Object(args[3]);
            var image = photo.CGImageRepresentation(); 
            capturedImages.push(image);
            
            if (capturedImages.length < frameCount) {
                console.log("[ZIDWI] Đang chụp liên tiếp, chờ frame tiếp theo...");
                // Kích hoạt chụp tiếp qua hook
            } else {
                console.log("[ZIDWI] Đã đủ " + frameCount + " frames. Tiến hành ghép ảnh (Stitching)...");
                var stitchedImage = stitchImages(capturedImages); // Gọi hàm ghép ảnh qua CoreGraphics
                
                // Trả ảnh đã ghép về cho Locket thay vì ảnh đơn
                // (Logic override return buffer ở đây)
                
                capturedImages = []; // Reset
            }
        }
    });

    function stitchImages(images) {
        // Pseudo logic ghép ảnh dùng CoreGraphics thông qua Frida
        console.log("[ZIDWI] Ghép " + images.length + " ảnh thành dải Photobooth.");
        return images[0]; // Trả về ảnh mock sau khi ghép
    }
}
