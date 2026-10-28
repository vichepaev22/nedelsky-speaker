export const CONSENT_KEY='nedelsky-quiz-statistics-v1';
export const VISITOR_KEY='nedelsky-quiz-visitor-v1';
export const VISIT_KEY='nedelsky-quiz-visit-v1';
const TTL=180*86400000,VISIT_TTL=86400000;
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
function read(storage,key){try{return JSON.parse(storage?.getItem(key)||'null');}catch{return null;}}
function write(storage,key,value){try{storage?.setItem(key,JSON.stringify(value));}catch{/* Optional persistence; memory remains usable. */}}
function remove(storage,key){try{storage?.removeItem(key);}catch{/* Quiz stays usable. */}}
export function readChoice(storage,now=Date.now()){
 const v=read(storage,CONSENT_KEY);return v&&v.version===1&&['yes','no'].includes(v.choice)&&Number.isFinite(v.expiresAt)&&v.expiresAt>now&&v.expiresAt<=now+TTL?v.choice:null;
}
export function validView(v){
 if(!v||!['cover','profile','chapter','question','result'].includes(v.stage)||!Number.isInteger(v.step)||v.step<0||v.step>19)return false;
 if(v.stage==='result')return v.step===19&&Number.isInteger(v.level)&&v.level>=1&&v.level<=4;
 if(v.level!==null)return false;
 return v.stage==='cover'?v.step===0:v.stage==='profile'?v.step>=1&&v.step<=3:v.stage==='chapter'?[3,7,11,15].includes(v.step):v.step>=4;
}
export function createJournal({storage,sessionStorage,newId,send,now=Date.now,config}){
 let choice=readChoice(storage,now()),visitor=null,visit=null,current={stage:'cover',step:0,level:null},lastSent='';
 function identity(){
  if(!visitor){const record=read(storage,VISITOR_KEY);visitor=record&&uuid.test(record.id)&&record.expiresAt>now()?record.id:newId();if(!uuid.test(visitor))throw Error('Invalid generated ID');write(storage,VISITOR_KEY,{id:visitor,expiresAt:now()+TTL});}
  if(!visit){const record=read(sessionStorage,VISIT_KEY);visit=record&&uuid.test(record.id)&&record.visitor===visitor&&record.revision===config.revision&&Number.isInteger(record.sequence)&&record.sequence>=0&&record.sequence<100000&&Number.isFinite(record.createdAt)&&record.createdAt<=now()&&record.createdAt>now()-VISIT_TTL?record:{id:newId(),visitor,revision:config.revision,sequence:0,createdAt:now()};}
 }
 function emit(){
  if(choice!=='yes'||!validView(current))return false;
  const key=JSON.stringify(current);if(key===lastSent)return false;
  try{
   identity();visit.sequence++;write(sessionStorage,VISIT_KEY,visit);
   const event={visitId:visit.id,visitorId:visitor,quizId:config.quizId,revision:config.revision,stage:current.stage,step:current.step,sequence:visit.sequence,level:current.level};
   send(event);lastSent=key;return true;
  }catch{return false;}
 }
 return {
  get choice(){return choice;},
  view(value){if(!validView(value))throw Error('Invalid journal view');current={stage:value.stage,step:value.step,level:value.level};return emit();},
  choose(value){if(!['yes','no'].includes(value))throw Error('Invalid choice');choice=value;write(storage,CONSENT_KEY,{version:1,choice,expiresAt:now()+TTL});if(value==='no'){remove(storage,VISITOR_KEY);remove(sessionStorage,VISIT_KEY);visitor=null;visit=null;lastSent='';return false;}return emit();},
  newAttempt(){visit=null;lastSent='';remove(sessionStorage,VISIT_KEY);}
 };
}
