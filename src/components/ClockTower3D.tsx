import { useEffect, useRef } from "react";
import * as THREE from "three";

export const ClockTower3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // إنشاء المشهد
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x001122);

    // التأكد من وجود حجم صالح
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;
    if (height === 0) return;

    // إنشاء الكاميرا
    const camera = new THREE.PerspectiveCamera(
      50,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // إنشاء الـ Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // إضافة الضوء
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffaa, 0.5);
    directionalLight2.position.set(-5, 3, -5);
    scene.add(directionalLight2);

    // إنشاء قاعدة البرج
    const baseGeometry = new THREE.BoxGeometry(3, 0.5, 3);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x888888,
      metalness: 0.3,
      roughness: 0.7
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1;
    scene.add(base);

    // إنشاء جسم البرج الرئيسي
    const towerGeometry = new THREE.CylinderGeometry(0.8, 1, 6, 8);
    const towerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.2
    });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 2;
    scene.add(tower);

    // إنشاء الساعة (وجه الساعة)
    const clockGeometry = new THREE.CylinderGeometry(0.95, 0.95, 0.2, 32);
    const clockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.3
    });
    const clock = new THREE.Mesh(clockGeometry, clockMaterial);
    clock.position.y = 5;
    scene.add(clock);

    // إضافة مؤشرات الساعة
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const hourMarkerGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
      const hourMarkerMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
      const hourMarker = new THREE.Mesh(hourMarkerGeometry, hourMarkerMaterial);
      hourMarker.position.x = Math.sin(angle) * 0.85;
      hourMarker.position.z = Math.cos(angle) * 0.85;
      hourMarker.position.y = 5;
      scene.add(hourMarker);
    }

    // إنشاء القبة الذهبية
    const domeGeometry = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 6.5;
    scene.add(dome);

    // إضافة هلال أعلى القبة
    const crescentGeometry = new THREE.TorusGeometry(0.8, 0.15, 16, 32, Math.PI);
    const crescentMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1
    });
    const crescent = new THREE.Mesh(crescentGeometry, crescentMaterial);
    crescent.position.y = 7.5;
    crescent.rotation.x = Math.PI / 2;
    scene.add(crescent);

    // تأثير التوهج حول البرج
    const glowGeometry = new THREE.CylinderGeometry(1.1, 1.3, 6.5, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffd700,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 2;
    scene.add(glow);

    // حركة دوران البرج (بطيئة)
    let rotationSpeed = 0.01;

    // دالة الرسوم المتحركة
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // دوران البرج ببطء
      tower.rotation.y += rotationSpeed * 0.1;
      clock.rotation.y += rotationSpeed * 0.1;
      dome.rotation.y += rotationSpeed * 0.1;
      glow.rotation.y += rotationSpeed * 0.1;

      // حركة توهج نابضة
      const time = Date.now() * 0.001;
      glowMaterial.opacity = 0.1 + Math.sin(time * 2) * 0.1;

      // حركة ضوئية
      directionalLight2.intensity = 0.3 + Math.sin(time) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // معالجة تغيير حجم النافذة
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const newWidth = containerRef.current.clientWidth || width;
      const newHeight = containerRef.current.clientHeight || height;
      if (newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // تنظيف
    return () => {
      window.removeEventListener("resize", handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }

      renderer.dispose();
      baseMaterial.dispose();
      baseGeometry.dispose();
      towerMaterial.dispose();
      towerGeometry.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
    />
  );
};
