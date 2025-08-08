document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("addCol").addEventListener("click", function () {
        let table = document.getElementById("playersTable");

        // Agregar encabezado (primera fila del thead)
        let headerRow = table.tHead.rows[0];
        let newHeader = document.createElement("th");
        newHeader.innerHTML = `<h2>J${headerRow.cells.length}</h2>`;
        headerRow.insertBefore(newHeader, headerRow.lastElementChild);

        // Segunda fila del thead para los inputs
        let inputRow;
        if (table.tHead.rows.length < 2) {
            inputRow = table.tHead.insertRow(1); // Crea la segunda fila si no existe
            // Rellena con celdas vacías para alinear con los encabezados existentes
            for (let i = 0; i < headerRow.cells.length; i++) {
                inputRow.insertCell(i);
            }
        } else {
            inputRow = table.tHead.rows[1];
        }

        // Agrega el input en la nueva celda antes de la última celda
        let newInputCell = document.createElement("th");
        newInputCell.innerHTML = `<input type="text" name="play${headerRow.cells.length - 1}" id="play${headerRow.cells.length - 1}" />`;
        inputRow.insertBefore(newInputCell, inputRow.lastElementChild);
    });


    function updateVictories() {
        let table = document.getElementById("playersTable");
        let tbody = table.tBodies[0];
        let inputRow = table.tHead.rows[1];
        let numPlayers = inputRow.querySelectorAll("input").length;

        // Inicializa el array de victorias
        let victories = Array(numPlayers).fill(0);

        // Recorre todas las filas de partidas (excepto la de victorias)
        for (let i = 0; i < tbody.rows.length; i++) {
            let row = tbody.rows[i];
            if (row.id === "victoryRow") continue;
            for (let j = 0; j < numPlayers; j++) {
                let input = row.cells[j]?.querySelector("input");
                if (input && input.value === "1") {
                    victories[j]++;
                }
            }
        }

        // Actualiza la fila de victorias
        let victoryRow = document.getElementById("victoryRow");
        // Si no existe, la crea
        if (!victoryRow) {
            victoryRow = tbody.insertRow();
            victoryRow.id = "victoryRow";
            for (let i = 0; i < numPlayers; i++) {
                victoryRow.insertCell(i);
            }
        }
        // Rellena las celdas con el conteo
        victoryRow.innerHTML = "";
        for (let i = 0; i < numPlayers; i++) {
            let cell = victoryRow.insertCell();
            cell.innerHTML = `<b>${victories[i]}</b>`;
        }
    }

    function createScoreCell(numPlayers, row, colIndex) {
        // Crea el input y los botones
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.gap = "4px";

        const input = document.createElement("input");
        input.type = "number";
        input.min = 1;
        input.max = numPlayers;
        input.value = 0;
        input.className = "scoreInput";
        input.style.width = "40px";
        input.style.textAlign = "center";

        const btnMinus = document.createElement("button");
        btnMinus.type = "button";
        btnMinus.textContent = "−";
        btnMinus.onclick = () => {
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
                input.dispatchEvent(new Event("input"));
            }
        };

        const btnPlus = document.createElement("button");
        btnPlus.type = "button";
        btnPlus.textContent = "+";
        btnPlus.onclick = () => {
            if (parseInt(input.value) < numPlayers) {
                input.value = parseInt(input.value) + 1;
                input.dispatchEvent(new Event("input"));
            }
        };

        container.appendChild(btnMinus);
        container.appendChild(input);
        container.appendChild(btnPlus);

        // Ayuda automática
        input.addEventListener("input", function () {
            // autoFillScores(row, numPlayers);
            updateVictories();
        });

        return container;
    }

    function autoFillScores(row, numPlayers) {
        // Obtiene los valores actuales
        const inputs = Array.from(row.querySelectorAll("input.scoreInput"));
        const values = inputs.map(inp => parseInt(inp.value) || 0);
        const used = values.filter(v => v > 0);

        // Si falta solo uno por asignar, lo completa automáticamente
        if (used.length === numPlayers - 1) {
            const missing = [1,2,3].slice(0, numPlayers).find(n => !used.includes(n));
            for (let i = 0; i < numPlayers; i++) {
                if (!values[i]) {
                    inputs[i].value = missing;
                }
            }
        }
    }

    document.getElementById("addGame").addEventListener("click", function () {
        let table = document.getElementById("playersTable");
        let inputRow = table.tHead.rows[1];
        let numPlayers = inputRow.querySelectorAll("input").length;

        let newRow = table.tBodies[0].insertRow(table.tBodies[0].rows.length - 1); // Antes de la fila de victorias
        for (let i = 0; i < numPlayers; i++) {
            let cell = newRow.insertCell();
            cell.appendChild(createScoreCell(numPlayers, newRow, i));
        }

        updateVictories();
    });

    // Si ya hay filas, agrega el evento
    document.querySelectorAll(".scoreInput").forEach(input => {
        input.addEventListener("input", updateVictories);
    });

    function getTableData() {
        const table = document.getElementById("playersTable");
        const inputRow = table.tHead.rows[1];
        const playerInputs = inputRow.querySelectorAll("input");
        const playerNames = Array.from(playerInputs).map(input => input.value);

        const tbody = table.tBodies[0];
        const data = [];

        for (let i = 0; i < tbody.rows.length; i++) {
            const row = tbody.rows[i];
            if (row.id === "victoryRow") continue; // Saltar la fila de victorias

            const rowData = {};
            for (let j = 0; j < playerNames.length; j++) {
                const input = row.cells[j]?.querySelector("input");
                rowData[playerNames[j] || `Jugador${j + 1}`] = input ? input.value : null;
            }
            data.push(rowData);
        }

        return data;
    }

    document.getElementById("exportExcel").addEventListener("click", function () {
        const data = getTableData(); // Usa la función que ya tienes
        if (data.length === 0) return;

        // Encabezados (nombres de jugadores)
        const headers = Object.keys(data[0]);
        let csv = headers.join(",") + "\n";

        // Filas de datos
        data.forEach(row => {
            csv += headers.map(h => row[h]).join(",") + "\n";
        });

        // Descargar el archivo
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
        a.download = `scoreup_partidas_${dateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});