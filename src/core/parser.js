import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function parseZahl(str) {
    str = str.trim().replace(',', '.');
    const val = parseFloat(str);
    if (isNaN(val)) throw new Error(`Ungültige Zahl: "${str}"`);
    return val;
}

function parseVektor(str) {
    // Erwartet: (x, y, z) oder x,y,z oder x;y;z
    str = str.trim().replace(/[()[\]{}]/g, '');
    const parts = str.split(/[,;|\s]+/).filter(Boolean);
    if (parts.length !== 3) throw new Error(`Vektor braucht 3 Komponenten: "${str}"`);
    return new THREE.Vector3(parseZahl(parts[0]), parseZahl(parts[1]), parseZahl(parts[2]));
}

// ─── Punkt-Parser ─────────────────────────────────────────────────────────────

export function parsePunkt(input) {
    // "A(1, 2, 3)" oder "1, 2, 3" oder "(1|2|3)"
    const match = input.match(/^([A-Za-z]\w*)?\s*\(?\s*([\d\s,;|.+-]+)\)?$/);
    if (!match) throw new Error(`Ungültiger Punkt: "${input}"`);

    const label = match[1] || null;
    const vektor = parseVektor(match[2]);
    return { label, position: vektor };
}

// ─── Vektor-Parser ────────────────────────────────────────────────────────────

export function parseVektorInput(input) {
    return parseVektor(input);
}

// ─── Geraden-Parser ───────────────────────────────────────────────────────────

export function parseGerade(input) {
    input = input.trim();

    // Parameterform: "X = (1,2,3) + t*(4,5,6)"
    const paramMatch = input.match(
        /X\s*=\s*\(?([\d\s.,;|+-]+)\)?\s*\+\s*t\s*[*·]?\s*\(?([\d\s.,;|+-]+)\)?/i
    );
    if (paramMatch) {
        return {
            modus: 'punktvektor',
            punkt: parseVektor(paramMatch[1]),
            vektor: parseVektor(paramMatch[2])
        };
    }

    // Zwei-Punkte-Form: "P(1,2,3) Q(4,5,6)"
    const zweiPunkteMatch = input.match(
        /\(?([\d\s.,;|+-]+)\)?\s+\(?([\d\s.,;|+-]+)\)?/
    );
    if (zweiPunkteMatch) {
        return {
            modus: '2punkte',
            p1: parseVektor(zweiPunkteMatch[1]),
            p2: parseVektor(zweiPunkteMatch[2])
        };
    }

    throw new Error(`Gerade konnte nicht geparst werden: "${input}"`);
}

// ─── Ebenen-Parser ────────────────────────────────────────────────────────────

export function parseEbene(input) {
    input = input.trim();

    // Normalenform: "n*(x - p) = 0" oder "ax + by + cz = d"
    const koordinatenMatch = input.match(
        /^([-\d.]+)x\s*([+-]\s*[\d.]+)y\s*([+-]\s*[\d.]+)z\s*=\s*([-\d.]+)$/i
    );
    if (koordinatenMatch) {
        const a = parseZahl(koordinatenMatch[1]);
        const b = parseZahl(koordinatenMatch[2].replace(/\s/g, ''));
        const c = parseZahl(koordinatenMatch[3].replace(/\s/g, ''));
        const d = parseZahl(koordinatenMatch[4]);
        const normal = new THREE.Vector3(a, b, c);
        const punkt = normal.clone().multiplyScalar(d / normal.lengthSq());
        return {
            modus: 'normalvektor',
            punkt,
            normal
        };
    }

    // Parameterform: "X = (1,2,3) + s*(1,0,0) + t*(0,1,0)"
    const paramMatch = input.match(
        /X\s*=\s*\(?([\d\s.,;|+-]+)\)?\s*\+\s*s\s*[*·]?\s*\(?([\d\s.,;|+-]+)\)?\s*\+\s*t\s*[*·]?\s*\(?([\d\s.,;|+-]+)\)?/i
    );
    if (paramMatch) {
        return {
            modus: 'parameterform',
            stuetz: parseVektor(paramMatch[1]),
            v1: parseVektor(paramMatch[2]),
            v2: parseVektor(paramMatch[3])
        };
    }

    // 3-Punkte-Form: "(1,2,3) (4,5,6) (7,8,9)"
    const dreiPunkteMatch = input.match(
        /\(?([\d\s.,;|+-]+)\)?\s+\(?([\d\s.,;|+-]+)\)?\s+\(?([\d\s.,;|+-]+)\)?/
    );
    if (dreiPunkteMatch) {
        return {
            modus: '3punkte',
            p1: parseVektor(dreiPunkteMatch[1]),
            p2: parseVektor(dreiPunkteMatch[2]),
            p3: parseVektor(dreiPunkteMatch[3])
        };
    }

    throw new Error(`Ebene konnte nicht geparst werden: "${input}"`);
}

// ─── Berechnung-Parser ────────────────────────────────────────────────────────

export function parseBerechnung(input) {
    input = input.trim().toLowerCase();

    // Abstand Punkt-Punkt
    if (input.match(/abstand.*punkt.*punkt|d\(.*,.*\)/)) {
        return { typ: 'abstand-punkt-punkt' };
    }

    // Abstand Punkt-Gerade
    if (input.match(/abstand.*punkt.*gerade/)) {
        return { typ: 'abstand-punkt-gerade' };
    }

    // Abstand Punkt-Ebene
    if (input.match(/abstand.*punkt.*ebene/)) {
        return { typ: 'abstand-punkt-ebene' };
    }

    // Winkel
    if (input.match(/winkel/)) {
        return { typ: 'winkel' };
    }

    // Schnittpunkt
    if (input.match(/schnitt/)) {
        return { typ: 'schnittpunkt' };
    }

    return { typ: 'unbekannt' };
}
