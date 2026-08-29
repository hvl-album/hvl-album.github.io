"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Image as DreiImage, Text, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, FrontSide, Mesh, Object3D, PerspectiveCamera, ShaderMaterial } from "three";
import type { DisplayMode, DisplayStyle, GalleryItem } from "./hvl-types";

function playClickSound() {
  window.dispatchEvent(new Event("hvl-click"));
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function getTrackLabel(numberTrack: number) {
  return numberTrack === 0 ? "TRAILER" : `TRACK ${numberTrack.toString().padStart(2, "0")}`;
}

function isDarkTrackNumber(numberTrack: number) {
  return numberTrack === 8 || numberTrack === 27 || numberTrack === 28 || numberTrack === 29;
}

function setMaterialUniform(material: unknown, uniformName: string, value: number) {
  if (!material || typeof material !== "object" || !("uniforms" in material)) return;

  const uniforms = (material as { uniforms?: Record<string, { value: number }> }).uniforms;
  if (uniforms?.[uniformName]) uniforms[uniformName].value = value;
}

const imageVertexShader = `
  uniform float uBend;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float edgeCurve = position.x * position.x;
    transformed.x += uBend * edgeCurve * 0.22;
    transformed.z -= abs(uBend) * edgeCurve * 0.12;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const imageFragmentShader = `
  uniform sampler2D uMap;
  uniform float uFlashProgress;
  uniform float uFlashIntensity;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec2 centeredUv = vUv - 0.5;
    float radius = length(centeredUv);
    float time = uFlashProgress * 6.28318;
    float pulse = uFlashIntensity;
    float waveA = sin(centeredUv.y * 24.0 + time * 2.1);
    float waveB = cos(centeredUv.x * 19.0 - time * 1.7);
    float waveC = sin((centeredUv.x + centeredUv.y) * 31.0 + time * 2.8);
    vec2 distortion = vec2(waveA + waveC * 0.45, waveB - waveC * 0.35);
    vec2 warpedUv = clamp(vUv + distortion * pulse * 0.008 * (1.0 - radius), 0.002, 0.998);
    vec4 imageColor = texture2D(uMap, warpedUv);

    float plasmaWave = 0.5 + 0.5 * sin(
      centeredUv.x * 15.0 - centeredUv.y * 18.0 + time * 2.6 + waveA * 1.4
    );
    float plasmaCore = pow(1.0 - smoothstep(0.03, 0.68, radius), 1.7);
    vec3 plasmaColor = mix(vec3(0.92, 0.97, 1.0), vec3(1.0, 0.91, 0.97), plasmaWave);
    imageColor.rgb += plasmaColor * plasmaCore * plasmaWave * pulse * 0.12;
    imageColor.rgb *= 1.0 + pulse * 0.22;

    gl_FragColor = vec4(imageColor.rgb, imageColor.a * uOpacity);
  }
`;

const flashVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flashFragmentShader = `
  uniform float uProgress;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    vec2 centeredUv = vUv - 0.5;
    float easedProgress = smoothstep(0.0, 1.0, uProgress);
    float radius = length(centeredUv);
    float time = easedProgress * 6.28318;
    float plasmaA = sin(centeredUv.x * 18.0 + sin(centeredUv.y * 9.0 + time) * 2.2 - time * 1.8);
    float plasmaB = cos(centeredUv.y * 22.0 + cos(centeredUv.x * 11.0 - time) * 1.8 + time * 2.1);
    float plasmaField = 0.5 + 0.5 * sin(plasmaA * 2.4 + plasmaB * 2.0 + time * 1.7);
    float radialAura = pow(1.0 - smoothstep(0.04, 0.78, radius), 1.8);
    float filament = smoothstep(0.58, 0.95, plasmaField) * (1.0 - smoothstep(0.45, 0.9, radius));
    float alpha = (radialAura * (0.28 + plasmaField * 0.28) + filament * 0.28) * uIntensity;
    vec3 glowColor = mix(vec3(0.94, 0.98, 1.0), vec3(1.0, 0.93, 0.98), plasmaField);

    gl_FragColor = vec4(glowColor, alpha * 0.56);
  }
