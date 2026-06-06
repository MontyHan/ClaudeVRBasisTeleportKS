import { parsePunkt, parseVektorInput, parseGerade, parseEbene } from '../core/parser.js';
import { addPunkt } from '../core/punkte.js';
import { addGerade } from '../core/geraden.js';
import { addEbene } from '../core/ebenen.js';

let scene = null;

export function initEingabePanel(sceneRef) {
    scene = sceneRef;

    document.getElementById('btn-punkt').addEventListener('click', () => zeigeFormular('punkt'));
    document.getElementById('btn-gerade').addEventListener('click', () => zeigeFormular('gerade'));
    document.getElementById('btn-ebene').addEventListener('click', () => zeigeFormular('ebene'));

    document.getElementById('formular-submit').addEventListener('click', onSubmit);
    document.getElementById('formular-abbrechen').addEventListener('click', verbergeFormular);
}

function zeigeFormular(typ) {
    const container = document.getElementById('formular-container');
    const inhalt = document.getElementById('formular-inhalt');
    container.style.display = 'block';
    container.dataset.typ = typ;

    if (typ === 'punkt') {
        inhalt.innerHTML = `
            <label>Name (optional)</label>
            <input type="text" id="f-name" placeholder="z.B. A" maxlength="4"/>
            <label>Position (x, y, z)</label>
            <input type="text" id="f-pos" placeholder="z.B. 1, 2, 3"/>
        `;
    } else if (typ === 'gerade') {
        inhalt.innerHTML = `
            <label>Eingabetyp</label>
            <select id="f-gerade-modus">
                <option value="punktvektor">Punkt + Richtungsvektor</option>
                <option value="2punkte">Zwei Punkte</option>
            </select>
            <div id="f-gerade-felder"></div>
        `;
        document.getElementById('f-gerade-modus').addEventListener('change', updateGeradeFelder);
        updateGeradeFelder();
    } else if (typ === 'ebene') {
        inhalt.innerHTML = `
            <label>Eingabetyp</label>
            <select id="f-ebene-modus">
                <option value="3punkte">Drei Punkte</option>
                <option value="normalvektor">Stützpunkt + Normalvektor</option>
                <option value="parameterform">Parameterform</option>
            </select>
            <div id="f-ebene-felder"></div>
        `;
        document.getElementById('f-ebene-modus').addEventListener('change', updateEbeneFelder);
        updateEbeneFelder();
    }
}

function updateGeradeFelder() {
    const modus = document.getElementById('f-gerade-modus').value;
    const felder = document.getElementById('f-gerade-felder');

    if (modus === 'punktvektor') {
        felder.innerHTML = `
            <label>Stützpunkt (x, y, z)</label>
            <input type="text" id="f-stuetz" placeholder="z.B. 0, 0, 0"/>
            <label>Richtungsvektor (x, y, z)</label>
            <input type="text" id="f-richt" placeholder="z.B. 1, 0, 0"/>
        `;
    } else {
        felder.innerHTML = `
            <label>Punkt 1 (x, y, z)</label>
            <input type="text" id="f-p1" placeholder="z.B. 0, 0, 0"/>
            <label>Punkt 2 (x, y, z)</label>
            <input type="text" id="f-p2" placeholder="z.B. 1, 1, 1"/>
        `;
    }
}

function updateEbeneFelder() {
    const modus = document.getElementById('f-ebene-modus').value;
    const felder = document.getElementById('f-ebene-felder');

    if (modus === '3punkte') {
        felder.innerHTML = `
            <label>Punkt 1 (x, y, z)</label>
            <input type="text" id="f-p1" placeholder="z.B. 1, 0, 0"/>
            <label>Punkt 2 (x, y, z)</label>
            <input type="text" id="f-p2" placeholder="z.B. 0, 1, 0"/>
            <label>Punkt 3 (x, y, z)</label>
            <input type="text" id="f-p3" placeholder="z.B. 0, 0, 1"/>
        `;
    } else if (modus === 'normalvektor') {
        felder.innerHTML = `
            <label>Stützpunkt (x, y, z)</label>
            <input type="text" id="f-stuetz" placeholder="z.B. 0, 0, 0"/>
            <label>Normalvektor (x, y, z)</label>
            <input type="text" id="f-normal" placeholder="z.B. 0, 1, 0"/>
        `;
    } else {
        felder.innerHTML = `
            <label>Stützvektor (x, y, z)</label>
            <input type="text" id="f-stuetz" placeholder="z.B. 0, 0, 0"/>
            <label>Richtungsvektor 1 (x, y, z)</label>
            <input type="text" id="f-v1" placeholder="z.B. 1, 0, 0"/>
            <label>Richtungsvektor 2 (x, y, z)</label>
            <input type="text" id="f-v2" placeholder="z.B. 0, 0, 1"/>
        `;
    }
}

function onSubmit() {
    const typ = document.getElementById('formular-container').dataset.typ;
    const fehler = document.getElementById('formular-fehler');
    fehler.textContent = '';

    try {
        if (typ === 'punkt') {
            const name = document.getElementById('f-name').value.trim() || null;
            const pos = parseVektorInput(document.getElementById('f-pos').value);
            addPunkt(scene, { label: name, position: pos });

        } else if (typ === 'gerade') {
            const modus = document.getElementById('f-gerade-modus').value;
            let params = { modus };

            if (modus === 'punktvektor') {
                params.stuetz = parseVektorInput(document.getElementById('f-stuetz').value);
                params.richtung = parseVektorInput(document.getElementById('f-richt').value);
            } else {
                params.p1 = parseVektorInput(document.getElementById('f-p1').value);
                params.p2 = parseVektorInput(document.getElementById('f-p2').value);
            }
            addGerade(scene, params);

        } else if (typ === 'ebene') {
            const modus = document.getElementById('f-ebene-modus').value;
            let params = { modus };

            if (modus === '3punkte') {
                params.p1 = parseVektorInput(document.getElementById('f-p1').value);
                params.p2 = parseVektorInput(document.getElementById('f-p2').value);
                params.p3 = parseVektorInput(document.getElementById('f-p3').value);
            } else if (modus === 'normalvektor') {
                params.punkt = parseVektorInput(document.getElementById('f-stuetz').value);
                params.normal = parseVektorInput(document.getElementById('f-normal').value);
            } else {
                params.stuetz = parseVektorInput(document.getElementById('f-stuetz').value);
                params.v1 = parseVektorInput(document.getElementById('f-v1').value);
                params.v2 = parseVektorInput(document.getElementById('f-v2').value);
            }
            addEbene(scene, params);
        }

        verbergeFormular();

    } catch (e) {
        fehler.textContent = '⚠ ' + e.message;
    }
}

function verbergeFormular() {
    document.getElementById('formular-container').style.display = 'none';
}
