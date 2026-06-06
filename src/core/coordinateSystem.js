import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function initCoordinateSystem(scene) {

    const range = 10;

    // Achsen
    // X = nach vorne (in THREE: -Z), Y = nach rechts (in THREE: X), Z = nach oben (in THREE: Y)

    const axes = [
        { dir: new THREE.Vector3(0, 0, -1), color: 0xff4444, label: 'x' },  // vorne
        { dir: new THREE.Vector3(1, 0, 0),  color: 0x44ff44, label: 'y' },  // rechts
        { dir: new THREE.Vector3(0, 1, 0),  color: 0x4444ff, label: 'z' },  // oben
    ];

    for (const axis of axes) {
        // positive Richtung
        const posGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            axis.dir.clone().multiplyScalar(range)
        ]);
        const posMat = new THREE.LineBasicMaterial({ color: axis.color });
        scene.add(new THREE.Line(posGeo, posMat));

        // negative Richtung (gestrichelt simuliert durch dunklere Farbe)
        const negGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            axis.dir.clone().multiplyScalar(-range)
        ]);
        const negMat = new THREE.LineBasicMaterial({ color: axis.color, opacity: 0.3, transparent: true });
        scene.add(new THREE.Line(negGeo, negMat));

        // Beschriftungen entlang der Achse
        for (let i = -range; i <= range; i++) {
            if (i === 0) continue;
            const pos = axis.dir.clone().multiplyScalar(i);
            addLabel(scene, `${i}`, pos, axis.color);
        }

        // Achsenbeschriftung
        const labelPos = axis.dir.clone().multiplyScalar(range + 0.5);
        addLabel(scene, axis.label, labelPos, axis.color, true);
    }

    // Ursprung
    const originGeo = new THREE.SphereGeometry(0.05);
    const originMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    scene.add(new THREE.Mesh(originGeo, originMat));
    addLabel(scene, '0', new THREE.Vector3(0.1, 0.1, 0.1), 0xffffff);
}

function addLabel(scene, text, position, color, big = false) {
    const canvas = document.createElement('canvas');
    canvas.width = big ? 128 : 64;
    canvas.height = big ? 128 : 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
    ctx.font = big ? 'bold 64px Arial' : 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(position);
    sprite.scale.set(big ? 0.6 : 0.3, big ? 0.6 : 0.3, 1);
    scene.add(sprite);
}
