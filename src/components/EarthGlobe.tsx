import { useEffect, useRef } from "react";
import * as THREE from "three";

interface EarthGlobeProps {
  meccaPosition?: { lat: number; lng: number };
  medinaPosition?: { lat: number; lng: number };
}

export const EarthGlobe = ({ 
  meccaPosition = { lat: 21.4225, lng: 39.8262 }, // مكة المكرمة
  medinaPosition = { lat: 24.4672, lng: 39.6142 }  // المدينة المنورة
}: EarthGlobeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cleanup: (() => void) | undefined;
    let initialized = false;

    // استخدام requestAnimationFrame للتأكد من أن DOM جاهز
    const initTimeout = requestAnimationFrame(() => {
      setTimeout(() => {
        if (initialized || !containerRef.current) return;
        initializeScene();
      }, 100);
    });

    function initializeScene() {
      if (initialized || !containerRef.current) return;
      
      try {
        const width = containerRef.current.clientWidth || 800;
        const height = containerRef.current.clientHeight || 600;

        // التأكد من عدم القسمة على صفر
        if (height === 0 || width === 0) {
          // حاول مرة أخرى بعد قليل
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
      const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
      );
      camera.position.set(0, 0, 2.5);
      cameraRef.current = camera;

      // إنشاء الـ Renderer
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // الحد من PixelRatio
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // تحميل نسيج الكرة الأرضية مع معالجة الأخطاء
      const textureLoader = new THREE.TextureLoader();
      let earthTexture: THREE.Texture;
      let normalTexture: THREE.Texture;

      try {
        earthTexture = textureLoader.load(
          "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg",
          undefined,
          undefined,
          (error) => {
            if (error) {
              console.warn("Failed to load earth texture:", error);
            }
          }
        );

        normalTexture = textureLoader.load(
          "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg",
          undefined,
          undefined,
          (error) => {
            if (error) {
              console.warn("Failed to load normal texture:", error);
            }
          }
        );
      } catch (error) {
        console.error("Error loading textures:", error);
        return;
      }

      // إنشاء الكرة الأرضية
      const geometry = new THREE.SphereGeometry(1, 64, 64);
      const material = new THREE.MeshStandardMaterial({
        map: earthTexture,
        normalMap: normalTexture,
        roughness: 0.8,
        metalness: 0.2,
      });
      const earth = new THREE.Mesh(geometry, material);
      scene.add(earth);
      earthRef.current = earth;

      // إضافة الضوء
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 3, 5);
      scene.add(directionalLight);

      // دالة لتحويل خطوط الطول والعرض إلى إحداثيات 3D
      const latLngToVector3 = (lat: number, lng: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        const x = -(1.02 * Math.sin(phi) * Math.cos(theta));
        const y = 1.02 * Math.cos(phi);
        const z = 1.02 * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
      };

      // إضافة نقطة حمراء لمكة
      const meccaPoint = latLngToVector3(meccaPosition.lat, meccaPosition.lng);
      const meccaGeometry = new THREE.SphereGeometry(0.03, 16, 16);
      const meccaMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
      });
      const meccaMarker = new THREE.Mesh(meccaGeometry, meccaMaterial);
      meccaMarker.position.copy(meccaPoint);
      scene.add(meccaMarker);

      // إضافة حلقة متوهجة حول نقطة مكة
      const meccaRingGeometry = new THREE.RingGeometry(0.04, 0.06, 32);
      const meccaRingMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const meccaRing = new THREE.Mesh(meccaRingGeometry, meccaRingMaterial);
      meccaRing.position.copy(meccaPoint);
      meccaRing.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(meccaRing);

      // إضافة نقطة حمراء للمدينة المنورة
      const medinaPoint = latLngToVector3(medinaPosition.lat, medinaPosition.lng);
      const medinaGeometry = new THREE.SphereGeometry(0.03, 16, 16);
      const medinaMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4444,
        emissive: 0xff4444,
        emissiveIntensity: 0.5
      });
      const medinaMarker = new THREE.Mesh(medinaGeometry, medinaMaterial);
      medinaMarker.position.copy(medinaPoint);
      scene.add(medinaMarker);

      // إضافة حلقة متوهجة حول نقطة المدينة
      const medinaRingGeometry = new THREE.RingGeometry(0.04, 0.06, 32);
      const medinaRingMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const medinaRing = new THREE.Mesh(medinaRingGeometry, medinaRingMaterial);
      medinaRing.position.copy(medinaPoint);
      medinaRing.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(medinaRing);

      // حركة متوهجة للنقاط
      const animatePulses = () => {
        const time = Date.now() * 0.001;
        const scale = 1 + Math.sin(time * 2) * 0.2;
        
        meccaMarker.scale.set(scale, scale, scale);
        medinaMarker.scale.set(scale, scale, scale);
        
        const ringScale = 1 + Math.sin(time * 2) * 0.5;
        meccaRing.scale.set(ringScale, ringScale, ringScale);
        medinaRing.scale.set(ringScale, ringScale, ringScale);
        
        meccaRingMaterial.opacity = 0.3 + Math.sin(time * 2) * 0.2;
        medinaRingMaterial.opacity = 0.3 + Math.sin(time * 2) * 0.2;
      };

      // دوران الكرة الأرضية
      let rotationSpeed = 0.002;
      let isMouseDown = false;
      let previousMousePosition = { x: 0, y: 0 };

      const onMouseDown = (event: MouseEvent) => {
        isMouseDown = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
      };

      const onMouseMove = (event: MouseEvent) => {
        if (!isMouseDown) return;

        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y,
        };

        const rotationQuaternion = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            (deltaMove.y * Math.PI) / 180,
            (deltaMove.x * Math.PI) / 180,
            0,
            "XYZ"
          )
        );

        earth.quaternion.multiplyQuaternions(rotationQuaternion, earth.quaternion);
        meccaMarker.quaternion.multiplyQuaternions(rotationQuaternion, meccaMarker.quaternion);
        medinaMarker.quaternion.multiplyQuaternions(rotationQuaternion, medinaMarker.quaternion);
        meccaRing.quaternion.multiplyQuaternions(rotationQuaternion, meccaRing.quaternion);
        medinaRing.quaternion.multiplyQuaternions(rotationQuaternion, medinaRing.quaternion);

        previousMousePosition = { x: event.clientX, y: event.clientY };
      };

      const onMouseUp = () => {
        isMouseDown = false;
      };

      containerRef.current.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);

      // دالة الرسوم المتحركة
      const animate = () => {
        if (animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }

        if (earth && !isMouseDown) {
          earth.rotation.y += rotationSpeed;
        }

        animatePulses();
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

      window.addEventListener("resize", handleResize);

      // تنظيف
      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        containerRef.current?.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
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
        if (material) {
          material.dispose();
        }
        if (geometry) {
          geometry.dispose();
        }
        if (earthTexture) {
          earthTexture.dispose();
        }
        if (normalTexture) {
          normalTexture.dispose();
        }
      };
      } catch (error) {
        console.error("Error initializing EarthGlobe:", error);
        initialized = false;
      }
    }

    return () => {
      cancelAnimationFrame(initTimeout);
      if (cleanup) cleanup();
    };
  }, [meccaPosition, medinaPosition]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
      style={{ cursor: 'grab' }}
    />
  );
};
