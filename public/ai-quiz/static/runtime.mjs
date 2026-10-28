import {buildSwot} from './swot.mjs';
import {renderSwot,swotText} from './swot-view.mjs';
import {initJournal} from './journal.mjs';
import { ALL_QUESTIONS, LEVELS, DIMENSIONS, GATE_TEXT, GOALS, ROLE_CONTEXT, STEP_DETAILS } from './data.mjs';
import { VIEWS } from './views.mjs';
import { readSession, persistSession, freshSession, firstMissing, answerAt, evaluate } from './domain.mjs';
import { mountUI } from './ui.mjs';
import { mountChapter } from './chapter.mjs';
import { mountDisclosure } from './disclosure.mjs';
import { mountOffers } from './offers.mjs';
import { mountOffer } from './offer.mjs';

const main=document.getElementById('main');
let storage=null;try{storage=window.sessionStorage;}catch{/* In-memory navigation remains available. */}
let session=readSession(storage,Date.now()),cleanups=[],currentScreen='';
const persist=()=>persistSession(storage,session);
const journal=initJournal();
function go(route){if(location.hash===`#/${route}`)render();else location.hash=`/${route}`;}
function route(){
  const h=location.hash;
  if(h==='#next-steps')return 'result';
  return h.startsWith('#/')?h.slice(2):'';
}
function text(selector,value){const node=main.querySelector(selector);if(node)node.textContent=value;}
function report(result){
  const level=LEVELS[result.level],growth=result.gate_gap||result.growth;
  const lines=['Максим Недельский · Ваша карта работы с ИИ',`Ступень: ${level.name} (${result.level}/4)`,`Индекс ответов: ${result.index}/100`,level.metaphor];
  for(const [c,n] of Object.entries(result.blocks))lines.push(`${DIMENSIONS[c].name}: ${n}/100`);
  if(result.gate_gap)lines.push(GATE_TEXT[result.gate_gap]);
  lines.push('',swotText(buildSwot(session.answers)),'','Три шага на ближайшие 7 дней:');
  level.steps.forEach((step,i)=>lines.push(`Шаг ${i+1}. ${STEP_DETAILS[result.level][i][0]}`,step,`На выходе: ${STEP_DETAILS[result.level][i][1]}.`));
  lines.push('',`Что у вас уже получается: ${DIMENSIONS[result.strength].name}`,result.blocks[result.strength]===0?'Вы обозначили начало пути. Этот блок можно взять за отправную точку, а не считать уже освоенным навыком.':DIMENSIONS[result.strength].strength,`Следующая точка роста: ${DIMENSIONS[growth].name}`,DIMENSIONS[growth].growth,ROLE_CONTEXT[session.answers.P1],GOALS[session.answers.P2],'Это ориентировочная диагностика по ответам, а не экзамен или сертификат.');
  return lines.join('\n');
}
function fillResult(result){
  const growth=result.gate_gap||result.growth;
  text('.insight-grid>section:first-child h3',DIMENSIONS[result.strength].name);
  text('.insight-grid>section:first-child p:last-child',result.blocks[result.strength]===0?'Вы обозначили начало пути. Этот блок можно взять за отправную точку, а не считать уже освоенным навыком.':DIMENSIONS[result.strength].strength);
  text('.insight-grid>section:last-child h3',DIMENSIONS[growth].name);
  text('.insight-grid>section:last-child p:last-child',DIMENSIONS[growth].growth);
  text('.goal-example h2',ROLE_CONTEXT[session.answers.P1]);text('.goal-example>p:last-child',GOALS[session.answers.P2]);
  renderSwot(main.querySelector('[data-swot-grid]'),buildSwot(session.answers));
  text('#result-save-source',report(result));
  const card=main.querySelector('[data-roadmap-offer]');card.dataset.completedAt=String(session.completedAt);
  if(result.gate_gap){
    const note=document.createElement('aside');note.className='gate-note';
    const strong=document.createElement('strong');strong.textContent='Почему индекс и ступень могут отличаться?';
    const explanation=document.createElement('p');explanation.textContent=`Индекс ответов: ${result.index}/100. Текущая подтверждённая ступень: ${LEVELS[result.level].name}. ${GATE_TEXT[result.gate_gap]}`;
    const qualifier=document.createElement('p');qualifier.textContent='Ступень подтверждена только логикой ваших ответов, а не независимой проверкой навыков.';
    note.append(strong,explanation,qualifier);(main.querySelector('[data-swot]')||main.querySelector('.plan-disclosure')).before(note);
  }
}
function render(){
  const next=route();
  if(location.hash==='#next-steps'&&currentScreen==='result')return;
  let view,step=null,result=null;
  const question=/^q\/(\d+)$/.exec(next),chapter=/^chapter\/([1-3])$/.exec(next);
  const missing=firstMissing(session.answers);
  if(question){
    step=Number(question[1]);
    if(step>18||step<0){go('');return;}
    if(missing!==-1&&step>missing){go(`q/${missing}`);return;}
    view=VIEWS.questions[step];
  }else if(chapter){
    const n=Number(chapter[1]),target=3+n*4;
    if(missing!==-1&&missing<target){go(`q/${missing}`);return;}
    view=VIEWS.chapters[n];
  }else if(next==='result'){
    if(missing!==-1){go(`q/${missing}`);return;}
    if(session.completedAt===null){session.completedAt=Date.now();persist();}
    result=evaluate(session.answers);view=VIEWS.results[result.level];
  }else if(next===''){view=VIEWS.cover;}
  else{go('');return;}
  for(const dispose of cleanups)dispose();cleanups=[];
  let html=view.html;
  if(result){
    html=html.replaceAll('__RESULT_INDEX__',String(result.index));
    for(const [c,n] of Object.entries(result.blocks))html=html.replaceAll(`__BLOCK_${c}__`,String(n));
  }
  main.className=view.className;main.innerHTML=html;currentScreen=next;
  document.body.toggleAttribute('data-focus-screen',next!=='');
  document.title=`${result?'Ваша карта работы с ИИ':step!==null?'Вопрос '+(step+1):chapter?'Ваш маршрут':'Где я сейчас в ИИ'} · Максим Недельский`;
  if(step!==null){
    const selected=session.answers[ALL_QUESTIONS[step].id];
    for(const radio of main.querySelectorAll('input[name=option_id]'))radio.checked=radio.value===selected;
    if(selected){text('.answer-save','Ваш ответ сохранён. Его можно изменить.');main.querySelector('[data-first-chapter]')?.remove();}
    main.querySelector('.next-button').disabled=!selected;
  }
  if(result)fillResult(result);
  if(next===''){
    const start=main.querySelector('[data-action=start] button');
    if(session.started)start.firstChild.textContent='Продолжить диагностику';
    else main.querySelector('[data-action=restart]')?.remove();
  }
  window.scrollTo({top:0,behavior:'instant'});
  cleanups.push(mountUI(),mountChapter(),mountDisclosure(),mountOffers(),mountOffer());
  journalScreen(result);
}
function journalScreen(result=null){
 const value=route(),question=/^q\/(\d+)$/.exec(value),chapter=/^chapter\/([1-3])$/.exec(value);
 if(result){journal.view({stage:'result',step:19,level:result.level});return;}
 if(chapter){journal.view({stage:'chapter',step:3+Number(chapter[1])*4,level:null});return;}
 if(question){
  const step=Number(question[1]),intro=main.querySelector('[data-first-chapter]');
  if(intro&&!intro.hidden)journal.view({stage:'chapter',step:3,level:null});
  else journal.view({stage:step<3?'profile':'question',step:step+1,level:null});
  return;
 }
 journal.view({stage:'cover',step:0,level:null});
}
document.addEventListener('click',event=>{
 if(event.target.closest('[data-begin-chapter]'))journal.view({stage:'question',step:4,level:null});
});

