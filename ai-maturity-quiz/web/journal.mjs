import {createJournal} from './journal-core.mjs';
import {JOURNAL_CONFIG} from './journal-config.mjs';
const element=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
export function initJournal(){
 let storage=null,sessionStorage=null;try{storage=window.localStorage;}catch{/* Optional. */}try{sessionStorage=window.sessionStorage;}catch{/* Optional. */}
 const send=event=>{
  const body=JSON.stringify(event);
  try{if(navigator.sendBeacon?.(JOURNAL_CONFIG.endpoint,new Blob([body],{type:'text/plain;charset=UTF-8'})))return;}catch{/* Try bounded keepalive fallback. */}
  try{fetch(JOURNAL_CONFIG.endpoint,{method:'POST',body,headers:{'Content-Type':'text/plain;charset=UTF-8'},credentials:'omit',mode:'cors',keepalive:true}).catch(()=>{});}catch{/* No network dependency for the quiz. */}
 };
 const journal=createJournal({storage,sessionStorage,newId:()=>crypto.randomUUID(),send,config:JOURNAL_CONFIG});
 const root=document.querySelector('[data-journal-root]');
 function settings(){
  root.replaceChildren();const panel=element('aside',undefined,'journal-choice');panel.setAttribute('aria-labelledby','journal-choice-title');
  const h=element('h2','Помочь улучшить диагностику?');h.id='journal-choice-title';
  const p=element('p','Можно разрешить небольшой журнал посещений: случайный код браузера, время, версия теста и последний шаг. Имя, контакты и тексты ответов не отправляются. Без статистики тест работает так же.');
  const actions=element('div',undefined,'journal-choice-actions');
  for(const [value,label] of [['no','Только тест'],['yes','Разрешить статистику']]){const button=element('button',label);button.type='button';button.addEventListener('click',()=>{journal.choose(value);root.replaceChildren();});actions.append(button);}
  const link=element('a','Как используются данные');link.href='privacy.html';panel.append(h,p,actions,link);root.append(panel);
 }
 document.querySelector('[data-journal-settings]')?.addEventListener('click',settings);
 if(journal.choice===null)settings();
 return journal;
}
