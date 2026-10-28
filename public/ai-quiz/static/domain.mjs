import { ALL_QUESTIONS, QUESTIONS } from './data.mjs';

export const SESSION_KEY='nedelsky-ai-quiz-session-v1';
export const SESSION_TTL=24*60*60*1000;
export const REVISION='quiz-2026-10-28';
const own=(object,key)=>Object.hasOwn(object,key);
export function validAnswer(question,id){return typeof id==='string'&&question.options.some(o=>o.id===id);}
export function validAnswers(answers){
  if(!answers||typeof answers!=='object'||Array.isArray(answers))return false;
  return Object.entries(answers).every(([id,value])=>{const q=ALL_QUESTIONS.find(q=>q.id===id);return q&&validAnswer(q,value);});
}
export function firstMissing(answers){return ALL_QUESTIONS.findIndex(q=>!validAnswer(q,answers[q.id]));}
export function freshSession(now){return {version:1,revision:REVISION,createdAt:now,started:false,answers:{},completedAt:null};}
export function readSession(storage,now){
  try{
    const raw=storage?.getItem(SESSION_KEY);
    if(!raw)return freshSession(now);
    if(raw.length>15000)throw new Error('Session too large');
    const s=JSON.parse(raw);
    if(s.version!==1||s.revision!==REVISION||!Number.isFinite(s.createdAt)||s.createdAt>now||now-s.createdAt>=SESSION_TTL||typeof s.started!=='boolean'||!validAnswers(s.answers))throw new Error('Invalid session');
    if(s.completedAt!==null&&(!Number.isFinite(s.completedAt)||s.completedAt<s.createdAt||s.completedAt>now||firstMissing(s.answers)!==-1))throw new Error('Invalid completion');
    return {version:1,revision:REVISION,createdAt:s.createdAt,started:s.started,answers:{...s.answers},completedAt:s.completedAt};
  }catch{return freshSession(now);}
}
export function persistSession(storage,session){try{if(!storage)return false;storage.setItem(SESSION_KEY,JSON.stringify(session));return true;}catch{return false;}}
export function roundRatio(numerator,denominator){
  const floor=Math.floor(numerator/denominator),remainder=numerator%denominator;
  return remainder*2<denominator?floor:remainder*2>denominator?floor+1:floor+(floor%2);
}
export function evaluate(answers){
  if(!validAnswers(answers))throw new Error('Неизвестный ответ');
  const scores={};
  for(const q of QUESTIONS){const o=q.options.find(o=>o.id===answers[q.id]);if(!o)throw new Error('Не хватает ответов');scores[q.id]=o.score;}
  const blocks={};
  for(const c of 'BPSA')blocks[c]=roundRatio(100*Object.entries(scores).filter(([id])=>id.startsWith(c)).reduce((sum,[,n])=>sum+n,0),12);
  const index=roundRatio(100*Object.values(scores).reduce((sum,n)=>sum+n,0),48);
  const initial=index<25?1:index<50?2:index<75?3:4;
  const count=c=>Object.entries(scores).filter(([id,n])=>id.startsWith(c)&&n>=2).length;
  const gates={P:count('P')>=2,S:count('S')>=2,A:count('A')>=3&&scores.A14>=2&&scores.A16>=2};
  let level=initial,gap=null;
  for(const [target,c] of [[2,'P'],[3,'S'],[4,'A']])if(level>=target&&!gates[c]){level=target-1;gap=c;break;}
  const codes=Object.keys(blocks);
  const strength=codes.reduce((best,c)=>blocks[c]>blocks[best]?c:best,codes[0]);
  const minimum=codes.reduce((best,c)=>blocks[c]<blocks[best]?c:best,codes[0]);
  return {index,level,preliminary:initial,blocks,strength,growth:codes.find(c=>blocks[c]<67)||minimum,gate_gap:gap};
}
export function answerAt(session,step,id){
  const question=ALL_QUESTIONS[step];
  if(!question||!validAnswer(question,id)||!own(session,'answers'))throw new Error('Некорректный ответ');
  session.answers[question.id]=id;session.started=true;
}
