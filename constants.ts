
import * as THREE from 'three';

export const LINE_COUNT = 4000;
export const TUNNEL_RADIUS = 120;
export const TUNNEL_LENGTH = 1200;
export const CAMERA_Z = 100;

export const COLORS = [
  new THREE.Color(0xff0000), // Red
  new THREE.Color(0xff0055), // Pinkish Red
  new THREE.Color(0x800080), // Purple
  new THREE.Color(0xff00ff), // Magenta
  new THREE.Color(0xffffff)  // White highlights
];

// Adjusted base speed so 0.2 (20%) is slow and 2.0 (200%) is fast
export const INITIAL_SPEED = 6;
