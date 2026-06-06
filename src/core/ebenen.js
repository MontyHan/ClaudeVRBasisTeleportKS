
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const ebenen = [];
let beschriftungenVisible = true;

export function getEbenen() {
    return ebenen;
}

export function addEbene(scene, params) {
    // params: { modus: '3punkte', p1, p2, p3 }
    // oder   { modus: 'normalvektor', punkt, normal }
    // oder   { modus: 'parameterform', stuetz, v1, v2 }

    let stuetz, normal, v1, v2;

    if (params.modus === '3punkte') {
        stuetz = params.p1.clone();
        v1 = params.p2.clone().sub(params.p1);
        v2 = params.p3.clone().sub(params.p1);
        normal = v1.clone().cross(v2).normalize();
    } else if (params.modus === 'normalvektor') {
        stuetz = params.punkt.clone();
        normal = params.normal.clone().normalize();
        // Hilfsvektor für v1/v2
        const hilf = Math.abs(normal.x) < 0.9
            ? new THREE.Vector3(1, 0, 0)
            : new THREE.Vector3(0, 1, 0);
        v1 = hilf.clone().cross(normal).normalize();
        v2 = normal.clone().cross(v1).normalize();
    } else if (params.modus === 'parameterform') {
        stuetz = params.stuetz.clone();
        v1 = params.v1.clone();
        v2 = params.v2.clone();
        normal = v1.clone().cross(v2).normalize();
    } else {
        console.warn('Unbekannter Ebenen-Modus:', params.modus);
        return;
    }

    const id = ebenen.length + 1;
    const label = `E${id}`;

    // Ebenen-Fläche (Plane Geometry)
    const size = 6;
    const geo = new THREE.PlaneGeometry(size, size, 10, 10);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);

    // Ebene ausrichten
    mesh.position.copy(stuetz);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    mesh.setRotationFromQuaternion(quaternion);
    scene.add(mesh);

    // Normalvektor-Pfeil
    const arrow = new THREE.ArrowHelper(
        normal,
        stuetz,
        1.5,
        0x4488ff,
        0.2,
        0.1
    );
    scene.add(arrow);

    // Gitterlinien auf der Ebene
    const gridHelper = createEbenenGrid(stuetz, v1, v2, size);
    scene.add(gridHelper);

    // Beschriftung
    const nx = normal.x.toFixed(2);
    const ny = normal.y.toFixed(2);
    const nz = normal.z.toFixed(2);
    const d = normal.dot(stuetz).toFixed(2);
    const gleichung = `${label}: ${nx}x + ${ny}y + ${nz}z = ${d}`;

    const sprite = createTextSprite(gleichung, 0x88bbff);
    sprite.position.copy(stuetz).add(new THREE.Vector3(0, 0.4, 0));
    sprite.visible = beschriftungenVisible;
    scene.add(sprite);

    const ebene = {
        id, label, stuetz, normal, v1, v2,
        mesh, arrow, gridHelper, sprite,
        scene
    };
    ebenen.push(ebene);
    return ebene;
}

export function removeEbene(label) {
    const idx = ebenen.findIndex(e => e.label === label);
    if (idx === -1) return;
    const e = ebenen[idx];
    e.scene.remove(e.mesh);
    e.scene.remove(e.arrow);
    e.scene.remove(e.gridHelper);
    e.scene.remove(e.sprite);
    ebenen.splice(idx, 1);
}

export function toggleEbenenBeschriftungen() {
    beschriftungenVisible = !beschriftungenVisible;
    ebenen.forEach(e => {
        e.sprite.visible = beschriftungenVisible;
    });
}

function createEbenenGrid(stuetz, v1, v2, size) {
    const group = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color: 0x2255aa, transparent: true, opacity: 0.4 });
    const steps = 6;
    const half = size / 2;

    for (let i = -steps; i <= steps; i++) {
        const t = (i / steps) * half;

        // Linien entlang v1
        const a1 = stuetz.clone().add(v1.clone().multiplyScalar(t)).add(v2.clone().multiplyScalar(-half));
        const b1 = stuetz.clone().add(v1.clone().multiplyScalar(t)).add(v2.clone().multiplyScalar(half));
        const geo1 = new THREE.BufferGeometry().setFromPoints([a1, b1]);
        group.add(new THREE.Line(geo1, mat));

        // Linien entlang v2
        const a2 = stuetz.clone().add(v2.clone().multiplyScalar(t)).add(v1.clone().multiplyScalar(-half));
        const b2 = stuetz.clone().add(v2.clone().multiplyScalar(t)).add(v1.clone().multiplyScalar(half));
        const geo2 = new THREE.BufferGeometry().setFromPoints([a2, b2]);
        group.add(new THREE.Line(geo2, mat));
    }

    return group;
}

function createTextSprite(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 64);
    ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 8, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.9, 0.12, 1);
    return sprite;
}
