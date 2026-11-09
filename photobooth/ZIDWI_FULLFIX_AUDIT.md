# Review: Zidwi FullFix ZIP (2026-11-09)

Source reviewed: `shad-main-Zidwi_FullFix.zip` (3 entries). This file was provided for review only and is **not** merged into the running Shadowrocket configuration.

## Files inspected
- `tweak_injector/Tweak.xm` (3,716 bytes)
- `modules/Locket_Zidwi.sgmodule` (598 bytes)
- `js/Locket_Ohoang7_Zidwi.js` (1,458 bytes)

## Confirmed by static inspection
- ZIP structure integrity: PASS.
- `Tweak.xm` references guessed native classes and methods with no evidence that these symbols exist in the current Locket iOS binary.
- `Tweak.xm` looks up a button by tag `999` without assigning that tag.
- The image composer draws images vertically, but there is no working 2/3/4 frame layout picker; the count defaults to four.
- The module uses relative `../js/` script paths: not validated as importable remotely by Shadowrocket.
- The new JavaScript modifies subscription JSON and inserts unverified `is_photobooth` and `frame_count` fields. No evidence that Locket accepts these fields.
- The provided archive lacks a Theos Makefile, package metadata, a verified binary class map, and any on-device acceptance report.
- The new module is not an unchanged integration of the existing `Locket_ohb.sgmodule`; its behavior differs.

## Not tested or demonstrated
- Building a functioning tweak with Theos.
- IPA injection, code signing, or opening the app with the tweak.
- Display of a Photobooth button within the actual Locket camera.
- Receiving four valid camera images, combining them, and posting them through Locket.
- Preservation of existing account or video behavior.

## Conclusion
**Native Locket Photobooth: NOT VERIFIED.** Do not replace the working module with this ZIP based on the current evidence. The original `main` module should remain unchanged.

Only a static audit note is committed in this review branch. No subscription modification or third-party app injection implementation from the ZIP is published.
