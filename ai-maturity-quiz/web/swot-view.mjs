const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
export function renderSwot(grid,report){
 if(!grid||!report.complete)return;
 grid.replaceChildren(...report.categories.map(category=>{
  const card=node('article',undefined,'swot-card');card.dataset.category=category.code;
  const heading=node('div',undefined,'swot-label');heading.append(node('span',category.code,'swot-letter'),node('h3',category.title));
  const list=node('ul');list.append(...category.items.map(item=>node('li',item)));
  const details=node('details',undefined,'swot-evidence');details.append(node('summary','Почему такой вывод?'));
  for(const evidence of category.evidence){const p=node('p');p.append(node('strong',`${evidence.id} · ${evidence.question}`),node('span',`Ваш ответ: «${evidence.answer}»`));details.append(p);}
  card.append(heading,node('p',category.intro,'swot-intro'),list,details);return card;
 }));
}
export function swotText(report){
 if(!report.complete)return '';
 return ['Ваш SWOT по работе с ИИ',...report.categories.map(c=>`${c.title}\n${c.intro}\n${c.items.map(x=>'• '+x).join('\n')}\nОснование: ${c.evidence.map(e=>e.id).join(', ')}`),'SWOT сформирован по вашим ответам, а не по данным о бизнесе.'].join('\n\n');
}
