import test from'node:test';
import assert from'node:assert/strict';
import{loadOffer,offerPrice,OFFER_KEY,OFFER_DURATION}from'../app/static/roadmap-offer.mjs';
const storage=()=>{const values=new Map();return{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}};
test('first result starts 90 minutes and reload never extends the offer',()=>{
  const s=storage(),now=1792835000000,first=loadOffer(s,now),later=loadOffer(s,now+60000);
  assert.deepEqual(later,first);assert.equal(first.expiresAt-now,OFFER_DURATION);
  assert.deepEqual(offerPrice(later,now+60000),{active:true,price:2900,seconds:5340});
});
test('expiry restores 4500 and another visit does not restart the discount',()=>{
  const s=storage(),now=1792835000000;loadOffer(s,now);
  const later=loadOffer(s,now+OFFER_DURATION);assert.equal(offerPrice(later,now+OFFER_DURATION).price,4500);
  assert.equal(offerPrice(loadOffer(s,now+OFFER_DURATION+1000),now+OFFER_DURATION+1000).active,false);
});
test('blocked, corrupt and future storage fall back to regular price',()=>{
  const s=storage();s.setItem(OFFER_KEY,'broken');assert.equal(loadOffer(s,1000),null);
  s.setItem(OFFER_KEY,JSON.stringify({version:1,createdAt:2900,expiresAt:2900+OFFER_DURATION}));assert.equal(loadOffer(s,1000),null);
  const blocked={getItem(){throw Error('blocked')}};assert.equal(loadOffer(blocked,1000),null);
  assert.equal(offerPrice(null,1000).price,4500);
});
