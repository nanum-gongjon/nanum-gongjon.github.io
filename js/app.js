/* 이충길 제15회 개인전 〈나눔과 공존〉 모바일 안내 — 화면 동작 */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const imgPath=(kind,n)=>'images/'+kind+'/'+pad(n)+'.webp';
let dk='portfolio';const D=()=>DOCS[dk];
const docPath=(kind,n)=>'images/'+D().dir+'/'+kind+'/'+pad(n)+'.webp';
const HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke-linejoin="round"/></svg>';
const fmt=iso=>{try{return new Date(iso).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}catch(e){return ''}};

let items=[],cur=0,rail,slides=[],tm,lastPost=0;
let ST={likes:{},mine:new Set(),comments:{}};
const loadedCm={};

/* ---------- 화면 만들기 ---------- */
function formHTML(kind,n){
  const max=kind==='g'?500:300;
  return '<form class="cf" data-k="'+kind+'"'+(n?' data-n="'+n+'"':'')+' autocomplete="off">'
   +'<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">'
   +'<input type="text" name="nick" maxlength="20" placeholder="이름(닉네임)" required aria-label="이름 또는 닉네임" value="'+esc(API.nick())+'">'
   +'<textarea name="body" maxlength="'+max+'" required aria-label="'+(kind==='g'?'방명록':'댓글')+' 내용" placeholder="'+(kind==='g'?'전시를 보신 소감을 남겨 주세요.':'이 작품에 대한 생각을 남겨 주세요.')+'"></textarea>'
   +'<div class="row2"><span class="cnt">0 / '+max+'</span><button class="sub-b" type="submit">남기기</button></div></form>';
}
const demoNote=()=>API.live?'':'<p class="demo">미리보기 모드입니다. 지금 남기는 글과 좋아요는 이 기기에만 저장됩니다. (Supabase를 연결하면 모든 관람객에게 공유됩니다.)</p>';

