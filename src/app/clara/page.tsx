"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import * as THREE from "three";

export default function RomanticLovePage() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHeartOpen, setIsHeartOpen] = useState(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const loveLetterRef = useRef<HTMLDivElement | null>(null);
  const portraitCardRef = useRef<HTMLDivElement | null>(null);
  const extraCardRef = useRef<HTMLDivElement | null>(null);
  const thirdCardRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const overlayContentRef = useRef<HTMLDivElement | null>(null);
  const revealButtonRef = useRef<HTMLButtonElement | null>(null);
  const floatingHeartRefs = useRef<HTMLDivElement[]>([]);

  type Star = {
    id: number;
    size: number;
    left: string;
    top: string;
    delay: number;
    duration: number;
  };

  function seededValue(seed: number) {
    const x = Math.sin(seed * 9999.91) * 10000;
    return x - Math.floor(x);
  }

  function createStars(count: number): Star[] {
    return Array.from({ length: count }, (_, i) => {
      const a = seededValue(i + 1);
      const b = seededValue(i + 11);
      const c = seededValue(i + 21);
      const d = seededValue(i + 31);
      const e = seededValue(i + 41);

      return {
        id: i,
        size: a * 6 + 4,
        left: `${b * 100}%`,
        top: `${c * 100}%`,
        delay: d * 4,
        duration: e * 4 + 4,
      };
    });
  }

  const stars = createStars(18);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x070611, 8, 24);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0.2, 8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff8ac2, 18, 30, 2);
    pointLight.position.set(3, 2, 6);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xa78bfa, 14, 30, 2);
    pointLight2.position.set(-4, -1, 5);
    scene.add(pointLight2);

    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, 0, -1.2, -1.2, -2.2, 0.3);
    heartShape.bezierCurveTo(-3.2, 1.8, -1.6, 3.8, 0, 5.1);
    heartShape.bezierCurveTo(1.6, 3.8, 3.2, 1.8, 2.2, 0.3);
    heartShape.bezierCurveTo(1.2, -1.2, 0, 0, 0, 0);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.8,
      bevelEnabled: true,
      bevelSegments: 12,
      steps: 2,
      bevelSize: 0.18,
      bevelThickness: 0.22,
      curveSegments: 48,
    };

    const heartGeometry = new THREE.ExtrudeGeometry(
      heartShape,
      extrudeSettings,
    );
    heartGeometry.center();

    const heartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff4fa0,
      metalness: 0.15,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      emissive: 0x6a1037,
      emissiveIntensity: 0.7,
      transmission: 0.04,
      thickness: 0.8,
    });

    const heartMesh = new THREE.Mesh(heartGeometry, heartMaterial);
    heartMesh.scale.set(0.72, 0.72, 0.72);
    heartMesh.rotation.z = Math.PI;
    heartMesh.position.y = 0.2;
    group.add(heartMesh);

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xffc6df,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const wireHeart = new THREE.Mesh(heartGeometry.clone(), wireMaterial);
    wireHeart.scale.set(0.84, 0.84, 0.84);
    wireHeart.rotation.z = Math.PI;
    group.add(wireHeart);

    const particlesCount = 1400;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.03,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const auraGeometry = new THREE.TorusGeometry(2.35, 0.04, 32, 200);
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: 0xf9a8d4,
      transparent: true,
      opacity: 0.25,
    });
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    aura.rotation.x = Math.PI / 1.8;
    aura.position.y = -0.15;
    scene.add(aura);

    const mouse = { x: 0, y: 0 };

    const onMouseMove = (event: MouseEvent) => {
      const bounds = container.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    };

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    let animationFrame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      animationFrame = requestAnimationFrame(animate);

      group.rotation.y += 0.0035;
      group.rotation.x = Math.sin(elapsed * 0.7) * 0.08 + mouse.y * 0.18;
      group.position.x += (mouse.x * 0.7 - group.position.x) * 0.045;
      group.position.y += (mouse.y * 0.45 - group.position.y) * 0.04;

      heartMesh.rotation.z = Math.PI + Math.sin(elapsed * 1.2) * 0.06;
      wireHeart.rotation.z = Math.PI - Math.sin(elapsed * 0.9) * 0.08;
      aura.rotation.z += 0.003;
      aura.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.03);

      particles.rotation.y = elapsed * 0.025;
      particles.rotation.x = elapsed * 0.012;

      camera.position.x += (mouse.x * 0.45 - camera.position.x) * 0.03;
      camera.position.y += (mouse.y * 0.22 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    gsap.set([titleRef.current, subtitleRef.current, ctaRef.current], {
      opacity: 0,
      y: 24,
      filter: "blur(12px)",
    });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      overlayContentRef.current,
      { opacity: 0, y: 18, filter: "blur(10px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1 },
    ).fromTo(
      revealButtonRef.current,
      { opacity: 0, y: 12, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 },
      "-=0.55",
    );

    floatingHeartRefs.current.forEach((el, index) => {
      if (!el) return;
      gsap.to(el, {
        y: index % 2 === 0 ? -18 : -28,
        x: index % 2 === 0 ? 10 : -8,
        duration: 2.8 + index * 0.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      heartGeometry.dispose();
      heartMaterial.dispose();
      wireMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      auraGeometry.dispose();
      auraMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleReveal = () => {
    if (isRevealed) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.inOut" } });
    tl.to(overlayContentRef.current, {
      opacity: 0,
      y: -20,
      filter: "blur(12px)",
      duration: 0.55,
    })
      .to(
        overlayRef.current,
        {
          clipPath: "circle(140% at 50% 50%)",
          opacity: 0,
          duration: 1.35,
        },
        "-=0.1",
      )
      .to(
        [titleRef.current, subtitleRef.current, ctaRef.current],
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          stagger: 0.14,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.55",
      )
      .set(overlayRef.current, { pointerEvents: "none" });

    setIsRevealed(true);
  };

  const handleOpenHeart = () => {
    if (isHeartOpen) return;

    setIsHeartOpen(true);

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.fromTo(
      portraitCardRef.current,
      {
        opacity: 0,
        x: -24,
        y: 24,
        scale: 0.9,
        rotate: -8,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: -6,
        filter: "blur(0px)",
        duration: 0.9,
      },
    )
      .fromTo(
        extraCardRef.current,
        { opacity: 0, y: 28, scale: 0.9, rotate: 8, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 2,
          filter: "blur(0px)",
          duration: 0.9,
        },
        "-=0.55",
      )
      .fromTo(
        thirdCardRef.current,
        {
          opacity: 0,
          x: 24,
          y: 24,
          scale: 0.9,
          rotate: 4,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotate: 7,
          filter: "blur(0px)",
          duration: 0.9,
        },
        "-=0.55",
      )
      .fromTo(
        loveLetterRef.current,
        { opacity: 0, y: 38, scale: 0.92, filter: "blur(12px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.05 },
        "-=0.35",
      );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05030b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,110,180,0.22),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(167,139,250,0.18),transparent_28%),linear-gradient(180deg,#0b0715_0%,#05030b_45%,#040208_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />

      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white/70 shadow-[0_0_20px_rgba(255,255,255,0.55)]"
          style={{
            width: star.size,
            height: star.size,
            left: star.left,
            top: star.top,
          }}
          animate={{ opacity: [0.25, 1, 0.25], scale: [1, 1.35, 1] }}
          transition={{
            repeat: Infinity,
            duration: star.duration,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <div
        ref={overlayRef}
        className="absolute inset-0 z-30 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,120,190,0.18),transparent_30%),linear-gradient(180deg,#09040f_0%,#040208_100%)]"
        style={{ clipPath: "circle(75% at 50% 50%)" }}
      >
        <div
          ref={overlayContentRef}
          className="mx-6 flex max-w-2xl flex-col items-center rounded-[2rem] border border-white/10 bg-white/[0.045] px-8 py-10 text-center backdrop-blur-2xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-white/60">
            a little surprise
          </div>

          <h2 className="max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl">
            Tem uma surpresa linda esperando pela Cho.
          </h2>

          <p className="mt-5 max-w-lg text-sm leading-7 text-white/62 sm:text-base">
            Não é só uma página. É uma pequena experiência feita para a Clara —
            daquelas que primeiro param o tempo e depois puxam um sorriso.
          </p>

          <button
            ref={revealButtonRef}
            onClick={handleReveal}
            className="mt-8 rounded-full border border-white/15 bg-white px-7 py-4 text-sm font-medium text-[#120713] shadow-[0_10px_50px_rgba(255,255,255,0.18)] transition-transform duration-300 hover:scale-[1.03]"
          >
            Revelar surpresa
          </button>
        </div>
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-pink-300 shadow-[0_0_16px_rgba(244,114,182,0.9)]" />
              Clarinha
            </div>

            <h1
              ref={titleRef}
              className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl xl:text-[5.7rem]"
            >
              Clara, você é o meu
              <span className="block bg-[linear-gradient(180deg,#ffffff_0%,#ffd2e7_35%,#ff6fb7_70%,#a78bfa_100%)] bg-clip-text pb-3 text-transparent">
                universo favorito.
              </span>
            </h1>

            <p
              ref={subtitleRef}
              className="mt-7 max-w-xl text-base leading-8 text-white/68 sm:text-lg"
            >
              Cho, tudo aqui foi pensado para te lembrar o que eu sinto: brilho
              lindos dos seus cabelos, olhos apaixonantes, delicadeza e uma
              atmosfera que parece saída de um sonho.
            </p>

            <div ref={ctaRef} className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleOpenHeart}
                className="group relative overflow-hidden rounded-full border border-white/15 bg-white px-7 py-4 text-sm font-medium text-[#120713] shadow-[0_10px_50px_rgba(255,255,255,0.18)] transition-transform duration-300 hover:scale-[1.03]"
              >
                <span className="relative z-10">Abrir coração</span>
                <span className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.45),rgba(255,182,213,0.55),rgba(167,139,250,0.45))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ["Linda", "Amo seus olhos"],
                ["Gostosa", "Amo sua boca"],
                ["Irresistível", "Amo você"],
              ].map(([title, desc], i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{
                    opacity: isRevealed ? 1 : 0,
                    y: isRevealed ? 0 : 18,
                  }}
                  transition={{
                    delay: isRevealed ? 0.35 + i * 0.14 : 0,
                    duration: 0.7,
                  }}
                  className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-2xl"
                >
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/55">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[520px] items-center justify-center lg:min-h-[680px]">
            <div className="absolute inset-x-8 top-1/2 h-52 -translate-y-1/2 rounded-full bg-pink-500/20 blur-3xl" />
            <div className="absolute inset-x-16 bottom-16 h-28 rounded-full bg-violet-400/20 blur-3xl" />

            <div
              ref={mountRef}
              className="absolute inset-0 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-md"
            />

            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_78%_24%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_center,transparent_35%,rgba(255,255,255,0.03)_100%)]" />

            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_center,transparent_35%,rgba(255,255,255,0.03)_100%)]" />

            {["❤", "✦", "❤", "✦"].map((item, i) => (
              <div
                key={`${item}-${i}`}
                ref={(el) => {
                  if (el) floatingHeartRefs.current[i] = el;
                }}
                className={`absolute text-2xl ${
                  i === 0
                    ? "left-10 top-16 text-pink-300/80"
                    : i === 1
                      ? "right-12 top-24 text-violet-200/75"
                      : i === 2
                        ? "bottom-24 left-12 text-rose-200/70"
                        : "bottom-16 right-14 text-white/60"
                }`}
              >
                {item}
              </div>
            ))}

            {isHeartOpen && (
              <>
                <div
                  ref={portraitCardRef}
                  className="absolute left-[-1rem] top-8 z-20 w-[200px] -rotate-6 overflow-hidden rounded-[1.8rem] border border-white/15 bg-white/10 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:left-[-1.5rem] sm:w-[230px] lg:left-[-2rem] lg:w-[260px]"
                >
                  <div className="overflow-hidden rounded-[1.2rem]">
                    <img
                      src="https://img.vsco.co/ec08ea/78168508/695a8bab5557cdb168dfb807/vsco_010426.jpg"
                      alt="Clara, a Cho 1"
                      className="h-[260px] w-full object-cover sm:h-[300px] lg:h-[340px]"
                    />
                  </div>
                </div>

                <div
                  ref={extraCardRef}
                  className="absolute left-1/2 top-6 z-10 w-[190px] -translate-x-1/2 rotate-[2deg] overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/8 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:w-[220px] lg:w-[240px]"
                >
                  <div className="overflow-hidden rounded-[1.2rem]">
                    <img
                      src="https://img.vsco.co/cdn-cgi/image/width=480,height=640/ec08ea/78168508/64b00581cb8b39601d7acacb/vsco_071323.jpg"
                      alt="Clara, a Cho 2"
                      className="h-[250px] w-full object-cover opacity-95 sm:h-[290px] lg:h-[320px]"
                    />
                  </div>
                </div>

                <div
                  ref={thirdCardRef}
                  className="absolute right-[-1rem] top-10 z-20 w-[200px] rotate-[7deg] overflow-hidden rounded-[1.8rem] border border-white/15 bg-white/10 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:right-[-1.5rem] sm:w-[230px] lg:right-[-2rem] lg:w-[260px]"
                >
                  <div className="overflow-hidden rounded-[1.2rem]">
                    <img
                      src="https://img.vsco.co/cdn-cgi/image/width=1200,height=1600/ec08ea/78168508/64b005f3cb8b39601d7acacc/vsco_071323.jpg"
                      alt="Clara, a Cho 3"
                      className="h-[260px] w-full object-cover sm:h-[300px] lg:h-[340px]"
                    />
                  </div>
                </div>

                <div
                  ref={loveLetterRef}
                  className="absolute inset-x-6 top-[62%] z-40 mx-auto max-w-xl -translate-y-1/2 rounded-[2rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] p-6 shadow-[0_25px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-white/60">
                    para clarinha
                  </div>
                  <h3 className="mt-5 text-3xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-4xl">
                    Eu queria te mostrar uma coisa bonita.
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-white/72 sm:text-base">
                    Clara, eu fiz essa página pensando em te impressionar, mas
                    no fim percebi uma coisa.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-pink-100/90 sm:text-base">
                    A parte mais bonita sempre foi você, Cho. Eu te amo!
                  </p>
                </div>
              </>
            )}

            <div className="absolute bottom-5 left-1/2 w-[86%] -translate-x-1/2 rounded-[1.6rem] border border-white/12 bg-black/20 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                    para clara, minha cho
                  </p>
                </div>
                <div className="rounded-full border border-pink-300/20 bg-white/10 px-4 py-2 text-sm text-pink-100">
                  princesa buti
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
