document.addEventListener("DOMContentLoaded", function () {

    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });

    document.getElementById("addCol").addEventListener("click", function () {
        agregarColumna();
    });

    function agregarColumna() {
        let table = document.getElementById("playersTable");

        // Agregar encabezado (primera fila del thead)
        let headerRow = table.tHead.rows[0];
        // Inserta el nuevo th ANTES del botón "+" (penúltima posición)
        let newHeader = document.createElement("th");
        newHeader.innerHTML = `<h2>J${headerRow.cells.length - 1}</h2>`;
        headerRow.insertBefore(newHeader, headerRow.cells[headerRow.cells.length - 2]);
        guardarTabla();
        // Segunda fila del thead para los inputs
        let inputRow;
        if (table.tHead.rows.length < 2) {
            inputRow = table.tHead.insertRow(1);
            for (let i = 0; i < headerRow.cells.length; i++) {
                inputRow.insertCell(i);
                guardarTabla();
            }
        } else {
            inputRow = table.tHead.rows[1];
            // Inserta la celda ANTES del botón "+" (penúltima posición)
            let newInputCell = document.createElement("td");
            newInputCell.innerHTML = `<input type="text" name="play${headerRow.cells.length - 2}" id="play${headerRow.cells.length - 2}" class="form-control"  placeholder="Ingrese el nombre"/>`;
            inputRow.insertBefore(newInputCell, inputRow.cells[inputRow.cells.length - 2]);
            guardarTabla();
            return;
        }

        // Si es la primera vez, pon los inputs en las posiciones correctas
        for (let i = 0; i < headerRow.cells.length - 2; i++) {
            inputRow.cells[i].innerHTML = `<input type="text" name="play${i + 1}" id="play${i + 1}" class="form-control" />`;
        }
    }

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
        guardarTabla();
    }

    function createScoreCell(numPlayers, row, colIndex) {
        const input = document.createElement("input");
        input.type = "text";
        input.readOnly = true;
        input.className = "form-control scoreInput";
        input.style.cursor = "pointer";
        input.value = "";

        input.addEventListener("click", function () {
            // Obtén todos los inputs de la fila
            const inputs = Array.from(row.querySelectorAll("input.scoreInput"));
            // Busca el siguiente puesto disponible (1, 2, 3, ...)
            let used = inputs.map(inp => parseInt(inp.value)).filter(v => !isNaN(v));
            let next = 1;
            while (used.includes(next) && next <= numPlayers) next++;
            if (next > numPlayers) return; // Todos asignados

            // Si ya tiene valor, no hacer nada
            if (input.value) return;

            input.value = next;
            updateVictories();
        });

        return input;
    }

    document.getElementById("addGame").addEventListener("click", function () {
        let table = document.getElementById("playersTable");
        let inputRow = table.tHead.rows[1];
        let numPlayers = inputRow.querySelectorAll("input").length;

        // Inserta la nueva fila antes de la fila de victorias
        let tbody = table.tBodies[0];
        let victoryRow = document.getElementById("victoryRow");
        let newRow = tbody.insertRow(victoryRow ? victoryRow.rowIndex - table.tHead.rows.length : -1);

        // 1. Celdas de jugadores (inputs de puntuación)
        for (let i = 0; i < numPlayers; i++) {
            let cell = newRow.insertCell();
            cell.appendChild(createScoreCell(numPlayers, newRow, i));
        }

        // 2. Celda vacía para el botón "+" (alineación con thead)
        // newRow.insertCell();

        // 3. Celda para el botón "Limpiar" (¡NUEVA POSICIÓN!)
        let clearCell = newRow.insertCell();
        let clearBtn = document.createElement("button");
        clearBtn.className = "btn btn-info btn-sm";
        clearBtn.innerHTML = "🧹";  // Icono de recarga (alternativas: "🗘" o "⏮️")
        clearBtn.title = "Reiniciar puntuaciones";
        clearBtn.style.padding = "0.25rem";  // Más compacto
        clearBtn.onclick = function () {
            const inputs = Array.from(newRow.querySelectorAll("input.scoreInput"));
            inputs.forEach(inp => inp.value = "");
            updateVictories();
        };
        clearCell.appendChild(clearBtn);

        // 4. Celda para el botón de basura (🗑️)
        let deleteCell = newRow.insertCell();
        let btn = document.createElement("button");
        btn.className = "btn btn-danger btn-sm";
        btn.innerHTML = "🗑️";
        btn.title = "Eliminar partida";
        btn.onclick = function () {
            newRow.remove();
            updateVictories();
        };
        deleteCell.appendChild(btn);

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


    // Guardar datos de la tabla
    function guardarTabla() {
        const table = document.getElementById("playersTable");
        const inputRow = table.tHead.rows[1];
        const playerNames = Array.from(inputRow.querySelectorAll("input")).map(input => input.value);


        const tbody = table.tBodies[0];
        const partidas = [];

        tbody.querySelectorAll("tr").forEach(row => {
            if (row.id === "victoryRow") return; // saltar fila de victorias

            const rowData = [];
            row.querySelectorAll("td").forEach((cell, i) => {
                const input = cell.querySelector("input");
                if (input) {
                    rowData.push(input.value);
                }
            });
            if (rowData.length) partidas.push(rowData);
        });

        localStorage.setItem("playerNames", JSON.stringify(playerNames));
        localStorage.setItem("partidas", JSON.stringify(partidas));
    }


    reconstruirTabla();

    function reconstruirTabla() {
        const table = document.getElementById("playersTable");
        const tbody = table.tBodies[0];
        const thead = table.tHead;

        const playerNames = JSON.parse(localStorage.getItem("playerNames") || "[]");
        const partidas = JSON.parse(localStorage.getItem("partidas") || "[]");

        if (playerNames.length === 0 && partidas.length === 0) {
            return; // No hay datos para reconstruir
        }
        // --- Reconstruir encabezado ---
        thead.innerHTML = ""; // limpiar todo

        // Fila de títulos
        const headerRow = thead.insertRow();
        playerNames.forEach((name, i) => {
            const th = document.createElement("th");
            th.innerHTML = `<h2>J${i + 1}</h2>`;
            headerRow.appendChild(th);
        });
        // Botón "+"
        const thAdd = document.createElement("th");
        thAdd.innerHTML = `<button type="button" id="addCol" class="btn btn-outline-secondary btn-sm">+</button>`;
        headerRow.appendChild(thAdd);
        document.getElementById("playersTable").addEventListener("click", function (e) {
            if (e.target && e.target.id === "addCol") {
                // Llama aquí a tu función de añadir columna
                agregarColumna();
            }
        });

        // Columna eliminar
        const thDel = document.createElement("th");
        thDel.textContent = "Eliminar";
        headerRow.appendChild(thDel);

        // Fila de inputs de nombres
        const inputRow = thead.insertRow();
        playerNames.forEach((name, i) => {
            const td = inputRow.insertCell();
            td.innerHTML = `<input type="text" name="play${i + 1}" class="form-control" value="${name}" placeholder="Ingrese el nombre"/>`;
        });
        // Celdas vacías para "+" y eliminar
        inputRow.insertCell();
        inputRow.insertCell();

        // --- Reconstruir tbody ---
        tbody.innerHTML = "";

        partidas.forEach(filaData => {
            const newRow = tbody.insertRow();
            filaData.forEach((valor, i) => {
                const cell = newRow.insertCell();
                const input = document.createElement("input");
                input.type = "text";
                input.readOnly = true;
                input.className = "form-control scoreInput";
                input.style.cursor = "pointer";
                input.value = valor;

                input.addEventListener("click", function () {
                    const inputs = Array.from(newRow.querySelectorAll("input.scoreInput"));
                    const used = inputs.map(inp => parseInt(inp.value)).filter(v => !isNaN(v));
                    let next = 1;
                    while (used.includes(next) && next <= playerNames.length) next++;
                    if (next > playerNames.length) return;
                    if (input.value) return;
                    input.value = next;
                    updateVictories();
                });

                cell.appendChild(input);
            });

            // Botón limpiar
            const clearCell = newRow.insertCell();
            const clearBtn = document.createElement("button");
            clearBtn.className = "btn btn-info btn-sm";
            clearBtn.innerHTML = "🧹";
            clearBtn.style.padding = "0.25rem";
            clearBtn.onclick = function () {
                newRow.querySelectorAll("input.scoreInput").forEach(inp => inp.value = "");
                updateVictories();
            };
            clearCell.appendChild(clearBtn);

            // Botón eliminar
            const deleteCell = newRow.insertCell();
            const delBtn = document.createElement("button");
            delBtn.className = "btn btn-danger btn-sm";
            delBtn.innerHTML = "🗑️";
            delBtn.onclick = function () {
                newRow.remove();
                updateVictories();
            };
            deleteCell.appendChild(delBtn);
        });

        // Reconstruir fila de victorias
        updateVictories();

        // Reagregar evento de input para guardar cambios
        inputRow.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", guardarTabla);
        });
    }




    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", function () {
            guardarTabla();
        });
    });


    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js');
        });
    }