function build(){
  const total=WORKS.length;
  items=['intro',...WORKS.map(w=>String(w.n)),'about','guest'];
  rail=$('#rail');
  let h='<section class="s" data-id="intro"><div class="hero"><img data-eager="1" alt="표지화 모정" src="'+imgPath('view',1)+'" fetchpriority="high" width="1000" height="681"></div><div class="in"><h1>나눔과 공존</h1><p class="sub">이충길 열다섯 번째 개인전</p>'
   +'<dl class="inf"><dt>전시기간</dt><dd>'+esc(INFO.term)+'</dd><dt>장소</dt><dd>'+esc(INFO.place)+'</dd><dt>초대일시</dt><dd>'+esc(INFO.open)+'</dd></dl>'
   +'<div class="row three"><button class="pri" data-go="1" type="button">작품 보기</button><button class="btn" data-sheet="1" type="button">작품 목록</button><button class="btn" data-go="about" type="button">작가의 말</button></div>'
   +'<div class="row2b"><button class="btn" data-go="guest" type="button">방명록 남기기</button></div>'
   +'<p class="hint">작품은 화면 아래의 ‘이전 작품’·‘다음 작품’ 버튼을 누르거나 화면을 옆으로 밀어서 넘길 수 있습니다. 팸플릿의 작품 번호로 찾으려면 왼쪽 위 ‘작품 목록’을 누르세요. 사진을 누르면 확대되고, 두 손가락으로 더 크게 볼 수 있습니다.</p></div></section>';

  for(const w of WORKS){
    h+='<section class="s" data-id="'+w.n+'"><figure class="fig"><img data-n="'+w.n+'" alt="'+esc(w.t)+'"><p class="zhint">사진을 누르면 크게 볼 수 있어요</p></figure>'
     +'<div class="cap"><span class="no">'+(w.n===1?'표지':w.n)+'</span><div><h2>'+esc(w.t)+'</h2><p class="meta"><span>'+esc(w.s)+'</span><span>'+w.y+'년</span></p></div></div>'
     +'<p class="desc">'+esc(w.d)+'</p>'
     +'<div class="act"><button class="like" type="button" data-n="'+w.n+'" aria-pressed="false" aria-label="좋아요">'+HEART+'<span>좋아요</span><span class="n lc">0</span></button>'
     +'<button class="jump" type="button" data-n="'+w.n+'">댓글 <span class="n cc">0</span></button></div>'
     +'<div class="cm" id="cm'+w.n+'"><h3>작품 댓글<small class="cc2"></small></h3>'+demoNote()+'<ul class="cl" aria-live="polite"></ul>'+formHTML('c',w.n)+'</div></section>';
  }

  h+='<section class="s" data-id="about"><div class="sec"><h3>작가의 말</h3><p class="lead">나눔의 미학으로 피어나는 공존의 울림</p>'
   +S.map(p=>'<p>'+esc(p)+'</p>').join('')
   +'<div class="sig"><span>서양화가<br>이충길</span><img src="images/artist.webp" width="92" height="122" alt="서양화가 이충길 화백" loading="lazy"></div>'
   +'<h3 style="margin-top:34px">약력</h3>'+Object.keys(BIO).map(k=>'<h4>'+esc(k)+'</h4><ul>'+BIO[k].map(i=>'<li>'+esc(i)+'</li>').join('')+'</ul>').join('')
   +'<h4>작업실</h4><ul><li>부산광역시 동래구 사직북로48번길 206-4 (온천동)</li></ul>'
   +'<div class="row col" style="margin-top:26px"><button class="pri" data-doc="portfolio" type="button">작가 관련 정보(Portfolio) 보기</button><button class="pri" data-doc="guide" type="button">전시 관람 도우미(창작기법)</button><button class="pri" data-doc="nfc" type="button">전시 관람 도우미(NFC TAG)</button></div>'
   +'<h3 style="margin-top:30px">전시 안내</h3><p>'+esc(INFO.term)+'<br>'+esc(INFO.place)+'<br>'+esc(INFO.addr)+'<br>초대일시 '+esc(INFO.open)+'</p>'
   +'<div class="row" style="margin-top:6px"><a class="btn" target="_blank" rel="noopener" href="https://map.naver.com/p/search/'+encodeURIComponent(INFO.addr)+'">길찾기</a><a class="btn" href="tel:'+esc(INFO.tel)+'">전화하기</a><a class="btn" href="mailto:'+esc(INFO.mail)+'">이메일</a></div>'
   +'<div class="row" style="margin-top:14px"><button class="pri" data-go="guest" type="button" style="width:100%">방명록 남기기</button></div>'
   +'<p class="hint" style="margin-top:22px">본 전시는 2026년 부산광역시, 부산문화재단 〈부산문화예술지원사업〉의 지원을 받았습니다.</p></div></section>';

  h+='<section class="s" data-id="guest"><div class="sec"><h3>방명록</h3><p>전시를 보시고 느끼신 점을 작가에게 남겨 주세요. 따뜻한 한마디가 큰 힘이 됩니다.</p>'+demoNote()
   +formHTML('g')+'<div class="gb" style="margin-top:22px"><h3>관람객의 글<small class="gc"></small></h3><ul class="cl" id="gl" aria-live="polite"></ul></div></div></section>';

  rail.innerHTML=h; slides=[...rail.querySelectorAll('.s')];
  const i=items.indexOf(location.hash.slice(1)); cur=i>=0?i:0;
  go(cur,false); upd();
}

/* ---------- 이동 ---------- */
function go(i,sm){i=Math.max(0,Math.min(items.length-1,i));const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;rail.scrollTo({left:i*rail.clientWidth,behavior:sm&&!rm?'smooth':'auto'})}
const goId=(id,sm)=>go(items.indexOf(String(id)),sm);
function sync(){const i=Math.round(rail.scrollLeft/rail.clientWidth);if(i!==cur){cur=i;upd()}}
const isWork=id=>/^\d+$/.test(id);
function upd(){
  const id=items[cur],n=+id;
  $('#pos').textContent=id==='intro'?'표지':id==='about'?'작가의 말':id==='guest'?'방명록':n===1?'표지화':n+' / '+WORKS.length;
  const prev=items[cur-1],next=items[cur+1];
  $('#pv').disabled=cur===0;$('#nx').disabled=cur===items.length-1;
  $('#pv').textContent=prev==='intro'?'표지':prev==='about'?'작가의 말':'이전 작품';
  $('#nx').textContent=next==='about'?'작가의 말':next==='guest'?'방명록':'다음 작품';
  try{history.replaceState(null,'',id==='intro'?location.pathname+location.search:'#'+id)}catch(e){}
  document.title=(isWork(id)?WORKS.find(x=>x.n===n).t+' · ':'')+'나눔과 공존 · 이충길';
  fill();
  if(isWork(id)&&!loadedCm[n])loadComments(n);
  if(id==='guest'&&!loadedCm.g)loadGuest();
}
function fill(){ // 현재 슬라이드와 앞뒤 한 장씩 이미지 불러오기
  for(let k=cur-1;k<=cur+1;k++){const s=slides[k];if(!s)continue;const im=s.querySelector('.fig img');
    if(im&&!im.getAttribute('src')){im.decoding='async';im.src=imgPath('view',im.dataset.n)}}
}