document.addEventListener('change',event=>{
  if(!event.target.matches('input[name=option_id]'))return;
  const form=event.target.closest('[data-step]');if(!form)return;
  answerAt(session,Number(form.dataset.step),event.target.value);const saved=persist();
  main.querySelector('.next-button').disabled=false;
  text('.answer-save',saved?'Ответ сохранён. Нажмите «Далее», когда будете готовы.':'Ответ выбран. Хранилище недоступно: продолжайте в этой вкладке без обновления страницы.');
});
document.addEventListener('submit',event=>{
  const form=event.target,action=form.dataset.action;if(!action)return;
  event.preventDefault();
  if(action==='restart'){journal.newAttempt();session=freshSession(Date.now());persist();go('');return;}
  if(action==='start'){session.started=true;persist();const missing=firstMissing(session.answers);go(missing===-1?'result':`q/${missing}`);return;}
  if(action==='answer'){
    const step=Number(form.dataset.step),selected=form.querySelector('input[name=option_id]:checked');
    if(!selected){text('#answer-error','Выберите один ответ.');return;}
    answerAt(session,step,selected.value);
    if(step===18&&session.completedAt===null)session.completedAt=Date.now();
    persist();
    if(step===18)go('result');
    else if([6,10,14].includes(step))go(`chapter/${(step-2)/4}`);
    else go(`q/${step+1}`);
  }
});
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#/')||location.hash==='#next-steps')render();});
render();
