import {createBalls,stepBalls,inviteBalls,scrollImpulse} from './chapter-physics.mjs';
export function mountChapter() {
  const controller=new AbortController();
  let cleanup=()=>{};
  function listen(target,event,handler,options={}){target.addEventListener(event,handler,{...options,signal:controller.signal});}

const arena=document.querySelector('.chapter-playground');
if(arena){
  const section=arena.closest('.chapter-intro'),nodes=[...arena.querySelectorAll('span')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
  let width=0,height=0,radius=22,obstacles=[],balls=[],pointer=null,frame=0,previous=null,quiet=0;
  let keyboard=document.body.classList.contains('keyboard-navigation'),invitationTimers=[],entry=null,pendingScroll=0,lastScrollY=window.scrollY;
  function cancelInvitation(){invitationTimers.forEach(clearTimeout);invitationTimers=[];}
  function paint(){balls.forEach((b,i)=>{nodes[i].style.transform=`translate3d(${b.x-radius}px,${b.y-radius}px,0)`;});}
  function stop(){cancelAnimationFrame(frame);frame=0;previous=null;pendingScroll=0;entry?.cancel();entry=null;}
  function allowed(){return !reduced.matches&&!document.hidden&&!keyboard&&!section.hidden&&section.isConnected;}
  function reset(entering=false){stop();cancelInvitation();pointer=null;lastScrollY=window.scrollY;balls=createBalls(width,height,entering,{count:nodes.length,radius,obstacles});paint();}
  function animate(time){
    frame=0;if(!allowed())return;
    if(pendingScroll){balls=scrollImpulse(balls,pendingScroll);pendingScroll=0;}
    const before=balls;balls=stepBalls(balls,pointer,width,height,previous===null?1/60:(time-previous)/1000,obstacles);previous=time;paint();
    const moving=balls.some((b,i)=>Math.hypot(b.vx,b.vy)>.35||Math.hypot(b.x-before[i].x,b.y-before[i].y)>.025);
    quiet=moving?0:quiet+1;if(quiet<22)frame=requestAnimationFrame(animate);else previous=null;
  }
  function wake(){quiet=0;if(!frame&&allowed())frame=requestAnimationFrame(animate);}
  function invite(){
    cancelInvitation();if(!allowed())return;
    invitationTimers=[1400,3100].map(delay=>setTimeout(()=>{if(allowed()){balls=inviteBalls(balls);wake();}},delay));
  }
  function layout(entering=false){
    if(!section.isConnected||section.hidden)return;
    const bounds=arena.getBoundingClientRect();width=bounds.width;height=bounds.height;radius=nodes[0].getBoundingClientRect().width/2;obstacles=[];
    for(const element of section.querySelectorAll('[data-ball-obstacle]')){
      const rects=[];
      if(element.matches('a,button'))rects.push(element.getBoundingClientRect());
      else{const range=document.createRange();range.selectNodeContents(element);rects.push(...range.getClientRects());}
      for(const r of rects)if(r.width&&r.height)obstacles.push({left:r.left-bounds.left-9,right:r.right-bounds.left+9,top:r.top-bounds.top-9,bottom:r.bottom-bounds.top+9});
    }
    reset(entering&&allowed());
    if(entering&&allowed()){
      entry=section.animate?.([{transform:'translateY(-12px)'},{transform:'translateY(4px)',offset:.65},{transform:'translateY(0)'}],{duration:560,easing:'cubic-bezier(.22,.61,.36,1)'});
      wake();invite();
    }
  }
  listen(window,'scroll',()=>{
    const y=window.scrollY,delta=y-lastScrollY;lastScrollY=y;if(!allowed())return;
    const bounds=section.getBoundingClientRect();if(bounds.bottom<0||bounds.top>window.innerHeight)return;
    pendingScroll=Math.max(-100,Math.min(100,pendingScroll+delta));cancelInvitation();wake();
  },{passive:true});
  listen(section,'pointerdown',()=>{keyboard=false;lastScrollY=window.scrollY;},{passive:true});
  listen(section,'pointermove',event=>{
    if(event.pointerType!=='mouse'||!fine.matches||reduced.matches)return;
    cancelInvitation();const rect=arena.getBoundingClientRect();pointer={x:event.clientX-rect.left,y:event.clientY-rect.top};keyboard=false;wake();
  },{passive:true});
  listen(section,'pointerleave',()=>{pointer=null;wake();});
  listen(document,'keydown',()=>{keyboard=true;reset();});
  listen(document,'visibilitychange',()=>{if(document.hidden)reset();});
  listen(reduced,'change',()=>reset());
  listen(window,'pagehide',()=>{stop();cancelInvitation();});
  listen(section,'chapter-dismiss',()=>{stop();cancelInvitation();});
  arena.classList.add('motion-ready');layout();
  let lastSize=`${section.clientWidth}:${section.clientHeight}`;
  const observer=new ResizeObserver(()=>{if(!section.isConnected||section.hidden)return;const size=`${section.clientWidth}:${section.clientHeight}`;if(size!==lastSize){lastSize=size;layout();}});observer.observe(section);
  listen(section,'chapter-dismiss',()=>observer.disconnect());
  document.fonts.ready.then(()=>layout(true));
  cleanup=()=>{stop();cancelInvitation();observer.disconnect();};
}

  return ()=>{controller.abort();cleanup();};
}
