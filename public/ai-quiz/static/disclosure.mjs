import {createPlanEffects} from './plan-effects.mjs';
export function mountDisclosure() {
  const controller=new AbortController();
  let cleanup=()=>{};
  function listen(target,event,handler,options={}){target.addEventListener(event,handler,{...options,signal:controller.signal});}

// Native disclosure works without this optional, interruptible pointer animation.
const disclosure=document.querySelector('.plan-disclosure');
if(disclosure){
  const summary=disclosure.querySelector('.plan-summary');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const effects=createPlanEffects(disclosure,reduced);
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
    if(!open)effects.settle();
    const start=disclosure.getBoundingClientRect().height;
    cancelAnimation();
    desiredOpen=open;
    if(instant||reduced.matches||typeof disclosure.animate!=='function'){
      settle(open);
      if(open)effects.play(false);
      return;
    }
    disclosure.open=true;
    disclosure.style.removeProperty('height');
    const border=getComputedStyle(disclosure);
    const end=open?disclosure.getBoundingClientRect().height:
      summary.getBoundingClientRect().height+parseFloat(border.borderTopWidth)+parseFloat(border.borderBottomWidth);
    if(Math.abs(end-start)<1){settle(open);if(open)effects.play(true);return;}
    disclosure.classList.add('is-moving');
    disclosure.classList.toggle('is-closing',!open);
    disclosure.style.height=`${start}px`;
    disclosure.style.overflow='hidden';
    const current=disclosure.animate([{height:`${start}px`},{height:`${end}px`}],{
      duration:260,easing:'cubic-bezier(.23,1,.32,1)',fill:'forwards'
    });
    animation=current;
    current.onfinish=()=>{
      if(animation!==current)return;
      settle(open);
      if(open)effects.play(true);
    };
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
  let layoutWidth=document.documentElement.clientWidth;
  listen(window,'resize',()=>{
    const width=document.documentElement.clientWidth;
    if(width===layoutWidth)return;
    layoutWidth=width;
    if(animation){settle(desiredOpen);if(desiredOpen)effects.play(false);}
    effects.resize();
  });
  listen(document,'visibilitychange',()=>{
    if(document.hidden){if(animation)settle(desiredOpen);effects.settle();}
  });
  listen(reduced,'change',()=>{if(animation)settle(desiredOpen);effects.settle();});
  listen(window,'pagehide',()=>{settle(desiredOpen);effects.settle();});
  listen(window,'beforeprint',()=>{
    if(printing)return;
    restoreAfterPrint=desiredOpen;
    printing=true;
    effects.settle();
    settle(true);
  });
  listen(window,'afterprint',()=>{
    if(!printing)return;
    printing=false;
    settle(restoreAfterPrint);
  });
  cleanup=()=>{effects.clear();settle(desiredOpen);};
}

  return ()=>{controller.abort();cleanup();};
}
