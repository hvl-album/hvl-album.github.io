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
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
    kind: "initial" | "to-center" | "to-observatory";
    elapsed: number;
    startZ: number;
    startFov: number;
  }>({ kind: "initial", elapsed: 0, startZ: 14, startFov: 42 });

  useEffect(() => {
    const nextKind = displayStyle === "art" ? "to-center" : "to-observatory";
    if (previousStyleRef.current == null) {
      transitionRef.current = {
        kind: "initial",
        elapsed: 0,
        startZ: camera.position.z,
        startFov: perspectiveCamera.fov,
      };
    } else if (previousStyleRef.current !== displayStyle) {
      transitionRef.current = {
        kind: nextKind,
        elapsed: 0,
        startZ: camera.position.z,
        startFov: perspectiveCamera.fov,
      };
    }
    previousStyleRef.current = displayStyle;
  }, [camera, displayStyle]);

  useFrame((_, delta) => {
    const targetZ = displayStyle === "art" ? 0.85 : 6;
    const targetFov = displayStyle === "art" ? 62 : 50;
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

    camera.position.z = animatedZ;
    perspectiveCamera.fov = transition.startFov + (targetFov - transition.startFov) * easedProgress;
    camera.lookAt(0, 0, 0);
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
  const flashOverlayMeshRefs = useRef<Array<Mesh | null>>([]);
  const flashOverlayBackMeshRefs = useRef<Array<Mesh | null>>([]);
  const scrollCurrent = useRef(0);
  const angle = useRef(0);
  const focusAngleTarget = useRef<number | null>(null);
  const focusStartedAt = useRef(-1);
  const flashItemIndex = useRef(-1);
  const flashStartedAt = useRef(-1);
  const selectionSequence = useRef<{
    itemIndex: number;
    projectName: string;
    imageUrl: string;
    holdStartedAt: number;
    activatedAt: number;
    resumeAt: number;
  } | null>(null);
  const lastItemActivationAt = useRef(0);
  const itemVisibility = useRef(1);
  const displayTransition = useRef({ phase: "idle", start: -1, target: displayMode });
  const [tubeLayoutMode, setTubeLayoutMode] = useState<DisplayMode>(displayMode);

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
  const cols = Math.min(tubeCols, activeItems.length);
  const rows = Math.ceil(activeItems.length / cols);
  const radius = 3.2;
  const tileH = 1.5;
  const ySpacing = tubeRowSpacing;
  const totalRows = rows;

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
      const y = (rowIndex - (totalRows - 1) / 2) * ySpacing;
      const baseRow = rowIndex % rows;
      const rowOffset = baseRow % 2 === 0 ? 0 : 0.5;
      const itemCount = Math.min(cols, activeItems.length - baseRow * cols);
      out.push({ rowIndex, y, baseRow, rowOffset, itemCount });
    }
    return out.filter(({ itemCount }) => itemCount > 0);
  }, [activeItems.length, cols, rows, totalRows, ySpacing]);
  const targetViewTheta = displayStyle === "art" ? -Math.PI / 2 : Math.PI / 2;

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
    const scrollLerp = isDraggingRef.current ? 0.42 : 0.12;
    scrollCurrent.current += (scrollTargetRef.current - scrollCurrent.current) * scrollLerp;

    const activeScrollLimit = ((rows - 1) * tubeRowSpacing) / 2;
    scrollCurrent.current = Math.max(-activeScrollLimit, Math.min(activeScrollLimit, scrollCurrent.current));
    scrollTargetRef.current = Math.max(-activeScrollLimit, Math.min(activeScrollLimit, scrollTargetRef.current));

    const requestedFocusIndex = focusItemRef.current;
    if (requestedFocusIndex != null) {
      focusItemRef.current = null;
      const activePosition = activeItems.findIndex(({ index }) => index === requestedFocusIndex);
      if (activePosition >= 0) {
        const targetRowIndex = Math.floor(activePosition / cols);
        const targetRow = rowPositions[targetRowIndex];
        const targetCol = activePosition % cols;
        if (targetRow) {
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

    const baseSpeed = naturalDirRef.current * (0.14 + displaySpinBoost);
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
        onImageClick(activeSelection.projectName, activeSelection.imageUrl, activeSelection.itemIndex);
      }

      if (activeSelection.activatedAt > 0 && now >= activeSelection.resumeAt) {
        selectionSequence.current = null;
      }
    }
    const group = groupRef.current;
    if (!group) return;

    group.position.y = -scrollCurrent.current;

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const rowObj = rowGroupRefs.current[rowIndex];
      if (!rowObj) continue;
      const baseRow = rowIndex % rows;
      rowObj.rotation.y = angle.current * rowSpeed[baseRow];
    }

    const visibility = itemVisibility.current;
    itemGroupRefs.current.forEach((itemGroup) => {
      if (!itemGroup) return;
      itemGroup.visible = visibility > 0.01;
      itemGroup.scale.setScalar(Math.max(0.001, visibility));
    });
    itemMeshRefs.current.forEach((mesh) => {
      if (!mesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = visibility;
        setMaterialUniform(material, "uOpacity", visibility);
      });
    });
    itemBackMeshRefs.current.forEach((mesh) => {
      if (!mesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = visibility;
        setMaterialUniform(material, "uOpacity", visibility);
      });
    });

    if (flashItemIndex.current >= 0) {
      const elapsed = now - flashStartedAt.current;
      const flashDuration = 500;
      const progress = Math.min(1, elapsed / flashDuration);
      const flashIntensity = Math.sin(progress * Math.PI);
      const flashIndex = flashItemIndex.current;
      [itemMeshRefs.current[flashIndex], itemBackMeshRefs.current[flashIndex]].forEach((mesh) => {
        if (!mesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          setMaterialUniform(material, "uFlashProgress", progress);
          setMaterialUniform(material, "uFlashIntensity", flashIntensity);
        });
      });
      [flashOverlayMeshRefs.current[flashIndex], flashOverlayBackMeshRefs.current[flashIndex]].forEach((mesh) => {
        if (!mesh) return;
        mesh.visible = true;
        const material = mesh.material as ShaderMaterial;
        material.uniforms.uProgress.value = progress;
        material.uniforms.uIntensity.value = flashIntensity;
        material.opacity = 1;
      });

      if (progress >= 1) {
        [itemMeshRefs.current[flashIndex], itemBackMeshRefs.current[flashIndex]].forEach((mesh) => {
          if (!mesh) return;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material) => {
            setMaterialUniform(material, "uFlashProgress", 0);
            setMaterialUniform(material, "uFlashIntensity", 0);
          });
        });
        [flashOverlayMeshRefs.current[flashIndex], flashOverlayBackMeshRefs.current[flashIndex]].forEach((mesh) => {
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
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            const ry = -(theta + Math.PI / 2);
            const activeItem = activeItems[baseRow * cols + col];
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
              selectionSequence.current = {
                itemIndex: texIndex,
                projectName: item.title,
                imageUrl: item.imageUrl,
                holdStartedAt: -1,
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
                  itemGroupRefs.current[texIndex] = obj;
                }}
                visible={itemVisibility.current > 0.01}
                scale={Math.max(0.001, itemVisibility.current)}
              >
                <mesh
                  ref={(mesh) => {
                    itemMeshRefs.current[texIndex] = mesh;
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
                    flashOverlayMeshRefs.current[texIndex] = mesh;
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
                    itemBackMeshRefs.current[texIndex] = mesh;
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
                    flashOverlayBackMeshRefs.current[texIndex] = mesh;
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
        {displayStyle !== "art" && <HVLTitle />}
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
