import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const points = [];
let ortsvektorenVisible = true;
let vektorModus = false;
let selectedForVector = null;

export function getPoints() {
    return points;
}

export function addPoint(scene, position) {
    const id = points.length + 1;
    const label = `P${id}`;

    // Kugel
    const geo = new THREE.SphereGeometry(0.06);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    scene.add(mesh);

    // Beschriftung
    const sprite = createLabelSprite(label, 0xffff00);
    sprite.position.copy(position).add(new THREE.Vector3(0.1, 0.15, 0));
    scene.add(sprite);

    // Ortsvektor
    const arrow = createArrow(new THREE.Vector3(0, 0, 0), position, 0xffaa00);
    arrow.visible = ortsvektorenVisible;
    scene.add(arrow);

    const point = { id, label, position: position.clone(), mesh, sprite, arrow, scene };
    points.push(point);

    if (vektorModus) {
        handleVektorModus(point);
    }

    return point;
}

export function removePoint(label) {
    const idx = points.findIndex(p => p.label === label);
    if (idx === -1) return;
    const p = points[idx];
    p.scene.remove(p.mesh);
    p.scene.remove(p.sprite);
    p.scene.remove(p.arrow);
    points.splice(idx, 1);
}

export function toggleOrtsvektoren() {
    ortsvektorenVisible = !ortsvektorenVisible;
    points.forEach(p => { p.arrow.visible = ortsvektorenVisible; });
}

export function toggleVektorModus() {
    vektorModus = !vektorModus;
    selectedForVector = null;
    console.log('Vektorverbindungs-Modus:', vektorModus);
}

function handleVektorModus(point) {
    if (!selectedForVector) {
        selectedForVector = point;
        point.mesh.material.color.set(0xff6600);
    } else {
        // Verbindungsvektor zeichnen
        const from = selectedForVector.position;
        const to = point.position;
        const arrow = createArrow(from, to, 0x00ffff);
        point.scene.add(arrow);

        // Label für Verbindungsvektor
        const mid = from.clone().add(to).multiplyScalar(0.5);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dz = to.z - from.z;
        const vecLabel = `(${dx}|${dy}|${dz})`;
        const sprite = createLabelSprite(vecLabel, 0x00ffff);
        sprite.position.copy(mid).add(new THREE.Vector3(0, 0.2, 0));
        point.scene.add(sprite);

        selectedForVector.mesh.material.color.set(0xffff00);
        selectedForVector = null;
        vektorModus = false;
    }
}

function createArrow(from, to, color) {
    const dir = to.clone().sub(from);
    const length = dir.length();
    if (length < 0.001) return new THREE.Group();

    const arrow = new THREE.ArrowHelper(
        dir.normalize(),
        from,
        length,
        color,
        0.15,
        0.08
    );
    return arrow;
}

function createLabelSprite(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.4, 0.1, 1);
    return sprite;
}