/* ---------- 좋아요 · 댓글 ---------- */
function paintLike(n){
  const mine=ST.mine.has(n),c=ST.likes[n]||0;
  document.querySelectorAll('.like[data-n="'+n+'"]').forEach(b=>{b.setAttribute('aria-pressed',mine);b.querySelector('.lc').textContent=c;b.setAttribute('aria-label','좋아요 '+c+'개'+(mine?', 누름':''))});
  const t=document.querySelector('.th[data-n="'+n+'"] .tl');if(t){t.textContent='♥ '+c;t.hidden=!c}
}
function paintCm(n){
  const c=ST.comments[n]||0,s=document.getElementById('cm'+n);if(!s)return;
  document.querySelectorAll('.jump[data-n="'+n+'"] .cc').forEach(e=>e.textContent=c);
  s.querySelector('.cc2').textContent=c?c+'개':'';
}
function renderList(ul,list,empty){
  ul.textContent='';
  if(!list.length){const li=document.createElement('li');li.className='empty';li.textContent=empty;ul.appendChild(li);return}
  list.forEach(c=>{
    const li=document.createElement('li'),h=document.createElement('div'),b=document.createElement('b'),t=document.createElement('time'),p=document.createElement('p');
    h.className='ch';b.textContent=c.nickname;t.textContent=fmt(c.created_at);p.textContent=c.body;
    h.append(b,t);li.append(h,p);ul.appendChild(li);
  });
}
async function loadComments(n){
  loadedCm[n]=1;
  const r=await API.comments(n),ul=document.querySelector('#cm'+n+' .cl');
  if(r.error){loadedCm[n]=0;ul.innerHTML='<li class="empty">댓글을 불러오지 못했습니다.</li>';return}
  ST.comments[n]=r.list.length;renderList(ul,r.list,'첫 댓글을 남겨 주세요.');paintCm(n);
}
async function loadGuest(){
  loadedCm.g=1;
  const r=await API.guest(),ul=$('#gl');
  if(r.error){loadedCm.g=0;ul.innerHTML='<li class="empty">방명록을 불러오지 못했습니다.</li>';return}
  renderList(ul,r.list,'첫 방명록을 남겨 주세요.');$('.gc').textContent=r.list.length?r.list.length+'개':'';
}
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2400)}

function bindRail(){
  rail.addEventListener('scroll',()=>{clearTimeout(tm);tm=setTimeout(sync,90)},{passive:true});
  rail.addEventListener('click',async e=>{
    const t=e.target;
    const im=t.closest('.fig img');if(im&&im.src){zoom(+im.dataset.n);return}
    const g=t.closest('[data-go]');if(g){goId(g.dataset.go,true);return}
    if(t.closest('[data-sheet]')){sheet(true);return}
    const dd=t.closest('[data-doc]');if(dd){openDoc(dd.dataset.doc);return}
    const j=t.closest('.jump');if(j){const c=document.getElementById('cm'+j.dataset.n);if(c)c.scrollIntoView({behavior:'smooth',block:'start'});return}
    const b=t.closest('.like');if(b){
      const n=+b.dataset.n;b.disabled=true;
      const r=await API.toggleLike(n);b.disabled=false;
      if(r.error){toast('좋아요를 저장하지 못했습니다.');return}
      if(r.liked)ST.mine.add(n);else ST.mine.delete(n);
      ST.likes[n]=r.count;paintLike(n);
      b.classList.add('pop');setTimeout(()=>b.classList.remove('pop'),180);
    }
  });
  rail.addEventListener('input',e=>{const f=e.target.closest('.cf');if(f&&e.target.name==='body')f.querySelector('.cnt').textContent=e.target.value.length+' / '+e.target.maxLength});
  rail.addEventListener('submit',async e=>{
    const f=e.target.closest('.cf');if(!f)return;e.preventDefault();
    const el=f.elements;if(el.website.value)return; // 스팸 방지용 숨은 칸
    const nick=el.nick.value.trim(),body=el.body.value.trim();
    if(!nick||!body){toast('이름과 내용을 입력해 주세요.');return}
    if(Date.now()-lastPost<20000){toast('잠시 후 다시 남겨 주세요.');return}
    const btn=f.querySelector('.sub-b');btn.disabled=true;
    const k=f.dataset.k,n=+f.dataset.n;
    const r=k==='g'?await API.addGuest(nick,body):await API.addComment(n,nick,body);
    btn.disabled=false;
    if(r.error){toast('저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');return}
    lastPost=Date.now();API.saveNick(nick);el.body.value='';f.querySelector('.cnt').textContent='0 / '+el.body.maxLength;
    toast('남겨 주셔서 감사합니다.');
    if(k==='g')loadGuest();else loadComments(n);
  });
}

