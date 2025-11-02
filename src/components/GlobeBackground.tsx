import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface GlobeBackgroundProps {
  className?: string;
}

export const GlobeBackground = ({ className = '' }: GlobeBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cleanup: (() => void) | undefined;
    let initialized = false;

    const initTimeout = requestAnimationFrame(() => {
      setTimeout(() => {
        if (initialized || !containerRef.current) return;
        initializeScene();
      }, 100);
    });

    function initializeScene() {
      if (initialized || !containerRef.current) return;

      try {
        const width = containerRef.current.clientWidth || 500;
        const height = containerRef.current.clientHeight || 500;

        if (height === 0 || width === 0) {
          setTimeout(() => {
            if (!initialized && containerRef.current) {
              initializeScene();
            }
          }, 200);
          return;
        }

        initialized = true;

        // إنشاء المشهد
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // إنشاء الكاميرا
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 2.6);
        cameraRef.current = camera;

        // إنشاء الـ Renderer
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true 
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // إضافة الإضاءة
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);

        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(5, 3, 5);
        scene.add(dir);

        // إنشاء الكرة الأرضية
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const loader = new THREE.TextureLoader();
        const earthTextureUrl = 'https://raw.githubusercontent.com/creativetimofficial/public-assets/master/soft-ui-dashboard-pro/assets/img/earth.jpg';

        const earthMat = new THREE.MeshStandardMaterial({
          map: loader.load(earthTextureUrl, undefined, undefined, (error) => {
            if (error) {
              console.warn('Failed to load earth texture:', error);
            }
          }),
          metalness: 0,
          roughness: 1
        });

        const earth = new THREE.Mesh(geometry, earthMat);
        scene.add(earth);
        earthRef.current = earth;

        // غلاف جو ناعم
        const atmosphereGeo = new THREE.SphereGeometry(1.02, 64, 64);
        const atmosphereMat = new THREE.MeshBasicMaterial({
          color: 0x66ccff,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.12
        });

        const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
        scene.add(atmosphere);
        atmosphereRef.current = atmosphere;

        // إضافة OrbitControls للتحكم
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.rotateSpeed = 0.3;
        controls.minPolarAngle = 0.1;
        controls.maxPolarAngle = Math.PI - 0.1;
        controlsRef.current = controls;

        // دالة الرسوم المتحركة
        const animate = () => {
          if (animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }

          // تحديث OrbitControls
          if (controls) {
            controls.update();
          }

          // دوران تلقائي - يتوقف فقط عند السحب
          if (earth && (!controls || !controls.isDragging)) {
            earth.rotation.y += 0.0018; // سرعة الدوران
          }

          if (renderer && camera && scene) {
            renderer.render(scene, camera);
          }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

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

        window.addEventListener('resize', handleResize);

        // تنظيف
        cleanup = () => {
          window.removeEventListener('resize', handleResize);

          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }

          if (controls) {
            controls.dispose();
          }

          if (renderer?.domElement && containerRef.current) {
            try {
              containerRef.current.removeChild(renderer.domElement);
            } catch (e) {
              // العنصر قد يكون محذوفاً بالفعل
            }
          }

          if (renderer) {
            renderer.dispose();
          }
          if (earthMat) {
            earthMat.dispose();
          }
          if (geometry) {
            geometry.dispose();
          }
          if (atmosphereGeo) {
            atmosphereGeo.dispose();
          }
          if (atmosphereMat) {
            atmosphereMat.dispose();
          }
        };
      } catch (error) {
        console.error('Error initializing GlobeBackground:', error);
        initialized = false;
      }
    }

    return () => {
      cancelAnimationFrame(initTimeout);
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ borderRadius: '50%', overflow: 'hidden' }}
    />
  );
};

