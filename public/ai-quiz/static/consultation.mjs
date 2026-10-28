import {loadConsultationOffer,consultationState} from './consultation-window.mjs';
export function mountConsultation() {
  const controller=new AbortController();
  let cleanup=()=>{};
  function listen(target,event,handler,options={}){target.addEventListener(event,handler,{...options,signal:controller.signal});}

const card=document.querySelector('[data-consultation-offer]');
if(card){
  let storage=null;try{storage=window.localStorage;}catch{/* The ordinary contact remains available. */}
  const completed=Number(card.dataset.completedAt),now=Date.now();
  const offer=loadConsultationOffer(storage,now,Number.isFinite(completed)&&completed>0?completed:now);
  const confirmation=card.querySelector('[data-channel-confirmation]');
  const form=card.querySelector('[data-consultation-form]');
  const button=card.querySelector('[data-consultation-submit]');
  const clock=card.querySelector('[data-consultation-clock]');
  const windowNote=card.querySelector('[data-consultation-window]');
  const conditions=card.querySelector('[data-consultation-conditions]');
  const expired=card.querySelector('[data-consultation-expired]');
  const ordinary=card.querySelector('[data-consultation-ordinary]');
  const price=card.querySelector('[data-consultation-price]');
  const subtitle=card.querySelector('[data-consultation-subtitle]');
  let interval=0;
  function stop(){clearInterval(interval);interval=0;}
  function update(){
    const state=consultationState(offer,Date.now(),confirmation.checked);
    button.disabled=!state.canApply;button.hidden=!state.active;
    confirmation.disabled=!state.active;conditions.hidden=!state.active;
    windowNote.hidden=!state.active;expired.hidden=state.active;ordinary.hidden=state.active;
    if(state.active){
      const h=Math.floor(state.seconds/3600),m=Math.floor(state.seconds%3600/60),s=state.seconds%60;
      clock.textContent=[h,m,s].map(n=>String(n).padStart(2,'0')).join(':');
      price.textContent='Бесплатно';subtitle.textContent='за подписку на два канала';
    }else{
      stop();price.textContent=offer?'Окно заявки закрыто':'Уточнить условия';
      subtitle.textContent='Напишите Максиму в Telegram';
      const message=offer?'90 минут после теста истекли. Условия консультации можно обсудить в Telegram.':'Не удалось восстановить срок предложения. Уточните условия консультации в Telegram.';
      if(expired.textContent!==message)expired.textContent=message;
    }
  }
  function resume(){update();if(!document.hidden&&!interval&&consultationState(offer,Date.now()).active)interval=setInterval(update,1000);}
  listen(confirmation,'change',update);
  listen(form,'submit',event=>{
    if(!consultationState(offer,Date.now(),confirmation.checked).canApply){event.preventDefault();update();}
  });
  listen(document,'visibilitychange',()=>{if(document.hidden)stop();else resume();});
  listen(window,'pageshow',resume);
  listen(window,'pagehide',stop);
  resume();
  cleanup=()=>{clearInterval(interval);interval=0;};
}

  return ()=>{controller.abort();cleanup();};
}
