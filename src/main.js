import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/VRButton.js';
import { initCoordinateSystem } from './src/core/coordinateSystem.js';
import { initTeleport, updateTeleport } from './src/core/teleport.js';
import { initUI, updateUI } from './src/core/ui.js';
import { initPoints, toggleOrtsvektoren } from './src/core/points.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Rig
const rig = new THREE.Group();
rig.position.set(-5, 0, -5);
rig.add(camera);
scene.add(rig);

// Licht
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(light);

// Koordinatensystem
initCoordinateSystem(scene);

// Punkte-System
initPoints(scene);

// Teleport
initTeleport(renderer, scene, rig);

// UI
initUI(renderer, scene);

// Gamepad-Buttons überwachen
let prevAX = false;
let prevB = false;

function checkGamepadButtons() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

  for (const gp of gamepads) {
    if (!gp) continue;

    // Taste A (index 4) oder X (index 4 linker Controller) → Ortsvektoren
    const aPressed = gp.buttons[4]?.pressed;
    if (aPressed && !prevAX) {
      toggleOrtsvektoren();
    }
    prevAX = aPressed;

    // Taste B (index 5) → Modus wechseln
    const bPressed = gp.buttons[5]?.pressed;
    if (bPressed && !prevB) {
      import('./src/core/points.js').then(m => m.toggleVektorModus());
    }
    prevB = bPressed;
  }
}

// Gitter
const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
scene.add(grid);

// Kamera initial auf Ursprung ausrichten
camera.lookAt(0, 0, 0);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
  checkGamepadButtons();
  updateTeleport();
  updateUI();
  renderer.render(scene, camera);
});
