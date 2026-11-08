const COLORS = ['coral', 'lime', 'blue', 'violet'];
const BALL_LIMIT = 40;
const BALL_BATCH = 10;
const STORAGE_KEY = 'nedelsky-quiz-side-balls-v1';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const translate = (x, y) => `translate(${x}px, ${y}px)`;

function createSideBalls(disclosure, summary, reduced) {
  const main = disclosure.closest('.result-shell');
  const field = main.querySelector('[data-plan-landing]');
  const completion = main.querySelector('[data-consultation-offer]')?.dataset.completedAt;
  const rails = [false, true].map(right => {
    const node = document.createElement('div');
    node.className = 'plan-ball-rail';
    field.append(node);
    return {node, right, balls: []};
  });
  const running = new Map();
  let count = 0;

  function animate(ball, frames, options) {
    const animation = ball.node.animate(frames, options);
    running.set(ball, animation);
    animation.onfinish = () => running.delete(ball);
  }

  function settle() {
    for (const animation of running.values()) {
      animation.onfinish = null;
      animation.cancel();
    }
    running.clear();
  }

  function layout() {
    const shell = main.getBoundingClientRect();
    const lip = summary.getBoundingClientRect();
    const pageWidth = document.documentElement.clientWidth;
    for (const rail of rails) {
      const width = Math.min(112, Math.floor((rail.right ? pageWidth - lip.right : lip.left) - 2));
      const size = Math.min(40, width - 4);
      const columns = Math.max(1, Math.floor((width - 2) / (size + 5)));
      const pitch = size + 6;
      const height = Math.ceil((BALL_LIMIT / 2) / columns) * pitch + 12;
      Object.assign(rail, {width, height, size});
      rail.node.hidden = size < 8;
      if (rail.node.hidden) continue;
      const left = (rail.right ? lip.right + 1 : lip.left - width - 1) - shell.left;
      Object.assign(rail.node.style, {left: `${left}px`, width: `${width}px`, height: `${height}px`});
      rail.balls.forEach((ball, index) => {
        const cell = (width - 2) / columns;
        ball.x = 1 + (index % columns) * cell + (cell - size) * ball.u;
        ball.y = height - 9 - size - Math.floor(index / columns) * pitch - 5 * ball.v;
        Object.assign(ball.node.style, {left: `${ball.x}px`, top: `${ball.y}px`});
        ball.node.style.setProperty('--plan-ball-size', `${size}px`);
      });
    }
  }

  function append(number, withMotion) {
    const added = [];
    for (let index = count; index < number; index++) {
      const rail = rails[index % 2];
      const node = document.createElement('span');
      node.className = 'plan-ball';
      const color = COLORS[(Math.floor(index / 2) + (rail.right ? 2 : 0)) % COLORS.length];
      node.style.backgroundColor = `var(--${color})`;
      const ball = {node, u: Math.random(), v: Math.random(), x: 0, y: 0};
      rail.balls.push(ball);
      rail.node.append(node);
      added.push({rail, ball});
    }
    count = number;
    field.hidden = count === 0;
    layout();
    if (!withMotion) return;
    const lipBottom = summary.getBoundingClientRect().bottom;
    const railTops = new Map(rails.map(rail => [rail, rail.node.getBoundingClientRect().top]));
    added.forEach(({rail, ball}, index) => {
      if (rail.node.hidden) return;
      const y = lipBottom - railTops.get(rail) - ball.y - rail.size / 2;
      const x = (rail.width - rail.size - 2) * Math.random() + 1 - ball.x;
      animate(ball, [
        {transform: translate(x, y), opacity: 0},
        {transform: translate(x, y + 16), opacity: 1, offset: .12},
        {transform: translate(x * .6, y + 105), offset: .32},
        {transform: translate(0, 0), offset: .88},
        {transform: translate(0, -10), offset: .94},
        {transform: translate(0, 0)},
      ], {duration: 2250 + 380 * Math.random(), delay: index * 57, fill: 'backwards'});
    });
  }

  function move(event) {
    if (!count || event.pointerType !== 'mouse' || reduced.matches || document.hidden) return;
    for (const rail of rails) {
      if (rail.node.hidden) continue;
      const rect = rail.node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < -8 || x > rail.width + 8 || y < 0 || y > rail.height) continue;
      const radius = rail.size / 2;
      for (const ball of rail.balls) {
        if (running.has(ball) || typeof ball.node.animate !== 'function') continue;
        const dx = ball.x + radius - x;
        const dy = ball.y + radius - y;
        const distance = Math.hypot(dx, dy);
        const reach = radius + 14;
        if (distance > reach) continue;
        const power = 16 + 24 * (1 - distance / reach);
        const shiftX = clamp(ball.x + dx / Math.max(1, distance) * power, 1, rail.width - rail.size - 1) - ball.x;
        const lift = Math.abs(dy) < 4 ? -power : dy / distance * power;
        const shiftY = clamp(ball.y + lift, 0, rail.height - rail.size - 1) - ball.y;
        animate(ball, [
          {transform: translate(0, 0)},
          {transform: translate(shiftX, shiftY), offset: .26},
          {transform: translate(0, 0)},
        ], {duration: 630, easing: 'cubic-bezier(.22,.61,.36,1)'});
      }
    }
  }

  if (completion) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (saved?.completion === completion && Number.isInteger(saved.count) && saved.count > 0 && saved.count <= BALL_LIMIT) {
        append(saved.count, false);
      }
    } catch { /* Decoration works without storage. */ }
  }
  window.addEventListener('pointermove', move, {passive: true});
  return {
    add(withMotion) {
      if (count >= BALL_LIMIT) return;
      append(Math.min(count + BALL_BATCH, BALL_LIMIT), withMotion);
      if (completion) {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({completion, count})); }
        catch { /* The current result still keeps its balls. */ }
      }
    },
    settle,
    resize() { settle(); if (count) layout(); },
    dispose() {
      settle();
      window.removeEventListener('pointermove', move);
      field.replaceChildren();
      field.hidden = true;
    },
  };
}

