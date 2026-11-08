'use strict';
const assert = require('node:assert/strict');
const C = require('../js/CaptionFilters.js');
assert.equal(C.version, '1.0.0');
assert.equal(C.groups.length, 5);
assert.equal(C.presets.length, 40);
assert.ok(C.presets.every(x => x.free === true));
assert.equal(new Set(C.presets.map(x => x.id)).size, C.presets.length);
assert.ok(C.list({group:'love'}).length >= 7);
assert.ok(C.list({search:'nhớ'}).length >= 2);
assert.ok(C.list({search:'gioi'}).length === 0);
assert.equal(C.resolve('general-7', {time:new Date(2026,10,8,21,46)}).text, '21:46');
assert.equal(C.resolve('general-8', {streak:8}).text, '8');
assert.equal(C.resolve('general-5', {location:'Hà Nội'}).text,'Hà Nội');
assert.equal(C.resolve('general-6', {weather:'Nắng nhẹ'}).text,'Nắng nhẹ');
assert.equal(C.resolve('general-1', {from:'red'}).from,'#353535');
assert.equal(C.custom({text:'Tự do',from:'#abc123'}).from,'#abc123');
assert.equal(C.resolve('unknown'),null);
assert.throws(()=>C.paint(null,C.find('general-1'),0,0),TypeError);
const calls=[];
const fakeCtx={
  save(){},restore(){},beginPath(){},moveTo(){},arcTo(){},closePath(){},fill(){},
  fillText(...v){calls.push(v);},measureText(t){return {width:t.length*11};},
  createLinearGradient(){return {addColorStop(){}};}
};
const bbox=C.paint(fakeCtx,C.find('general-1'),10,20);
assert.ok(bbox.width>30&&bbox.height>30&&calls.length>=2);
console.log('CaptionFilters Free tests PASS ('+C.presets.length+' presets)');
