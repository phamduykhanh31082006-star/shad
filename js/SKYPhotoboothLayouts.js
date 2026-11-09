/**
 * SKY Photobooth Layouts v1.0
 * Image-only composition utility. No Locket API, account, proxy, or native injection.
 * Compatible with Canvas and CommonJS; operates on caller-provided images only.
 */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SKYPhotoboothLayouts = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function assertSize(value, name) {
    if (!Number.isInteger(value) || value <= 0 || value > 8192) {
      throw new RangeError(name + " must be an integer between 1 and 8192");
    }
  }

  function plan(count, format = "strip", options = {}) {
    if (![2, 3, 4].includes(count)) throw new RangeError("Use 2, 3, or 4 images");
    if (!["strip", "grid"].includes(format)) throw new RangeError("Unknown layout format");
    const cellWidth = options.cellWidth ?? 360;
    const cellHeight = options.cellHeight ?? 450;
    const gap = options.gap ?? 10;
    const padding = options.padding ?? 14;
    assertSize(cellWidth, "cellWidth");
    assertSize(cellHeight, "cellHeight");
    if (![gap, padding].every(v => Number.isInteger(v) && v >= 0 && v <= 200)) {
      throw new RangeError("gap and padding must be integers between 0 and 200");
    }

    const cols = format === "grid" ? 2 : 1;
    const rows = Math.ceil(count / cols);
    const width = 2 * padding + cols * cellWidth + (cols - 1) * gap;
    const height = 2 * padding + rows * cellHeight + (rows - 1) * gap;
    const frames = Array.from({ length: count }, (_, index) => ({
      index,
      x: padding + (index % cols) * (cellWidth + gap),
      y: padding + Math.floor(index / cols) * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight
    }));
    return { width, height, frames, format, count };
  }

  function drawCover(ctx, image, frame) {
    const iw = image.naturalWidth || image.videoWidth || image.width;
    const ih = image.naturalHeight || image.videoHeight || image.height;
    if (!(iw > 0 && ih > 0)) throw new TypeError("Invalid image dimensions");
    const sourceRatio = iw / ih;
    const destRatio = frame.width / frame.height;
    let sx = 0, sy = 0, sw = iw, sh = ih;
    if (sourceRatio > destRatio) {
      sw = ih * destRatio;
      sx = (iw - sw) / 2;
    } else {
      sh = iw / destRatio;
      sy = (ih - sh) / 2;
    }
    ctx.drawImage(image, sx, sy, sw, sh, frame.x, frame.y, frame.width, frame.height);
  }

  function compose(images, config = {}) {
    if (!Array.isArray(images)) throw new TypeError("images must be an array");
    const layout = plan(images.length, config.format || "strip", config);
    const canvas = config.canvasFactory
      ? config.canvasFactory()
      : (typeof document !== "undefined" ? document.createElement("canvas") : null);
    if (!canvas || typeof canvas.getContext !== "function") {
      throw new Error("Canvas unavailable: supply canvasFactory in this environment");
    }
    canvas.width = layout.width;
    canvas.height = layout.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    ctx.fillStyle = config.background || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    images.forEach((image, index) => drawCover(ctx, image, layout.frames[index]));
    return { canvas, layout };
  }

  return Object.freeze({ plan, compose, version: "1.0.0" });
});
