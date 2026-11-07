const PALETTE = ['coral', 'lime', 'blue', 'violet'];
const BALL_COUNT = 20;

export function createPlanEffects(disclosure) {
  const main = disclosure.closest('.result-shell');
  const summary = disclosure.querySelector('.plan-summary');
  const landing = main.querySelector('[data-plan-landing]');
  const steps = [...disclosure.querySelectorAll('.next-steps li')];
  const animations = new Set();
  let observer;
  let glow;

  function animate(element, frames, options, finished) {
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.onfinish = () => {
      animations.delete(animation);
      finished?.();
    };
  }

  function settle() {
    observer?.disconnect();
    observer = null;
    for (const animation of animations) {
      animation.onfinish = null;
      animation.cancel();
    }
    animations.clear();
    glow?.remove();
    glow = null;
  }

  function clear() {
    settle();
    landing.replaceChildren();
    landing.hidden = true;
  }

  function highlightNext(index) {
    const step = steps[index];
    if (!step) return;
    function highlight() {
      glow = document.createElement('i');
      glow.className = 'plan-step-glow';
      glow.setAttribute('aria-hidden', 'true');
      step.append(glow);
      animate(glow, [{opacity: 0}, {opacity: 1, offset: .36}, {opacity: 0}],
        {duration: 660, easing: 'ease-in-out'}, () => {
          glow.remove();
          glow = null;
          highlightNext(index + 1);
        });
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

  function spill(withMotion) {
    landing.hidden = false;
    const floor = landing.getBoundingClientRect();
    const lip = summary.getBoundingClientRect();
    const shell = main.getBoundingClientRect();
    const gutter = Math.min(lip.left - shell.left, shell.right - lip.right);
    const span = Math.min(152, floor.width * .36);
    const fragment = document.createDocumentFragment();
    const flights = [];
    const settled = [];

    for (let index = 0; index < BALL_COUNT; index++) {
      const right = index % 2 === 1;
      const slot = Math.floor(index / 2);
      const size = Math.round(Math.min(20, Math.max(7, gutter - 5)) * (.7 + Math.random() * .3));
      let endX, endY;
      for (let attempt = 0; attempt < 28; attempt++) {
        const fromEdge = 2 + Math.random() * (span - size - 2);
        endX = right ? floor.width - fromEdge - size : fromEdge;
        endY = 22 + Math.random() * (51 - size);
        const separated = settled.every(point => {
          const radius = (size + point.size) / 2;
          return Math.hypot(endX - point.x + size - radius, endY - point.y + size - radius) >= radius + 2;
        });
        if (separated) break;
      }
      settled.push({x:endX, y:endY, size});
      const railOffset = (gutter - size) * (.22 + Math.random() * .51);
      const originX = right ? lip.right + railOffset : lip.left - size - railOffset;
      const x = originX - floor.left - endX;
      const y = lip.bottom - size / 2 - floor.top - endY;
      const ball = document.createElement('span');
      ball.className = 'plan-ball';
      ball.style.left = `${endX / floor.width * 100}%`;
      ball.style.top = `${endY}px`;
      ball.style.setProperty('--plan-ball-size', `${size}px`);
      ball.style.backgroundColor = `var(--${PALETTE[(slot + (right ? 2 : 0)) % PALETTE.length]})`;
      fragment.append(ball);
      flights.push({ball, x, y});
    }
    landing.append(fragment);
    if (!withMotion) return;

    flights.forEach(({ball, x, y}, index) => {
      const position = (left, top) => `translate(${left}px, ${top}px)`;
      animate(ball, [
        {transform: position(x, y), opacity: 0},
        {transform: position(x, y + 14), opacity: 1, offset: .12},
        {transform: position(x, y + 88), opacity: 1, offset: .31},
        {transform: position(x, -26), opacity: 1, offset: .77},
        {transform: position(0, 0), opacity: 1, offset: .89},
        {transform: position(0, -7 - Math.random() * 5), opacity: 1, offset: .94},
        {transform: position(0, 0), opacity: 1},
      ], {duration: 1590 + Math.random() * 430, delay: index * 23, fill: 'backwards'});
    });
  }

  return {
    play(withMotion) {
      clear();
      const canAnimate = withMotion && !document.hidden && typeof landing.animate === 'function';
      spill(canAnimate);
      if (canAnimate) highlightNext(0);
    },
    settle,
    clear,
  };
}
