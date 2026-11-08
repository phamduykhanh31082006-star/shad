/*
 * CaptionFilters Free v1.0
 * Original, free preset catalog and canvas badge renderer.
 * This is an image/label filter library, NOT a Shadowrocket .sgmodule.
 * A Shadowrocket http-response script cannot inject native controls into Locket.
 * No account access, tracking, payment gates, network requests or analytics.
 * MIT licensed; see photobooth/LICENSE.
 */
(function (root) {
  'use strict';

  const RAW = [
    ['general','Văn bản','Aa','Văn bản','#353535','#565656','#ffffff'],
    ['general','Màu sắc','🎨','Màu sắc','#1598f0','#51d5eb','#ffffff'],
    ['general','Đánh giá','⭐','Đánh giá','#36363c','#55555d','#ffffff'],
    ['general','Đang phát','🎵','Đang phát','#353535','#4b4b4b','#ffffff'],
    ['general','Vị trí','📍','Vị trí','#383838','#505050','#ffffff'],
    ['general','Thời tiết','☀️','Thời tiết','#179df5','#4bcbec','#ffffff'],
    ['general','Giờ','🕒','Giờ','#383838','#535353','#ffffff'],
    ['general','Streak','🔥','Streak','#ffb521','#ffdc58','#292929'],
    ['general','Mùa Bọ Cạp','♏','Mùa Bọ Cạp','#67051c','#e61b2f','#ffffff'],
    ['holiday','Halloween','🎃','Halloween','#a54316','#f3731d','#ffffff'],
    ['holiday','Giáng sinh xanh','🕯️','Giáng sinh an lành','#1e9955','#45c276','#ffffff'],
    ['holiday','Giáng sinh đỏ','🎄','Giáng sinh an lành','#dc1740','#ef363b','#ffffff'],
    ['holiday','Năm mới vàng','🥂','Xin chào 2027!','#ffdb91','#ffe9b0','#2f2b2b'],
    ['holiday','Năm mới tím','💫','Xin chào 2027!','#4611d0','#8d32ef','#ffffff'],
    ['holiday','2027','✨','2027','#f72467','#ff475f','#ffffff'],
    ['holiday','Mùa thu','🍂','Xin chào Mùa Thu','#d9521d','#fda334','#ffffff'],
    ['decorative','Quẩy thôi','🪩','Quẩy thôi!','#59ebc4','#ddf078','#202020'],
    ['decorative','Buổi sáng','☀️','Good morning','#f4a315','#ffc52c','#ffffff'],
    ['decorative','Ngủ ngon','🌙','Goodnight','#433cc9','#7b45cf','#ffffff'],
    ['decorative','OOTD','🕶️','OOTD','#f6f6f7','#ffffff','#252525'],
    ['decorative','Nhớ bạn','🥰','Miss you','#ff371f','#fa484c','#ffffff'],
    ['decorative','Hàn ngữ','🥹','보고 싶어','#5182c8','#b5ceff','#ffffff'],
    ['love','Dỗi rồi','😤','Dỗi rồi','#ef537c','#ffa876','#ffffff'],
    ['love','Tương tư','💭','Đang bận tương tư','#162c8e','#39cade','#ffffff'],
    ['love','Rep tin nhắn','💌','Rep tin nhắn đi','#ed0909','#fe1717','#ffffff'],
    ['love','Mỏ hỗn','🐥','Mỏ hỗn nhưng tâm hiền','#eeb041','#ffc92c','#ffffff'],
    ['love','Muốn được ôm','🫂','Muốn được ôm','#fda2b6','#ffcdf0','#ffffff'],
    ['love','Hơi bị nhớ','💫','Hơi bị nhớ','#aa6ee4','#ffb5db','#ffffff'],
    ['love','Đang ghen','🔥','Đang ghen','#ed1410','#fe3029','#ffffff'],
    ['love','Ngủ ngon có em','🌌','Ngủ ngon giấc mơ có em','#139caa','#331366','#ffffff'],
    ['genz','Hảo hán','🗡️','Hảo hán','#25455a','#f48c9b','#ffffff'],
    ['genz','Cảm lạnh','🤧','Cảm lạnh','#1889c0','#45d1e7','#ffffff'],
    ['genz','Bất lực','🏳️','Bất lực','#24506b','#3989d1','#ffffff'],
    ['genz','Xin lũi','🥺','Xin lũi được chua','#e9be42','#ffa58f','#292929'],
    ['genz','Rớt nước mắt','😭','Rớt nước mắt','#007fdb','#102c8e','#ffffff'],
    ['genz','Gục ngã','🏳️','Gục ngã','#4b71a4','#c161a6','#ffffff'],
    ['genz','Tiền đình','⌛','Tiền đình','#cd2964','#7b2363','#ffffff'],
    ['genz','Chê mạnh','👎','Chê mạnh','#ffae18','#ff4e58','#ffffff'],
    ['genz','Xinh gái','💅','Xinh gái ấn phím 1','#ffb267','#e9327b','#ffffff'],
    ['genz','Đi làm','🤡','Đi làm vì đam mê','#ee7c1d','#ff9a27','#ffffff']
  ];

  const GROUPS = Object.freeze([
    { id: 'general', label: 'Chung' },
    { id: 'holiday', label: 'Holiday Caption' },
    { id: 'decorative', label: 'Decorative by Locket' },
    { id: 'love', label: 'In Love' },
    { id: 'genz', label: 'Gen Z Life' }
  ].map(v => Object.freeze(v)));

  // Build unique, stable ASCII IDs without relying on network or locale data.
  const PRESETS = Object.freeze(RAW.map((v, n) => Object.freeze({
    id: v[0] + '-' + (n + 1),
    group: v[0],
    name: v[1],
    emoji: v[2],
    text: v[3],
    from: v[4],
    to: v[5],
    foreground: v[6],
    free: true
  })));

  function norm(value) {
    return String(value == null ? '' : value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
  }
  function safeText(text, limit) {
    return String(text == null ? '' : text)
      .replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0, limit || 120);
  }
  function validHex(value, fallback) {
    return /^#[a-fA-F0-9]{6}$/.test(String(value)) ? String(value) : fallback;
  }
  function find(id) {
    const result = PRESETS.find(v => v.id === id);
    return result ? Object.assign({}, result) : null;
  }
  function list(options) {
    const opt = options || {};
    const group = String(opt.group || '').trim();
    const q = norm(opt.search || '');
    return PRESETS
      .filter(p => (!group || p.group === group) &&
        (!q || norm([p.name, p.text, p.emoji, p.group].join(' ')).includes(q)))
      .map(p => Object.assign({}, p));
  }
  function resolve(id, options) {
    const opt = options || {};
    const preset = find(id);
    if (!preset) return null;
    let text = opt.text == null ? preset.text : safeText(opt.text, 120);
    if (id === 'general-7' && opt.time instanceof Date && !isNaN(opt.time.getTime())) {
      const t = opt.time;
      text = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
    }
    if (id === 'general-8' && Number.isInteger(opt.streak) && opt.streak >= 0) {
      text = String(opt.streak);
    }
    // Weather and location are only shown when the user supplies them explicitly.
    if (id === 'general-6' && opt.weather != null) text = safeText(opt.weather, 45);
    if (id === 'general-5' && opt.location != null) text = safeText(opt.location, 45);
    const custom = {
      from: validHex(opt.from, preset.from),
      to: validHex(opt.to, preset.to),
      foreground: validHex(opt.foreground, preset.foreground),
      text: safeText(text, 120)
    };
    return Object.assign(preset, custom);
  }
  function custom(options) {
    const opt = options || {};
    return {
      id: 'user-custom',
      group: 'custom',
      name: safeText(opt.name || 'Tự phối', 40),
      emoji: safeText(opt.emoji || '✨', 8),
      text: safeText(opt.text || '', 120),
      from: validHex(opt.from, '#4b73b8'),
      to: validHex(opt.to, '#91d2ef'),
      foreground: validHex(opt.foreground, '#ffffff'),
      free: true
    };
  }
  function rounded(ctx, x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
  // Works only when called from a browser/WebView/owned editor with Canvas.
  // This is not callable by a Shadowrocket HTTP script without a Canvas context.
  function paint(ctx, item, x, y, options) {
    if (!ctx || typeof ctx.fillText !== 'function') {
      throw new TypeError('A Canvas 2D context is required');
    }
    const opt = options || {};
    const label = item && item.id === 'user-custom' ? custom(item) :
      resolve(item && item.id, item);
    if (!label) throw new Error('Unknown caption preset');
    const size = Math.max(12, Math.min(Number(opt.fontSize) || 22, 52));
    const inset = Math.max(8, Math.min(Number(opt.padding) || 13, 48));
    const gap = 7;
    const emoji = safeText(label.emoji, 8);
    const content = safeText(label.text, 120);
    ctx.save();
    ctx.font = '600 ' + size + 'px system-ui, -apple-system, sans-serif';
    const ew = emoji ? ctx.measureText(emoji).width : 0;
    const tw = ctx.measureText(content).width;
    const width = Math.ceil(2 * inset + ew + (emoji ? gap : 0) + tw);
    const height = Math.ceil(size * 1.5 + 2 * inset);
    const g = ctx.createLinearGradient(x, y, x + width, y);
    g.addColorStop(0, label.from); g.addColorStop(1, label.to);
    rounded(ctx, x, y, width, height, height / 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.textBaseline = 'middle';
    ctx.fillStyle = label.foreground;
    if (emoji) ctx.fillText(emoji, x + inset, y + height / 2);
    if (content) ctx.fillText(content, x + inset + ew + (emoji ? gap : 0), y + height / 2);
    ctx.restore();
    return { x, y, width, height };
  }
  const api = Object.freeze({ version: '1.0.0', groups: GROUPS, presets: PRESETS,
    list, find, resolve, custom, paint });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.CaptionFiltersFree = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
