export function mountOffers() {
  const controller=new AbortController();
  let cleanup=()=>{};
  function listen(target,event,handler,options={}){target.addEventListener(event,handler,{...options,signal:controller.signal});}
// The result is an occasional decision screen. Entry motion explains grouping once.

const section=document.querySelector('.result-offers');

if(section){

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');

  let keyboard=false,animations=[];

  function cancelMotion(){for(const animation of animations)animation.cancel();animations=[];}

  listen(document,'keydown',event=>{

    if(['Tab','Enter',' '].includes(event.key)){keyboard=true;section.classList.add('offers-keyboard');cancelMotion();}

  });

  listen(section,'pointerdown',event=>{

    if(event.pointerType==='mouse'){keyboard=false;section.classList.remove('offers-keyboard');}

  },{passive:true});

  listen(reduced,'change',()=>{if(reduced.matches)cancelMotion();});

  if('IntersectionObserver' in window){

    const observer=new IntersectionObserver(entries=>{

      if(!entries.some(entry=>entry.isIntersecting))return;

      observer.disconnect();

      if(keyboard||document.body.classList.contains("keyboard-navigation")||reduced.matches)return;

      animations=[...section.querySelectorAll('.offer-card')].map((card,i)=>card.animate(

        [{transform:'translateY(8px)'},{transform:'translateY(0)'}],

        {duration:260,delay:i*40,easing:'cubic-bezier(.23,1,.32,1)'}

      ));

    },{threshold:.12});

    observer.observe(section.querySelector('.offer-grid'));
    cleanup=()=>{observer.disconnect();cancelMotion();};

    listen(window,'pagehide',()=>{observer.disconnect();cancelMotion();});

  }

}


  return ()=>{controller.abort();cleanup();};
}