/* ---------- 작품 목록 ---------- */
function sheet(o){
  const sh=$('#sheet'),gr=$('#grid');
  if(o&&!gr.children.length){
    gr.innerHTML=WORKS.map((w,k)=>'<button class="th" data-n="'+w.n+'" data-i="'+(k+1)+'" type="button"><img alt="" loading="lazy" src="'+imgPath('thumb',w.n)+'"><span class="tn">'+(w.n===1?'표지':w.n)+'</span><span class="tl" hidden></span><span class="tt">'+esc(w.t)+'</span></button>').join('');
    WORKS.forEach(w=>paintLike(w.n));
  }
  if(o)[...gr.children].forEach((b,k)=>b.classList.toggle('on',k+1===cur));
  sh.classList.toggle('open',o);
}

/* ---------- 확대 보기(핀치 줌·더블탭·드래그) ---------- */
const zm=$('#zm'),zi=zm.querySelector('img');
const Z={n:0,s:1,x:0,y:0,bw:0,bh:0,p:new Map(),moved:false,tap:0,tx:0,ty:0,ready:false};
function zLayout(){
  const vw=zm.clientWidth,vh=zm.clientHeight,r=zi.naturalWidth/zi.naturalHeight;
  let w=vw,h=vw/r;if(h>vh){h=vh;w=vh*r}
  Z.bw=w;Z.bh=h;zi.style.width=w+'px';zi.style.height=h+'px';Z.s=1;Z.x=(vw-w)/2;Z.y=(vh-h)/2;zApply();
}
function zApply(){
  const vw=zm.clientWidth,vh=zm.clientHeight,w=Z.bw*Z.s,h=Z.bh*Z.s;
  Z.x=w<=vw?(vw-w)/2:Math.min(0,Math.max(vw-w,Z.x));
  Z.y=h<=vh?(vh-h)/2:Math.min(0,Math.max(vh-h,Z.y));
  zi.style.transform='translate('+Z.x+'px,'+Z.y+'px) scale('+Z.s+')';
}
function zAt(px,py,ns){ns=Math.max(1,Math.min(6,ns));const k=ns/Z.s;Z.x=px-(px-Z.x)*k;Z.y=py-(py-Z.y)*k;Z.s=ns;zApply()}
function openZoom(key,vs,ls,alt){
  Z.n=key;Z.ready=false;Z.p.clear();zm.classList.add('open');
  zi.onload=()=>{if(Z.n===key&&!Z.ready){Z.ready=true;zLayout()}};
  zi.alt=alt;zi.src=vs;
  const L=new Image();L.onload=()=>{if(zm.classList.contains('open')&&Z.n===key)zi.src=L.src};L.src=ls; // 고해상도로 교체
}
function zoom(n){openZoom(n,imgPath('view',n),imgPath('large',n),WORKS.find(w=>w.n===n).t)}
/* 작가 관련 정보 쪽 확대: 이전/다음 쪽 버튼 포함 */
let zDoc=-1;const zt=zm.querySelector('.zt'),ztOrig=zt.innerHTML;
function zoomDoc(i){
  const N=D().sizes.length;i=Math.max(1,Math.min(N,i));zDoc=i;
  openZoom(dk+i,docPath('view',i),docPath('large',i),D().title+' '+i+'쪽');
  zm.querySelectorAll('.zb,.zc').forEach(e=>e.hidden=false);
  zm.querySelector('.zp').disabled=i===1;zm.querySelector('.zn').disabled=i===N;
  zm.querySelector('.zc').textContent=i+' / '+N;
  zt.innerHTML='두 손가락으로 확대 · 두 번 탭하면 확대/축소<br>휴대폰을 가로로 돌리면 더 크게 볼 수 있어요<br>ⓒ 2026 이충길 · 무단 전재 및 복제 금지';
  const dl=$('#dvl'),p=dl&&dl.children[i-1];if(p)p.scrollIntoView({block:'nearest'});
}
function zClose(){zDoc=-1;zt.innerHTML=ztOrig;zm.querySelectorAll('.zb,.zc').forEach(e=>e.hidden=true);zm.classList.remove('open');zi.removeAttribute('src');Z.ready=false;Z.p.clear()}
zm.addEventListener('pointerdown',e=>{
  if(e.target.closest('.x,.zb'))return;
  try{zm.setPointerCapture(e.pointerId)}catch(x){}
  if(Z.p.size===0)Z.moved=false;
  Z.p.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});
});
zm.addEventListener('pointermove',e=>{
  const p=Z.p.get(e.pointerId);if(!p||!Z.ready)return;
  const px=e.clientX,py=e.clientY;
  if(Math.hypot(px-p.sx,py-p.sy)>10)Z.moved=true;
  if(Z.p.size===2){
    const o=[...Z.p.entries()].find(([id])=>id!==e.pointerId)[1];
    const d=Math.hypot(px-o.x,py-o.y),pd=Math.hypot(p.x-o.x,p.y-o.y);
    const cx=(px+o.x)/2,cy=(py+o.y)/2,pcx=(p.x+o.x)/2,pcy=(p.y+o.y)/2;
    Z.x+=cx-pcx;Z.y+=cy-pcy;Z.moved=true;
    if(pd>0)zAt(cx,cy,Z.s*d/pd);else zApply();
  }else if(Z.s>1){Z.x+=px-p.x;Z.y+=py-p.y;zApply()}
  p.x=px;p.y=py;
});
function zUp(e){
  if(!Z.p.has(e.pointerId))return;
  Z.p.delete(e.pointerId);
  if(Z.p.size===0&&!Z.moved&&e.type==='pointerup'&&Z.ready){
    const t=Date.now();
    if(t-Z.tap<320&&Math.hypot(e.clientX-Z.tx,e.clientY-Z.ty)<40){zAt(e.clientX,e.clientY,Z.s>1.2?1:2.5);Z.tap=0}
    else{Z.tap=t;Z.tx=e.clientX;Z.ty=e.clientY}
  }
}
zm.addEventListener('pointerup',zUp);zm.addEventListener('pointercancel',zUp);
zm.addEventListener('wheel',e=>{if(!Z.ready)return;e.preventDefault();zAt(e.clientX,e.clientY,Z.s*(e.deltaY<0?1.2:1/1.2))},{passive:false});
zm.querySelector('.x').addEventListener('click',zClose);

