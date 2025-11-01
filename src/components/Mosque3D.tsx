import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Mosque3DProps {
  type?: 'makkah' | 'madinah';
}

export const Mosque3D = ({ type = 'makkah' }: Mosque3DProps) => {
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

    // إنشاء الكاميرا
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // إنشاء الـ Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // إضافة الضوء
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const pointLight = new THREE.PointLight(0xffd700, 1, 50);
    pointLight.position.set(0, 4, 0);
    scene.add(pointLight);

    // إنشاء القاعدة
    const baseGeometry = new THREE.BoxGeometry(8, 0.3, 6);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.8
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1;
    scene.add(base);

    // إنشاء القبة الرئيسية
    const mainDomeGeometry = new THREE.SphereGeometry(2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const mainDomeMaterial = new THREE.MeshStandardMaterial({ 
      color: type === 'makkah' ? 0xffd700 : 0x90cdf4,
      metalness: 0.9,
      roughness: 0.1
    });
    const mainDome = new THREE.Mesh(mainDomeGeometry, mainDomeMaterial);
    mainDome.position.set(0, 2, 0);
    scene.add(mainDome);

    // إضافة هلال أعلى القبة
    const crescentGeometry = new THREE.TorusGeometry(0.6, 0.1, 16, 32, Math.PI);
    const crescentMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1
    });
    const crescent = new THREE.Mesh(crescentGeometry, crescentMaterial);
    crescent.position.set(0, 3.5, 0);
    crescent.rotation.x = Math.PI / 2;
    scene.add(crescent);

    // إنشاء القباب الجانبية (4 قباب)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const domeGeometry = new THREE.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2
      });
      const dome = new THREE.Mesh(domeGeometry, domeMaterial);
      dome.position.x = Math.sin(angle) * 3;
      dome.position.z = Math.cos(angle) * 2;
      dome.position.y = 1.5;
      scene.add(dome);
    }

    // إنشاء الأعمدة
    for (let i = -3; i <= 3; i += 2) {
      const columnGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2, 16);
      const columnMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x888888,
        metalness: 0.5,
        roughness: 0.5
      });
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      column.position.set(i, 0, -2);
      scene.add(column);
    }

    // تأثير التوهج
    const glowGeometry = new THREE.BoxGeometry(8.5, 0.5, 6.5);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffd700,
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = -0.8;
    scene.add(glow);

    // دالة الرسوم المتحركة
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // حركة توهج نابضة
      const time = Date.now() * 0.001;
      glowMaterial.opacity = 0.1 + Math.sin(time * 2) * 0.15;
      pointLight.intensity = 0.8 + Math.sin(time) * 0.3;

      // دوران بطيء للقبة الرئيسية
      mainDome.rotation.y += 0.002;
      crescent.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // معالجة تغيير حجم النافذة
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
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
    };
  }, [type]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
    />
  );
};
