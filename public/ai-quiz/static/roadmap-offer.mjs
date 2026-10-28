export const OFFER_KEY='nedelsky-business-analysis-offer-v2';
export const OFFER_DURATION=90*60*1000;

export function loadOffer(storage,now,completedAt=now){
  try{
    const raw=storage.getItem(OFFER_KEY);
    if(raw===null){
      if(!Number.isFinite(completedAt)||completedAt>now)return null;
      const offer={version:1,createdAt:completedAt,expiresAt:completedAt+OFFER_DURATION};
      storage.setItem(OFFER_KEY,JSON.stringify(offer));return offer;
    }
    const offer=JSON.parse(raw);
    if(offer?.version!==1||!Number.isFinite(offer.createdAt)||!Number.isFinite(offer.expiresAt)||offer.expiresAt-offer.createdAt!==OFFER_DURATION||offer.createdAt>now)return null;
    return offer;
  }catch{return null;}
}

export function offerPrice(offer,now){
  const remaining=offer?Math.max(0,offer.expiresAt-now):0;
  return{active:remaining>0,price:remaining>0?2900:4500,seconds:Math.ceil(remaining/1000)};
}
