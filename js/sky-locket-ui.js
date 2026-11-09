(function(){
'use strict';
const qs=(q)=>document.querySelector(q);
const qsa=(q)=>Array.from(document.querySelectorAll(q));
const video=qs('#camera-stream');
const image=qs('#image-preview');
const empty=qs('#camera-empty');
const captionBadge=qs('#caption-preview');
const output=qs('#camera-status');
const shutter=qs('#shutter');
const save=qs('#save-photo');
const select=qs('#caption-select');
let stream=null,front=true,mode='photo',filter='none',imageCanvas=null,booth=null,recording=null,recordedChunks=[],history=[];
const filters={none:'none',bw:'grayscale(1) contrast(1.1)',film:'sepia(.25) contrast(.92) saturate(.85)',digicam:'saturate(1.38) contrast(1.22)',dream:'brightness(1.14) saturate(.8) contrast(.84)'};
const say=(t)=>{output.textContent=t;};
const stopCam=()=>{if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}video.srcObject=null;};
async function startCamera(){
  if(!navigator.mediaDevices?.getUserMedia){say('Trình duyệt không hỗ trợ camera. Hãy chọn ảnh từ thư viện.');return;}
  stopCam();
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:front?'user':'environment',width:{ideal:1280},height:{ideal:1280}},audio:false});
    imageCanvas=null;
    video.srcObject=stream;
    video.classList.toggle('mirror',front);
    await video.play();
    video.style.display='block';image.style.display='none';empty.style.display='none';
    save.disabled=true;say('Camera sẵn sàng. Nhấn nút tròn để chụp.');
  }catch(err){say('Không mở được camera: '+(err.name||'lỗi quyền')+'. Bạn có thể chọn ảnh từ thư viện.');}
}
function selectedCaption(){
  if(!select.value)return null;
  const item=window.CaptionFiltersFree?.find(select.value);
  if(!item)return null;
  const custom=qs('#caption-text').value.trim();
  return custom?{...item,text:custom}:item;
}
function paintCaption(ctx){
  const caption=selectedCaption();
  if(caption&&window.CaptionFiltersFree){window.CaptionFiltersFree.paint(ctx,caption,38,904,{fontSize:27,padding:17});}
}
function renderCaptionBadge(){
  const caption=selectedCaption();captionBadge.style.display=caption?'block':'none';
  if(caption){captionBadge.textContent=(caption.emoji||'')+' '+caption.text;captionBadge.style.background='linear-gradient(120deg,'+caption.from+','+caption.to+')';captionBadge.style.color=caption.foreground;}
}
function sourceToCanvas(source,w,h){
  const can=document.createElement('canvas');can.width=1024;can.height=1024;const ctx=can.getContext('2d');
  const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;
  const scale=Math.max(1024/sw,1024/sh);const dw=sw*scale,dh=sh*scale;
  ctx.save();ctx.filter='none';
  if(source===video&&front){ctx.translate(1024,0);ctx.scale(-1,1);}
  ctx.drawImage(source,(1024-dw)/2,(1024-dh)/2,dw,dh);ctx.restore();return can;
}
function currentCanvas(){if(imageCanvas){const c=document.createElement('canvas');c.width=1024;c.height=1024;c.getContext('2d').drawImage(imageCanvas,0,0);return c;}
 if(stream&&video.videoWidth)return sourceToCanvas(video);return null;}
