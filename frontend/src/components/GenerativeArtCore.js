"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function GenerativeArtCore() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const container = containerRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // ── Scene ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.008);

    // ── Camera ─────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
    camera.position.z = 6;

    // ── Renderer ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    container.appendChild(renderer.domElement);

    // ═══════════════════════════════════════════════════════
    // LAYER 1 — Star Field (2400 floating particles)
    // ═══════════════════════════════════════════════════════
    const starCount = 2400;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3 + 0] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      starSizes[i] = Math.random() * 0.8 + 0.2;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        uniform vec2 uMouse;
        varying float vAlpha;

        void main() {
          // Slow drift + mouse parallax
          vec3 pos = position;
          pos.x += sin(uTime * 0.15 + position.z * 0.3) * 0.4 + uMouse.x * (position.z * 0.005);
          pos.y += cos(uTime * 0.12 + position.x * 0.2) * 0.3 + uMouse.y * (position.z * 0.004);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (280.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          // Twinkle
          vAlpha = 0.35 + 0.25 * sin(uTime * 1.2 + position.x * 10.0 + position.y * 7.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          // Soft circular point
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = (1.0 - dist * 2.0) * vAlpha;
          gl_FragColor = vec4(0.78, 0.72, 1.0, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ═══════════════════════════════════════════════════════
    // LAYER 2 — Ambient Glow Orbs (3 large translucent spheres)
    // ═══════════════════════════════════════════════════════
    const orbConfigs = [
      { color: 0x7c6af7, pos: [-2.5, 1.2, -3], scale: 2.2, speed: 0.6, orbit: 1.4 },   // indigo
      { color: 0x9d50f5, pos: [2.8, -0.8, -5], scale: 2.8, speed: 0.45, orbit: 1.0 },  // violet
      { color: 0x3b5bdb, pos: [0.5, 2.2, -7], scale: 3.5, speed: 0.35, orbit: 0.8 },  // deep blue
    ];

    const orbMeshes = orbConfigs.map(cfg => {
      const geo = new THREE.SphereGeometry(1, 32, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      // Custom glowing orb shader
      const shaderMat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(cfg.color) },
          uTime: { value: 0 },
          uPulse: { value: cfg.speed },
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uTime;
          uniform float uPulse;
          varying vec3 vNormal;

          void main() {
            // Fresnel edge glow
            float edge = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.5);
            float pulse = 0.85 + 0.15 * sin(uTime * uPulse);
            gl_FragColor = vec4(uColor * edge * pulse, edge * 0.55 * pulse);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      });

      const mesh = new THREE.Mesh(geo, shaderMat);
      mesh.position.set(...cfg.pos);
      mesh.scale.setScalar(cfg.scale);
      mesh.userData = cfg;
      scene.add(mesh);
      return mesh;
    });

    // ═══════════════════════════════════════════════════════
    // LAYER 3 — Core Icosahedron (refined, subtler)
    // ═══════════════════════════════════════════════════════
    const coreGeo = new THREE.IcosahedronGeometry(1.4, 5);
    const coreUniforms = {
      uTime: { value: 0 },
      uDisplacement: { value: 0.12 },
      uFrequency: { value: 1.8 },
      uColor: { value: new THREE.Color(0x7c6af7) },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };

    const coreMat = new THREE.ShaderMaterial({
      uniforms: coreUniforms,
      vertexShader: `
        uniform float uTime;
        uniform float uDisplacement;
        uniform float uFrequency;
        uniform vec2 uMouse;
        varying vec3 vNormal;
        varying float vDisplace;

        float wave(vec3 p) {
          float t = uTime * 0.7;
          float w1 = sin(p.x * uFrequency + t) * cos(p.y * uFrequency + t);
          float w2 = sin(p.y * uFrequency * 2.1 - t * 1.2) * cos(p.z * uFrequency * 1.6 + t);
          float w3 = sin(p.z * uFrequency * 3.8 + t * 1.9) * sin(p.x * uFrequency * 2.8 - t);
          return (w1 * 0.5 + w2 * 0.35 + w3 * 0.15) * uDisplacement;
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          float d = wave(position + vec3(uMouse * 0.3, 0.0));
          vDisplace = d;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * d, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying float vDisplace;

        void main() {
          float edge = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          vec3 col = uColor + vec3(vDisplace * 0.5, abs(vDisplace) * 0.15, vDisplace * 0.7);
          gl_FragColor = vec4(col * (edge * 1.3 + 0.1), edge * 0.75 + 0.05);
        }
      `,
      wireframe: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Halo point cloud around core
    const haloGeo = new THREE.IcosahedronGeometry(1.5, 2);
    const haloMat = new THREE.PointsMaterial({
      size: 0.018,
      color: 0xa592ff,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Points(haloGeo, haloMat);
    scene.add(haloMesh);

    // ═══════════════════════════════════════════════════════
    // INTERACTION
    // ═══════════════════════════════════════════════════════
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const onMouseMove = e => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    // ═══════════════════════════════════════════════════════
    // ANIMATION LOOP
    // ═══════════════════════════════════════════════════════
    const clock = new THREE.Clock();
    let raf;

    const animate = () => {
      const t = clock.getElapsedTime();

      // Smooth mouse
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      // Star field
      starMat.uniforms.uTime.value = t;
      starMat.uniforms.uMouse.value.set(mouse.x * 6, mouse.y * 6);

      // Ambient orbs — slow drift orbits
      orbMeshes.forEach((orb, i) => {
        const cfg = orb.userData;
        orb.position.x = cfg.pos[0] + Math.sin(t * cfg.speed * 0.5 + i) * cfg.orbit;
        orb.position.y = cfg.pos[1] + Math.cos(t * cfg.speed * 0.4 + i * 1.3) * cfg.orbit * 0.7;
        orb.material.uniforms.uTime.value = t;
      });

      // Core icosahedron
      coreUniforms.uTime.value = t;
      coreUniforms.uMouse.value.set(mouse.x, mouse.y);
      coreMesh.rotation.y = t * 0.04 + mouse.x * 0.2;
      coreMesh.rotation.x = t * 0.025 + mouse.y * 0.12;
      haloMesh.rotation.y = -t * 0.018;
      haloMesh.rotation.x = -t * 0.012;

      // Dynamic accent color sync
      try {
        const hex = getComputedStyle(document.documentElement)
          .getPropertyValue("--color-accent").trim();
        if (hex && hex.startsWith("#")) {
          coreUniforms.uColor.value.set(hex);
        }
      } catch (_) {}

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    animate();

    // ── Cleanup ────────────────────────────────────────────
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      starGeo.dispose();
      starMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      orbMeshes.forEach(o => { o.geometry.dispose(); o.material.dispose(); });
      renderer.dispose();
      if (container && renderer.domElement.parentNode) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.12,
      }}
    />
  );
}
