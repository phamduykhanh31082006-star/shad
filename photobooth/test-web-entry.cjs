'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(html,/script src="\.\/js\/CaptionFilters\.js"/);
assert.match(html,/script src="\.\/js\/Photobooth\.js"/);
assert.match(html,/new PhotoboothFree\.Photobooth/);
assert.match(html,/id="sample"/);
assert.match(html,/id="app"/);
assert.match(html,/không tự gửi vào Locket/);
for(const f of ['js/CaptionFilters.js','js/Photobooth.js']){
  assert.ok(fs.existsSync(path.join(root,f)));
}
console.log('PASS: mobile web entrypoint / local assets / clear Locket limitations');
