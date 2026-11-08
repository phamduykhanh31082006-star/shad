/*
 * SKY Locket Filter Probe V1.0 – read-only on-device diagnostics.
 * Logs only a coarse request category, never full URLs, headers, bodies,
 * media, account IDs or tokens. NEVER modifies or blocks network traffic.
 * This file is NOT an implementation of Photobooth inside the native Locket UI.
 */
(function () {
  try {
    var url = typeof $request !== 'undefined' && $request && typeof $request.url === 'string'
      ? $request.url : '';
    var path = url.replace(/^https:\/\/api\.locketcamera\.com/i, '').split(/[?#]/)[0];
    var category = 'other-api';
    if (/(filter|frame|caption|sticker|effect|template|camera|config)/i.test(path)) {
      category = 'possible-filter-api';
    } else if (/(postmoment|upload)/i.test(path)) {
      category = 'upload-related';
    }
    console.log('[SKY Locket Filter Probe] ' + category + ' request observed; no data captured');
  } catch (err) {
    console.log('[SKY Locket Filter Probe] request observed; classification unavailable');
  } finally {
    $done({});
  }
})();