function showCaptured(can){imageCanvas=can;image.src=can.toDataURL('image/jpeg',.91);image.style.display='block';video.style.display='none';empty.style.display='none';save.disabled=false;stopCam();}
function captureImage(){const can=currentCanvas();if(!can){say('Bật camera hoặc chọn ảnh trước khi chụp.');return;}showCaptured(can);history.unshift(can.toDataURL('image/jpeg',.8));history=history.slice(0,12);renderHistory();say('Đã chụp. Chọn Lưu ảnh để lưu vào thiết bị.');}
function renderHistory(){const el=qs('#history-local');el.replaceChildren();history.forEach((src,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Xem ảnh đã chụp '+(i+1));const im=document.createElement('img');im.src=src;b.appendChild(im);b.onclick=()=>{const pic=new Image();pic.onload=()=>{showCaptured(sourceToCanvas(pic));setView('camera');};pic.src=src;};el.appendChild(b);});}
function filterChange(name){filter=name;qsa('[data-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.filter===name));video.style.filter=filters[name];image.style.filter=imageCanvas?filters[name]:'none';}
function setView(name){
  qsa('.view').forEach(el=>el.classList.toggle('active',el.id==='view-'+name));
  qsa('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===name));
  if(name==='photobooth'){stopCam();if(!booth){try{booth=new window.PhotoboothFree.Photobooth({target:'#photobooth-host'});}catch(e){qs('#photobooth-host').textContent='Không mở được Photobooth: '+e.message;}}}
  if(name!=='camera'&&name!=='photobooth')stopCam();
}
const imgfile=qs('#photo-file');
imgfile.onchange=async(e)=>{
  const file=e.target.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){say('Vui lòng chọn file ảnh.');return;}
  const url=URL.createObjectURL(file);const pic=new Image();
  try{
    await new Promise((resolve,reject)=>{pic.onload=resolve;pic.onerror=reject;pic.src=url;});
    stopCam();showCaptured(sourceToCanvas(pic));say('Đã tải ảnh từ thư viện. Chọn Lưu ảnh để xuất ảnh đã chỉnh.');
  }catch(e){say('Không đọc được ảnh đã chọn.');}finally{URL.revokeObjectURL(url);imgfile.value='';}
};
function downloadBlob(blob,name){
  if(navigator.canShare&&navigator.share&&navigator.canShare({files:[new File([blob],name,{type:blob.type})]})){
    navigator.share({files:[new File([blob],name,{type:blob.type})],title:'SKY Locket Photo'}).catch(()=>{});
  }else{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
}
qs('#save-photo').onclick=()=>{
  if(!imageCanvas){say('Chụp ảnh trước để lưu.');return;}
  const c=document.createElement('canvas');c.width=1024;c.height=1024;const ctx=c.getContext('2d');ctx.filter=filters[filter];ctx.drawImage(imageCanvas,0,0);ctx.filter='none';paintCaption(ctx);
  c.toBlob(blob=>{if(blob){downloadBlob(blob,'SKY-Locket-'+Date.now()+'.png');say('Đã tạo ảnh. Chọn Lưu hình ảnh trong bảng chia sẻ của iPhone nếu được hỏi.');}else say('Xuất ảnh thất bại.');},'image/png');
};
async function recordVideo(){
  if(!stream||!video.videoWidth){say('Bật camera trước khi quay video.');return;}
  if(typeof MediaRecorder==='undefined'){say('Thiết bị không hỗ trợ quay video trong trình duyệt.');return;}
  try{
    let type=['video/mp4','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
    if(!type){say('Không tìm thấy định dạng video được hỗ trợ.');return;}
    const recorder=new MediaRecorder(stream,{mimeType:type});recordedChunks=[];recording=recorder;
    recorder.ondataavailable=e=>{if(e.data.size)recordedChunks.push(e.data);};
    recorder.onstop=()=>{const blob=new Blob(recordedChunks,{type});downloadBlob(blob,'SKY-Locket-'+Date.now()+(type.includes('mp4')?'.mp4':'.webm'));shutter.classList.remove('recording');recording=null;say('Video đã được ghi vào file. Chưa gửi đến Locket.');};
    recorder.start();shutter.classList.add('recording');say('Đang quay video… Nhấn nút đỏ để dừng.');
  }catch(e){say('Không thể quay video: '+e.message);}
}
qsa('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
qs('#friends-top').onclick=()=>setView('friends');
qs('#profile-top').onclick=()=>setView('profile');
qs('#open-history').onclick=()=>setView('history');
qs('#camera-start').onclick=startCamera;
qs('#choose-photo').onclick=()=>imgfile.click();
qs('#flip-camera').onclick=async()=>{front=!front;await startCamera();};
qs('#quick-filter').onclick=()=>qs('#filter-drawer').classList.toggle('open');
qs('#close-filter').onclick=()=>qs('#filter-drawer').classList.remove('open');
qsa('[data-filter]').forEach(b=>b.onclick=()=>filterChange(b.dataset.filter));
qsa('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;qsa('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));qs('#frame-label').textContent=mode==='photo'?'Ảnh':'Video';say(mode==='photo'?'Chế độ chụp ảnh.':'Chế độ video: chỉ lưu về máy, chưa đăng Locket.');});
qs('#shutter').onclick=()=>{if(mode==='photo')captureImage();else if(recording)recording.stop();else recordVideo();};
qs('#retake').onclick=()=>{imageCanvas=null;image.style.display='none';empty.style.display='flex';save.disabled=true;filterChange(filter);startCamera();};
const captions=window.CaptionFiltersFree;
if(captions){captions.presets.forEach(p=>{const opt=document.createElement('option');opt.value=p.id;opt.textContent=(p.emoji||'')+' '+p.name;select.appendChild(opt);});}
select.onchange=renderCaptionBadge;qs('#caption-text').oninput=renderCaptionBadge;
window.addEventListener('pagehide',stopCam);
})();
