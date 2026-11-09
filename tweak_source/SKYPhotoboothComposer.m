// Independent UIKit photo-grid renderer; no app hooking or account features.
#import "SKYPhotoboothComposer.h"
#import <math.h>

@implementation SKYPhotoboothComposer
+ (nullable UIImage *)composeImages:(NSArray<UIImage *> *)images
                             layout:(SKYPhotoboothLayout)layout
                           cellSize:(CGSize)cellSize
                            padding:(CGFloat)padding
                                gap:(CGFloat)gap {
    NSUInteger count = images.count;
    if (count < 2 || count > 4 || (layout != SKYPhotoboothLayoutStrip && layout != SKYPhotoboothLayoutGrid)) return nil;
    if (!isfinite(cellSize.width) || !isfinite(cellSize.height) ||
        cellSize.width <= 0 || cellSize.height <= 0 ||
        !isfinite(padding) || !isfinite(gap) || padding < 0 || gap < 0) return nil;
    for (UIImage *img in images) if (![img isKindOfClass:UIImage.class] || img.size.width <= 0 || img.size.height <= 0) return nil;

    NSUInteger cols = layout == SKYPhotoboothLayoutGrid ? 2 : 1;
    NSUInteger rows = (count + cols - 1) / cols;
    CGSize output = CGSizeMake(padding * 2 + cols * cellSize.width + (cols - 1) * gap,
                               padding * 2 + rows * cellSize.height + (rows - 1) * gap);
    if (output.width > 8192 || output.height > 8192) return nil;

    UIGraphicsImageRendererFormat *format = [UIGraphicsImageRendererFormat defaultFormat];
    format.opaque = YES;
    format.scale = 1;
    UIGraphicsImageRenderer *renderer = [[UIGraphicsImageRenderer alloc] initWithSize:output format:format];
    return [renderer imageWithActions:^(UIGraphicsImageRendererContext * _Nonnull context) {
        CGContextRef cg = context.CGContext;
        [[UIColor whiteColor] setFill];
        UIRectFill((CGRect){CGPointZero, output});
        [images enumerateObjectsUsingBlock:^(UIImage * _Nonnull image, NSUInteger idx, BOOL * _Nonnull stop) {
            CGRect slot = CGRectMake(padding + (idx % cols) * (cellSize.width + gap),
                                     padding + (idx / cols) * (cellSize.height + gap),
                                     cellSize.width, cellSize.height);
            CGFloat scale = MAX(slot.size.width / image.size.width, slot.size.height / image.size.height);
            CGSize drawSize = CGSizeMake(image.size.width * scale, image.size.height * scale);
            CGRect drawRect = CGRectMake(CGRectGetMidX(slot) - drawSize.width / 2,
                                         CGRectGetMidY(slot) - drawSize.height / 2,
                                         drawSize.width, drawSize.height);
            CGContextSaveGState(cg);
            CGContextClipToRect(cg, slot);
            [image drawInRect:drawRect];
            CGContextRestoreGState(cg);
        }];
    }];
}
@end
