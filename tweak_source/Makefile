ARCHS = arm64 arm64e
TARGET := iphone:clang:latest:14.0
INSTALL_TARGET_PROCESSES = Locket

include $(THEOS)/makefiles/common.mk

TWEAK_NAME = LocketZidwi

LocketZidwi_FILES = Tweak.xm
LocketZidwi_CFLAGS = -fobjc-arc
LocketZidwi_FRAMEWORKS = UIKit AVFoundation CoreGraphics

include $(THEOS_MAKE_PATH)/tweak.mk
