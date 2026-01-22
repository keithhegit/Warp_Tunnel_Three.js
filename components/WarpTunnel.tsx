
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  LINE_COUNT, 
  TUNNEL_RADIUS, 
  TUNNEL_LENGTH, 
  COLORS, 
  CAMERA_Z, 
  INITIAL_SPEED 
} from '../constants';

interface WarpTunnelProps {
  speedMultiplier?: number;
}

// High-energy palette for warp speeds
const HIGH_SPEED_COLORS = [
  new THREE.Color(0x00ffff), // Neon Cyan
  new THREE.Color(0x00ccff), // Electric Blue
  new THREE.Color(0x0088ff), // Deep Sky Blue
  new THREE.Color(0x00ffa2), // Energy Green/Cyan
  new THREE.Color(0xffffff)  // Pure White
];

const WarpTunnel: React.FC<WarpTunnelProps> = ({ speedMultiplier = 0.2 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.z = CAMERA_Z;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const tunnelGeometry = new THREE.BufferGeometry();
    const tunnelPositions: number[] = [];
    const baseTunnelColors: number[] = [];
    const highSpeedTunnelColors: number[] = [];
    const velocityZ: number[] = [];

    for (let i = 0; i < LINE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = rand(TUNNEL_RADIUS * 0.1, TUNNEL_RADIUS * 1.5);
      const x = Math.cos(theta) * r * 2.5;
      const y = Math.sin(theta) * r * 1.5;
      const z = -Math.random() * TUNNEL_LENGTH;
      const len = rand(20, 100);

      tunnelPositions.push(x, y, z, x, y, z + len);

      const colorIdx = Math.floor(Math.random() * COLORS.length);
      const lowColor = COLORS[colorIdx];
      const highColor = HIGH_SPEED_COLORS[colorIdx];
      
      baseTunnelColors.push(lowColor.r, lowColor.g, lowColor.b, lowColor.r, lowColor.g, lowColor.b);
      highSpeedTunnelColors.push(highColor.r, highColor.g, highColor.b, highColor.r, highColor.g, highColor.b);
      velocityZ.push(rand(0.8, 3.5));
    }

    tunnelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tunnelPositions, 3));
    tunnelGeometry.setAttribute('color', new THREE.Float32BufferAttribute(baseTunnelColors, 3));
    
    const tunnelMaterial = new THREE.LineBasicMaterial({ 
      vertexColors: true, 
      transparent: true, 
      opacity: 0.9, 
      blending: THREE.AdditiveBlending 
    });
    
    const linesMesh = new THREE.LineSegments(tunnelGeometry, tunnelMaterial);
    scene.add(linesMesh);

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const baseSpeed = INITIAL_SPEED * speedMultiplier;
      
      // colorMix now starts from 0.2 and goes to 2.0
      const colorMix = THREE.MathUtils.clamp((speedMultiplier - 0.2) / 1.8, 0, 1);

      if (speedMultiplier > 1.2) {
        const intensity = (speedMultiplier - 1.2) * 1.2;
        camera.position.x = (Math.sin(time * 30) + Math.sin(time * 17) * 0.5) * intensity;
        camera.position.y = (Math.sin(time * 25) + Math.sin(time * 19) * 0.5) * intensity;
      } else {
        camera.position.x *= 0.9; 
        camera.position.y *= 0.9;
      }

      const posAttr = tunnelGeometry.attributes.position, colAttr = tunnelGeometry.attributes.color;
      const posArr = posAttr.array as Float32Array, colArr = colAttr.array as Float32Array;
      for (let i = 0; i < LINE_COUNT; i++) {
        const speed = baseSpeed * velocityZ[i], z1 = i * 6 + 2, z2 = i * 6 + 5;
        posArr[z1] += speed; posArr[z2] += speed;
        
        if (posArr[z1] > CAMERA_Z + 200) {
          const len = posArr[z2] - posArr[z1], newZ = -TUNNEL_LENGTH;
          posArr[z1] = newZ; posArr[z2] = newZ + len;
        }
        
        const cIdx = i * 6;
        for (let j = 0; j < 6; j++) {
          colArr[cIdx+j] = THREE.MathUtils.lerp(baseTunnelColors[cIdx+j], highSpeedTunnelColors[cIdx+j], colorMix);
        }
      }
      posAttr.needsUpdate = true; 
      colAttr.needsUpdate = true;

      linesMesh.rotation.z += 0.001 * speedMultiplier;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
      tunnelGeometry.dispose(); 
      tunnelMaterial.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) containerRef.current.removeChild(renderer.domElement);
    };
  }, [speedMultiplier]);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full bg-black" />;
};

export default WarpTunnel;
