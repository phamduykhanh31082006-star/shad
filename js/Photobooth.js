/*
 * Photobooth Free V1.0 — 100% original, no paywall, no tracking, no remote services.
 * Works inside an HTML/JavaScript runtime with camera + Canvas APIs.
 * IMPORTANT: Shadowrocket HTTP scripts do NOT provide DOM, camera, or Canvas APIs.
 * This file cannot inject native buttons into Locket or any other iOS app via MITM.
 * (c) 2026 Photobooth Free contributors. MIT License.
 */
(function (global) {
  'use strict';

  const COLORS = [
    ['Trắng', '#ffffff'], ['Đen', '#161616'], ['Hồng', '#ffd5e4'],
    ['Kem', '#fff1da'], ['Xanh', '#d8eafd'], ['Bạc hà', '#d8f6ea']
  ];
  const TEMPLATES = [
    { id: 'grid', label: 'Lưới 2×2' },
    { id: 'strip', label: 'Dải đôi' },
    { id: 'hero', label: 'Nổi bật' }
  ];
  const FILTERS = [
    { id: 'none', label: 'Gốc', css: 'none' },
    { id: 'bw', label: 'Đen trắng', css: 'grayscale(1) contrast(1.1)' },
    { id: 'digicam', label: 'Digicam', css: 'saturate(1.38) contrast(1.22) brightness(.97)' },
    { id: 'film', label: 'Phim', css: 'sepia(.25) contrast(.92) saturate(.85)' },
    { id: 'dream', label: 'Mộng mơ', css: 'brightness(1.14) saturate(.8) contrast(.84)' }
  ];
  const PATTERNS = [
    { id: 'none', label: 'Không' }, { id: 'dots', label: 'Chấm bi' },
    { id: 'check', label: 'Caro' }, { id: 'stripe', label: 'Kẻ sọc' },
    { id: 'stars', label: 'Kim tuyến' }, { id: 'kraft', label: 'Giấy kraft' },
    { id: 'sunset', label: 'Hoàng hôn' }, { id: 'sky', label: 'Bầu trời' }
  ];
  const SEASONS = [
    { id: 'none', label: 'Không' }, { id: 'halloween', label: 'Halloween' },
    { id: 'christmas', label: 'Giáng sinh' }, { id: 'tet', label: 'Tết' },
    { id: 'valentine', label: 'Valentine' }, { id: 'birthday', label: 'Sinh nhật' }
  ];
  const FONTS = [
    { id: 'modern', label: 'Hiện đại', css: 'system-ui, -apple-system, sans-serif' },
    { id: 'classic', label: 'Cổ điển', css: 'Georgia, serif' },
    { id: 'hand', label: 'Viết tay', css: 'cursive' },
    { id: 'type', label: 'Máy chữ', css: 'monospace' }
  ];

  const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const byId = (arr, id) => arr.find(item => item.id === id) || arr[0];
  const fmtDate = d => [String(d.getDate()).padStart(2,'0'),String(d.getMonth()+1).padStart(2,'0'),d.getFullYear()].join('.');

  function writePattern(ctx, mode, width, height) {
    ctx.save();
    if (mode === 'none') { ctx.restore(); return; }
    if (mode === 'kraft') {
      ctx.fillStyle = '#c9a77c'; ctx.fillRect(0,0,width,height);
      for (let i=0;i<700;i++) {
        const x = ((i * 7519) % 997) / 997 * width;
        const y = ((i * 4337) % 991) / 991 * height;
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.14)' : 'rgba(40,22,0,.10)';
        ctx.fillRect(x,y,2,2);
      }
    } else if (mode === 'sunset' || mode === 'sky') {
      const g = ctx.createLinearGradient(0,0,width,height);
      const stops = mode === 'sunset' ? ['#f9ba9c','#f06f9e','#b96ddd'] : ['#c3d9fb','#d7edff','#b0e0ed'];
      stops.forEach((c,i)=>g.addColorStop(i/(stops.length-1),c));
      ctx.fillStyle = g; ctx.fillRect(0,0,width,height);
    } else {
      ctx.strokeStyle = 'rgba(95,93,110,.24)';
      ctx.fillStyle = 'rgba(240,113,152,.21)';
      if (mode === 'dots') for (let y=14;y<height;y+=32) for(let x=14;x<width;x+=32){ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();}
      if (mode === 'check') for(let y=0;y<height;y+=42) for(let x=0;x<width;x+=42){ if(((x+y)/42)%2===0) ctx.fillRect(x,y,42,42); }
      if (mode === 'stripe') for(let i=-height;i<width+height;i+=46){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+height,height);ctx.lineWidth=16;ctx.stroke();}
      if (mode === 'stars') for(let i=0;i<150;i++){
        const x=((i*7919)%997)/997*width, y=((i*6221)%991)/991*height;
        ctx.fillStyle=i%3===0?'#edc35e':'rgba(255,255,255,.9)';
        ctx.beginPath();ctx.arc(x,y,(i%3)+2,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.restore();
  }

  function paintSeason(ctx, mode, width, height) {
    if(mode === 'none') return;
    const icons = {
      halloween: ['★','☾','✦'], christmas: ['✧','❄','✦'],
      tet: ['✿','✾','✿'], valentine: ['♥','♡','♥'], birthday: ['✷','★','✦']
    }[mode] || [];
    const color = { halloween:'#b477ec', christmas:'#cf526a', tet:'#db9433', valentine:'#d15a83', birthday:'#886ac8' }[mode];
    ctx.save();ctx.fillStyle=color;ctx.textAlign='center';
    for(let i=0;i<12;i++){
      const x = 25+(i%6)*(width-50)/5, y = i<6?24:height-17;
      ctx.font=`${i%3===0?25:17}px Georgia,serif`; ctx.fillText(icons[i%3],x,y);
    }
    ctx.restore();
  }

  function roundedRect(ctx,x,y,w,h,r) {
    const q=clamp(r,0,Math.min(w,h)/2);
    ctx.beginPath();ctx.moveTo(x+q,y);ctx.arcTo(x+w,y,x+w,y+h,q);
    ctx.arcTo(x+w,y+h,x,y+h,q);ctx.arcTo(x,y+h,x,y,q);
    ctx.arcTo(x,y,x+w,y,q);ctx.closePath();
  }
  function cover(ctx,img,x,y,w,h,filter) {
    ctx.save();roundedRect(ctx,x,y,w,h,22);ctx.clip();
    ctx.fillStyle='#d7d7d7';ctx.fillRect(x,y,w,h);
    if(img){
      const ratio=Math.max(w/img.width,h/img.height), sw=img.width*ratio, sh=img.height*ratio;
      ctx.filter=filter;ctx.drawImage(img,x+(w-sw)/2,y+(h-sh)/2,sw,sh);ctx.filter='none';
    } else {
      ctx.fillStyle='#a1a1a1';ctx.textAlign='center';ctx.font='44px sans-serif';ctx.fillText('+',x+w/2,y+h/2+13);
    }
    ctx.restore();
  }
  function rectsForTemplate(id,w,h) {
    if(id==='strip'){
      const pad=48,gap=12,col=(w-pad*2-gap)/2,row=(h-176-2*pad-gap)/2;
      return [[pad,pad,col,row],[pad+col+gap,pad,col,row],[pad,pad+row+gap,col,row],[pad+col+gap,pad+row+gap,col,row]];
    }
    if(id==='hero'){
      const pad=48,gap=12,wide=w-pad*2,large=(h-175)*.62,short=(h-175)-large-gap;
      return [[pad,pad,wide,large],[pad,pad+large+gap,(wide-2*gap)/3,short],[pad+(wide+gap)/3,pad+large+gap,(wide-2*gap)/3,short],[pad+2*(wide+gap)/3,pad+large+gap,(wide-2*gap)/3,short]];
    }
    const pad=48,gap=18,cell=(w-pad*2-gap)/2,header=26;
    return [[pad,header,cell,cell],[pad+cell+gap,header,cell,cell],[pad,header+cell+gap,cell,cell],[pad+cell+gap,header+cell+gap,cell,cell]];
  }
  function renderComposition(config,images,visible=4,width=1080) {
    const template=config.template;
    const height=template==='strip'?Math.round(width*1.5):template==='hero'?Math.round(width*1.24):width;
    const c=document.createElement('canvas');c.width=width;c.height=height;
    const ctx=c.getContext('2d',{alpha:false});
    ctx.fillStyle=config.color;ctx.fillRect(0,0,width,height);
    writePattern(ctx,config.pattern,width,height);
    const rects=rectsForTemplate(template,width,height);
    rects.forEach(([x,y,w,h],i)=>cover(ctx,i<visible?images[i]:null,x,y,w,h,byId(FILTERS,config.filter).css));
    paintSeason(ctx,config.season,width,height);
    if(config.overlay){
      const overlay=config.overlay;
      ctx.drawImage(overlay,0,0,width,height);
    }
    let message='';
    if(config.textMode==='date')message=fmtDate(config.date);
    else if(config.textMode==='custom')message=config.text.trim();
    else if(config.textMode==='both')message=[config.text.trim(),fmtDate(config.date)].filter(Boolean).join(' • ');
    if(message){
      const textColor=/^(#fff|#ffffff|#fef|#ffd|#d8|#c3|#f9)/i.test(config.color)?'#25252b':'#fff';
      ctx.fillStyle=textColor;ctx.textAlign='center';ctx.textBaseline='middle';
      const base=template==='grid'?Math.round(height*.957):height-64;
      ctx.font=`bold ${Math.round(width*.041)}px ${byId(FONTS,config.font).css}`;
      const maxW=width-90;
      while(ctx.measureText(message).width>maxW&&ctx.font.match(/\d+px/)){
        const size=parseInt(ctx.font.match(/\d+px/)[0]);if(size<=19)break;
        ctx.font=`bold ${size-2}px ${byId(FONTS,config.font).css}`;
      }
      ctx.fillText(message,width/2,base,maxW);
    }
    return c;
  }

  // Self-contained, 256-colour GIF89a encoder. No external libraries or APIs.
  function gifEncode(canvases,delayCs=65) {
    const out=[];
    const u8=n=>out.push(n&255), u16=n=>{u8(n);u8(n>>8);};
    const ascii=s=>{for(let i=0;i<s.length;i++)u8(s.charCodeAt(i));};
    const w=canvases[0].width,h=canvases[0].height;
    ascii('GIF89a');u16(w);u16(h);u8(0xF7);u8(0);u8(0);
    for(let i=0;i<256;i++){
      u8((i>>5)*255/7);u8(((i>>2)&7)*255/7);u8((i&3)*255/3);
    }
    // Netscape looping extension (infinite)
    u8(0x21);u8(0xFF);u8(11);ascii('NETSCAPE2.0');u8(3);u8(1);u16(0);u8(0);
    function lzw(pixels){
      const clear=256,end=257,output=[];
      let dict=new Map(),next=258,bits=9,acc=0,nbits=0;
      function emit(code){acc|=code<<nbits;nbits+=bits;while(nbits>=8){output.push(acc&255);acc>>>=8;nbits-=8;}}
      function reset(){emit(clear);dict=new Map();next=258;bits=9;}
      reset();let cur=pixels[0];
      for(let i=1;i<pixels.length;i++){
        const k=pixels[i],key=cur+','+k;
        if(dict.has(key)){cur=dict.get(key);} else {
          emit(cur);
          if(next<4096){dict.set(key,next++);if(next>(1<<bits)&&bits<12)bits++;}
          else reset();
          cur=k;
        }
      }
      emit(cur);emit(end);if(nbits)output.push(acc&255);
      return output;
    }
    canvases.forEach(canvas=>{
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      const data=ctx.getImageData(0,0,w,h).data;
      const indexed=new Uint8Array(w*h);
      for(let i=0,j=0;i<data.length;i+=4,j++)indexed[j]=((data[i]>>5)<<5)|((data[i+1]>>5)<<2)|(data[i+2]>>6);
      u8(0x21);u8(0xF9);u8(4);u8(0);u16(delayCs);u8(0);u8(0);
      u8(0x2C);u16(0);u16(0);u16(w);u16(h);u8(0);
      u8(8);const stream=lzw(indexed);
      for(let i=0;i<stream.length;i+=255){const block=stream.slice(i,i+255);u8(block.length);out.push(...block);}
      u8(0);
    });
    u8(0x3B);
    return new Blob([new Uint8Array(out)],{type:'image/gif'});
  }
  function makeDemoImage(index){
    const c=document.createElement('canvas');c.width=720;c.height=720;
    const ctx=c.getContext('2d');
    const colors=[['#ffa8ca','#8a72d5'],['#87c3fd','#2c91a4'],['#b9e9b0','#f4b680'],['#e9c391','#ce7b9d']];
    const g=ctx.createLinearGradient(0,0,720,720);g.addColorStop(0,colors[index][0]);g.addColorStop(1,colors[index][1]);ctx.fillStyle=g;ctx.fillRect(0,0,720,720);
    ctx.fillStyle='rgba(255,255,255,.76)';ctx.font='bold 240px system-ui';ctx.textAlign='center';ctx.fillText(['✦','♡','☾','✿'][index],360,415);
    return c;
  }
  async function decodeImage(file) {
    if(!file || !file.type.startsWith('image/'))throw new Error('Vui lòng chọn tệp ảnh hợp lệ.');
    if(file.size>25*1024*1024)throw new Error('Ảnh quá lớn (tối đa 25 MB).');
    if('createImageBitmap' in global)return await createImageBitmap(file);
    return await new Promise((res,rej)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(url);res(img);};img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('Không đọc được ảnh.'));};img.src=url;});
  }
  const CSS=`
  .pf{--pf-bg:#09090c;--pf-panel:#262629;--pf-line:#45454b;--pf-text:#fff;--pf-accent:#efc069;font-family:-apple-system,BlinkMacSystemFont,system-ui,Arial,sans-serif;color:var(--pf-text);max-width:560px;margin:0 auto;background:var(--pf-bg);border-radius:22px;padding:15px 15px 30px;box-sizing:border-box}
  .pf *{box-sizing:border-box}.pf button,.pf input,.pf select{font:inherit}.pf button{cursor:pointer;-webkit-tap-highlight-color:transparent}.pf-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px}.pf-top h2{font-size:20px;margin:0}.pf-free{color:#181818;background:var(--pf-accent);font-size:12px;font-weight:800;border-radius:20px;padding:5px 10px}
  .pf-camera{position:relative;aspect-ratio:1/1;border-radius:25px;overflow:hidden;background:#24242a;display:grid;place-items:center;border:1px solid #39393e}
  .pf-camera video{width:100%;height:100%;object-fit:cover}.pf-mirror{transform:scaleX(-1)}.pf-placeholder{padding:40px;text-align:center;color:#b9b9c0;line-height:1.7}
  .pf-overlay{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}.pf-count{font-size:116px;font-weight:900;color:white;text-shadow:0 3px 18px #000}
  .pf-chip{position:absolute;bottom:13px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.65);color:white;padding:9px 15px;border-radius:30px;white-space:nowrap;font-size:13px;font-weight:700}
  .pf-controls{display:flex;justify-content:space-around;align-items:center;gap:10px;padding:18px 0 12px}.pf-btn{background:#29292d;color:white;border:1px solid #46464b;border-radius:14px;padding:11px 14px;font-weight:650}.pf-btn:disabled{opacity:.45;cursor:not-allowed}
  .pf-shot{height:80px;width:80px;flex:0 0 80px;border-radius:50%;border:6px solid var(--pf-accent);background:#fff;box-shadow:inset 0 0 0 6px #161616;color:#191919;font-size:27px;font-weight:900}.pf-small{font-size:12px;color:#aaa}
  .pf-thumbs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:0 0 15px}.pf-thumb{position:relative;border:2px dashed #484850;border-radius:13px;aspect-ratio:1/1;overflow:hidden;background:#242429;color:#9e9ea3}
  .pf-thumb img{height:100%;width:100%;object-fit:cover}.pf-thumb span{position:absolute;right:4px;bottom:4px;background:#111a;color:#fff;border-radius:7px;padding:2px 6px;font-size:12px}.pf-thumb-selected{border:2px solid var(--pf-accent)}
  .pf-panel{background:var(--pf-panel);border-radius:20px;padding:16px;margin:12px 0}.pf-panel h3{font-size:15px;margin:3px 0 12px}.pf-row{display:flex;gap:7px;flex-wrap:wrap}.pf-option{flex:1 1 auto;min-width:70px;background:#39393d;color:#ccc;border:none;border-radius:12px;padding:12px 8px;font-size:13px;font-weight:700}.pf-option[aria-pressed="true"]{background:white;color:#171719}
  .pf-swatch{width:48px;height:48px;border:3px solid transparent;border-radius:50%;margin-right:3px;outline:2px solid transparent;outline-offset:2px}.pf-swatch[aria-pressed="true"]{outline-color:var(--pf-accent)}
  .pf-label{font-size:13px;font-weight:650;margin:14px 0 7px}.pf-hint{color:#aaa;font-size:12px;line-height:1.5}.pf-inline{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.pf-textinput{width:100%;padding:12px;border-radius:12px;border:1px solid #555;background:#17171a;color:white}
  .pf-preview{width:100%;border-radius:15px;display:block;background:#ddd;object-fit:contain}.pf-bottom{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}
  .pf-primary{background:var(--pf-accent);color:#181818;border:none;border-radius:14px;padding:15px;font-weight:850}.pf-status{font-size:13px;min-height:18px;color:#bfc6cf;margin:9px 0}.pf-info{color:#98989d;font-size:11px;line-height:1.65}.pf-file{display:none}.pf-section{font-size:14px;margin-top:16px;margin-bottom:7px;font-weight:700}
  @media (max-width:420px){.pf{padding:10px 10px 24px;border-radius:0}.pf-panel{padding:11px}.pf-option{min-width:66px;padding:11px 5px;font-size:12px}.pf-shot{height:72px;width:72px;flex-basis:72px}}
  `;

  class Photobooth {
    constructor({target}={}){
      this.root=typeof target==='string'?document.querySelector(target):target;
      if(!this.root)throw new Error('Thiếu phần tử target.');
      this.config={template:'grid',filter:'none',pattern:'none',color:'#ffffff',season:'none',textMode:'date',font:'modern',text:'',date:new Date(),overlay:null};
      this.images=[null,null,null,null];this.stream=null;this.front=true;this.auto=true;this.delay=3;this.selected=0;this.busy=false;this.destroyed=false;this.started=false;
      this.makeUI();this.renderControls();this.drawPreview();this.renderThumbs();
    }
    makeUI(){
      const style=document.createElement('style');style.textContent=CSS;this.root.appendChild(style);
      const wrap=document.createElement('div');wrap.className='pf';wrap.innerHTML=`
        <div class="pf-top"><h2>Photobooth</h2><span class="pf-free">MIỄN PHÍ 100%</span></div>
        <div class="pf-camera"><video class="pf-video pf-mirror" autoplay playsinline muted></video><div class="pf-placeholder">Bật camera để chụp 4 ảnh<br><small>Hoặc tải 4 ảnh có sẵn để ghép.</small></div><div class="pf-overlay"><span class="pf-count"></span></div><div class="pf-chip">Lưới 2×2 · 3 giây</div></div>
        <div class="pf-controls"><button class="pf-btn pf-camera-start">Bật camera</button><button class="pf-shot" aria-label="Chụp ảnh">◎</button><button class="pf-btn pf-flip" aria-label="Đổi camera">↻ Đổi</button></div>
        <div class="pf-thumbs"></div><div class="pf-inline"><button class="pf-btn pf-upload">+ Thêm ảnh</button><button class="pf-btn pf-clear">Chụp lại tất cả</button><input class="pf-file pf-pick" type="file" accept="image/*" multiple></div>
        <div class="pf-status" role="status" aria-live="polite"></div>
        <div class="pf-panel"><h3>Cách chụp</h3><div class="pf-row pf-auto"></div><div class="pf-section">Hẹn giờ ảnh đầu</div><div class="pf-row pf-delay"></div><div class="pf-section">Kiểu</div><div class="pf-row pf-template"></div><div class="pf-section">Phong cách</div><div class="pf-row pf-filter"></div></div>
        <div class="pf-panel"><h3>Khung và trang trí</h3><div class="pf-label">Màu trơn</div><div class="pf-row pf-colors"></div><div class="pf-label">Họa tiết</div><div class="pf-row pf-pattern"></div><div class="pf-label">Theo mùa</div><div class="pf-row pf-season"></div><div class="pf-label">Khung ảnh tự thiết kế</div><div class="pf-inline"><button class="pf-btn pf-overlay-upload">Tải PNG trong suốt</button><button class="pf-btn pf-overlay-reset">Bỏ khung</button><input class="pf-file pf-overlay-pick" type="file" accept="image/png,image/webp"></div></div>
        <div class="pf-panel"><h3>Chữ</h3><div class="pf-row pf-textmode"></div><div class="pf-label">Phông chữ</div><div class="pf-row pf-font"></div><div class="pf-label">Nội dung chữ riêng</div><input class="pf-textinput pf-text-value" maxlength="80" placeholder="Nhập dòng chữ của bạn"><p class="pf-hint">Các hiệu ứng, khung, ngày chụp và xuất file đều miễn phí. Không có tài khoản, quảng cáo hay gói trả phí.</p></div>
        <div class="pf-panel"><h3>Xem trước thành phẩm</h3><canvas class="pf-preview"></canvas><div class="pf-bottom"><button class="pf-primary pf-save">Lưu ảnh PNG</button><button class="pf-primary pf-share">Chia sẻ ảnh</button><button class="pf-btn pf-gif">Xuất GIF</button><button class="pf-btn pf-video-export">Xuất video</button></div><div class="pf-info">Video dùng định dạng được trình duyệt hỗ trợ (MP4/WebM). Tính năng này không thêm nút vào ứng dụng iOS gốc qua Shadowrocket.</div></div>`;
      this.root.appendChild(wrap);this.el=wrap;
      this.video=wrap.querySelector('.pf-video');this.count=wrap.querySelector('.pf-count');this.placeholder=wrap.querySelector('.pf-placeholder');this.live=wrap.querySelector('.pf-status');
      this.preview=wrap.querySelector('.pf-preview');
      const Q=s=>wrap.querySelector(s);
      Q('.pf-camera-start').onclick=()=>this.startCamera();
      Q('.pf-shot').onclick=()=>this.take();Q('.pf-flip').onclick=()=>this.flipCamera();
      Q('.pf-upload').onclick=()=>Q('.pf-pick').click();Q('.pf-pick').onchange=e=>this.loadImages(e.target.files);
      Q('.pf-clear').onclick=()=>{this.images=[null,null,null,null];this.selected=0;this.setStatus('Đã xóa 4 ô ảnh.');this.refresh();};
      Q('.pf-overlay-upload').onclick=()=>Q('.pf-overlay-pick').click();
      Q('.pf-overlay-pick').onchange=async e=>{try{this.config.overlay=await decodeImage(e.target.files[0]);this.refresh();}catch(err){this.setStatus(err.message);}};
      Q('.pf-overlay-reset').onclick=()=>{this.config.overlay=null;this.refresh();};
      Q('.pf-text-value').oninput=e=>{this.config.text=e.target.value;this.refresh();};
      Q('.pf-save').onclick=()=>this.savePNG();Q('.pf-share').onclick=()=>this.share();Q('.pf-gif').onclick=()=>this.saveGIF();Q('.pf-video-export').onclick=()=>this.saveVideo();
    }
    setStatus(s){this.live.textContent=s;}
    renderButtons(selector,items,value,click){
      const root=this.el.querySelector(selector);root.replaceChildren();
      items.forEach(item=>{const b=document.createElement('button');b.className='pf-option';b.textContent=item.label;b.setAttribute('aria-pressed',String(value===item.id));b.onclick=()=>click(item.id);root.appendChild(b);});
    }
    renderControls(){
      const set=(key,val)=>{this.config[key]=val;this.refresh();};
      this.renderButtons('.pf-auto',[{id:'yes',label:'Tự động'},{id:'no',label:'Từng ảnh'}],this.auto?'yes':'no',v=>{this.auto=v==='yes';this.renderControls();});
      this.renderButtons('.pf-delay',[3,5,10].map(n=>({id:n,label:`${n} giây`})),this.delay,v=>{this.delay=v;this.renderControls();});
      this.renderButtons('.pf-template',TEMPLATES,this.config.template,v=>set('template',v));
      this.renderButtons('.pf-filter',FILTERS,this.config.filter,v=>set('filter',v));
      this.renderButtons('.pf-pattern',PATTERNS,this.config.pattern,v=>set('pattern',v));
      this.renderButtons('.pf-season',SEASONS,this.config.season,v=>set('season',v));
      this.renderButtons('.pf-textmode',[{id:'date',label:'Ngày'},{id:'custom',label:'Chữ riêng'},{id:'both',label:'Cả hai'},{id:'none',label:'Không'}],this.config.textMode,v=>set('textMode',v));
      this.renderButtons('.pf-font',FONTS,this.config.font,v=>set('font',v));
      const cols=this.el.querySelector('.pf-colors');cols.replaceChildren();
      COLORS.forEach(([name,color])=>{const b=document.createElement('button');b.className='pf-swatch';b.title=name;b.setAttribute('aria-label',name);b.style.background=color;b.setAttribute('aria-pressed',String(this.config.color===color));b.onclick=()=>set('color',color);cols.appendChild(b);});
      this.el.querySelector('.pf-chip').textContent=`${byId(TEMPLATES,this.config.template).label} · ${this.delay} giây`;
    }
    refresh(){this.renderControls();this.drawPreview();this.renderThumbs();}
    drawPreview(){
      const canvas=renderComposition(this.config,this.images,4,800);this.preview.width=canvas.width;this.preview.height=canvas.height;
      this.preview.getContext('2d').drawImage(canvas,0,0);
    }
    renderThumbs(){
      const row=this.el.querySelector('.pf-thumbs');row.replaceChildren();
      this.images.forEach((img,i)=>{const b=document.createElement('button');b.className='pf-thumb'+(this.selected===i?' pf-thumb-selected':'');b.title='Chọn ảnh '+(i+1)+' để chụp lại';
        if(img){const c=document.createElement('canvas');c.width=150;c.height=150;const x=c.getContext('2d');cover(x,img,0,0,150,150,'none');const thumbnail=new Image();thumbnail.src=c.toDataURL('image/jpeg',.75);b.appendChild(thumbnail);}
        const text=document.createElement('span');text.textContent=String(i+1);b.appendChild(text);
        b.onclick=()=>{this.selected=i;this.renderThumbs();this.setStatus(`Đã chọn ô ${i+1}. Bấm chụp để thay ảnh.`);};row.appendChild(b);
      });
    }
    async startCamera(){
      if(!navigator.mediaDevices?.getUserMedia){this.setStatus('Trình duyệt không hỗ trợ camera. Có thể thêm ảnh từ thư viện.');return;}
      try{
        if(this.stream)this.stream.getTracks().forEach(t=>t.stop());
        const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:this.front?'user':'environment',width:{ideal:1280},height:{ideal:1280}}});
        this.stream=stream;this.video.srcObject=stream;this.video.classList.toggle('pf-mirror',this.front);
        await this.video.play();this.placeholder.style.display='none';this.started=true;this.setStatus('Camera sẵn sàng. Chọn chế độ rồi bấm nút chụp.');
      }catch(err){this.setStatus(`Không mở được camera (${err.name||'lỗi'}). Hãy cấp quyền hoặc tải ảnh từ thư viện.`);}
    }
    async flipCamera(){if(this.busy)return;this.front=!this.front;await this.startCamera();}
    async countDown(sec){for(let n=sec;n>0;n--){this.count.textContent=n;await sleep(1000);if(this.destroyed)throw new Error('Stopped');}this.count.textContent='';}
    capture(){
      if(!this.started||this.video.videoWidth===0)throw new Error('Chưa bật camera.');
      const c=document.createElement('canvas');c.width=960;c.height=960;
      const x=c.getContext('2d');const v=this.video;
      const scale=Math.max(960/v.videoWidth,960/v.videoHeight),w=v.videoWidth*scale,h=v.videoHeight*scale;
      x.save();if(this.front){x.translate(960,0);x.scale(-1,1);}x.drawImage(v,(960-w)/2,(960-h)/2,w,h);x.restore();return c;
    }
    async take(){
      if(this.busy)return;
      if(!this.started){this.setStatus('Bật camera trước hoặc chọn “Thêm ảnh” để dùng ảnh có sẵn.');return;}
      this.busy=true;const shot=this.el.querySelector('.pf-shot');shot.disabled=true;
      try{
        if(this.auto){
          let index=this.images.findIndex(v=>v===null);if(index<0)index=this.selected;
          await this.countDown(this.delay);
          for(let n=index;n<4;n++){
            if(n>index)await this.countDown(1);
            this.images[n]=this.capture();this.selected=clamp(n+1,0,3);this.refresh();this.setStatus(`Đã chụp ảnh ${n+1}/4.`);
          }
          this.setStatus('Đã chụp đủ 4 ảnh. Chọn ô để chụp lại hoặc lưu ảnh.');
        } else {
          await this.countDown(this.images.some(Boolean)?1:this.delay);
          const idx=this.selected;this.images[idx]=this.capture();this.selected=(idx+1)%4;
          this.refresh();this.setStatus(`Đã chụp ô ${idx+1}.`);
        }
      }catch(err){this.setStatus(err.message||'Không thể chụp ảnh.');}
      finally{this.busy=false;shot.disabled=false;this.count.textContent='';}
    }
    async loadImages(files){
      try{
        if(!files?.length)return;
        let i=this.images.findIndex(v=>v===null);if(i<0)i=this.selected;
        for(const file of Array.from(files).slice(0,4)){
          this.images[i]=await decodeImage(file);i=(i+1)%4;
        }
        this.selected=i;this.refresh();this.setStatus('Đã thêm ảnh từ thư viện.');
      }catch(err){this.setStatus(err.message||'Không tải được ảnh.');}
      this.el.querySelector('.pf-pick').value='';
    }
    download(blob,filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);}
    hasFourPhotos(){if(this.images.every(Boolean))return true;this.setStatus('Cần chụp hoặc thêm đủ 4 ảnh trước khi xuất.');return false;}
    async savePNG(){if(!this.hasFourPhotos())return;const canvas=renderComposition(this.config,this.images);const blob=await new Promise(res=>canvas.toBlob(res,'image/png'));if(!blob){this.setStatus('Không thể tạo ảnh PNG.');return;}this.download(blob,'photobooth-'+Date.now()+'.png');this.setStatus('Đã tạo ảnh PNG để lưu.');}
    async share(){
      if(!this.hasFourPhotos())return;
      const canvas=renderComposition(this.config,this.images);const blob=await new Promise(res=>canvas.toBlob(res,'image/png'));
      if(!blob)return;
      const file=new File([blob],'photobooth.png',{type:'image/png'});
      if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'Photobooth'});this.setStatus('Đã mở bảng chia sẻ.');}catch(err){if(err.name!=='AbortError')this.setStatus('Không thể chia sẻ.');}}
      else {this.download(blob,'photobooth-'+Date.now()+'.png');this.setStatus('Thiết bị không hỗ trợ chia sẻ tệp: đã tạo ảnh PNG.');}
    }
    async saveGIF(){
      if(this.busy||!this.hasFourPhotos())return;this.busy=true;this.setStatus('Đang tạo GIF 4 khung…');
      try{await sleep(50);const frames=[];for(let i=1;i<=4;i++)frames.push(renderComposition(this.config,this.images,i,320));
        frames.push(renderComposition(this.config,this.images,4,320));
        const blob=gifEncode(frames,65);this.download(blob,'photobooth-'+Date.now()+'.gif');this.setStatus('Đã tạo GIF 5 khung hình.');
      }catch(err){this.setStatus('Lỗi tạo GIF: '+err.message);}finally{this.busy=false;}
    }
    async saveVideo(){
      if(this.busy||!this.hasFourPhotos())return;this.busy=true;
      try{
        if(!HTMLCanvasElement.prototype.captureStream||typeof MediaRecorder==='undefined')throw new Error('Trình duyệt không hỗ trợ MediaRecorder. Hãy xuất GIF thay thế.');
        const canvas=renderComposition(this.config,this.images,0,720),ctx=canvas.getContext('2d');
        const candidates=['video/mp4;codecs=h264','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
        const type=candidates.find(t=>MediaRecorder.isTypeSupported(t));if(!type)throw new Error('Không tìm thấy định dạng video được hỗ trợ.');
        const stream=canvas.captureStream(12),chunks=[];
        const recorder=new MediaRecorder(stream,{mimeType:type});
        const ended=new Promise((res,rej)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=res;recorder.onerror=e=>rej(new Error('Ghi video thất bại.'));});
        recorder.start();this.setStatus('Đang xuất video…');
        for(let i=0;i<5;i++){const frame=renderComposition(this.config,this.images,Math.min(i+1,4),720);ctx.drawImage(frame,0,0);await sleep(800);}
        recorder.stop();await ended;stream.getTracks().forEach(t=>t.stop());
        const blob=new Blob(chunks,{type});this.download(blob,'photobooth-'+Date.now()+(type.includes('mp4')?'.mp4':'.webm'));this.setStatus('Đã xuất video.');
      }catch(err){this.setStatus(err.message||'Lỗi xuất video.');}finally{this.busy=false;}
    }
    addDemoPhotos(){this.images=[0,1,2,3].map(makeDemoImage);this.selected=0;this.refresh();this.setStatus('Đang xem 4 ảnh minh họa để kiểm thử.');}
    destroy(){this.destroyed=true;if(this.stream)this.stream.getTracks().forEach(t=>t.stop());this.root.replaceChildren();}
  }
  global.PhotoboothFree={Photobooth,renderComposition,gifEncode,version:'1.0.0'};
})(typeof window !== 'undefined' ? window : globalThis);