import{loadOffer,offerPrice}from'./roadmap-offer.mjs';

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
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
  window.addEventListener('pageshow',resume);
  window.addEventListener('pagehide',()=>{clearInterval(interval);interval=0;});
}
