import { formatVector, formatZahl } from '../core/berechnungen.js';

const container = document.getElementById('ergebnis-container');
const liste = document.getElementById('ergebnis-liste');

// ─── Haupt-Anzeigefunktion ────────────────────────────────────────────────────

export function zeigeErgebnis(typ, daten) {
    const eintrag = document.createElement('div');
    eintrag.classList.add('ergebnis-eintrag');

    switch (typ) {
        case 'abstand':
            eintrag.innerHTML = ergebnisAbstand(daten);
            break;
        case 'winkel':
            eintrag.innerHTML = ergebnisWinkel(daten);
            break;
        case 'schnittpunkt':
            eintrag.innerHTML = ergebnisSchnittpunkt(daten);
            break;
        case 'schnittgerade':
            eintrag.innerHTML = ergebnisSchnittgerade(daten);
            break;
        case 'lagebeziehung':
            eintrag.innerHTML = ergebnisLagebeziehung(daten);
            break;
        case 'lotfusspunkt':
            eintrag.innerHTML = ergebnisLotfusspunkt(daten);
            break;
        case 'projektion':
            eintrag.innerHTML = ergebnisProjektion(daten);
            break;
        default:
            eintrag.innerHTML = `<p class="ergebnis-unbekannt">Unbekannter Ergebnistyp: ${typ}</p>`;
    }

    // Schließen-Button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.classList.add('ergebnis-close');
    closeBtn.addEventListener('click', () => eintrag.remove());
    eintrag.appendChild(closeBtn);

    liste.prepend(eintrag);
    container.style.display = 'block';
}

export function alleErgebnisseLoeschen() {
    liste.innerHTML = '';
    container.style.display = 'none';
}

// ─── Ergebnis-Templates ───────────────────────────────────────────────────────

function ergebnisAbstand(d) {
    return `
        <h3>📏 Abstand</h3>
        <p class="ergebnis-beschreibung">${d.beschreibung || ''}</p>
        <p class="ergebnis-wert">${formatZahl(d.abstand)} <span class="einheit">LE</span></p>
        ${d.rechenweg ? rechenweg(d.rechenweg) : ''}
    `;
}

function ergebnisWinkel(d) {
    return `
        <h3>📐 Winkel</h3>
        <p class="ergebnis-beschreibung">${d.beschreibung || ''}</p>
        <p class="ergebnis-wert">${formatZahl(d.winkel)}°</p>
        ${d.rechenweg ? rechenweg(d.rechenweg) : ''}
    `;
}

function ergebnisSchnittpunkt(d) {
    if (!d.punkt) {
        return `
            <h3>✖ Kein Schnittpunkt</h3>
            <p class="ergebnis-beschreibung">${d.beschreibung || 'Die Objekte schneiden sich nicht.'}</p>
        `;
    }
    return `
        <h3>✔ Schnittpunkt</h3>
        <p class="ergebnis-beschreibung">${d.beschreibung || ''}</p>
        <p class="ergebnis-wert">${formatVector(d.punkt)}</p>
        ${d.rechenweg ? rechenweg(d.rechenweg) : ''}
    `;
}

function ergebnisSchnittgerade(d) {
    if (!d.gerade) {
        return `
            <h3>✖ Keine Schnittgerade</h3>
            <p class="ergebnis-beschreibung">${d.beschreibung || 'Die Ebenen sind parallel.'}</p>
        `;
    }
    return `
        <h3>✔ Schnittgerade</h3>
        <p class="ergebnis-beschreibung">${d.beschreibung || ''}</p>
        <p class="ergebnis-label">Stützvektor:</p>
        <p class="ergebnis-wert">${formatVector(d.gerade.stuetz)}</p>
        <p class="ergebnis-label">Richtungsvektor:</p>
        <p class="ergebnis-wert">${formatVector(d.gerade.richtung)}</p>
        ${d.rechenweg ? rechenweg(d.rechenweg) : ''}
    `;
}

function ergebnisLagebeziehung(d) {
    const icons = {
        'identisch': '🟰',
        'parallel': '⇉',
        'schneidend': '✂',
        'windschief': '↗'
    };
    const icon = icons[d.lage] || '❓';
    return `
        <h3>${icon} Lagebeziehung</h3>
        <p class="ergebnis-beschreibung">${d.beschreibung || ''}</p>
        <p class="ergebnis-wert ergebnis-lage-${d.lage}">${d.lage}</p>
        ${d.zusatz ? `<p class="ergebnis-zusatz">${d.zusatz}</p>` : ''}
        ${d.rechenweg ? rechenweg(d.rechenweg) : ''}
    `;
}

function ergebnisLotfusspunkt(d) {
    return `
        <h3>📍 Lotfußpunkt</h3>
        <p class="ergebnis-beschreibung">${d.beschreibung || ''}</p>
        <p class="ergebnis-wert">${formatVector(d.punkt)}</p>
        ${d.abstand !== undefined
            ? `<p class="ergebnis-zusatz">Abstand: ${formatZahl(d.abstand)} LE</p>`
            : ''}
        ${d.rechenweg ? rechenweg(d.rechenweg) : ''}
    `;
}

function ergebnisProjektion(d) {
    return `
        <h3>🔽 Projektion</h3>
        <p class="ergebnis-beschreibung">${d.beschreibung || ''}</p>
        <p class="ergebnis-label">Projektionsvektor:</p>
        <p class="ergebnis-wert">${formatVector(d.projektion)}</p>
        ${d.rechenweg ? rechenweg(d.rechenweg) : ''}
    `;
}

// ─── Rechenweg ────────────────────────────────────────────────────────────────

function rechenweg(schritte) {
    if (!schritte || schritte.length === 0) return '';
    const items = schritte.map(s => `<li>${s}</li>`).join('');
    return `
        <details class="rechenweg">
            <summary>Rechenweg anzeigen</summary>
            <ol>${items}</ol>
        </details>
    `;
}
