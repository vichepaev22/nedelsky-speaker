import test from 'node:test';
import assert from 'node:assert/strict';
import {VIEWS} from '../public/ai-quiz/static/views.mjs';
import {loadConsultationOffer,consultationState,CONSULTATION_KEY,CONSULTATION_DURATION} from '../public/ai-quiz/static/consultation-window.mjs';
import {loadOffer,offerPrice,OFFER_KEY} from '../public/ai-quiz/static/roadmap-offer.mjs';

const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
test('free consultation deadline starts at completion and needs explicit subscription confirmation',()=>{
  const s=storage(),completed=100000000,offer=loadConsultationOffer(s,completed+60000,completed);
  assert.equal(offer.createdAt,completed);assert.equal(offer.expiresAt,completed+CONSULTATION_DURATION);
  assert.deepEqual(consultationState(offer,completed+60000),{active:true,seconds:5340,canApply:false});
  assert.equal(consultationState(offer,completed+60000,true).canApply,true);
  assert.equal(consultationState(offer,completed+60000,'true').canApply,false);
});
test('refresh, later completion and expiry never reset the free offer',()=>{
  const s=storage(),completed=100000000,first=loadConsultationOffer(s,completed,completed);
  assert.deepEqual(loadConsultationOffer(s,completed+70000,completed+50000),first);
  assert.deepEqual(consultationState(first,first.expiresAt-1,true),{active:true,seconds:1,canApply:true});
  assert.deepEqual(consultationState(first,first.expiresAt,true),{active:false,seconds:0,canApply:false});
  assert.equal(consultationState(loadConsultationOffer(s,first.expiresAt+1,first.expiresAt),first.expiresAt+1,true).canApply,false);
});
test('corrupt, future and blocked storage never advertise eligibility',()=>{
  const s=storage(),now=100000000;
  for(const value of ['{','null',JSON.stringify({version:1,createdAt:now+1,expiresAt:now+1+CONSULTATION_DURATION}),JSON.stringify({version:1,createdAt:now,expiresAt:now+1})]){
    s.setItem(CONSULTATION_KEY,value);assert.equal(loadConsultationOffer(s,now,now),null);
  }
  assert.equal(loadConsultationOffer({getItem(){throw Error();}},now,now),null);
  assert.equal(loadConsultationOffer({getItem(){return null;},setItem(){throw Error();}},now,now),null);
  assert.equal(loadConsultationOffer(storage(),now,now+1),null);
  assert.equal(consultationState(null,now,true).canApply,false);
});
test('the paid analysis price and free consultation use independent windows',()=>{
  const s=storage(),completed=100000000,analysis=loadOffer(s,completed,completed);
  const free=loadConsultationOffer(s,completed+1000,completed+1000);
  assert.notEqual(CONSULTATION_KEY,OFFER_KEY);assert.equal(free.createdAt,completed+1000);
  assert.equal(offerPrice(analysis,completed).price,2900);
  assert.equal(offerPrice(analysis,analysis.expiresAt).price,4500);
  assert.deepEqual(loadOffer(s,completed+2000,completed+2000),analysis);
});
test('all result variants show the exact conditions and Telegram without auto-verification or hidden form data',()=>{
  for(const view of Object.values(VIEWS.results)){
    const paid=view.html.match(/<article class="offer-card roadmap-offer"[\s\S]*?<\/article>/)[0];
    const card=view.html.match(/<article class="offer-card consultation-offer"[\s\S]*?<\/article>/)[0];
    assert.match(paid,/4 500 ₽/);assert.match(paid,/data-roadmap-price/);
    assert.match(card,/45 минут/);assert.match(card,/Бесплатно/);assert.match(card,/стадии роста/);
    assert.match(card,/href="https:\/\/t\.me\/FutureDarkSide"/);assert.match(card,/href="https:\/\/t\.me\/nofuturenews"/);
    assert.match(card,/action="https:\/\/t\.me\/nedelsky"/);assert.match(card,/Подписку подтверждаете вы/);
    assert.match(card,/<input[^>]*type="checkbox"[^>]*required/);assert.match(card,/data-consultation-submit[^>]*disabled/);
    assert.doesNotMatch(card,/Подписка проверена|name="|ограничения|Согласовать время во ВКонтакте/);
  }
});
