// SKY Photobooth image compositor for developer-authorized iOS integrations.
// Does not access Locket internals, subscription services or camera hooks.
#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, SKYPhotoboothLayout) {
    SKYPhotoboothLayoutStrip = 0,
    SKYPhotoboothLayoutGrid = 1
};

@interface SKYPhotoboothComposer : NSObject
+ (nullable UIImage *)composeImages:(NSArray<UIImage *> *)images
                             layout:(SKYPhotoboothLayout)layout
                           cellSize:(CGSize)cellSize
                            padding:(CGFloat)padding
                                gap:(CGFloat)gap;
@end
