"use client";

import { useEffect, useMemo, useRef } from "react";

const mobileMediaQuery = "(pointer: coarse), (max-width: 1199px)";

type AudioPool = {
  nextIndex: number;
  clips: HTMLAudioElement[];
};

function approach(current: number, target: number, maxDelta: number) {
  if (current < target) return Math.min(target, current + maxDelta);
  if (current > target) return Math.max(target, current - maxDelta);
  return current;
}

function makeAudioPool(url: string, poolSize: number, volume: number): AudioPool {
  const clips = Array.from({ length: poolSize }, () => {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.volume = volume;
    return audio;
  });

  return { nextIndex: 0, clips };
}

export function GlobalSound() {
  const clickUrls = useMemo(() => ["/sound/clickDown.mp3", "/sound/clickUp.mp3"], []);
  const scrollUrl = useMemo(() => "/sound/scroll.mp3", []);

  const clickPoolsRef = useRef<AudioPool[] | null>(null);
  const scrollAudioRef = useRef<HTMLAudioElement | null>(null);
  const isUnlockingScrollAudioRef = useRef(false);
  const isScrollAudioUnlockedRef = useRef(false);

  const lastWheelAtRef = useRef(0);
  const wheelIntensityRef = useRef(0);
  const scrollTargetRateRef = useRef(1);
  const scrollCurrentRateRef = useRef(1);
  const scrollTargetVolRef = useRef(0);
  const scrollCurrentVolRef = useRef(0);

  useEffect(() => {
    const isMobile = () => window.matchMedia(mobileMediaQuery).matches;

    clickPoolsRef.current = clickUrls.map((url) => makeAudioPool(url, 4, 0.35));
    const scrollAudio = new Audio(scrollUrl);
    scrollAudio.preload = "auto";
    scrollAudio.loop = true;
    scrollAudio.volume = 0;
    scrollAudio.playbackRate = 1;
    scrollAudioRef.current = scrollAudio;

    let rafId = 0;
    let lastRafAt = performance.now();

    const tick = () => {
      const audio = scrollAudioRef.current;
      if (!audio) {
        rafId = 0;
        return;
      }

      const now = performance.now();
      const dt = Math.min(0.05, (now - lastRafAt) / 1000);
      lastRafAt = now;
      const sinceWheel = now - lastWheelAtRef.current;
      if (sinceWheel > 90) {
        scrollTargetVolRef.current = Math.max(0, scrollTargetVolRef.current - 0.9 * dt);
        scrollTargetRateRef.current = approach(scrollTargetRateRef.current, 1, 1.2 * dt);
      }

      scrollCurrentRateRef.current = approach(scrollCurrentRateRef.current, scrollTargetRateRef.current, 3 * dt);
      scrollCurrentVolRef.current = approach(scrollCurrentVolRef.current, scrollTargetVolRef.current, 2 * dt);
      audio.playbackRate = scrollCurrentRateRef.current;
      audio.volume = scrollCurrentVolRef.current;

      if (sinceWheel > 220 && scrollCurrentVolRef.current < 0.01) {
        audio.pause();
        audio.currentTime = 0;
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    const ensureScrollAnimation = () => {
      if (!rafId) {
        lastRafAt = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };

    const unlockScrollAudio = () => {
      if (isMobile()) return;
      const audio = scrollAudioRef.current;
      if (!audio || isScrollAudioUnlockedRef.current || isUnlockingScrollAudioRef.current) return;
      isUnlockingScrollAudioRef.current = true;
      void audio.play().then(() => {
        isScrollAudioUnlockedRef.current = true;
        ensureScrollAnimation();
      }).catch(() => {
        isScrollAudioUnlockedRef.current = false;
      }).finally(() => {
        isUnlockingScrollAudioRef.current = false;
      });
    };

    const onClickSound = () => {
      if (isMobile()) return;
      unlockScrollAudio();
      const pools = clickPoolsRef.current;
      if (!pools?.length) return;
      const pool = pools[Math.floor(Math.random() * pools.length)];
      const audio = pool.clips[pool.nextIndex];
      pool.nextIndex = (pool.nextIndex + 1) % pool.clips.length;
      try {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      } catch {
      }
    };

    const onScrollMotion = (delta: number) => {
      if (isMobile()) return;
      const audio = scrollAudioRef.current;
      if (!audio) return;
      const now = performance.now();
      const dtWheel = Math.min(0.05, Math.max(0.001, (now - lastWheelAtRef.current) / 1000));
      lastWheelAtRef.current = now;
      wheelIntensityRef.current = approach(wheelIntensityRef.current, Math.min(220, Math.abs(delta)), 900 * dtWheel);
      const normalized = Math.min(1, wheelIntensityRef.current / 120);
      scrollTargetRateRef.current = 1 + normalized * 0.55;
      scrollTargetVolRef.current = normalized * 0.32;
      if (audio.paused) {
        void audio.play().then(() => {
          isScrollAudioUnlockedRef.current = true;
        }).catch(() => {
          isScrollAudioUnlockedRef.current = false;
        });
      }
      ensureScrollAnimation();
    };

    const onDragMotion = (event: Event) => {
      const distance = (event as CustomEvent<number>).detail;
      if (typeof distance === "number") onScrollMotion(distance);
    };

    window.addEventListener("hvl-click", onClickSound);
    window.addEventListener("hvl-audio-unlock", unlockScrollAudio);
    window.addEventListener("hvl-drag-motion", onDragMotion);
    return () => {
      window.removeEventListener("hvl-click", onClickSound);
      window.removeEventListener("hvl-audio-unlock", unlockScrollAudio);
      window.removeEventListener("hvl-drag-motion", onDragMotion);
      cancelAnimationFrame(rafId);
      scrollAudio.pause();
      scrollAudio.src = "";
    };
  }, [clickUrls, scrollUrl]);

  return null;
}
