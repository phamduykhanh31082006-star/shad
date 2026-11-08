'use strict';
const assert=require('node:assert/strict');
global.CaptionFiltersFree=require('../js/CaptionFilters.js');
require('../js/Photobooth.js');
const api=global.PhotoboothFree;
assert.equal(api.version,'1.1.0');
const labels=[];
const ctx={
 save(){},restore(){},fillRect(){},beginPath(){},moveTo(){},arcTo(){},closePath(){},clip(){},
 fill(){},drawImage(){},scale(){},fillText(v){labels.push(String(v));},
 measureText(t){return {width:String(t).length*10};},
 createLinearGradient(){return {addColorStop(){}}}
};
global.document={createElement(tag){assert.equal(tag,'canvas');return {width:0,height:0,getContext(){return ctx;}};}};
const love=global.CaptionFiltersFree.list({group:'love'})[0].id;
const cfg={template:'grid',filter:'none',pattern:'none',color:'#ffffff',season:'none',textMode:'none',font:'modern',text:'',overlay:null,date:new Date(),captionId:love,captionText:'Kiểm thử chú thích'};
const image=api.renderComposition(cfg,[null,null,null,null],4,640);
assert.equal(image.width,640);
assert.ok(labels.includes('Kiểm thử chú thích'));
labels.length=0;cfg.captionId='none';api.renderComposition(cfg,[null,null,null,null],4,640);
assert.ok(!labels.includes('Kiểm thử chú thích'));
console.log('PASS: Photobooth+CaptionFilters composition');
