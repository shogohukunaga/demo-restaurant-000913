'use strict';
document.documentElement.classList.add('js');
const root=document.documentElement, reduced=matchMedia('(prefers-reduced-motion: reduce)');
const motionButton=document.querySelector('#motion-toggle');
let manualStop=false, stopped=reduced.matches;
const hero=document.querySelector('.hero'), heroVisual=document.querySelector('.hero-visual');
const concept=document.querySelector('.concept'), panels=[...document.querySelectorAll('.concept-panel')], words=[...document.querySelectorAll('.concept-words span')];
const galleryWindow=document.querySelector('.gallery-window'), track=document.querySelector('.gallery-track'), group=document.querySelector('.gallery-group');
const clone=group.cloneNode(true);clone.classList.add('gallery-clone');clone.setAttribute('aria-hidden','true');clone.querySelectorAll('button').forEach(b=>b.tabIndex=-1);track.append(clone);
let offset=0, speed=45, targetSpeed=45, lastTime=0, pointerPause=false, raf;
function updateMotion(){stopped=reduced.matches||manualStop;root.classList.toggle('motion-off',stopped);motionButton.setAttribute('aria-pressed',String(stopped));motionButton.textContent=stopped?'動きを再開する':'動きを止める';if(reduced.matches){motionButton.textContent='端末の動き軽減設定を使用中';motionButton.disabled=true}else motionButton.disabled=false;paintScroll();}
motionButton.addEventListener('click',()=>{manualStop=!manualStop;updateMotion()});reduced.addEventListener('change',updateMotion);
function paintScroll(){
 const h=innerHeight,r=concept.getBoundingClientRect(),p=Math.max(0,Math.min(3,-r.top/h));
 words.forEach((w,i)=>w.classList.toggle('is-shown',stopped||(-r.top+h*.25>=i*h)));
 heroVisual.style.transform=stopped?'':`translateY(${Math.max(0,Math.min(h,scrollY))*.5}px)`;
 panels.forEach(panel=>{const a=panel.getBoundingClientRect();panel.querySelectorAll('img').forEach(img=>img.style.transform=stopped?'':`translateY(${Math.max(0,Math.min(h,-a.top))*.5}px)`)});
}
function sizeCopy(){const nav=document.querySelector('.desktop-nav').getBoundingClientRect().height;document.querySelectorAll('.feature-copy').forEach(e=>{const top=Math.max(nav+24,(innerHeight-e.offsetHeight)/2);e.style.top=innerWidth>767?`${top}px`:'';e.style.position=innerWidth>767&&e.offsetHeight>innerHeight-nav-64?'static':''})}
let scrollPending=false;addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(()=>{paintScroll();scrollPending=false})}},{passive:true});addEventListener('resize',()=>{paintScroll();sizeCopy()});sizeCopy();
function animate(t){const dt=Math.min(.05,(t-lastTime)/1000||0);lastTime=t;if(!stopped&&!pointerPause&&!document.hidden&&galleryWindow.getBoundingClientRect().top<innerHeight&&galleryWindow.getBoundingClientRect().bottom>0){speed+=(targetSpeed-speed)*.08;const width=group.offsetWidth+parseFloat(getComputedStyle(track).gap);offset=((offset+speed*dt)%width+width)%width;track.style.transform=`translateX(${-offset}px)`}raf=requestAnimationFrame(animate)}
galleryWindow.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){const r=galleryWindow.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;targetSpeed=(x-.5)*160}});galleryWindow.addEventListener('pointerleave',()=>targetSpeed=45);galleryWindow.addEventListener('focusin',()=>pointerPause=true);galleryWindow.addEventListener('focusout',()=>pointerPause=false);
let dragStart=null,dragOffset=0,wasDragged=false;
galleryWindow.addEventListener('pointerdown',e=>{if(stopped)return;dragStart=e.clientX;dragOffset=offset;wasDragged=false});
galleryWindow.addEventListener('pointermove',e=>{if(dragStart===null)return;const dx=e.clientX-dragStart;if(Math.abs(dx)>10){wasDragged=true;pointerPause=true;const width=group.offsetWidth+parseFloat(getComputedStyle(track).gap);offset=((dragOffset-dx)%width+width)%width;track.style.transform=`translateX(${-offset}px)`}});
addEventListener('pointerup',()=>{dragStart=null;pointerPause=false;targetSpeed=45});galleryWindow.addEventListener('pointercancel',()=>{dragStart=null;pointerPause=false});galleryWindow.addEventListener('click',e=>{if(wasDragged){e.preventDefault();e.stopImmediatePropagation();wasDragged=false}},true);
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.05});document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
const toggle=document.querySelector('.menu-toggle'),menu=document.querySelector('#mobile-menu'),shell=document.querySelector('#site-shell');let menuOrigin;
function closeMenu(){menu.close();shell.inert=false;document.body.classList.remove('locked');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','メニューを開く');toggle.innerHTML='<span></span><span></span><span></span>';document.body.append(toggle);toggle.focus()}
toggle.addEventListener('click',()=>{if(menu.open){closeMenu();return}menuOrigin=document.activeElement;menu.showModal();menu.append(toggle);shell.inert=true;document.body.classList.add('locked');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','メニューを閉じる');toggle.innerHTML='<b style="font:26px Arial">×</b>';toggle.focus()});menu.addEventListener('cancel',e=>{e.preventDefault();closeMenu()});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));addEventListener('resize',()=>{if(innerWidth>767&&menu.open)closeMenu()});
const tabs=[...document.querySelectorAll('[role=tab]')],faqPanels=[...document.querySelectorAll('.faq-panel')];
function selectTab(i,focus=false){tabs.forEach((t,j)=>{t.setAttribute('aria-selected',String(i===j));t.tabIndex=i===j?0:-1;faqPanels[j].hidden=i!==j});if(focus)tabs[i].focus()}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTab(i));tab.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();selectTab(n,true)})});selectTab(0);
const lightbox=document.querySelector('#lightbox'),items=[...group.querySelectorAll('.gallery-item')];let current=0,origin;
function showImage(i){current=(i+items.length)%items.length;const img=items[current].querySelector('img');lightbox.querySelector('img').src=img.src;lightbox.querySelector('img').alt=img.alt;lightbox.querySelector('.image-counter').textContent=`${String(current+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;lightbox.dataset.index=String(current)}
[...items,...clone.querySelectorAll('.gallery-item')].forEach((b,i)=>b.addEventListener('click',()=>{origin=b;showImage(i%items.length);lightbox.showModal();document.body.classList.add('locked');pointerPause=true}));
lightbox.querySelector('.prev').addEventListener('click',()=>showImage(current-1));lightbox.querySelector('.next').addEventListener('click',()=>showImage(current+1));lightbox.querySelector('.dialog-close').addEventListener('click',()=>lightbox.close());lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight')showImage(current+1);if(e.key==='ArrowLeft')showImage(current-1)});lightbox.addEventListener('close',()=>{document.body.classList.remove('locked');pointerPause=false;origin?.focus()});
const reservation=document.querySelector('#reservation-dialog');document.querySelector('.reservation-demo').addEventListener('click',()=>reservation.showModal());reservation.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>reservation.close()));
updateMotion();requestAnimationFrame(animate);
