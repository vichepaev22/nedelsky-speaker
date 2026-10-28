import assert from 'node:assert/strict';
import test from 'node:test';
import { createBalls, stepBalls, inviteBalls } from '../app/static/chapter-physics.mjs';

const obstacles = [{left:140,top:220,right:500,bottom:282},{left:240,top:480,right:400,bottom:535}];
const outside=(b,boxes)=>boxes.every(r=>Math.hypot(b.x-Math.max(r.left,Math.min(r.right,b.x)),b.y-Math.max(r.top,Math.min(r.bottom,b.y)))>=b.radius-.01);

test('4/8/12/16 homes avoid text and occupy both dimensions',()=>{
  for(const count of [4,8,12,16]){
    const balls=createBalls(640,720,false,{count,radius:22,obstacles});
    assert.equal(balls.length,count);assert.ok(balls.every(b=>outside(b,obstacles)));
    assert.ok(Math.max(...balls.map(b=>b.y))-Math.min(...balls.map(b=>b.y))>200);
  }
});
test('cursor launches a ball vertically and horizontally',()=>{
  let balls=createBalls(640,720,false,{count:1,radius:22});const start={...balls[0]};
  for(let i=0;i<22;i++)balls=stepBalls(balls,{x:start.x+12,y:start.y+28},640,720,1/60);
  assert.ok(balls[0].y<start.y-55,`Vertical displacement ${start.y-balls[0].y}`);
  assert.ok(balls[0].x<start.x-20);
});
test('balls bounce off text edges and corners',()=>{
  const boxes=[{left:220,top:280,right:420,bottom:330}];
  const balls=[{x:320,y:256,homeX:320,homeY:256,vx:0,vy:420,radius:18}];
  const bounced=stepBalls(balls,null,640,720,1/30,boxes);
  assert.ok(bounced[0].y<=262.01);assert.ok(bounced[0].vy<0);assert.ok(outside(bounced[0],boxes));
  balls[0]={...balls[0],x:210,y:270,vx:180,vy:180};
  assert.ok(outside(stepBalls(balls,null,640,720,1/30,boxes)[0],boxes));
});
for(const width of [276,390,1440])test(`16 balls respect arena and text bounds at ${width}px`,()=>{
  const boxes=[{left:width*.15,top:240,right:width*.85,bottom:300},{left:width*.3,top:440,right:width*.7,bottom:490}];
  let balls=createBalls(width,740,true,{count:16,radius:width<400?15:22,obstacles:boxes});
  for(let i=0;i<1000;i++){
    balls=stepBalls(balls,{x:(Math.sin(i*.17)+1)*width/2,y:(Math.cos(i*.11)+1)*370},width,740,i%151===0?5:1/60,boxes);
    for(const b of balls){
      assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.y)&&Number.isFinite(b.vx)&&Number.isFinite(b.vy));
      assert.ok(b.x>=b.radius-.01&&b.x<=width-b.radius+.01);
      assert.ok(b.y>=b.radius-.01&&b.y<=740-b.radius+.01);
      assert.ok(outside(b,boxes),`Ball overlaps text at ${b.x},${b.y}`);
    }
  }
});
test('entry settles so the renderer can stop its frame loop',()=>{
  let balls=createBalls(640,720,true,{count:16,radius:22});const initial=structuredClone(balls);
  for(let i=0;i<1800;i++)balls=stepBalls(balls,null,640,720,1/120);
  assert.ok(balls.every(b=>Math.hypot(b.vx,b.vy)<.2));
  assert.ok(balls.every((b,i)=>Math.hypot(b.x-initial[i].homeX,b.y-initial[i].homeY)<.5));
});
test('a resting ball against copy does not bounce forever toward an unreachable home',()=>{
  const boxes=[{left:220,top:280,right:420,bottom:330}];
  let balls=[{x:320,y:255,homeX:320,homeY:400,vx:0,vy:0,radius:18}];
  for(let i=0;i<1200;i++)balls=stepBalls(balls,null,640,720,1/120,boxes);
  assert.ok(outside(balls[0],boxes));assert.ok(Math.hypot(balls[0].vx,balls[0].vy)<.35);
});
test('stepping is immutable and coincident balls remain finite',()=>{
  const original=createBalls(640,720,false,{count:8,radius:22});original[1].x=original[0].x;original[1].y=original[0].y;
  const before=structuredClone(original),after=stepBalls(original,{x:original[0].x,y:original[0].y},640,720,1/60,obstacles);
  assert.deepEqual(original,before);assert.ok(after.every(b=>Number.isFinite(b.x)&&Number.isFinite(b.y)));
  assert.ok(Math.hypot(after[0].x-after[1].x,after[0].y-after[1].y)>0);
});
test('motion is consistent at 30/60/120fps',()=>{
  const states=[30,60,120].map(fps=>{let balls=createBalls(640,720,true,{count:8,radius:22});for(let i=0;i<fps*2;i++)balls=stepBalls(balls,null,640,720,1/fps);return balls;});
  for(const state of states)state.forEach((b,i)=>assert.ok(Math.hypot(b.x-states[0][i].x,b.y-states[0][i].y)<.01));
});


test('new milestone counts 5/10/15/20 occupy both axes outside text',()=>{
  for(const count of [5,10,15,20]){
    const balls=createBalls(640,760,true,{count,radius:22,obstacles});
    assert.equal(balls.length,count);assert.ok(balls.every(b=>outside(b,obstacles)));
    assert.ok(Math.max(...balls.map(b=>b.y))-Math.min(...balls.map(b=>b.y))>200);
  }
});
for(const width of [271,390,1440])test(`20 balls remain in bounds and outside text at ${width}px`,()=>{
  const boxes=[{left:width*.15,top:240,right:width*.85,bottom:330},{left:width*.3,top:490,right:width*.7,bottom:550}];
  let balls=createBalls(width,760,true,{count:20,radius:width<400?16:23,obstacles:boxes});
  for(let i=0;i<1000;i++){
    if([100,200,300].includes(i))balls=inviteBalls(balls);
    balls=stepBalls(balls,{x:(Math.sin(i*.17)+1)*width/2,y:(Math.cos(i*.11)+1)*380},width,760,i%151===0?5:1/60,boxes);
    for(const b of balls){
      assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.y));
      assert.ok(b.x>=b.radius-.01&&b.x<=width-b.radius+.01);
      assert.ok(b.y>=b.radius-.01&&b.y<=760-b.radius+.01);
      assert.ok(outside(b,boxes));
    }
  }
});
test('invitation kick is deterministic and immutable, moves both axes and stays capped',()=>{
  const before=createBalls(640,760,false,{count:5,radius:22});
  const saved=structuredClone(before),kicked=inviteBalls(before);
  assert.deepEqual(before,saved);assert.deepEqual(kicked,inviteBalls(before));
  assert.ok(kicked.every(b=>Math.abs(b.vx)>0&&Math.abs(b.vy)>0));
  assert.ok(inviteBalls([{...before[0],vx:510,vy:-510}]).every(b=>Math.abs(b.vx)<=520&&Math.abs(b.vy)<=520));
});
test('twenty invited balls settle once the finite invitation ends',()=>{
  let balls=createBalls(640,760,false,{count:20,radius:22});
  for(let i=0;i<3;i++)balls=inviteBalls(balls);
  for(let i=0;i<1800;i++)balls=stepBalls(balls,null,640,760,1/120);
  assert.ok(balls.every(b=>Math.hypot(b.vx,b.vy)<.35));
});
