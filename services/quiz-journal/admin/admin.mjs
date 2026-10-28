const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const format=value=>value?new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Yekaterinburg'}).format(new Date(value)):'—';
function place(v){if(v.stage==='result')return 'Получил результат';if(v.stage==='cover')return 'Обложка';if(v.stage==='profile')return `Знакомство · ${v.step} из 3`;if(v.stage==='chapter')return `Перед главой ${Math.floor((v.step-3)/4)+1} из 4`;return `Вопрос ${v.step-3} из 16`;}
async function load(){
 const status=document.getElementById('status'),days=document.getElementById('days').value;status.textContent='Загружаю журнал…';document.getElementById('csv').href=`visits.csv?days=${days}`;
 try{
  const response=await fetch(`visits.json?days=${days}`,{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error('request');const {visits}=await response.json();
  const metrics=[['Визиты',visits.length],['Браузеры',new Set(visits.map(v=>v.visitor_id)).size],['Завершили',visits.filter(v=>v.completed_at).length]];
  document.getElementById('metrics').replaceChildren(...metrics.map(([name,value])=>{const card=node('div');card.className='metric';card.append(node('span',name),node('strong',String(value)));return card;}));
  document.getElementById('rows').replaceChildren(...visits.map(v=>{const row=node('tr'),visitor=node('td',`V-${v.visitor_id.slice(0,8)}`),quiz=node('td','Где я сейчас в ИИ');visitor.append(node('small',`Визит ${v.visit_id.slice(0,8)}`));quiz.append(node('small',v.revision));row.append(visitor,node('td',format(v.first_at)),node('td',format(v.last_at)),quiz,node('td',place(v)),node('td',v.level?['','Базовый','Прикладной','Продвинутый','Агентский'][v.level]:'—'));return row;}));
  status.textContent=visits.length?`Показано визитов: ${visits.length}. Обновлено ${format(new Date().toISOString())}.`:'В выбранном периоде пока нет визитов. Здесь появятся реальные разрешённые посещения.';
 }catch{status.textContent='Не удалось загрузить журнал. Проверьте доступ и обновите страницу; демонстрационные записи не подставляются.';document.getElementById('rows').replaceChildren();document.getElementById('metrics').replaceChildren();}
}
document.getElementById('days').addEventListener('change',load);document.getElementById('refresh').addEventListener('click',load);load();
