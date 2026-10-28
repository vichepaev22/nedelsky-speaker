import{loadOffer,offerPrice}from'./roadmap-offer.mjs';
export function mountOffer() {
  const controller=new AbortController();
  let cleanup=()=>{};
  function listen(target,event,handler,options={}){target.addEventListener(event,handler,{...options,signal:controller.signal});}

const card=document.querySelector('[data-roadmap-offer]');
if(card){
  let storage=null;try{storage=window.localStorage;}catch{/* Regular price remains available. */}
  const offer=storage?loadOffer(storage,Date.now(),Number(card.dataset.completedAt)||Date.now()):null;
  const price=card.querySelector('[data-roadmap-price]'),original=card.querySelector('[data-original-price]'),windowNote=card.querySelector('[data-offer-window]'),clock=card.querySelector('[data-offer-clock]'),regular=card.querySelector('[data-regular-note]');
  let interval=0;
  function update(){
    const state=offerPrice(offer,Date.now());
    price.textContent=state.price===2900?'2 900 ₽':'4 500 ₽';original.hidden=!state.active;windowNote.hidden=!state.active;
    if(regular)regular.hidden=state.active;
    if(state.active){const h=Math.floor(state.seconds/3600),m=Math.floor(state.seconds%3600/60),s=state.seconds%60;clock.textContent=[h,m,s].map(n=>String(n).padStart(2,'0')).join(':');}
    else if(interval)clearInterval(interval);
  }
  function resume(){update();if(!interval&&offerPrice(offer,Date.now()).active)interval=setInterval(update,1000);}
  resume();
  listen(document,'visibilitychange',()=>{if(!document.hidden)update();});
  listen(window,'pageshow',resume);
  listen(window,'pagehide',()=>{clearInterval(interval);interval=0;});
  cleanup=()=>{clearInterval(interval);interval=0;};
}

  return ()=>{controller.abort();cleanup();};
}