/* ---------- 자료 보기 (작가 관련 정보 · 관람 도우미 등: 쪽별 이미지, 세로로 넘기며 보기 · 누르면 확대) ---------- */
const dv=$('#dv');let dvKey='',dvRaf=0;
function dvOpen(){return dv.classList.contains('open')}
function buildDoc(){
  dvKey=dk;const d=D(),N=d.sizes.length;
  $('#dvt').textContent=d.title;dv.setAttribute('aria-label',d.title);
  $('#dvl').innerHTML=d.sizes.map((s,k)=>'<figure class="dp" data-i="'+(k+1)+'"><img src="'+docPath('view',k+1)+'" width="'+s[0]+'" height="'+s[1]+'" alt="'+esc(d.title)+' '+(k+1)+'쪽" loading="'+(k<2?'eager':'lazy')+'" decoding="async"><figcaption>'+(k+1)+' / '+N+'쪽</figcaption></figure>').join('')
    +'<p class="dend">마지막 쪽입니다. 쪽을 누르면 크게 볼 수 있습니다.</p>';
  $('#dvl').scrollTop=0;
}
function dvCount(){
  const l=$('#dvl'),N=D().sizes.length,top=l.getBoundingClientRect().top+70;let c=1;
  for(const f of l.querySelectorAll('.dp')){if(f.getBoundingClientRect().bottom>top){c=+f.dataset.i;break}c=+f.dataset.i}
  $('#dvn').textContent=c+' / '+N+'쪽';
}
function openDoc(key){
  if(!DOCS[key])return;
  dk=key;
  if(dvKey!==key)buildDoc();
  dv.classList.add('open');dvCount();
  try{history.pushState({dv:1},'')}catch(e){}
}
function closeDoc(fromPop){
  if(!dvOpen())return;
  dv.classList.remove('open');
  if(!fromPop&&history.state&&history.state.dv){try{history.back()}catch(e){}}
}
addEventListener('popstate',()=>{
  if(zm.classList.contains('open')){zClose();if(dvOpen()){try{history.pushState({dv:1},'')}catch(e){}}return}
  if(dvOpen())closeDoc(true);
});