export function createPlanEffects(disclosure, reduced) {
  const summary = disclosure.querySelector('.plan-summary');
  const steps = [...disclosure.querySelectorAll('.next-steps li')];
  const balls = createSideBalls(disclosure, summary, reduced);
  let observer;
  let glow;
  let animation;
  let pause;

  function settle() {
    observer?.disconnect();
    observer = null;
    clearTimeout(pause);
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
      animation = null;
    }
    glow?.remove();
    glow = null;
    balls.settle();
  }

  function highlightNext(index) {
    const step = steps[index];
    if (!step) return;
    function highlight() {
      glow = document.createElement('i');
      glow.className = 'plan-step-glow';
      glow.setAttribute('aria-hidden', 'true');
      step.append(glow);
      animation = glow.animate([
        {opacity: 0}, {opacity: 1, offset: .15}, {opacity: 1, offset: .78}, {opacity: 0},
      ], {duration: 1500, easing: 'ease-in-out'});
      animation.onfinish = () => {
        glow.remove();
        glow = null;
        animation = null;
        if (index + 1 < steps.length) pause = setTimeout(() => highlightNext(index + 1), 500);
      };
    }
    if (!('IntersectionObserver' in window)) {
      highlight();
      return;
    }
    const current = new IntersectionObserver(entries => {
      if (observer !== current || !entries.some(entry => entry.intersectionRatio >= .24)) return;
      current.disconnect();
      observer = null;
      highlight();
    }, {threshold: .24});
    observer = current;
    observer.observe(step);
  }

  return {
    play(withMotion) {
      settle();
      const canAnimate = withMotion && !reduced.matches && !document.hidden && typeof summary.animate === 'function';
      balls.add(canAnimate);
      if (canAnimate) highlightNext(0);
    },
    settle,
    resize() { settle(); balls.resize(); },
    clear() { settle(); balls.dispose(); },
  };
}
