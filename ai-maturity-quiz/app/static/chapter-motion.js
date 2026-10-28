import {createBalls,stepBalls,inviteBalls} from './chapter-physics.mjs';

const arena=document.querySelector('.chapter-playground');
if(arena){
  const section=arena.closest('.chapter-intro'),nodes=[...arena.querySelectorAll('span')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
  let width=0,height=0,radius=22,obstacles=[],balls=[],pointer=null,frame=0,previous=null,quiet=0;
  let keyboard=document.body.classList.contains('keyboard-navigation'),invitationTimers=[];
  function cancelInvitation(){invitationTimers.forEach(clearTimeout);invitationTimers=[];}
  function paint(){balls.forEach((b,i)=>{nodes[i].style.transform=`translate3d(${b.x-radius}px,${b.y-radius}px,0)`;});}
  function stop(){cancelAnimationFrame(frame);frame=0;previous=null;}
  function reset(entering=false){stop();cancelInvitation();pointer=null;balls=createBalls(width,height,entering,{count:nodes.length,radius,obstacles});paint();}
  function animate(time){
    frame=0;if(reduced.matches||document.hidden||keyboard||section.hidden)return;
    const before=balls;balls=stepBalls(balls,pointer,width,height,previous===null?1/60:(time-previous)/1000,obstacles);previous=time;paint();
    const moving=balls.some((b,i)=>Math.hypot(b.vx,b.vy)>.35||Math.hypot(b.x-before[i].x,b.y-before[i].y)>.025);
    quiet=moving?0:quiet+1;if(quiet<22)frame=requestAnimationFrame(animate);else previous=null;
  }
  function wake(){quiet=0;if(!frame&&!reduced.matches&&!document.hidden&&!keyboard&&!section.hidden)frame=requestAnimationFrame(animate);}
  function invite(){
    cancelInvitation();if(reduced.matches||keyboard||!fine.matches||document.hidden)return;
    invitationTimers=[1800,3600,5400].map(delay=>setTimeout(()=>{
      if(reduced.matches||document.hidden||keyboard||section.hidden||!section.isConnected)return;
      balls=inviteBalls(balls);wake();
    },delay));
  }
  function layout(entering=false){
    if(section.hidden)return;
    const bounds=arena.getBoundingClientRect();width=bounds.width;height=bounds.height;radius=nodes[0].getBoundingClientRect().width/2;obstacles=[];
    for(const element of section.querySelectorAll('[data-ball-obstacle]')){
      const rects=[];
      if(element.matches('a,button'))rects.push(element.getBoundingClientRect());
      else{const range=document.createRange();range.selectNodeContents(element);rects.push(...range.getClientRects());}
      for(const r of rects)if(r.width&&r.height)obstacles.push({left:r.left-bounds.left-9,right:r.right-bounds.left+9,top:r.top-bounds.top-9,bottom:r.bottom-bounds.top+9});
    }
    reset(entering&&!reduced.matches&&!keyboard);if(entering){wake();invite();}
  }
  section.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||!fine.matches||reduced.matches)return;
    cancelInvitation();const rect=arena.getBoundingClientRect();pointer={x:event.clientX-rect.left,y:event.clientY-rect.top};keyboard=false;wake();
  },{passive:true});
  section.addEventListener('pointerleave',()=>{pointer=null;wake();});
  document.addEventListener('keydown',()=>{keyboard=true;reset();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  reduced.addEventListener('change',()=>reset());
  window.addEventListener('pagehide',()=>{stop();cancelInvitation();});
  section.addEventListener('chapter-dismiss',()=>{stop();cancelInvitation();});
  arena.classList.add('motion-ready');layout(true);
  let lastSize=`${section.clientWidth}:${section.clientHeight}`;
  const observer=new ResizeObserver(()=>{if(section.hidden)return;const size=`${section.clientWidth}:${section.clientHeight}`;if(size!==lastSize){lastSize=size;layout();}});observer.observe(section);
  section.addEventListener('chapter-dismiss',()=>observer.disconnect());
  document.fonts.ready.then(()=>layout(true));
}