/* ---------- 시작 ---------- */
function start(){
  build();bindRail();
  /* 작품 이미지 우클릭 메뉴·끌어다 놓기 차단 (이미지 위에서만 작동, 입력칸에는 영향 없음) */
  document.addEventListener('contextmenu',e=>{if(e.target.closest('img,#zm'))e.preventDefault()});
  document.addEventListener('dragstart',e=>{if(e.target.tagName==='IMG')e.preventDefault()});
  $('#dvx').onclick=()=>closeDoc();
  $('#dvl').addEventListener('click',e=>{const f=e.target.closest('.dp');if(f)zoomDoc(+f.dataset.i)});
  $('#dvl').addEventListener('scroll',()=>{if(dvRaf)return;dvRaf=requestAnimationFrame(()=>{dvRaf=0;dvCount()})},{passive:true});
  zm.querySelector('.zp').onclick=()=>zoomDoc(zDoc-1);zm.querySelector('.zn').onclick=()=>zoomDoc(zDoc+1);
  $('#bIdx').onclick=()=>sheet(true);$('#sx').onclick=()=>sheet(false);
  $('#pv').onclick=()=>go(cur-1,true);$('#nx').onclick=()=>go(cur+1,true);
  $('#sheet').addEventListener('click',e=>{
    if(e.target.id==='sheet'){sheet(false);return}
    const b=e.target.closest('[data-i],[data-id]');
    if(b){go(b.dataset.id?items.indexOf(b.dataset.id):+b.dataset.i,false);sheet(false)}
  });
  $('#bSz').onclick=e=>{const b=document.body.classList.toggle('big');e.currentTarget.setAttribute('aria-pressed',b);e.currentTarget.textContent=b?'글자 작게':'글자 크게';try{localStorage.setItem('big',b?1:0)}catch(x){}};
  try{if(localStorage.getItem('big')==='1')$('#bSz').click()}catch(x){}
  addEventListener('keydown',e=>{
    if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;
    if(zDoc>0&&zm.classList.contains('open')){if(e.key==='ArrowRight')zoomDoc(zDoc+1);if(e.key==='ArrowLeft')zoomDoc(zDoc-1);if(e.key!=='Escape')return}
    else if(dvOpen()&&e.key!=='Escape')return;
    if(e.key==='ArrowRight')go(cur+1,true);
    if(e.key==='ArrowLeft')go(cur-1,true);
    if(e.key==='Escape'){if(zm.classList.contains('open'))zClose();else if(dvOpen())closeDoc();else sheet(false)}
  });
  addEventListener('resize',()=>{go(cur,false);if(zm.classList.contains('open')&&Z.ready)zLayout()});
  addEventListener('hashchange',()=>{const i=items.indexOf(location.hash.slice(1));if(i>=0&&i!==cur){cur=i;go(i,false);upd()}});
  API.init().then(st=>{
    ST=st;WORKS.forEach(w=>{paintLike(w.n);paintCm(w.n)});
    if(st.error)toast('좋아요 정보를 불러오지 못했습니다.');
  });
}
start();
})();
