
    // Datos de respaldo basados en los sorteos de las imágenes suministradas
    const dbSorteos = {
        quini: [
            { nombre: "Tradicional Primer Sorteo", nums: ['04', '06', '07', '09', '24', '35'] },
            { nombre: "Tradicional La Segunda", nums: ['01', '05', '16', '34', '35', '41'] },
            { nombre: "Revancha", nums: ['26', '27', '30', '35', '37', '38'] },
            { nombre: "Siempre Sale", nums: ['00', '10', '19', '42', '43', '44'] },
            { nombre: "Premio Extra", nums: ['01', '04', '05', '06', '07', '09', '16', '24', '26', '27', '30', '34', '35', '37', '38', '41'] }
        ],
        brinco: [
            { nombre: "Extracciones Tradicional", nums: ['05', '09', '14', '16', '17', '26'] },
            { nombre: "Brinco Junior Siempre Sale", nums: ['18', '19', '21', '24', '27', '37'] }
        ]
    };

    function validarNumeros(str, max, cantidad) {
        const parts = str.split(/[\s,-]+/).filter(x => x !== "").map(n => n.padStart(2, '0'));
        const unicos = [...new Set(parts)];
        
        if (unicos.length !== cantidad) return false;
        return unicos.every(n => {
            const val = parseInt(n);
            return !isNaN(val) && val >= 0 && val <= max;
        });
    }

    function procesarTodo() {
        const strBrinco = document.getElementById('inputBrinco').value;
        const strQuini = document.getElementById('inputQuini').value;

        const vBrinco = validarNumeros(strBrinco, 39, 6);
        const vQuini = validarNumeros(strQuini, 45, 6);

        document.getElementById('errBrinco').style.display = vBrinco ? 'none' : 'block';
        document.getElementById('errQuini').style.display = vQuini ? 'none' : 'block';

        if (vBrinco && vQuini) {
            renderizarResultados('resQuini', dbSorteos.quini, strQuini);
            renderizarResultados('resBrinco', dbSorteos.brinco, strBrinco);
            document.getElementById('resultsArea').style.display = 'block';
            window.scrollTo({ top: document.getElementById('resultsArea').offsetTop, behavior: 'smooth' });
        }
    }

    function renderizarResultados(containerId, sorteos, userStr) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        const userNums = userStr.split(/[\s,-]+/).filter(x => x !== "").map(n => n.padStart(2, '0'));

        sorteos.forEach(sorteo => {
            const hits = sorteo.nums.filter(n => userNums.includes(n));
            
            const div = document.createElement('div');
            div.className = 'result-item';
            
            div.innerHTML = `
                <div class="result-header">
                    <strong>${sorteo.nombre}</strong>
                    <span class="badge-hits">${hits.length} ACIERTOS</span>
                </div>
                <div class="ball-container">
                    ${sorteo.nums.map(n => `
                        <div class="ball ${userNums.includes(n) ? 'match' : ''}">${n}</div>
                    `).join('')}
                </div>
            `;
            container.appendChild(div);
        });
    }