/**
 * Lotería Santa Fe: Verificador Pro - Múltiples Sorteos
 */

// 1. TUS NÚMEROS POR DEFECTO
const MIS_NUMEROS_QUINI_BASE = ['09', '12', '24', '36', '41'];
const MIS_NUMEROS_BRINCO_BASE = ['04', '05', '06', '13', '31', '38'];

async function procesarTodo() {
    const resArea = document.getElementById('resultsArea');
    const quiniContenedor = document.getElementById('resQuini');
    const brincoContenedor = document.getElementById('resBrinco');

    // --- LIMPIEZA INICIAL ---
    resArea.style.display = 'block';
    quiniContenedor.innerHTML = '<div class="info-box">⏳ Analizando todos los sorteos del Quini 6...</div>';
    brincoContenedor.innerHTML = '<div class="info-box">⏳ Analizando todos los sorteos del Brinco...</div>';

    // --- CAPTURA DE INPUTS ---
    let misNumerosQuini = extraerNumerosDeInput('inputQuini');
    let misNumerosBrinco = extraerNumerosDeInput('inputBrinco');

    if (misNumerosQuini.length === 0) misNumerosQuini = MIS_NUMEROS_QUINI_BASE;
    if (misNumerosBrinco.length === 0) misNumerosBrinco = MIS_NUMEROS_BRINCO_BASE;

    const t = new Date().getTime();
    const urlQuini = `https://www.loteriasantafe.gov.ar/index.php/resultados/quini-6?t=${t}`;
    const urlBrinco = `https://www.loteriasantafe.gov.ar/index.php/resultados/brinco?view=resultados&t=${t}`;

    try {
        const htmlQuini = await obtenerHTMLProxy(urlQuini);
        const htmlBrinco = await obtenerHTMLProxy(urlBrinco);

        quiniContenedor.innerHTML = '';
        brincoContenedor.innerHTML = '';

        // --- PROCESAMIENTO EN VIVO ---
        // Intentamos extraer las tablas dinámicamente
        extraerSorteosCompleto(htmlQuini, 'resQuini', misNumerosQuini, 'quini');
        extraerSorteosCompleto(htmlBrinco, 'resBrinco', misNumerosBrinco, 'brinco');

        // Si la página en vivo no trajo nada (por cambios en el diseño de la lotería)
        if (quiniContenedor.innerHTML === '') throw new Error("No se detectaron tablas en Quini");
        if (brincoContenedor.innerHTML === '') throw new Error("No se detectaron tablas en Brinco");

    } catch (error) {
        console.warn("Usando datos estáticos basados en las capturas de pantalla.", error);
        quiniContenedor.innerHTML = '<p style="color:#f26522; font-weight:bold; text-align:center;">Mostrando Sorteo de Respaldo</p>';
        brincoContenedor.innerHTML = '<p style="color:#f26522; font-weight:bold; text-align:center;">Mostrando Sorteo de Respaldo</p>';
        ejecutarRespaldo(misNumerosQuini, misNumerosBrinco);
    }
}

// Extrae números agrupándolos por tablas/paneles
function extraerSorteosCompleto(html, contenedorId, misNumeros, tipo) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // En la página de la lotería, los resultados suelen estar en tablas o paneles
    const contenedores = doc.querySelectorAll('table, .panel, .caja-resultado');

    contenedores.forEach((contenedor, index) => {
        // Buscamos el título (ej: "TRADICIONAL PRIMER SORTEO")
        let tituloElemento = contenedor.closest('div').querySelector('h2, h3, th, .panel-heading, .titulo-sorteo');
        let nombreSorteo = tituloElemento ? tituloElemento.textContent.trim() : `Sorteo ${index + 1}`;
        
        // Evitamos tablas que sean de premios y no de bolillas
        if (nombreSorteo.toLowerCase().includes("premio") && !nombreSorteo.toLowerCase().includes("extra")) return;

        // Extraemos las bolillas de esa sección
        const bolillas = Array.from(contenedor.querySelectorAll('td, .bola, .bolilla'))
            .map(el => el.textContent.trim().padStart(2, '0'))
            .filter(n => n.length === 2 && !isNaN(n) && n !== '00' && n !== '99'); // Filtro básico

        // Solo renderizamos si encontramos un bloque de bolillas (6 o más, el Extra tiene 15)
        if (bolillas.length >= 6) {
            dibujarResultados(contenedorId, nombreSorteo, bolillas, misNumeros);
        }
    });
}

function extraerNumerosDeInput(id) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) return [];
    const matches = el.value.match(/\d{1,2}/g) || [];
    return matches.map(n => n.padStart(2, '0'));
}

async function obtenerHTMLProxy(url) {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("Error de red");
    const data = await response.json();
    return data.contents;
}

function dibujarResultados(contenedorId, titulo, sorteados, misNumeros) {
    const contenedor = document.getElementById(contenedorId);
    const div = document.createElement('div');
    div.className = 'result-item';

    const aciertos = sorteados.filter(n => misNumeros.includes(n)).length;

    const bolillasHTML = sorteados.map(num => {
        const esMatch = misNumeros.includes(num);
        return `<div class="ball ${esMatch ? 'match' : ''}">${num}</div>`;
    }).join('');

    div.innerHTML = `
        <div class="result-header">
            <strong>${titulo}</strong>
            <span class="badge-hits">${aciertos} Aciertos</span>
        </div>
        <div class="ball-container">${bolillasHTML}</div>
    `;
    contenedor.appendChild(div);
}

// Carga exactamente los datos de tus capturas de pantalla
function ejecutarRespaldo(mQuini, mBrinco) {
    // --- TODOS LOS SORTEOS DE QUINI 6 ---
    dibujarResultados('resQuini', 'TRADICIONAL PRIMER SORTEO', ['04', '06', '07', '09', '24', '35'], mQuini);
    dibujarResultados('resQuini', 'TRADICIONAL LA SEGUNDA DEL QUINI', ['01', '05', '16', '34', '35', '41'], mQuini);
    dibujarResultados('resQuini', 'REVANCHA', ['26', '27', '30', '35', '37', '38'], mQuini);
    dibujarResultados('resQuini', 'SIEMPRE SALE', ['00', '10', '19', '42', '43', '44'], mQuini);
    // El Premio Extra tiene 15 números (o más). El script soporta cualquier cantidad de bolillas.
    dibujarResultados('resQuini', 'PREMIO EXTRA', ['01', '04', '05', '06', '07', '09', '16', '24', '26', '27', '30', '34', '35', '37', '38', '41'], mQuini);

    // --- TODOS LOS SORTEOS DE BRINCO ---
    dibujarResultados('resBrinco', 'EXTRACCIONES', ['05', '09', '14', '16', '17', '26'], mBrinco);
    dibujarResultados('resBrinco', 'BRINCO JUNIOR SIEMPRE SALE', ['18', '19', '21', '24', '27', '37'], mBrinco);
}