"use client";

import { useEffect, useMemo, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneArtwork } from "./SceneArtwork";
import { SCENE_FPS, SCENE_FRAMES, STAGE_FRAMES, type MotionPlayerProps, type SceneType } from "./program-scenes";

function ProgramScene({ type, compact }: { type: SceneType; compact: boolean }) {
  const frame = useCurrentFrame();
  const active = Math.min(3, Math.floor(frame / STAGE_FRAMES));
  const progress = [0, 1, 2, 3].map((stage) => interpolate(frame, [stage * STAGE_FRAMES, stage * STAGE_FRAMES + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const pulse = interpolate(frame % STAGE_FRAMES, [0, 18, 38, 74], [0, 1, 0, 0], { extrapolateRight: "clamp" });
  return <SceneArtwork type={type} compact={compact} active={active} progress={progress} pulse={pulse} />;
}

export default function ProgramMotionPlayer({ type, compact, playing, visible, seek, onStage, onComplete, onError }: MotionPlayerProps) {
  const player = useRef<PlayerRef>(null);
  const lastSeek = useRef<MotionPlayerProps["seek"] | null>(null);
  const inputProps = useMemo(() => ({ type, compact }), [type, compact]);
  useEffect(() => {
    const instance = player.current;
    if (!instance) return;
    let lastStage = -1;
    let settling = false;
    const update = ({ detail }: { detail: { frame: number } }) => {
      const stage = Math.min(3, Math.floor(detail.frame / STAGE_FRAMES));
      if (stage !== lastStage) { lastStage = stage; onStage(stage); }
    };
    const finish = () => {
      if (settling) return;
      settling = true;
      // A throttled browser may skip the final frame. Always settle on the result.
      // seekTo(lastFrame) also emits ended, hence the re-entrancy guard.
      instance.seekTo(SCENE_FRAMES - 1);
      onStage(3);
      onComplete();
      settling = false;
    };
    instance.addEventListener("frameupdate", update);
    instance.addEventListener("ended", finish);
    instance.addEventListener("error", onError);
    return () => { instance.removeEventListener("frameupdate", update); instance.removeEventListener("ended", finish); instance.removeEventListener("error", onError); };
  }, [onStage, onComplete, onError]);
  useEffect(() => {
    const instance = player.current;
    if (!instance) return;
    if (lastSeek.current !== seek) {
      instance.pause();
      instance.seekTo(seek.frame);
      lastSeek.current = seek;
    }
    let scheduled = 0;
    if (playing && visible) {
      // Let the seek commit before starting the clock, especially when replaying.
      scheduled = requestAnimationFrame(() => { scheduled = requestAnimationFrame(() => player.current?.play()); });
    } else instance.pause();
    return () => cancelAnimationFrame(scheduled);
  }, [playing, visible, seek]);
  return <Player ref={player} component={ProgramScene} inputProps={inputProps}
    durationInFrames={SCENE_FRAMES} compositionWidth={compact ? 400 : 720} compositionHeight={compact ? 300 : 340} fps={SCENE_FPS}
    initialFrame={seek.frame} controls={false} loop={false} clickToPlay={false} spaceKeyToPlayOrPause={false}
    moveToBeginningWhenEnded={false} initiallyMuted numberOfSharedAudioTags={0} acknowledgeRemotionLicense style={{ width: "100%", height: "100%" }}
    errorFallback={() => <SceneArtwork type={type} compact={compact} />} />;
}
