import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildSwot} from '../public/ai-quiz/static/swot.mjs';
import {swotText} from '../public/ai-quiz/static/swot-view.mjs';
import {QUESTIONS,ALL_QUESTIONS} from '../public/ai-quiz/static/data.mjs';
import {createJournal,CONSENT_KEY} from '../public/ai-quiz/static/journal-core.mjs';
import {scrollImpulse,createBalls,stepBalls} from '../public/ai-quiz/static/chapter-physics.mjs';
const fixtures=JSON.parse(await readFile(new URL('./quiz-scoring-fixtures.json',import.meta.url),'utf8'));
test('SWOT uses the actual scorer and exact selected-answer provenance for all117 scenarios',()=>{
 for(const {answers,expected} of fixtures){
  const report=buildSwot(answers);assert.equal(report.complete,true);assert.deepEqual(report.result,expected);
  assert.deepEqual(report.categories.map(c=>c.code),['S','W','O','T']);
  for(const c of report.categories){assert.ok(c.intro&&c.items.length);assert.ok(c.evidence.length);for(const e of c.evidence){const q=ALL_QUESTIONS.find(q=>q.id===e.id);assert.equal(e.answer,q.options.find(o=>o.id===answers[q.id]).text);}}
  assert.doesNotMatch(report.categories[0].items.join(' '),/Вы отметили устойчивую практику:/);assert.doesNotMatch(report.categories[1].items.join(' '),/Нужно укрепить:/);
  const text=swotText(report);assert.match(text,/Ваш SWOT/);assert.ok(text.length<6000);
 }
});
test('incomplete and all-low answers do not invent a completed report or mastered skills',()=>{
 const answers={P1:'B',P2:'D',P3:'A'};for(const q of QUESTIONS)answers[q.id]=q.options.find(o=>o.score===0).id;
 assert.match(buildSwot(answers).categories[0].items[0],/пока не подтверждают/);delete answers.A16;assert.equal(buildSwot(answers).complete,false);assert.equal(swotText(buildSwot(answers)),'');
});
function memory(){const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
function setup(overrides={}){let id=0;const events=[],storage=memory(),sessionStorage=memory(),config={quizId:'ai-maturity',revision:'quiz-2026-10-28-r18'};const options={storage,sessionStorage,config,now:()=>100000000,newId:()=>`00000000-0000-4000-8000-${String(++id).padStart(12,'0')}`,send:e=>events.push(e),...overrides};return {events,options,core:createJournal(options)};}
test('own journal sends nothing before choice/after refusal, then only current minimal state',()=>{
 const {core,events}=setup();core.view({stage:'profile',step:2,level:null});assert.equal(events.length,0);core.choose('no');core.view({stage:'question',step:6,level:null});assert.equal(events.length,0);core.choose('yes');assert.equal(events.length,1);assert.equal(events[0].step,6);
 assert.deepEqual(Object.keys(events[0]).sort(),['level','quizId','revision','sequence','stage','step','visitId','visitorId'].sort());core.choose('no');core.view({stage:'result',step:19,level:3});assert.equal(events.length,1);
});
test('refresh preserves visit and sequence, restart creates an attempt, and corrupt storage fails softly',()=>{
 const {core,options,events}=setup();core.choose('yes');core.view({stage:'question',step:4,level:null});const first=events.at(-1);const refreshed=createJournal(options);refreshed.view({stage:'question',step:5,level:null});assert.equal(events.at(-1).visitId,first.visitId);assert.ok(events.at(-1).sequence>first.sequence);refreshed.newAttempt();refreshed.view({stage:'cover',step:0,level:null});assert.notEqual(events.at(-1).visitId,first.visitId);
 options.storage.setItem(CONSENT_KEY,'{');assert.equal(createJournal(options).choice,null);
 const blocked=setup({storage:{getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}},sessionStorage:{getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}},send(){throw Error('offline');}}).core;
 assert.doesNotThrow(()=>{blocked.choose('yes');blocked.view({stage:'profile',step:1,level:null});});
});
test('scroll impulses reverse, stay capped, respect obstacles and settle on mobile',()=>{
 let balls=createBalls(390,950,false,{count:20,radius:15}),original=structuredClone(balls);const down=scrollImpulse(balls,45),up=scrollImpulse(balls,-45);assert.deepEqual(balls,original);assert.ok(down.every(b=>b.vy>0));assert.ok(up.every(b=>b.vy<0));
 const boxes=[{left:50,right:340,top:300,bottom:380}];balls=createBalls(390,950,false,{count:20,radius:15,obstacles:boxes});
 for(let i=0;i<1400;i++){if(i<120&&i%4===0)balls=scrollImpulse(balls,i%8===0?45:-45);balls=stepBalls(balls,null,390,950,1/60,boxes);for(const b of balls){assert.ok(b.x>=14.99&&b.x<=375.01&&b.y>=14.99&&b.y<=935.01);assert.ok(Math.hypot(b.x-Math.max(50,Math.min(340,b.x)),b.y-Math.max(300,Math.min(380,b.y)))>=14.99);}}
 assert.ok(balls.every(b=>Math.hypot(b.vx,b.vy)<.35));
});
