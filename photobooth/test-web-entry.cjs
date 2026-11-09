'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const p = require('node:path');
const root = p.join(__dirname,'..');
const html = fs.readFileSync(p.join(root,'index.html'),'utf8');
for(const id of ['view-camera','view-history','view-chats','view-friends','view-profile','view-photobooth','photobooth-host','caption-select','shutter','camera-start','save-photo']){
 assert.match(html,new RegExp('id="'+id+'"'),'Missing UI '+id);
}
for(const src of ['./js/CaptionFilters.js','./js/Photobooth.js','./js/sky-locket-ui.js'])assert.ok(html.includes('src="'+src+'"'),'Missing script '+src);
assert.match(html,/chưa kết nối tài khoản Locket/i);
assert.doesNotMatch(html,/<input[^>]*type="password"/i);
for(const filename of ['js/CaptionFilters.js','js/Photobooth.js','js/sky-locket-ui.js'])assert.ok(fs.existsSync(p.join(root,filename)));
console.log('PASS: SKY Locket Web navigation, camera, editor and clear auth boundary');
