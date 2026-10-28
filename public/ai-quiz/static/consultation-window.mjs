export const CONSULTATION_KEY='nedelsky-free-consultation-offer-v1';
export const CONSULTATION_DURATION=90*60*1000;

export function loadConsultationOffer(storage,now,completedAt){
  if(!Number.isFinite(now)||!Number.isFinite(completedAt)||completedAt>now)return null;
  try{
    const raw=storage.getItem(CONSULTATION_KEY);
    if(raw===null){
      const offer={version:1,createdAt:completedAt,expiresAt:completedAt+CONSULTATION_DURATION};
      storage.setItem(CONSULTATION_KEY,JSON.stringify(offer));return offer;
    }
    const offer=JSON.parse(raw);
    if(offer?.version!==1||!Number.isFinite(offer.createdAt)||!Number.isFinite(offer.expiresAt)||offer.createdAt>now||offer.expiresAt-offer.createdAt!==CONSULTATION_DURATION)return null;
    return offer;
  }catch{return null;}
}

export function consultationState(offer,now,subscribed=false){
  const remaining=offer&&Number.isFinite(now)?Math.max(0,offer.expiresAt-now):0;
  const active=remaining>0;
  return {active,seconds:Math.ceil(remaining/1000),canApply:active&&subscribed===true};
}
