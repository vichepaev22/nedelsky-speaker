// The result is an occasional decision screen. Entry motion explains grouping once.
const section=document.querySelector('.result-offers');
if(section){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let keyboard=false,animations=[];
  function cancelMotion(){for(const animation of animations)animation.cancel();animations=[];}
  document.addEventListener('keydown',event=>{
    if(['Tab','Enter',' '].includes(event.key)){keyboard=true;section.classList.add('offers-keyboard');cancelMotion();}
  });
  section.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'){keyboard=false;section.classList.remove('offers-keyboard');}
  },{passive:true});
  reduced.addEventListener('change',()=>{if(reduced.matches)cancelMotion();});
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
    window.addEventListener('pagehide',()=>{observer.disconnect();cancelMotion();});
  }
}
