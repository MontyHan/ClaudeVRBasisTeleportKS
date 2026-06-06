import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { XRControllerModelFactory } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/XRControllerModelFactory.js';

let controller, controllerGrip;
let rig, scene;
let raycaster, marker;
let teleportActive = false;
let floorPlane;

const curve = new THREE.QuadraticBezierCurve3();
const points = [];
let arcLine;

export function initTeleport(renderer, _scene, _rig) {
    scene = _scene;
    rig = _rig;

    raycaster = new THREE.Raycaster();

    // Boden-Ebene für Teleport
    floorPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    floorPlane.rotation.x = -Math.PI / 2;
    scene.add(floorPlane);

    // Ziel-Marker
    const markerGeo = new THREE.RingGeometry(0.2, 0.25, 32);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
    marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = -Math.PI / 2;
    marker.visible = false;
    scene.add(marker);

    // Bogen-Linie
    const arcGeo = new THREE.BufferGeometry();
    const arcMat = new THREE.LineBasicMaterial({ color: 0x00ffff });
    arcLine = new THREE.Line(arcGeo, arcMat);
    arcLine.visible = false;
    scene.add(arcLine);

    // Linker Controller (index 0)
    controller = renderer.xr.getController(0);
    controller.addEventListener('selectstart', () => { teleportActive = true; });
    controller.addEventListener('selectend', onTeleport);
    scene.add(controller);

    const factory = new XRControllerModelFactory();
    controllerGrip = renderer.xr.getControllerGrip(0);
    controllerGrip.add(factory.createControllerModel(controllerGrip));
    scene.add(controllerGrip);
}

function onTeleport() {
    teleportActive = false;
    arcLine.visible = false;
    marker.visible = false;

    if (marker.visible === false) return;

    rig.position.x = marker.position.x;
    rig.position.z = marker.position.z;
}

export function updateTeleport() {
    if (!teleportActive) return;

    // Controller-Weltposition und -Richtung
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3();
    controller.getWorldPosition(origin);
    controller.getWorldDirection(direction).negate();

    // Bezier-Bogen
    const mid = origin.clone().add(direction.clone().multiplyScalar(3)).add(new THREE.Vector3(0, 1, 0));
    const end = origin.clone().add(direction.clone().multiplyScalar(6)).add(new THREE.Vector3(0, -1.5, 0));

    curve.v0 = origin;
    curve.v1 = mid;
    curve.v2 = end;

    const arcPoints = curve.getPoints(20);
    arcLine.geometry.setFromPoints(arcPoints);
    arcLine.visible = true;

    // Raycaster auf Boden
    raycaster.set(origin, direction);
    const hits = raycaster.intersectObject(floorPlane);

    if (hits.length > 0) {
        marker.position.copy(hits[0].point);
        marker.visible = true;
    } else {
        marker.visible = false;
    }
}
