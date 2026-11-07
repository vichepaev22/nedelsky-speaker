// Informational examples only. These controls never select or score a quiz answer.
export function mountCover(root=document,environment=window){
  const choices=[...root.querySelectorAll('[data-preview-stage]')];
  if(!choices.length)return ()=>{};
  const title=root.querySelector('#route-example strong');
  const description=root.querySelector('#route-example span');
  const companion=root.querySelector('.companion-button');
  const controller=new AbortController();
  const reduced=environment.matchMedia('(prefers-reduced-motion: reduce)');
  const examples=['Соберите идею поста или найдите информацию.','Подготовьте письмо по своим материалам.','Соберите повторяемый сценарий с проверкой.','Свяжите инструменты и задайте агенту правила.'];
  const listen=(target,event,handler)=>target.addEventListener(event,handler,{signal:controller.signal});
  const stop=()=>companion.classList.remove('is-greeting');
  function select(index){
    choices.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    title.textContent='Например, на этой ступени';
    description.textContent=examples[index];
  }
  choices.forEach((button,index)=>listen(button,'click',()=>select(index)));
  listen(companion,'click',()=>{
    title.textContent='Идём в вашем темпе.';
    if(!reduced.matches&&!root.hidden)companion.classList.add('is-greeting');
  });
  listen(companion,'animationend',stop);
  listen(root,'visibilitychange',()=>{if(root.hidden)stop();});
  listen(environment,'pagehide',stop);
  listen(reduced,'change',stop);
  select(0);
  return ()=>{controller.abort();stop();};
}
