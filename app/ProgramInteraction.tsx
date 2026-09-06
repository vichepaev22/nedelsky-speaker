"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ComponentType } from "react";
import { SceneArtwork } from "./motion/SceneArtwork";
import { scenes, STAGE_FRAMES, type MotionPlayerProps, type SceneType } from "./motion/program-scenes";

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
const reducedSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const visibleSnapshot = () => document.visibilityState === "visible";
const serverReduced = () => true;
const serverHidden = () => false;

export function ProgramInteraction({ type }: { type: SceneType }) {
  const config = scenes[type];
  const frame = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, reducedSnapshot, serverReduced);
  const tabVisible = useSyncExternalStore(subscribeVisibility, visibleSnapshot, serverHidden);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [compact, setCompact] = useState(false);
  const [MotionPlayer, setMotionPlayer] = useState<ComponentType<MotionPlayerProps> | null>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [ended, setEnded] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [seek, setSeek] = useState({ frame: 0, request: 0 });
  const playable = !!MotionPlayer && !reducedMotion && !failed;

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); preload.disconnect(); }
    }, { rootMargin: "200px" });
    const viewport = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= .4), { threshold: [0, .4] });
    const resize = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 480));
    preload.observe(element); viewport.observe(element); resize.observe(element);
    return () => { preload.disconnect(); viewport.disconnect(); resize.disconnect(); };
  }, []);
  useEffect(() => {
    if (!near || reducedMotion || MotionPlayer || failed) return;
    let cancelled = false;
    // The Player and Remotion stay in a separate chunk, not the initial page bundle.
    import("./motion/ProgramMotionPlayer").then((module) => {
      if (!cancelled) setMotionPlayer(() => module.default);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [near, reducedMotion, MotionPlayer, failed]);

  const complete = useCallback(() => { setPlaying(false); setEnded(true); }, []);
  const fail = useCallback(() => setFailed(true), []);
  const selectStage = (index: number) => {
    setActiveStage(index); setPlaying(false); setEnded(false);
    setSeek((previous) => ({ frame: index * STAGE_FRAMES + 38, request: previous.request + 1 }));
  };
  const replay = () => {
    setSeek((previous) => ({ frame: 0, request: previous.request + 1 }));
    setActiveStage(0); setEnded(false); setPlaying(true);
  };
  return <section className={`program-lab lab-${type}`} aria-labelledby="interaction-title" id="interactive">
    <div className="program-lab-intro">
      <p className="eyebrow eyebrow-dark">{config.eyebrow}</p><h2 id="interaction-title">{config.title}</h2><p>{config.lead}</p>
      <span className="lab-hint"><b aria-hidden="true">↗</b> 4 этапа · один практический пример</span>
    </div>
    <div className="lab-board" data-motion={reducedMotion ? "reduced" : failed ? "fallback" : playable ? "ready" : "poster"} data-playing={playable && playing && visible && tabVisible}>
      <div className="lab-toolbar">
        <span className="lab-scene-label">В деталях <span> / 10 секунд</span></span>
        <div className="lab-playback">
          <button type="button" disabled={!playable} onClick={() => ended ? replay() : setPlaying((value) => !value)} aria-label={playing && playable ? "Приостановить анимацию" : "Воспроизвести анимацию"}><span aria-hidden="true">{playing && playable ? "Ⅱ" : "▷"}</span> {playing && playable ? "Пауза" : "Смотреть"}</button>
          <button type="button" disabled={!playable} onClick={replay} aria-label="Повторить анимацию"><span aria-hidden="true">↻</span></button>
        </div>
      </div>
      <div className="lab-scene" ref={frame} aria-hidden="true" inert>
        {playable && MotionPlayer ? <MotionPlayer type={type} compact={compact} playing={playing} visible={visible && tabVisible} seek={seek} onStage={setActiveStage} onComplete={complete} onError={fail} /> : <>
          <div className="lab-poster-wide"><SceneArtwork type={type} active={activeStage} /></div>
          <div className="lab-poster-compact"><SceneArtwork type={type} active={activeStage} compact /></div>
        </>}
      </div>
      <div className="lab-stage-controls" role="group" aria-label="Выберите этап схемы">
        {config.stages.map((stage, index) => <button key={stage.label} type="button" className={index === activeStage ? "is-active" : ""} aria-pressed={index === activeStage} aria-controls="lab-stage-description" onClick={() => selectStage(index)}><span>0{index + 1}</span>{stage.label}</button>)}
      </div>
      <div className="lab-readout" id="lab-stage-description" aria-live={playing && playable ? "off" : "polite"} aria-atomic="true">
        <span aria-hidden="true">0{activeStage + 1}</span>
        <div className="lab-readout-panels">{config.stages.map((stage, index) => <div key={stage.label} className={index === activeStage ? "is-active" : ""} aria-hidden={index !== activeStage}><strong>{stage.label}</strong><p>{stage.description}</p><p className="lab-example">{stage.example}</p></div>)}</div>
      </div>
      <p className="lab-motion-note">{reducedMotion ? "Движение отключено в настройках устройства. Все этапы доступны по нажатию." : failed ? "Анимация недоступна. Вы можете разобрать все этапы по нажатию." : "Выберите этап, чтобы остановиться и разобрать его. Без звука."}</p>
    </div>
  </section>;
}
