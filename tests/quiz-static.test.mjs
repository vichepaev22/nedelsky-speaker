import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluate,roundRatio,readSession,freshSession,persistSession,answerAt,firstMissing,SESSION_KEY,SESSION_TTL} from '../public/ai-quiz/static/domain.mjs';
import {VIEWS} from '../public/ai-quiz/static/views.mjs';
import {ALL_QUESTIONS} from '../public/ai-quiz/static/data.mjs';
import {loadOffer,offerPrice,OFFER_KEY,OFFER_DURATION} from '../public/ai-quiz/static/roadmap-offer.mjs';

const fixtures=JSON.parse(await readFile(new URL('./quiz-scoring-fixtures.json',import.meta.url),'utf8'));
test('static scorer exactly matches the Python contract across boundary and seeded vectors',()=>{
  const levels=new Set();
  for(const {answers,expected} of fixtures){assert.deepEqual(evaluate(answers),expected);levels.add(expected.level);}
  assert.deepEqual([...levels].sort(),[1,2,3,4]);
});
test('half-even rounding and ordered gates are not replaced by Math.round',()=>{
  assert.equal(roundRatio(125,10),12);assert.equal(roundRatio(375,10),38);
  assert.throws(()=>evaluate({...fixtures[0].answers,unexpected:'A'}));
  assert.throws(()=>evaluate({...fixtures[0].answers,B01:'E'}));
  assert.throws(()=>evaluate({}));
});
function memory(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};}
test('progress survives refresh, expires without extending TTL, and rejects corrupt data',()=>{
  const now=100000000,storage=memory(),s=freshSession(now);
  answerAt(s,0,'B');assert.equal(firstMissing(s.answers),1);assert.ok(persistSession(storage,s));
  assert.deepEqual(readSession(storage,now+1),s);
  assert.deepEqual(readSession(storage,now+SESSION_TTL),freshSession(now+SESSION_TTL));
  for(const raw of ['{',JSON.stringify({...s,answers:{evil:'A'}}),JSON.stringify({...s,completedAt:now}),JSON.stringify({...s,createdAt:now+1})]){
    storage.setItem(SESSION_KEY,raw);assert.deepEqual(readSession(storage,now),freshSession(now));
  }
});
test('blocked storage leaves a complete in-memory quiz usable',()=>{
  const storage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  const s=readSession(storage,100);
  ALL_QUESTIONS.forEach((q,i)=>answerAt(s,i,fixtures[0].answers[q.id]));
  assert.equal(persistSession(storage,s),false);assert.equal(firstMissing(s.answers),-1);
  assert.deepEqual(evaluate(s.answers),fixtures[0].expected);
});
test('completion starts the new 4500/2900 window; refresh and another test do not extend it',()=>{
  const storage=memory(),completed=100000000,now=completed+60000;
  const offer=loadOffer(storage,now,completed);
  assert.equal(offer.createdAt,completed);assert.equal(offer.expiresAt,completed+OFFER_DURATION);
  assert.equal(offerPrice(offer,now).price,2900);
  assert.deepEqual(loadOffer(storage,now+60000,now+60000),offer);
  assert.equal(offerPrice(offer,completed+OFFER_DURATION).price,4500);
  assert.equal(loadOffer(memory(),now,now+1),null);
  assert.equal(offerPrice(loadOffer({getItem(){throw Error('blocked');}},now,completed),now).price,4500);
  storage.setItem(OFFER_KEY,'{');assert.equal(loadOffer(storage,now,completed),null);
});
test('export has no backend transport, localhost or cross-host asset dependencies',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../public/ai-quiz/build-manifest.json',import.meta.url),'utf8'));
  for(const path of Object.keys(manifest.files)){
    const content=await readFile(new URL('../public/ai-quiz/'+path,import.meta.url),'utf8');
    assert.doesNotMatch(content,/127\.0\.0\.1|localhost|fetch\s*\(|XMLHttpRequest|action="\/(?:answer|start|restart)/,path);
  }
});

test('both outputs contain the exact same quiz and own-host hero entry',async()=>{
  const roots=['pages-dist','cloudflare-dist'];
  const manifests=await Promise.all(roots.map(folder=>readFile(new URL('../'+folder+'/ai-quiz/build-manifest.json',import.meta.url),'utf8')));
  assert.equal(manifests[0],manifests[1]);
  const [gh,cf]=await Promise.all(roots.map(folder=>readFile(new URL('../'+folder+'/index.html',import.meta.url),'utf8')));
  assert.match(gh,/href="\/nedelsky-speaker\/ai-quiz\/"/);
  assert.match(cf,/href="\/ai-quiz\/"/);
  for(const html of [gh,cf])assert.match(html,/Где я в ИИ\?/);
});

test('result product links resolve inside the current mirror without a doubled slash',()=>{
  for(const view of Object.values(VIEWS.results)){
    assert.doesNotMatch(view.html,/href="\.\.\/\//);
  }
  for(const base of ['https://nedelsky.pages.dev/ai-quiz/','https://vichepaev22.github.io/nedelsky-speaker/ai-quiz/']){
    const href=VIEWS.results[3].html.match(/href="([^" ]+ai-transformation#details-ai-transformation)"/)[1];
    assert.equal(new URL(href,base).pathname,new URL('../ai-for-business/',base).pathname);
  }
});
