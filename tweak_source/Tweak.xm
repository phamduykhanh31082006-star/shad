#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>

// ZIDWI LOGOS TWEAK - LOCKET PHOTOBOOTH INJECTOR v2
// Fix 1: Đã gán tag=999 cho button.
// Fix 2: Logic click chu kỳ chọn số lượng ảnh (TẮT -> 2 -> 3 -> 4 -> TẮT).

static NSMutableArray *capturedImages;
static NSInteger currentFrameCount = 0; // 0 = Tắt chế độ Photobooth
static BOOL isPhotoboothMode = NO;

// Lưu ý cho pro-dev (Lỗi 3): Class name của Locket có thể bị obfuscate hoặc thay đổi.
// Dùng FLEXible hoặc class-dump để xác nhận lại tên Controller chụp ảnh thực tế.
// Ở đây dùng tên phổ biến nhất cho module Camera nội bộ.
@interface LocketCameraViewController : UIViewController
- (void)capturePhotoAction;
@end

@interface LocketPreviewController : UIViewController
@property (nonatomic, strong) UIImage *capturedImage;
@end

%hook LocketCameraViewController

- (void)viewDidLoad {
    %orig;
    
    if (!capturedImages) {
        capturedImages = [[NSMutableArray alloc] init];
    }
    
    // Nút điều khiển Photobooth
    UIButton *pbButton = [UIButton buttonWithType:UIButtonTypeCustom];
    pbButton.frame = CGRectMake(20, 60, 140, 40);
    pbButton.tag = 999; // FIX 1: Đã gán tag
    
    // Trạng thái mặc định
    [pbButton setTitle:@"📸 PB: TẮT" forState:UIControlStateNormal];
    pbButton.backgroundColor = [UIColor colorWithWhite:0 alpha:0.6];
    pbButton.layer.cornerRadius = 20;
    pbButton.layer.masksToBounds = YES;
    
    [pbButton addTarget:self action:@selector(zidwi_cyclePhotobooth) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:pbButton];
}

%new
- (void)zidwi_cyclePhotobooth {
    // FIX 2: Vòng lặp chọn số khung ảnh trực tiếp trên UI
    UIButton *btn = (UIButton *)[self.view viewWithTag:999];
    
    if (currentFrameCount == 0) {
        currentFrameCount = 2;
        isPhotoboothMode = YES;
        [btn setTitle:@"📸 PB: 2 Khung" forState:UIControlStateNormal];
        btn.backgroundColor = [UIColor systemBlueColor];
    } else if (currentFrameCount == 2) {
        currentFrameCount = 3;
        [btn setTitle:@"📸 PB: 3 Khung" forState:UIControlStateNormal];
        btn.backgroundColor = [UIColor systemOrangeColor];
    } else if (currentFrameCount == 3) {
        currentFrameCount = 4;
        [btn setTitle:@"📸 PB: 4 Khung" forState:UIControlStateNormal];
        btn.backgroundColor = [UIColor systemRedColor];
    } else {
        // Reset về tắt
        currentFrameCount = 0;
        isPhotoboothMode = NO;
        [btn setTitle:@"📸 PB: TẮT" forState:UIControlStateNormal];
        btn.backgroundColor = [UIColor colorWithWhite:0 alpha:0.6];
    }
}

// Bắt sự kiện bấm nút chụp
- (void)capturePhotoAction {
    if (!isPhotoboothMode || currentFrameCount == 0) {
        %orig; // Chụp 1 ảnh bình thường
        return;
    }
    
    // Bắn trigger chụp liên tiếp
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        for (int i = 0; i < currentFrameCount; i++) {
            dispatch_sync(dispatch_get_main_queue(), ^{
                %orig; 
                
                // Hiệu ứng nháy Flash giả lập khi đang chuỗi chụp (tùy chọn)
                UIView *flashView = [[UIView alloc] initWithFrame:[UIScreen mainScreen].bounds];
                flashView.backgroundColor = [UIColor whiteColor];
                flashView.alpha = 1.0;
                [[UIApplication sharedApplication].keyWindow addSubview:flashView];
                [UIView animateWithDuration:0.2 animations:^{
                    flashView.alpha = 0.0;
                } completion:^(BOOL finished) {
                    [flashView removeFromSuperview];
                }];
            });
            // Delay 0.6s để module hardware camera xử lý buffer & focus
            [NSThread sleepForTimeInterval:0.6]; 
        }
    });
}
%end

// Ép kiểu ảnh trả về
%hook LocketPreviewController

- (void)setCapturedImage:(UIImage *)image {
    if (!isPhotoboothMode || currentFrameCount == 0) {
        %orig(image);
        return;
    }
    
    if (image) [capturedImages addObject:image];
    
    // Block không cho show UI khi chưa gom đủ ảnh
    if (capturedImages.count < currentFrameCount) {
        return; 
    }
    
    // Stitch ảnh dọc
    CGFloat width = ((UIImage *)capturedImages[0]).size.width;
    CGFloat height = ((UIImage *)capturedImages[0]).size.height;
    CGSize newSize = CGSizeMake(width, height * currentFrameCount);
    
    UIGraphicsBeginImageContextWithOptions(newSize, NO, 0.0);
    for (int i = 0; i < currentFrameCount; i++) {
        UIImage *img = capturedImages[i];
        [img drawInRect:CGRectMake(0, height * i, width, height)];
    }
    UIImage *finalStitchedImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    [capturedImages removeAllObjects]; // Dọn dẹp RAM
    
    %orig(finalStitchedImage); // Trả cho Locket
}
%end
