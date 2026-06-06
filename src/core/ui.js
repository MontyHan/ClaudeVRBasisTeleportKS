import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { XRControllerModelFactory } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/XRControllerModelFactory.js';
import { addPoint, toggleOrtsvektoren, toggleVektorModus, getPoints, removePoint } from './points.js';
import { addGerade, toggleBeschriftungen } from './geraden.js';

let controller, controllerGrip;
let scene;
let menuPanel, menuVisible = false;
let menuItems = [];
let raycaster;
let prevTrigger = false;
let prevThumbstick = false;

const MENU_ITEMS = [
    { label: 'Ortsvektoren ein/aus', action: () => toggleOrtsvektoren() },
    { label: 'Vektorverbindung Modus', action: () => toggleVektorModus() },
    { label: 'Beschriftungen ein/aus', action: () => toggleBeschriftungen() },
    { label: 'Gerade (2 Punkte)', action: () => setGeradenModus('2punkte') },
    { label: 'Gerade (Punkt+Vektor)', action: () => setGeradenModus('punktvektor') },
    { label: 'Objekte anzeigen', action: () => showObjektListe() },
    { label: 'Menü schließen', action: () => toggleMenu() },
];

export function initUI(renderer, _scene) {
    scene = _scene;
    raycaster = new THREE.Raycaster();

    // Rechter Controller (index 1)
    controller = renderer.xr.getController(1);
    controller.addEventListener('selectstart', onRightTrigger);
    scene.add(controller);

    const factory = new XRControllerModelFactory();
    controllerGrip = renderer.xr.getControllerGrip(1);
    controllerGrip.add(factory.createControllerModel(controllerGrip));
    scene.add(controllerGrip);

    buildMenu();
}

function buildMenu() {
    menuPanel = new THREE.Group();
    menuPanel.visible = false;
    scene.add(menuPanel);

    const bgGeo = new THREE.PlaneGeometry(1.2, MENU_ITEMS.length * 0.18 + 0.1);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    menuPanel.add(bg);

    menuItems = [];
    MENU_ITEMS.forEach((item, i) => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, 16, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const geo = new THREE.PlaneGeometry(1.1, 0.15);
        const mesh = new THREE.Mesh(geo, mat);

        const yOffset = (MENU_ITEMS.length / 2 - i) * 0.18 - 0.09;
        mesh.position.set(0, yOffset, 0.001);
        menuPanel.add(mesh);
        menuItems.push({ mesh, action: item.action });
    });
}

export function toggleMenu() {
    menuVisible = !menuVisible;
    menuPanel.visible = menuVisible;

    if (menuVisible) {
        // Menü vor dem Controller platzieren
        const pos = new THREE.Vector3();
        controller.getWorldPosition(pos);
        menuPanel.position.copy(pos).add(new THREE.Vector3(0, 0.3, -0.5));
        menuPanel.lookAt(pos);
    }
}

function onRightTrigger() {
    if (menuVisible) {
        checkMenuClick();
    } else {
        handlePointPlacement();
    }
}

function handlePointPlacement() {
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3();
    controller.getWorldPosition(origin);
    controller.getWorldDirection(direction).negate();

    // Punkt auf Gitter-Ebene platzieren (y=0)
    if (direction.y !== 0) {
        const t = -origin.y / direction.y;
        if (t > 0) {
            const point = origin.clone().add(direction.clone().multiplyScalar(t));
            point.x = Math.round(point.x);
            point.z = Math.round(point.z);
            point.y = 0;
            addPoint(scene, point);
        }
    }
}

function checkMenuClick() {
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3();
    controller.getWorldPosition(origin);
    controller.getWorldDirection(direction).negate();

    raycaster.set(origin, direction);
    const meshes = menuItems.map(i => i.mesh);
    const hits = raycaster.intersectObjects(meshes);

    if (hits.length > 0) {
        const hit = hits[0].object;
        const item = menuItems.find(i => i.mesh === hit);
        if (item) item.action();
    }
}

let geradenModus = null;

function setGeradenModus(modus) {
    geradenModus = modus;
    menuVisible = false;
    menuPanel.visible = false;
    console.log('Geraden-Modus:', modus);
}

function showObjektListe() {
    const pts = getPoints();
    console.log('Punkte:', pts);
    // TODO: visuelle Liste im VR-Raum
}

export function updateUI() {
    if (!menuVisible) return;

    // Menü immer zur Kamera ausrichten
    const camPos = new THREE.Vector3();
    // Kamera-Position aus der Scene holen
    scene.traverse(obj => {
        if (obj.isCamera) camPos.copy(obj.getWorldPosition(new THREE.Vector3()));
    });
    if (camPos.lengthSq() > 0) {
        menuPanel.lookAt(camPos);
    }
}
