# Photobooth Free – integration status

- Native iOS Locket camera injection via Shadowrocket: **not implemented**.
- The file `js/Photobooth.js` contains the independently authored Photobooth camera and image compositor.
- The Shadowrocket HTTP request/response JavaScript environment does not provide browser DOM, Canvas or `getUserMedia` APIs, so pointing a `.sgmodule` script-path to this file cannot display the Photobooth UI inside Locket.
- Do **not** add a fake MITM rule to the existing `modules/Locket_ohb.sgmodule`: that would risk breaking the existing setup without enabling Photobooth.
- `photobooth/preview.html` is a local test harness only, not a deployed website. From repository root run `python3 -m http.server 8000` and visit `http://localhost:8000/photobooth/preview.html` in a desktop browser.
- Features implemented in the source are free: 4-photo capture, timer, layout, filters, frames, decorations, date/text and output options.
- GitHub stores source files; it does not cause them to execute inside another app. Network-driven integration would first require a documented endpoint or extension point of the target app.

Origin: new Photobooth code written for this fork; upstream scripts retained unchanged.