`;

function ItemCaption({
  item,
  position,
  rotation,
  width,
}: {
  item: GalleryItem;
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
}) {
  const hasSubtitle = item.subtitle.length > 0;
  const durationSeconds = item.durationSeconds;
  const trackNumberLabel = getTrackLabel(item.numberTrack);
  const trackNumberWidth = trackNumberLabel.length * 0.0264;
  const isTrackEight = isDarkTrackNumber(item.numberTrack);
  const trackNumberColor = isTrackEight ? "#080808" : "#ffffff";
  const captionColor = isTrackEight ? "#080808" : "#ffffff";
  const captionShadowOffsetX = "1.5%";
  const captionShadowOffsetY = "-2.5%";
  const captionShadowBlur = "3%";

  return (
    <group position={position} rotation={rotation}>
      <Text
        font="/fonts/GeistMono-Variable.ttf"
        position={[0, 0, 0]}
        raycast={() => {}}
        anchorX="left"
        anchorY="top"
        color={trackNumberColor}
        fontSize={0.04}
        lineHeight={1}
        maxWidth={width}
        letterSpacing={0.06}
        renderOrder={1}
        depthOffset={-4}
        material-side={FrontSide}
        material-toneMapped={false}
        outlineColor="#000000"
        outlineOpacity={0}
        outlineOffsetX={captionShadowOffsetX}
        outlineOffsetY={captionShadowOffsetY}
        outlineBlur={captionShadowBlur}
      >
        {trackNumberLabel}
      </Text>
      {durationSeconds != null && (
        <>
          <Text
            font="/fonts/GeistMono-Variable.ttf"
            position={[trackNumberWidth + 0.025, 0, 0]}
            raycast={() => {}}
            anchorX="left"
            anchorY="top"
            color={captionColor}
            fontSize={0.04}
            lineHeight={1}
            letterSpacing={0.06}
            renderOrder={1}
            depthOffset={-4}
            material-side={FrontSide}
            material-toneMapped={false}
            outlineColor="#000000"
            outlineOpacity={0}
            outlineOffsetX={captionShadowOffsetX}
            outlineOffsetY={captionShadowOffsetY}
            outlineBlur={captionShadowBlur}
          >
            /
          </Text>
          <Text
            font="/fonts/GeistMono-Variable.ttf"
            position={[trackNumberWidth + 0.075, 0, 0]}
            raycast={() => {}}
            anchorX="left"
            anchorY="top"
            color={captionColor}
            fontSize={0.04}
            lineHeight={1}
            letterSpacing={0.06}
            renderOrder={1}
            depthOffset={-4}
            material-side={FrontSide}
            material-toneMapped={false}
            outlineColor="#000000"
            outlineOpacity={0}
            outlineOffsetX={captionShadowOffsetX}
            outlineOffsetY={captionShadowOffsetY}
            outlineBlur={captionShadowBlur}
          >
            {formatTime(durationSeconds)}
          </Text>
        </>
      )}
      <Text
        font="/fonts/GeistMono-Bold.ttf"
        position={[0, -0.07, 0]}
        raycast={() => {}}
        anchorX="left"
        anchorY="top"
        color={captionColor}
        fontSize={0.075}
        maxWidth={width}
        letterSpacing={0.01}
        renderOrder={1}
        depthOffset={-4}
        material-side={FrontSide}
        material-toneMapped={false}
        outlineColor="#000000"
        outlineOpacity={0.64}
        outlineOffsetX={captionShadowOffsetX}
        outlineOffsetY={captionShadowOffsetY}
        outlineBlur={captionShadowBlur}
      >
        {item.title.toUpperCase()}
      </Text>
      {hasSubtitle && (
        <Text
          font="/fonts/GeistMono-Variable.ttf"
          position={[0, -0.16, 0]}
          raycast={() => {}}
          anchorX="left"
          anchorY="top"
          color={captionColor}
          fontSize={0.04}
          maxWidth={width - 0.2}
          letterSpacing={0.02}
          renderOrder={1}
          depthOffset={-4}
          material-side={FrontSide}
          material-toneMapped={false}
          outlineColor="#000000"
          outlineOpacity={0}
          outlineOffsetX={captionShadowOffsetX}
          outlineOffsetY={captionShadowOffsetY}
          outlineBlur={captionShadowBlur}
        >
          {item.subtitle.toUpperCase()}
        </Text>
      )}
    </group>
  );
}

function CanvasPlayingIndicator({
  active,
  position,
  color,
}: {
  active: boolean;
  position: [number, number, number];
  color: string;
}) {
  const barsRef = useRef<Object3D>(null);
  const barCount = 6;
  const barWidth = 0.009;
  const barGap = 0.009;
  const maxHeight = 0.06;

  useFrame(({ clock }) => {
    if (!active || !barsRef.current) return;

    const time = clock.elapsedTime;
    barsRef.current.children.forEach((bar, index) => {
      const wave = 0.5 + 0.5 * Math.sin(time * 7.2 + index * 1.15);
      bar.scale.y = 0.4 + wave * 0.6;
    });
  });

  if (!active) return null;

  return (
    <group ref={barsRef} position={position} raycast={() => {}} renderOrder={4}>
      {Array.from({ length: barCount }, (_, index) => (
        <mesh
          key={index}
          position={[(index - (barCount - 1) / 2) * (barWidth + barGap), 0, 0]}
          raycast={() => {}}
        >
          <planeGeometry args={[barWidth, maxHeight]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function HVLTitle() {
  return (
    <DreiImage url="/images/hvl-logo.svg" scale={[4.4, 0.76]} transparent toneMapped={false} />
  );
}

function SceneCamera({ displayStyle }: { displayStyle: DisplayStyle }) {
  const { camera } = useThree();
  const perspectiveCamera = camera as PerspectiveCamera;
  const previousStyleRef = useRef<DisplayStyle | null>(null);
  const transitionRef = useRef<{
    kind: "initial" | "to-center" | "to-observatory" | "to-wave";
    elapsed: number;
    startZ: number;
    startFov: number;
    startY: number;
  }>({ kind: "initial", elapsed: 0, startZ: 14, startFov: 42, startY: 0 });

  useEffect(() => {
    const nextKind = displayStyle === "art" ? "to-center" : displayStyle === "wave" ? "to-wave" : "to-observatory";
    if (previousStyleRef.current == null) {
      transitionRef.current = {
        kind: "initial",
        elapsed: 0,
        startZ: camera.position.z,
        startFov: perspectiveCamera.fov,
        startY: camera.position.y,
      };
    } else if (previousStyleRef.current !== displayStyle) {
      transitionRef.current = {
        kind: nextKind,
        elapsed: 0,
        startZ: camera.position.z,
        startFov: perspectiveCamera.fov,
        startY: camera.position.y,
      };
    }
    previousStyleRef.current = displayStyle;
  }, [camera, displayStyle]);

  useFrame((_, delta) => {
    const targetZ = displayStyle === "art" ? 0.85 : displayStyle === "wave" ? 4.5 : 6;
    const targetFov = displayStyle === "art" ? 62 : displayStyle === "wave" ? 52 : 50;
    const targetY = displayStyle === "wave" ? -1.35 : 0;
    const transition = transitionRef.current;
    const duration = transition.kind === "initial" ? 1.8 : 1.45;
    transition.elapsed = Math.min(duration, transition.elapsed + delta);
    const progress = Math.min(1, transition.elapsed / duration);
    const easedProgress = progress * progress * (3 - 2 * progress);
    let animatedZ = targetZ;

    if (transition.kind === "to-observatory") {
      const peakZ = 9.5;
      if (progress < 0.58) {
        const peakProgress = (progress / 0.58) * (progress / 0.58) * (3 - 2 * (progress / 0.58));
        animatedZ = transition.startZ + (peakZ - transition.startZ) * peakProgress;
      } else {
        const settleProgress = (progress - 0.58) / 0.42;
        const easedSettle = settleProgress * settleProgress * (3 - 2 * settleProgress);
        animatedZ = peakZ + (targetZ - peakZ) * easedSettle;
      }
    } else {
      animatedZ = transition.startZ + (targetZ - transition.startZ) * easedProgress;
    }

    // Keep the incoming Cuộn Trào move smooth, while never letting the camera
    // pull far enough back for the cards to leave the viewport.
    camera.position.z = displayStyle === "wave" ? Math.min(animatedZ, 5.4) : animatedZ;
    camera.position.y = transition.startY + (targetY - transition.startY) * easedProgress;
    perspectiveCamera.fov = transition.startFov + (targetFov - transition.startFov) * easedProgress;
    camera.lookAt(0, displayStyle === "wave" ? -1 : 0, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

function ImageTube({
  items,
  tubeCols,
  tubeRowSpacing,
  tubeScrollLimit,
  scrollTargetRef,
  focusItemRef,
  isDraggingRef,
  spinVelocityRef,
  naturalDirRef,
  dragDeltaRef,
  suppressClickUntilRef,
  onImageClick,
  displayMode,
  displayStyle,
  playingTrackIndex,
}: {
  items: readonly GalleryItem[];
  tubeCols: number;
  tubeRowSpacing: number;
  tubeScrollLimit: number;
  scrollTargetRef: React.MutableRefObject<number>;
  focusItemRef: React.MutableRefObject<number | null>;
  isDraggingRef: React.MutableRefObject<boolean>;
  spinVelocityRef: React.MutableRefObject<number>;
  naturalDirRef: React.MutableRefObject<number>;
  dragDeltaRef: React.MutableRefObject<number>;
  suppressClickUntilRef: React.MutableRefObject<number>;
  onImageClick: (projectName: string, imageUrl: string, textureIndex: number) => void;
  displayMode: DisplayMode;
  displayStyle: DisplayStyle;
  playingTrackIndex: number | null;
}) {
  const groupRef = useRef<Object3D>(null);
  const rowGroupRefs = useRef<Array<Object3D | null>>([]);
  const itemGroupRefs = useRef<Array<Object3D | null>>([]);
  const itemMeshRefs = useRef<Array<Mesh | null>>([]);
  const itemBackMeshRefs = useRef<Array<Mesh | null>>([]);
  const itemBendRefs = useRef<number[]>([]);
  const waveItemGroupRefs = useRef<Array<Object3D | null>>([]);
  const waveItemMeshRefs = useRef<Array<Mesh | null>>([]);
  const waveItemBackMeshRefs = useRef<Array<Mesh | null>>([]);
  const waveItemBendRefs = useRef<number[]>([]);
  const waveItemVisibleRefs = useRef<boolean[]>([]);
  const waveItemHasEnteredRefs = useRef<boolean[]>([]);
  const flashOverlayMeshRefs = useRef<Array<Mesh | null>>([]);
  const flashOverlayBackMeshRefs = useRef<Array<Mesh | null>>([]);
  const waveFlashOverlayMeshRefs = useRef<Array<Mesh | null>>([]);
  const waveFlashOverlayBackMeshRefs = useRef<Array<Mesh | null>>([]);
  const scrollCurrent = useRef(0);
  const angle = useRef(0);
  const focusAngleTarget = useRef<number | null>(null);
  const focusStartedAt = useRef(-1);
  const flashItemIndex = useRef(-1);
  const flashStartedAt = useRef(-1);
  const selectionSequence = useRef<{
    itemIndex: number;
    textureIndex: number;
    projectName: string;
    imageUrl: string;
    holdStartedAt: number;
    activatedAt: number;
    resumeAt: number;
  } | null>(null);
  const lastItemActivationAt = useRef(0);
  const itemVisibility = useRef(1);
  const displayTransition = useRef({ phase: "idle", start: -1, target: displayMode });
  const styleTransition = useRef<{
    phase: "idle" | "spin" | "fade-out" | "fade-in";
    start: number;
    target: DisplayStyle;
  }>({ phase: "idle", start: -1, target: displayStyle });
  const [tubeLayoutMode, setTubeLayoutMode] = useState<DisplayMode>(displayMode);
  const [renderedStyle, setRenderedStyle] = useState<DisplayStyle>(displayStyle);

  const imageUrls = useMemo(() => [...new Set(items.map((item) => item.imageUrl))], []);

  const textures = useTexture(imageUrls);
  const texturesByUrl = useMemo(
    () => new Map(imageUrls.map((url, index) => [url, textures[index]])),
    [imageUrls, textures],
  );

  const activeItems = useMemo(
    () => items.map((item, index) => ({ item, index })).filter(({ item }) => tubeLayoutMode === "full" || item.type === "pulled"),
    [tubeLayoutMode],
  );
  const isWaveStyle = renderedStyle === "wave";
  const cols = Math.min(isWaveStyle ? 2 : tubeCols, activeItems.length);
  const rows = Math.ceil(activeItems.length / cols);
  const radius = 3.2;
  const tileH = 1.5;
  const ySpacing = tubeRowSpacing;
  const totalRows = rows;
  const wavePairsPerScrollUnit = Math.max(
    1,
    (Math.max(rows - 1, 0) / Math.max(tubeScrollLimit, 0.001)),
  );
  const waveDepthSpacing = 1.1;

  const rowSpeed = useMemo(() => {
    const speeds: number[] = [];
    for (let r = 0; r < rows; r++) {
      const t = rows <= 1 ? 0 : r / (rows - 1);
      speeds.push(0.65 + t * 0.9);
    }
    return speeds;
  }, [rows]);

  const rowPositions = useMemo(() => {
    const out: Array<{
      rowIndex: number;
      y: number;
      baseRow: number;
      rowOffset: number;
      itemCount: number;
    }> = [];
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      if (isWaveStyle) {
        const baseRow = rowIndex;
        const itemCount = Math.min(cols, activeItems.length - baseRow * cols);
        out.push({ rowIndex, y: 0, baseRow, rowOffset: 0, itemCount });
        continue;
      }
      const y = (rowIndex - (totalRows - 1) / 2) * ySpacing;
      const baseRow = rowIndex % rows;
      const rowOffset = baseRow % 2 === 0 ? 0 : 0.5;
      const itemCount = Math.min(cols, activeItems.length - baseRow * cols);
      out.push({ rowIndex, y, baseRow, rowOffset, itemCount });
    }
    return out.filter(({ itemCount }) => itemCount > 0);
  }, [activeItems.length, cols, isWaveStyle, rows, totalRows, ySpacing]);
  const waveItemInstances = useMemo(
    () =>
      isWaveStyle && activeItems.length > 0
        ? Array.from({ length: activeItems.length }, (_, layoutIndex) => ({
            layoutIndex,
            groupIndex: Math.floor(layoutIndex / cols),
            item: activeItems[layoutIndex],
          }))
        : [],
    [activeItems, cols, isWaveStyle, rows, totalRows],
  );
  const targetViewTheta = renderedStyle === "art" ? -Math.PI / 2 : Math.PI / 2;

  useEffect(() => {
    if (displayStyle === renderedStyle) return;
    if (styleTransition.current.target === displayStyle && styleTransition.current.phase !== "idle") return;
    styleTransition.current = { phase: "spin", start: -1, target: displayStyle };
  }, [displayStyle, renderedStyle]);

  useEffect(() => {
    if (displayMode === tubeLayoutMode) {
      if (displayTransition.current.phase === "rebuild") return;
      if (displayTransition.current.phase !== "idle") {
        displayTransition.current = { phase: "idle", start: -1, target: displayMode };
        itemVisibility.current = 1;
      }
      return;
    }

    displayTransition.current = {
      phase: "spin",
      start: -1,
      target: displayMode,
    };
  }, [displayMode, tubeLayoutMode]);

  useEffect(() => {
    if (displayTransition.current.phase === "rebuild") {
      displayTransition.current.phase = "fade-in";
      displayTransition.current.start = -1;
    }
  }, [tubeLayoutMode]);

  useFrame((state, dt) => {
    const now = performance.now();
    const scrollResponse = isWaveStyle
      ? isDraggingRef.current ? 16 : 5.2
      : isDraggingRef.current ? 32 : 7.6;
    // Frame-rate independent damping prevents wheel ticks from reading as
    // separate steps in the Cuộn Trào path.
    const scrollLerp = 1 - Math.exp(-scrollResponse * dt);
    scrollCurrent.current += (scrollTargetRef.current - scrollCurrent.current) * scrollLerp;

    const activeScrollLimit = ((rows - 1) * tubeRowSpacing) / 2;
    if (!isWaveStyle) {
      scrollCurrent.current = Math.max(-activeScrollLimit, Math.min(activeScrollLimit, scrollCurrent.current));
      scrollTargetRef.current = Math.max(-activeScrollLimit, Math.min(activeScrollLimit, scrollTargetRef.current));
    }

    const requestedFocusIndex = focusItemRef.current;
    if (requestedFocusIndex != null) {
      focusItemRef.current = null;
      const activePosition = activeItems.findIndex(({ index }) => index === requestedFocusIndex);
      if (activePosition >= 0) {
        const targetRowIndex = Math.floor(activePosition / cols);
        const targetRow = rowPositions[targetRowIndex];
        const targetCol = activePosition % cols;
        if (targetRow && isWaveStyle) {
          const currentProgress = -scrollCurrent.current * wavePairsPerScrollUnit;
          const nearestCycle = Math.round((currentProgress - targetRowIndex) / rows);
          scrollTargetRef.current = -(targetRowIndex + nearestCycle * rows) / wavePairsPerScrollUnit;
        } else if (targetRow) {
          const targetTheta =
            Math.PI - ((targetCol + targetRow.rowOffset + 0.5) / targetRow.itemCount) * Math.PI * 2;
          const targetRowRotation = targetTheta - targetViewTheta;
          const targetAngle = targetRowRotation / rowSpeed[targetRow.baseRow];
          const rowAnglePeriod = (Math.PI * 2) / rowSpeed[targetRow.baseRow];
          const nearestTurn = Math.round((angle.current - targetAngle) / rowAnglePeriod);
          focusAngleTarget.current = targetAngle + nearestTurn * rowAnglePeriod;
          focusStartedAt.current = now;
          scrollTargetRef.current = targetRow.y;
        }
      }
    }

    const damping = 0.92;
    spinVelocityRef.current *= Math.pow(damping, dt * 60);
    spinVelocityRef.current = Math.max(-2.0, Math.min(2.0, spinVelocityRef.current));

    const transition = displayTransition.current;
    let displaySpinBoost = 0;
    if (transition.phase !== "idle") {
      if (transition.start < 0) transition.start = state.clock.elapsedTime;
      const elapsed = state.clock.elapsedTime - transition.start;

      if (transition.phase === "spin") {
        displaySpinBoost = 5.2 * (1 - Math.min(1, elapsed / 0.34));
        if (elapsed >= 0.34) {
          transition.phase = "fade-out";
          transition.start = -1;
        }
      } else if (transition.phase === "fade-out") {
        const progress = Math.min(1, elapsed / 0.32);
        itemVisibility.current = 1 - (1 - Math.pow(1 - progress, 3));
        displaySpinBoost = 2.2 * (1 - progress);

        if (progress >= 1) {
          itemVisibility.current = 0;
          transition.phase = "rebuild";
          transition.start = -1;
          setTubeLayoutMode(transition.target);
        }
      } else if (transition.phase === "fade-in") {
        const progress = Math.min(1, elapsed / 0.52);
        itemVisibility.current = 1 - Math.pow(1 - progress, 3);
        displaySpinBoost = 1.15 * (1 - progress);

        if (progress >= 1) {
          itemVisibility.current = 1;
          transition.phase = "idle";
          transition.start = -1;
        }
      }
    }

    const styleChange = styleTransition.current;
    let styleSpinBoost = 0;
    if (styleChange.phase !== "idle") {
      if (styleChange.start < 0) styleChange.start = state.clock.elapsedTime;
      const elapsed = state.clock.elapsedTime - styleChange.start;
      if (styleChange.phase === "spin") {
        styleSpinBoost = 3.6 * (1 - Math.min(1, elapsed / 0.28));
        if (elapsed >= 0.28) {
          styleChange.phase = "fade-out";
          styleChange.start = -1;
        }
      } else if (styleChange.phase === "fade-out") {
        const progress = Math.min(1, elapsed / 0.24);
        itemVisibility.current = 1 - (progress * progress * (3 - 2 * progress));
        if (progress >= 1) {
          itemVisibility.current = 0;
          setRenderedStyle(styleChange.target);
          styleChange.phase = "fade-in";
          styleChange.start = -1;
        }
      } else if (styleChange.phase === "fade-in") {
        const progress = Math.min(1, elapsed / 0.46);
        itemVisibility.current = progress * progress * (3 - 2 * progress);
        if (progress >= 1) {
          itemVisibility.current = 1;
          styleChange.phase = "idle";
        }
      }
    }

    const baseSpeed = naturalDirRef.current * (0.14 + displaySpinBoost + styleSpinBoost);
    angle.current += dragDeltaRef.current;
    dragDeltaRef.current = 0;
    if (focusAngleTarget.current != null) {
      const remaining = focusAngleTarget.current - angle.current;
      angle.current += remaining * Math.min(1, dt * 7.5);
      if (Math.abs(remaining) < 0.003 || now - focusStartedAt.current >= 480) {
        angle.current = focusAngleTarget.current;
        scrollCurrent.current = scrollTargetRef.current;
        focusAngleTarget.current = null;
        focusStartedAt.current = -1;
        if (selectionSequence.current) {
          selectionSequence.current.holdStartedAt = now;
        }
      }
    } else if (
      !selectionSequence.current ||
      selectionSequence.current.holdStartedAt < 0 ||
      (selectionSequence.current.activatedAt > 0 && now >= selectionSequence.current.resumeAt)
    ) {
      angle.current += (baseSpeed + spinVelocityRef.current) * dt;
    }

    const activeSelection = selectionSequence.current;
    if (activeSelection && activeSelection.holdStartedAt >= 0) {
      const holdElapsed = now - activeSelection.holdStartedAt;

      if (activeSelection.activatedAt < 0 && holdElapsed >= 250 && flashItemIndex.current < 0) {
        flashItemIndex.current = activeSelection.itemIndex;
        flashStartedAt.current = now;
      }

      if (activeSelection.activatedAt < 0 && holdElapsed >= 500) {
        activeSelection.activatedAt = now;
        activeSelection.resumeAt = now + 250;
        onImageClick(activeSelection.projectName, activeSelection.imageUrl, activeSelection.textureIndex);
      }

      if (activeSelection.activatedAt > 0 && now >= activeSelection.resumeAt) {
        selectionSequence.current = null;
      }
    }
    const group = groupRef.current;
    if (!group) return;

    group.position.y = isWaveStyle ? 0 : -scrollCurrent.current;

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const rowObj = rowGroupRefs.current[rowIndex];
      if (!rowObj) continue;
      if (isWaveStyle) {
        rowObj.rotation.y = 0;
        continue;
      }
      const baseRow = rowIndex % rows;
      rowObj.rotation.y = angle.current * rowSpeed[baseRow];
    }

    if (isWaveStyle) {
      const scrollProgress = -scrollCurrent.current * wavePairsPerScrollUnit;
      waveItemInstances.forEach(({ groupIndex, layoutIndex }) => {
        const itemGroup = waveItemGroupRefs.current[layoutIndex];
        if (!itemGroup) return;

        const lane = layoutIndex % cols === 0 ? -1 : 1;
        const rawRelativeDepth = groupIndex - scrollProgress;
        const relativeDepth = ((rawRelativeDepth + rows / 2) % rows + rows) % rows - rows / 2;
        // A signed logarithmic rail keeps the velocity continuous as a card
        // crosses the center. The old separate front/back formulas made that
        // crossing read like a small step.
        const smoothRelativeDepth =
          Math.sign(relativeDepth) * (Math.log1p(Math.abs(relativeDepth)) / Math.LN2);
        const behind = Math.max(smoothRelativeDepth, 0);
        // Let the rear rail open just a little: left cards keep drifting left
        // and right cards keep drifting right as their depth increases.
        const depthOutset = Math.min(0.26, behind * 0.09);
        const passed = Math.max(-relativeDepth, 0);
        // A card advances toward the camera before beginning to part, which
        // leaves the next group visible in the center for longer.
        const spreadDistance = Math.max(0, passed - 0.56);
        // This curve has zero velocity at the point where a card starts to
        // part, then glides outward without a second, visible phase change.
        const spreadEase =
          1 - (1 + spreadDistance / 0.55) * Math.exp(-spreadDistance / 0.55);
        const spreadDrop = spreadEase * 0.9;
        const spreadDirection = lane;
        const spreadOffset = spreadEase * 3.5;
        const bend = -spreadDirection * Math.min(0.55, spreadEase * 0.55);

        itemGroup.position.set(
          lane * (1.18 + depthOutset) + spreadDirection * spreadOffset,
          -1.22 + smoothRelativeDepth * 1.32 - spreadDrop + Math.abs(lane) * 0.1,
          -smoothRelativeDepth * waveDepthSpacing - Math.abs(lane) * 0.22,
        );
        itemGroup.rotation.set(
          0,
          -spreadDirection * Math.min(0.42, spreadEase * 0.42),
          spreadDirection * Math.min(0.16, spreadEase * 0.16),
        );
        waveItemBendRefs.current[layoutIndex] = bend;
        // Do not reveal items from the preceding cycle on first load. Once an
        // item has entered from the distant rail, keep it visible until it has
        // actually travelled beyond the screen edge.
        if (relativeDepth >= 0) waveItemHasEnteredRefs.current[layoutIndex] = true;
        waveItemVisibleRefs.current[layoutIndex] =
          waveItemHasEnteredRefs.current[layoutIndex] === true && relativeDepth > -2.2;
      });
    }

    const visibility = itemVisibility.current;
    const activeGroupRefs = isWaveStyle ? waveItemGroupRefs.current : itemGroupRefs.current;
    const activeMeshRefs = isWaveStyle ? waveItemMeshRefs.current : itemMeshRefs.current;
    const activeBackMeshRefs = isWaveStyle ? waveItemBackMeshRefs.current : itemBackMeshRefs.current;
    const activeBendRefs = isWaveStyle ? waveItemBendRefs.current : itemBendRefs.current;
    const activeFlashOverlayRefs = isWaveStyle ? waveFlashOverlayMeshRefs.current : flashOverlayMeshRefs.current;
    const activeFlashOverlayBackRefs = isWaveStyle
      ? waveFlashOverlayBackMeshRefs.current
      : flashOverlayBackMeshRefs.current;
    activeGroupRefs.forEach((itemGroup, index) => {
      if (!itemGroup) return;
      const isVisibleInRail = !isWaveStyle || waveItemVisibleRefs.current[index] !== false;
      itemGroup.visible = visibility > 0.01 && isVisibleInRail;
      itemGroup.scale.setScalar(Math.max(0.001, visibility));
    });
    activeMeshRefs.forEach((mesh, index) => {
      if (!mesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = visibility;
        setMaterialUniform(material, "uOpacity", visibility);
        setMaterialUniform(material, "uBend", isWaveStyle ? activeBendRefs[index] ?? 0 : 0);
      });
    });
    activeBackMeshRefs.forEach((mesh, index) => {
      if (!mesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = visibility;
        setMaterialUniform(material, "uOpacity", visibility);
        setMaterialUniform(material, "uBend", isWaveStyle ? activeBendRefs[index] ?? 0 : 0);
      });
    });

    if (flashItemIndex.current >= 0) {
      const elapsed = now - flashStartedAt.current;
      const flashDuration = 500;
      const progress = Math.min(1, elapsed / flashDuration);
      const flashIntensity = Math.sin(progress * Math.PI);
      const flashIndex = flashItemIndex.current;
      [activeMeshRefs[flashIndex], activeBackMeshRefs[flashIndex]].forEach((mesh) => {
        if (!mesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          setMaterialUniform(material, "uFlashProgress", progress);
          setMaterialUniform(material, "uFlashIntensity", flashIntensity);
        });
      });
      [activeFlashOverlayRefs[flashIndex], activeFlashOverlayBackRefs[flashIndex]].forEach((mesh) => {
        if (!mesh) return;
        mesh.visible = true;
        const material = mesh.material as ShaderMaterial;
        material.uniforms.uProgress.value = progress;
        material.uniforms.uIntensity.value = flashIntensity;
        material.opacity = 1;
      });

      if (progress >= 1) {
        [activeMeshRefs[flashIndex], activeBackMeshRefs[flashIndex]].forEach((mesh) => {
          if (!mesh) return;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material) => {
            setMaterialUniform(material, "uFlashProgress", 0);
            setMaterialUniform(material, "uFlashIntensity", 0);
          });
        });
        [activeFlashOverlayRefs[flashIndex], activeFlashOverlayBackRefs[flashIndex]].forEach((mesh) => {
          if (!mesh) return;
          mesh.visible = false;
          const material = mesh.material as ShaderMaterial;
          material.uniforms.uIntensity.value = 0;
        });
        flashItemIndex.current = -1;
        flashStartedAt.current = -1;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {rowPositions.map(({ rowIndex, y, baseRow, rowOffset, itemCount }) => (
        <group
          key={rowIndex}
          position={[0, y, 0]}
          ref={(obj) => {
            rowGroupRefs.current[rowIndex] = obj;
          }}
        >
          {Array.from({ length: itemCount }).map((_, col) => {
            const theta = Math.PI - ((col + rowOffset + 0.5) / itemCount) * Math.PI * 2;
            const waveLane = col === 0 ? -1 : 1;
            const waveInitialDepth = Math.log1p(baseRow) / Math.LN2;
            const waveInitialOutset = Math.min(0.26, waveInitialDepth * 0.09);
            const x = isWaveStyle ? waveLane * (1.18 + waveInitialOutset) : Math.cos(theta) * radius;
            const z = isWaveStyle ? -waveInitialDepth * waveDepthSpacing - Math.abs(waveLane) * 0.22 : Math.sin(theta) * radius;
            const ry = isWaveStyle ? 0 : -(theta + Math.PI / 2);
            const layoutIndex = isWaveStyle ? rowIndex * cols + col : baseRow * cols + col;
            const itemPosition = baseRow * cols + col;
            const activeItem = activeItems[itemPosition];
            const { item, index: texIndex } = activeItem;
            const texture = texturesByUrl.get(item.imageUrl);
            const textureImage = texture?.image as { width?: number; height?: number } | undefined;
            const imageAspect =
              textureImage?.width && textureImage.height ? textureImage.width / textureImage.height : 1;
            const tileW = tileH * imageAspect;
            const captionPadding = 0.05;
            const captionWidth = Math.min(tileW - captionPadding * 2, 1.35);
            const openImageDetail = (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation();
              if (displayMode === "pulled" && item.type === "stream") return;
              const now = performance.now();
              if (now < suppressClickUntilRef.current || now - lastItemActivationAt.current < 100) return;
              lastItemActivationAt.current = now;
              if (isWaveStyle) {
                const currentProgress = -scrollCurrent.current * wavePairsPerScrollUnit;
                const nearestCycle = Math.round((currentProgress - baseRow) / rows);
                scrollTargetRef.current = -(baseRow + nearestCycle * rows) / wavePairsPerScrollUnit;
              } else {
                // A positive Y rotation moves the card's position from theta to
                // theta - rowRotation. At rowRotation = theta - PI / 2, this
                // card is on the camera's center axis and its back face points
                // toward the camera.
                const targetRowRotation = theta - targetViewTheta;
                const targetAngle = targetRowRotation / rowSpeed[baseRow];
                // Each row has its own angular speed, so its equivalent full
                // rotations in `angle.current` are 2π / rowSpeed, not 2π.
                const rowAnglePeriod = (Math.PI * 2) / rowSpeed[baseRow];
                const nearestTurn = Math.round((angle.current - targetAngle) / rowAnglePeriod);
                focusAngleTarget.current = targetAngle + nearestTurn * rowAnglePeriod;
                focusStartedAt.current = now;
                scrollTargetRef.current = y;
              }
              selectionSequence.current = {
                itemIndex: isWaveStyle ? layoutIndex : texIndex,
                textureIndex: texIndex,
                projectName: item.title,
                imageUrl: item.imageUrl,
                holdStartedAt: isWaveStyle ? now : -1,
                activatedAt: -1,
                resumeAt: -1,
              };
              playClickSound();
            };

            return (
              <group
                key={texIndex}
                position={[x, 0, z]}
                rotation={[0, ry, 0]}
                ref={(obj) => {
                  if (isWaveStyle) waveItemGroupRefs.current[layoutIndex] = obj;
                  else itemGroupRefs.current[texIndex] = obj;
                }}
                visible={itemVisibility.current > 0.01}
                scale={Math.max(0.001, itemVisibility.current)}
              >
                <mesh
                  ref={(mesh) => {
                    if (isWaveStyle) waveItemMeshRefs.current[layoutIndex] = mesh;
                    else itemMeshRefs.current[texIndex] = mesh;
                  }}
                  onPointerUp={openImageDetail}
                  onClick={openImageDetail}
                >
                  <planeGeometry args={[tileW, tileH]} />
                  <shaderMaterial
                    transparent
                    toneMapped={false}
                    vertexShader={imageVertexShader}
                    fragmentShader={imageFragmentShader}
                    uniforms={{
                      uMap: { value: texture },
                      uFlashProgress: { value: 0 },
                      uFlashIntensity: { value: 0 },
                      uOpacity: { value: itemVisibility.current },
                      uBend: { value: 0 },
                    }}
                  />
                  <ItemCaption
                    item={item}
                    position={[-tileW / 2 + captionPadding, tileH / 2 - captionPadding, 0.024]}
                    width={captionWidth}
                  />
                  <CanvasPlayingIndicator
                    active={playingTrackIndex === texIndex}
                    color={isDarkTrackNumber(item.numberTrack) ? "#080808" : "#ffffff"}
                    position={[tileW / 2 - 0.15, -tileH / 2 + 0.14, 0.035]}
                  />
                </mesh>
                <mesh
                  ref={(mesh) => {
                    if (isWaveStyle) waveFlashOverlayMeshRefs.current[layoutIndex] = mesh;
                    else flashOverlayMeshRefs.current[texIndex] = mesh;
                  }}
                  position={[0, 0, 0.03]}
                  renderOrder={3}
                  visible={false}
                >
                  <planeGeometry args={[tileW, tileH]} />
                  <shaderMaterial
                    transparent
                    depthTest={false}
                    depthWrite={false}
                    blending={AdditiveBlending}
                    vertexShader={flashVertexShader}
                    fragmentShader={flashFragmentShader}
                    uniforms={{
                      uProgress: { value: 0 },
                      uIntensity: { value: 0 },
                    }}
                  />
                </mesh>
                <mesh
                  ref={(mesh) => {
                    if (isWaveStyle) waveItemBackMeshRefs.current[layoutIndex] = mesh;
                    else itemBackMeshRefs.current[texIndex] = mesh;
                  }}
                  rotation={[0, Math.PI, 0]}
                  onPointerUp={openImageDetail}
                  onClick={openImageDetail}
                >
                  <planeGeometry args={[tileW, tileH]} />
                  <shaderMaterial
                    transparent
                    toneMapped={false}
                    vertexShader={imageVertexShader}
                    fragmentShader={imageFragmentShader}
                    uniforms={{
                      uMap: { value: texture },
                      uFlashProgress: { value: 0 },
                      uFlashIntensity: { value: 0 },
                      uOpacity: { value: itemVisibility.current },
                      uBend: { value: 0 },
                    }}
                  />
                  <ItemCaption
                    item={item}
                    position={[-tileW / 2 + captionPadding, tileH / 2 - captionPadding, 0.024]}
                    width={captionWidth}
                  />
                  <CanvasPlayingIndicator
                    active={playingTrackIndex === texIndex}
                    color={isDarkTrackNumber(item.numberTrack) ? "#080808" : "#ffffff"}
                    position={[tileW / 2 - 0.15, -tileH / 2 + 0.14, 0.035]}
                  />
                </mesh>
                <mesh
                  ref={(mesh) => {
                    if (isWaveStyle) waveFlashOverlayBackMeshRefs.current[layoutIndex] = mesh;
                    else flashOverlayBackMeshRefs.current[texIndex] = mesh;
                  }}
                  position={[0, 0, 0.03]}
                  rotation={[0, Math.PI, 0]}
                  renderOrder={3}
                  visible={false}
                >
                  <planeGeometry args={[tileW, tileH]} />
                  <shaderMaterial
                    transparent
                    depthTest={false}
                    depthWrite={false}
                    blending={AdditiveBlending}
                    vertexShader={flashVertexShader}
                    fragmentShader={flashFragmentShader}
                    uniforms={{
                      uProgress: { value: 0 },
                      uIntensity: { value: 0 },
                    }}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}




export function HVLCanvas({
  items,
  tubeCols,
  tubeRowSpacing,
  tubeScrollLimit,
  scrollTargetRef,
  focusItemRef,
  isDraggingRef,
  spinVelocityRef,
  naturalDirRef,
  dragDeltaRef,
  suppressClickUntilRef,
  onImageClick,
  displayMode,
  displayStyle,
  playingTrackIndex,
}: {
  items: readonly GalleryItem[];
  tubeCols: number;
  tubeRowSpacing: number;
  tubeScrollLimit: number;
  scrollTargetRef: React.MutableRefObject<number>;
  focusItemRef: React.MutableRefObject<number | null>;
  isDraggingRef: React.MutableRefObject<boolean>;
  spinVelocityRef: React.MutableRefObject<number>;
  naturalDirRef: React.MutableRefObject<number>;
  dragDeltaRef: React.MutableRefObject<number>;
  suppressClickUntilRef: React.MutableRefObject<number>;
  onImageClick: (projectName: string, imageUrl: string, textureIndex: number) => void;
  displayMode: DisplayMode;
  displayStyle: DisplayStyle;
  playingTrackIndex: number | null;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      dpr={[1, 2]}
      frameloop="always"
      onCreated={({ camera, gl }) => {
        camera.lookAt(0, 0, 0);
        gl.setClearColor(0x000000, 0);
      }}
    >
      <SceneCamera displayStyle={displayStyle} />
      <Suspense fallback={null}>
        {displayStyle === "museum" && <HVLTitle />}
        <ImageTube
          items={items}
          tubeCols={tubeCols}
          tubeRowSpacing={tubeRowSpacing}
          tubeScrollLimit={tubeScrollLimit}
          scrollTargetRef={scrollTargetRef}
          focusItemRef={focusItemRef}
          isDraggingRef={isDraggingRef}
          spinVelocityRef={spinVelocityRef}
          naturalDirRef={naturalDirRef}
          dragDeltaRef={dragDeltaRef}
          suppressClickUntilRef={suppressClickUntilRef}
          onImageClick={onImageClick}
          displayMode={displayMode}
          displayStyle={displayStyle}
          playingTrackIndex={playingTrackIndex}
        />
      </Suspense>
    </Canvas>
  );
}