// --- Reset Jugadores ---
document.getElementById("resetPlayers").addEventListener("click", function () {
    const confirmReset = confirm("¿Estás seguro de que quieres reiniciar todos los jugadores? Se perderán los datos.");
    if (!confirmReset) return; // Si cancela, no hacer nada

    const table = document.getElementById("playersTable");
    const headerRow = table.tHead.rows[0];
    const inputRow = table.tHead.rows[1];
    const tbody = table.tBodies[0];

    // Determinar cuántos jugadores por defecto hay en el HTML (ej: 2)
    const defaultPlayers = 2;

    // Eliminar todas las columnas adicionales en el thead
    while (headerRow.cells.length > defaultPlayers + 2) { // +2 por "+" y "Eliminar"
        headerRow.deleteCell(defaultPlayers);
        inputRow.deleteCell(defaultPlayers);
    }

    // Limpiar inputs de nombres
    inputRow.querySelectorAll("input").forEach((input, i) => {
        if (i < defaultPlayers) input.value = "";
    });

    // Eliminar columnas extra en el tbody
    for (let i = 0; i < tbody.rows.length; i++) {
        const row = tbody.rows[i];
        if (row.id === "victoryRow") continue; // no tocar fila de victorias
        while (row.cells.length > defaultPlayers + 2) {
            row.deleteCell(defaultPlayers);
        }
        for (let j = 0; j < defaultPlayers; j++) {
            const input = row.cells[j]?.querySelector("input");
            if (input) input.value = "";
        }
    }

    // Actualizar datos
    guardarTabla();
    updateVictories();

    alert("Se han reiniciado los jugadores correctamente.");
});

// --- Reset Partidas ---
document.getElementById("resetGames").addEventListener("click", function () {
    const confirmReset = confirm("¿Estás seguro de que quieres reiniciar todas las partidas? Se perderán todas las puntuaciones.");
    if (!confirmReset) return; // Si cancela, no hacer nada

    const table = document.getElementById("playersTable");
    const tbody = table.tBodies[0];

    // Eliminar todas las filas excepto la de victorias
    Array.from(tbody.rows).forEach(row => {
        if (row.id !== "victoryRow") row.remove();
    });

    // Limpiar la fila de victorias
    const victoryRow = document.getElementById("victoryRow");
    if (victoryRow) {
        victoryRow.innerHTML = "";
        const numPlayers = table.tHead.rows[1].querySelectorAll("input").length;
        for (let i = 0; i < numPlayers; i++) {
            victoryRow.insertCell();
        }
    }

    // Actualizar datos
    guardarTabla();
    updateVictories();

    alert("Se han eliminado todas las partidas.");
});


});