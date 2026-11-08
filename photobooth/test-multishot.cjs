'use strict';
const assert = require('node:assert/strict');
const {PhotoboothFilter, version} = require('../js/PhotoboothFilter.js');
assert.equal(version, '1.2.0');
const f = new PhotoboothFilter();
assert.deepEqual(f.state().filled, [false,false,false,false]);
assert.equal(f.capacity, 4);
const sources = [{id:1},{id:2},{id:3},{id:4}];
(async () => {
  for (let n=0; n<4; n++) {
    const result=await f.capture(async()=>sources[n]);
    assert.equal(result.slot,n);
  }
  assert.equal(f.count,4);
  assert.equal(f.isReady,true);
  assert.equal(f.nextSlot,-1);
  assert.throws(()=>f.addFrame({id:5}), /All four/);
  assert.deepEqual(f.compose(frames => frames.map(x=>x.id)),[1,2,3,4]);
  const replacement={id:44};
  const result=f.addFrame(replacement,3);
  assert.equal(result.slot,3);
  assert.equal(f.count,4);
  assert.equal(f.compose(frames=>frames[3].id),44);
  const copied=f.frames; copied[0]=null;
  assert.equal(f.frames[0].id,1);
  assert.equal(f.removeFrame(1).count,3);
  assert.equal(f.nextSlot,1);
  assert.throws(()=>f.compose(x=>x),/four frames/);
  f.addFrame({id:22}); assert.equal(f.count,4);
  assert.deepEqual(f.compose(frames=>frames.map(x=>x.id)),[1,22,3,44]);
  assert.throws(()=>f.removeFrame(4), RangeError);
  assert.throws(()=>f.addFrame(null,2), TypeError);
  await assert.rejects(()=>f.capture(async()=>{throw new Error('Camera unavailable');}),/Camera unavailable/);
  assert.equal(f.count,4);
  f.reset(); assert.equal(f.count,0);
  assert.equal(f.nextSlot,0);
  console.log('PASS: multi-shot filter add/retake/compose/reset/errors');
})().catch(error => {console.error(error);process.exitCode=1;});
