export function mountDisclosure() {
  const controller=new AbortController();
  let cleanup=()=>{};
  function listen(target,event,handler,options={}){target.addEventListener(event,handler,{...options,signal:controller.signal});}
// Native disclosure works without this optional, interruptible pointer animation.
const disclosure=document.querySelector('.plan-disclosure');
if(disclosure){
  const summary=disclosure.querySelector('.plan-summary');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation=null,desiredOpen=disclosure.open,printing=false,restoreAfterPrint=false;

  function cancelAnimation(){
    if(!animation)return;
    animation.onfinish=null;
    animation.oncancel=null;
    animation.cancel();
    animation=null;
  }
  function settle(open){
    cancelAnimation();
    desiredOpen=open;
    disclosure.open=open;
    disclosure.classList.remove('is-moving','is-closing');
    disclosure.style.removeProperty('height');
    disclosure.style.removeProperty('overflow');
  }
  function change(open,instant=false){
    if(!animation&&disclosure.open===open){desiredOpen=open;return;}
    const start=disclosure.getBoundingClientRect().height;
    cancelAnimation();
    desiredOpen=open;
    if(instant||reduced.matches||typeof disclosure.animate!=='function'){
      settle(open);return;
    }
    disclosure.open=true;
    disclosure.style.removeProperty('height');
    const border=getComputedStyle(disclosure);
    const end=open?disclosure.getBoundingClientRect().height:
      summary.getBoundingClientRect().height+parseFloat(border.borderTopWidth)+parseFloat(border.borderBottomWidth);
    if(Math.abs(end-start)<1){settle(open);return;}
    disclosure.classList.add('is-moving');
    disclosure.classList.toggle('is-closing',!open);
    disclosure.style.height=`${start}px`;
    disclosure.style.overflow='hidden';
    const current=disclosure.animate([{height:`${start}px`},{height:`${end}px`}],{
      duration:260,easing:'cubic-bezier(.23,1,.32,1)',fill:'forwards'
    });
    animation=current;
    current.onfinish=()=>{if(animation===current)settle(open);};
  }
  function keyboard(){return document.body.classList.contains('keyboard-navigation');}
  listen(summary,'click',event=>{
    event.preventDefault();
    change(!desiredOpen,event.detail===0||keyboard());
  });
  document.querySelectorAll('a[href="#next-steps"]').forEach(link=>{
    listen(link,'click',event=>{
      if(event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
      change(true,event.detail===0||keyboard());
      summary.focus({preventScroll:true});
    });
  });
  listen(disclosure,'toggle',()=>{if(!animation)desiredOpen=disclosure.open;});
  listen(document,'keydown',()=>{if(animation)settle(desiredOpen);});
  listen(window,'resize',()=>{if(animation)settle(desiredOpen);});
  listen(document,'visibilitychange',()=>{if(document.hidden&&animation)settle(desiredOpen);});
  listen(reduced,'change',()=>{if(animation)settle(desiredOpen);});
  listen(window,'pagehide',()=>settle(desiredOpen));
  listen(window,'beforeprint',()=>{
    if(printing)return;
    restoreAfterPrint=desiredOpen;
    printing=true;
    settle(true);
  });
  listen(window,'afterprint',()=>{
    if(!printing)return;
    printing=false;
    settle(restoreAfterPrint);
  });
  cleanup=()=>settle(desiredOpen);
}

  return ()=>{controller.abort();cleanup();};
}
