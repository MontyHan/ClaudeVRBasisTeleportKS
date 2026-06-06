import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const geraden = [];
let beschriftungenVisible = true;

export function getGeraden() {
    return geraden;
}

export function addGerade(scene, params) {
    // params: { modus: '2punkte', p1, p2 } oder { modus: 'punktvektor', punkt, vektor }
    let stuetz, richtung;

    if (params.modus === '2punkte') {
        stuetz = params.p1.clone();
        richtung = params.p2.clone().sub(params.p1).normalize();
    } else if (params.modus === 'punktvektor') {
        stuetz = params.punkt.clone();
        richtung = params.vektor.clone().normalize();
    } else {
        console.warn('Unbekannter Geraden-Modus:', params.modus);
        return;
    }

    const id = geraden.length + 1;
    const label = `g${id}`;

    // Linie zeichnen (von -10 bis +10 entlang Richtungsvektor)
    const start = stuetz.clone().add(richtung.clone().multiplyScalar(-10));
    const end = stuetz.clone().add(richtung.clone().multiplyScalar(10));

    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({ color: 0xff4444, linewidth: 2 });
    const line = new THREE.Line(geo, mat);
    scene.add(line);

    // Richtungspfeil am Stützpunkt
    const arrow = new THREE.ArrowHelper(
        richtung,
        stuetz,
        1.5,
        0xff4444,
        0.2,
        0.1
    );
    scene.add(arrow);

    // Beschriftung
    const sprite = createGeradenLabel(label, stuetz, richtung);
    sprite.visible = beschriftungenVisible;
    scene.add(sprite);

    // Gleichung als Text
    const rx = richtung.x.toFixed(1);
    const ry = richtung.y.toFixed(1);
    const rz = richtung.z.toFixed(1);
    const sx = stuetz.x.toFixed(1);
    const sy = stuetz.y.toFixed(1);
    const sz = stuetz.z.toFixed(1);
    const gleichung = `${label}: (${sx}|${sy}|${sz}) + t·(${rx}|${ry}|${rz})`;

    const eqSprite = createTextSprite(gleichung, 0xff8888);
    const eqPos = stuetz.clone().add(new THREE.Vector3(0, 0.3, 0));
    eqSprite.position.copy(eqPos);
    eqSprite.visible = beschriftungenVisible;
    scene.add(eqSprite);

    const gerade = {
        id, label, stuetz, richtung,
        line, arrow, sprite, eqSprite,
        scene
    };
    geraden.push(gerade);
    return gerade;
}

export function removeGerade(label) {
    const idx = geraden.findIndex(g => g.label === label);
    if (idx === -1) return;
    const g = geraden[idx];
    g.scene.remove(g.line);
    g.scene.remove(g.arrow);
    g.scene.remove(g.sprite);
    g.scene.remove(g.eqSprite);
    geraden.splice(idx, 1);
}

export function toggleBeschriftungen() {
    beschriftungenVisible = !beschriftungenVisible;
    geraden.forEach(g => {
        g.sprite.visible = beschriftungenVisible;
        g.eqSprite.visible = beschriftungenVisible;
    });
}

function createGeradenLabel(text, position, richtung) {
    const sprite = createTextSprite(text, 0xff4444);
    const offset = new THREE.Vector3(0.1, 0.1, 0).add(richtung.clone().multiplyScalar(0.5));
    sprite.position.copy(position).add(offset);
    return sprite;
}

function createTextSprite(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 64);
    ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 8, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.8, 0.1, 1);
    return sprite;
}
