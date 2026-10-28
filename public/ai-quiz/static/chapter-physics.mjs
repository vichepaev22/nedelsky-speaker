// Deterministic circle physics; rectangles represent visible copy and controls.
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const distanceToRect=(x,y,r)=>Math.hypot(x-clamp(x,r.left,r.right),y-clamp(y,r.top,r.bottom));

export function createBalls(width,height,entering=false,{count=4,radius=22,obstacles=[]}={}) {
  const gap=radius*2+12, candidates=[];
  for(let y=radius+10;y<=height-radius-10;y+=gap)
    for(let x=radius+10;x<=width-radius-10;x+=gap)
      if(obstacles.every(r=>distanceToRect(x,y,r)>radius+7))candidates.push({x,y});
  const homes=[];
  for(let i=0;i<count;i++){
    let best=null,bestScore=-Infinity;
    for(const p of candidates){
      const score=homes.length?Math.min(...homes.map(h=>Math.hypot(h.x-p.x,h.y-p.y))):-Math.hypot(p.x-width*.35,p.y-height*.35);
      if(score>bestScore){best=p;bestScore=score;}
    }
    const p=best||{x:clamp(width/2,radius,width-radius),y:clamp(height/2,radius,height-radius)};
    homes.push(p); if(best)candidates.splice(candidates.indexOf(best),1);
  }
  return homes.map((p,i)=>({x:p.x,y:p.y,homeX:p.x,homeY:p.y,radius,vx:entering?Math.cos(i*2.4)*80:0,vy:entering?Math.sin(i*2.4+.8)*100:0}));
}

function constrain(b,width,height,obstacles){
  const radius=b.radius;
  b.x=clamp(b.x,radius,width-radius);b.y=clamp(b.y,radius,height-radius);
  if((b.x===radius&&b.vx<0)||(b.x===width-radius&&b.vx>0))b.vx=Math.abs(b.vx)<12?0:b.vx*-.72;
  if((b.y===radius&&b.vy<0)||(b.y===height-radius&&b.vy>0))b.vy=Math.abs(b.vy)<12?0:b.vy*-.72;
  for(const rect of obstacles){
    const nearX=clamp(b.x,rect.left,rect.right),nearY=clamp(b.y,rect.top,rect.bottom);
    let dx=b.x-nearX,dy=b.y-nearY,d=Math.hypot(dx,dy),push=radius-d;
    if(push<=0)continue;
    if(d<.0001){
      const exits=[{n:b.x-rect.left,x:-1,y:0},{n:rect.right-b.x,x:1,y:0},{n:b.y-rect.top,x:0,y:-1},{n:rect.bottom-b.y,x:0,y:1}];
      exits.sort((a,c)=>a.n-c.n);dx=exits[0].x;dy=exits[0].y;push=radius+exits[0].n;d=1;
    }
    const nx=dx/d,ny=dy/d;
    b.x+=nx*(push+.001);b.y+=ny*(push+.001);
    const incoming=b.vx*nx+b.vy*ny;
    if(incoming<0){const response=Math.abs(incoming)<12?1:1.72;b.vx-=response*incoming*nx;b.vy-=response*incoming*ny;}
  }
}

export function stepBalls(previous,pointer,width,height,elapsed,obstacles=[]){
  const balls=previous.map(b=>({...b}));
  const dt=clamp(Number.isFinite(elapsed)?elapsed:0,0,1/30),steps=Math.max(1,Math.ceil(dt*120)),tick=dt/steps;
  for(let sub=0;sub<steps;sub++){
    for(const [i,b] of balls.entries()){
      let fx=(b.homeX-b.x)*2.4-b.vx*2.5,fy=(b.homeY-b.y)*2.4-b.vy*2.5;
      if(pointer){
        const dx=b.x-pointer.x,dy=b.y-pointer.y,d=Math.hypot(dx,dy);
        if(d<135){const power=8000*(1-d/135)**2;const angle=i*2.4;
          fx+=(d>.01?dx/d:Math.cos(angle))*power;
          fy+=(d>.01?dy/d:Math.sin(angle+.8))*power;
        }
      }
      b.vx=clamp(b.vx+fx*tick,-520,520);b.vy=clamp(b.vy+fy*tick,-520,520);
      b.x+=b.vx*tick;b.y+=b.vy*tick;
      constrain(b,width,height,obstacles);
    }
    for(let pass=0;pass<3;pass++){
      for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){
        const a=balls[i],b=balls[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),target=a.radius+b.radius+2;
        if(d>=target)continue;if(d<.001){dx=1;dy=.7;d=Math.hypot(dx,dy);}
        const nx=dx/d,ny=dy/d,overlap=(target-d)/2;
        a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
        const incoming=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
        if(incoming<0){const impulse=-incoming*.8;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}
      }
      for(const b of balls){constrain(b,width,height,obstacles);b.vx=clamp(b.vx,-520,520);b.vy=clamp(b.vy,-520,520);}
    }
  }
  return balls;
}


// A small deterministic invitation impulse. The DOM adapter schedules only three.
export function inviteBalls(previous){
  return previous.map((b,i)=>({...b,
    vx:clamp(b.vx+Math.cos(i*2.4+.4)*85,-520,520),
    vy:clamp(b.vy+Math.sin(i*2.4+.8)*110,-520,520)
  }));
}

export function scrollImpulse(previous,delta){
 if(!Number.isFinite(delta)||Math.abs(delta)<.1)return previous;
 const impulse=clamp(delta,-100,100)*3.2;
 return previous.map((b,i)=>({...b,vx:clamp(b.vx+Math.sin(i*2.4+.5)*impulse*.24,-420,420),vy:clamp(b.vy+impulse*(.85+(i%3)*.1),-420,420)}));
}
