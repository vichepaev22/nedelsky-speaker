import {ALL_QUESTIONS,QUESTIONS,DIMENSIONS,GOALS,LEVELS} from './data.mjs';
import {evaluate} from './domain.mjs';

const themes={B01:'Применение ИИ в практике',B02:'Постановка задачи и контекст',B03:'Проверка фактов и источников',B04:'Доработка ответа',P05:'Работа со своими материалами',P06:'Получение рабочего результата',P07:'Разделение сложной задачи',P08:'Собственные шаблоны',S09:'Последовательность шагов',S10:'Повторение процесса',S11:'Выбор задачи и оценка эффекта',S12:'Системная проверка качества',A13:'Обработка обращений',A14:'Подтверждение отправки',A15:'Интеграции и тестовый запуск',A16:'Ограничение доступа к данным'};
function evidence(answers,ids){return ids.map(id=>{const q=ALL_QUESTIONS.find(q=>q.id===id),o=q.options.find(o=>o.id===answers[id]);return {id,question:q.text,answer:o.text,score:o.score};});}
export function buildSwot(answers){
 const missing=ALL_QUESTIONS.filter(q=>!q.options.some(o=>o.id===answers[q.id]));
 if(missing.length)return {complete:false,missing:missing.map(q=>q.id),answered:16-missing.filter(q=>q.kind!=='profile').length};
 const result=evaluate(answers),scores=QUESTIONS.map(q=>({id:q.id,score:q.options.find(o=>o.id===answers[q.id]).score})),score=Object.fromEntries(scores.map(s=>[s.id,s.score]));
 const practical=scores.filter(s=>!s.id.startsWith('A'));
 const strong=practical.filter(s=>s.score>=2).sort((a,b)=>b.score-a.score).slice(0,2);
 const weak=practical.filter(s=>s.score<=1).sort((a,b)=>a.score-b.score).slice(0,2);
 const growth=result.gate_gap||result.growth;
 const strength=strong.length?strong.map(s=>`${themes[s.id]}.`):['Вы уже обозначили точку старта и цель. Ответы пока не подтверждают устойчивых прикладных навыков — это ориентир для обучения.'];
 const weakness=weak.length?weak.map(s=>`${themes[s.id]}.`):['В ответах о практике явные начальные пробелы не выделились. Следующая проверка — применить подход к реальной задаче и измерить результат.'];
 const opportunities=[DIMENSIONS[growth].growth,`Под вашу цель: ${GOALS[answers.P2]}`];
 const risks=[],riskIds=[];
 for(const [id,copy] of [['B03','Ошибочный факт может попасть в решение. Для важных задач нужна независимая проверка источников.'],['S12','Без критериев качества ошибка может повторяться вместе с процессом. Сначала зафиксируйте проверку результата.'],['A14','В ситуационном ответе мало контроля отправки. Ошибочный ответ клиенту лучше останавливать до отправки.'],['A16','В ситуационном ответе недостаточно ограничения доступа. Для пилота оставьте только необходимые права и данные.']]){
  if(score[id]<2&&risks.length<2){risks.push(copy);riskIds.push(id);}
 }
 if(result.blocks.A>=67&&result.blocks.S<50&&risks.length<2){risks.push('Понимание агентских сценариев опережает практику процессов. Сразу переходить к автономному запуску рано.');riskIds.push(...scores.filter(s=>s.id.startsWith('S')).slice(0,1).map(s=>s.id),'A13');}
 if(!risks.length)risks.push('Явные рискованные решения в проверенных ответах не выделились. Это не проверка безопасности реальной системы: доступы, тесты и журнал нужно проверить на пилоте.');
 const growthIds=scores.filter(s=>s.id.startsWith(growth)).sort((a,b)=>a.score-b.score).slice(0,2).map(s=>s.id);
 return {complete:true,result,level:LEVELS[result.level],categories:[
  {code:'S',title:'Сильные стороны',intro:strong.length?'Уже получается:':'Ваша отправная точка:',items:strength,evidence:evidence(answers,strong.length?strong.map(s=>s.id):['P2',...practical.slice(0,1).map(s=>s.id)])},
  {code:'W',title:'Слабые стороны',intro:weak.length?'Нужно укрепить:':'Что проверить на практике:',items:weakness,evidence:evidence(answers,weak.length?weak.map(s=>s.id):practical.slice(0,2).map(s=>s.id))},
  {code:'O',title:'Возможности',intro:'Что можно попробовать:',items:opportunities,evidence:evidence(answers,['P2',...growthIds])},
  {code:'T',title:'Риски',intro:'На что обратить внимание:',items:risks,evidence:evidence(answers,riskIds.length?[...new Set(riskIds)]:['B03','S12','A14','A16'])}
 ]};
}
