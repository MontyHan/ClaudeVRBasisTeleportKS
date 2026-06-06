import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ─── Punkte ───────────────────────────────────────────────────────────────────

export function abstandPunktPunkt(p1, p2) {
    return p1.distanceTo(p2);
}

export function verbindungsvektor(p1, p2) {
    return p2.clone().sub(p1);
}

export function mittelpunkt(p1, p2) {
    return p1.clone().add(p2).multiplyScalar(0.5);
}

// ─── Vektoren ─────────────────────────────────────────────────────────────────

export function betrag(v) {
    return v.length();
}

export function skalarprodukt(v1, v2) {
    return v1.dot(v2);
}

export function kreuzprodukt(v1, v2) {
    return v1.clone().cross(v2);
}

export function winkelZwischen(v1, v2) {
    const cos = v1.dot(v2) / (v1.length() * v2.length());
    return THREE.MathUtils.radToDeg(Math.acos(Math.max(-1, Math.min(1, cos))));
}

export function sindOrthogonal(v1, v2, epsilon = 0.001) {
    return Math.abs(v1.dot(v2)) < epsilon;
}

export function sindParallel(v1, v2, epsilon = 0.001) {
    const cross = v1.clone().cross(v2);
    return cross.length() < epsilon;
}

// ─── Geraden ──────────────────────────────────────────────────────────────────

export function punktAufGerade(stuetz, richtung, t) {
    return stuetz.clone().add(richtung.clone().multiplyScalar(t));
}

export function abstandPunktGerade(punkt, stuetz, richtung) {
    const r = richtung.clone().normalize();
    const ap = punkt.clone().sub(stuetz);
    const proj = r.clone().multiplyScalar(ap.dot(r));
    return ap.clone().sub(proj).length();
}

export function lotfusspunktPunktGerade(punkt, stuetz, richtung) {
    const r = richtung.clone().normalize();
    const ap = punkt.clone().sub(stuetz);
    const t = ap.dot(r);
    return stuetz.clone().add(r.multiplyScalar(t));
}

export function geradenSchnittpunkt(s1, r1, s2, r2) {
    // Löst s1 + t*r1 = s2 + u*r2
    // Gibt { schnittpunkt, t, u } oder null zurück
    const d = s2.clone().sub(s1);
    const r1r2 = r1.clone().cross(r2);
    const denom = r1r2.lengthSq();

    if (denom < 0.0001) {
        // parallel oder identisch
        return null;
    }

    const t = d.clone().cross(r2).dot(r1r2) / denom;
    const u = d.clone().cross(r1).dot(r1r2) / denom;

    const punkt1 = s1.clone().add(r1.clone().multiplyScalar(t));
    const punkt2 = s2.clone().add(r2.clone().multiplyScalar(u));

    if (punkt1.distanceTo(punkt2) > 0.01) {
        return null; // windschief
    }

    return { schnittpunkt: punkt1, t, u };
}

export function geradenLagebeziehung(s1, r1, s2, r2) {
    if (sindParallel(r1, r2)) {
        // parallel oder identisch?
        const verbindung = s2.clone().sub(s1);
        if (sindParallel(verbindung, r1) || verbindung.length() < 0.001) {
            return 'identisch';
        }
        return 'parallel';
    }

    const schnitt = geradenSchnittpunkt(s1, r1, s2, r2);
    if (schnitt) return 'schneidend';
    return 'windschief';
}

export function abstandWindschiefeGeraden(s1, r1, s2, r2) {
    const normal = r1.clone().cross(r2).normalize();
    if (normal.length() < 0.001) return null;
    return Math.abs(s2.clone().sub(s1).dot(normal));
}

// ─── Ebenen ───────────────────────────────────────────────────────────────────

export function abstandPunktEbene(punkt, stuetz, normal) {
    const n = normal.clone().normalize();
    const d = n.dot(stuetz);
    return Math.abs(n.dot(punkt) - d);
}

export function lotfusspunktPunktEbene(punkt, stuetz, normal) {
    const n = normal.clone().normalize();
    const d = n.dot(stuetz);
    const t = n.dot(punkt) - d;
    return punkt.clone().sub(n.clone().multiplyScalar(t));
}

export function ebeneGeradenSchnittpunkt(stuetzE, normalE, stuetzG, richtungG) {
    const n = normalE.clone().normalize();
    const denom = n.dot(richtungG);

    if (Math.abs(denom) < 0.0001) {
        // Gerade parallel zur Ebene
        return null;
    }

    const d = n.dot(stuetzE);
    const t = (d - n.dot(stuetzG)) / denom;
    return stuetzG.clone().add(richtungG.clone().multiplyScalar(t));
}

export function ebenenSchnittgerade(s1, n1, s2, n2) {
    const richtung = n1.clone().cross(n2);
    if (richtung.length() < 0.001) return null; // parallel

    // Einen Punkt auf der Schnittgeraden finden
    const d1 = n1.dot(s1);
    const d2 = n2.dot(s2);

    // Lösung über LGS (vereinfacht)
    const n1n2 = n1.dot(n2);
    const n1n1 = n1.dot(n1);
    const n2n2 = n2.dot(n2);
    const denom = n1n1 * n2n2 - n1n2 * n1n2;

    if (Math.abs(denom) < 0.0001) return null;

    const c1 = (d1 * n2n2 - d2 * n1n2) / denom;
    const c2 = (d2 * n1n1 - d1 * n1n2) / denom;

    const punkt = n1.clone().multiplyScalar(c1).add(n2.clone().multiplyScalar(c2));

    return { stuetz: punkt, richtung: richtung.normalize() };
}

export function ebenenLagebeziehung(s1, n1, s2, n2) {
    if (sindParallel(n1, n2)) {
        const abstand = abstandPunktEbene(s1, s2, n2);
        if (abstand < 0.001) return 'identisch';
        return 'parallel';
    }
    return 'schneidend';
}

export function winkelZwischenEbenen(n1, n2) {
    return winkelZwischen(n1, n2);
}

export function winkelGeradEbene(richtung, normal) {
    const sin = Math.abs(richtung.clone().normalize().dot(normal.clone().normalize()));
    return THREE.MathUtils.radToDeg(Math.asin(Math.max(-1, Math.min(1, sin))));
}

// ─── Ergebnis formatieren ─────────────────────────────────────────────────────

export function formatVector(v, dez = 2) {
    return `(${v.x.toFixed(dez)} | ${v.y.toFixed(dez)} | ${v.z.toFixed(dez)})`;
}

export function formatZahl(z, dez = 4) {
    return parseFloat(z.toFixed(dez)).toString();
}
