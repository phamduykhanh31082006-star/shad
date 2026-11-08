'use strict';
const assert = require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const content=fs.readFileSync(path.join(root,'js/Locket_Filter_Probe.js'),'utf8');
const mod=fs.readFileSync(path.join(root,'modules/Locket_Filter_Probe.sgmodule'),'utf8');
assert.ok(mod.includes('[Script]'));
assert.ok(mod.includes('[MITM]'));
assert.ok(mod.includes('hostname = %APPEND% api.locketcamera.com'));
assert.ok(mod.includes('js/Locket_Filter_Probe.js'));
assert.equal((mod.match(/type=http-request/g)||[]).length,1);
assert.ok(!/revenuecat/i.test(mod));
function simulate(url) {
  const logs=[];
  const calls=[];
  vm.runInNewContext(content, {
    $request:{url,headers:{Authorization:'Bearer SECRET_ACCOUNT_TOKEN'},body:'SECRET_IMAGE_DATA'},
    $done:function(value){calls.push(value);},
    console:{log:function(value){logs.push(value);}}
  });
  assert.equal(calls.length,1);
  assert.equal(JSON.stringify(calls[0]),'{}');
  assert.equal(logs.length,1);
  assert.ok(!logs[0].includes('SECRET'));
  assert.ok(!logs[0].includes('api.locketcamera.com'));
  assert.ok(!logs[0].includes('uid='));
  return logs[0];
}
assert.ok(simulate('https://api.locketcamera.com/captionTemplates?uid=SECRET123').includes('possible-filter-api'));
assert.ok(simulate('https://api.locketcamera.com/postMomentV2?token=SECRET123').includes('upload-related'));
assert.ok(simulate('https://api.locketcamera.com/getLatestMomentV2?key=SECRET123').includes('other-api'));
console.log('PASS: Shadowrocket module probe config + privacy-preserving pass-through script');
