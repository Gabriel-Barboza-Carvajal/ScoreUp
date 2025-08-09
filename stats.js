const supabaseUrl = 'https://ydhwdmqdhezhjducfmlh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaHdkbXFkaGV6aGpkdWNmbWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjExMzMsImV4cCI6MjA3MDI5NzEzM30.3wj4pFa8G7n-CV8B4py55xfwT_tAbY_OlPsbFW8hofU';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let partidaJson = null;

document.getElementById("excelInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
        const data = evt.target.result;
        let workbook;
        if (file.name.endsWith(".csv")) {
            workbook = XLSX.read(data, { type: "binary" });
        } else {
            workbook = XLSX.read(data, { type: "array" });
        }
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        partidaJson = XLSX.utils.sheet_to_json(sheet);
        alert("Archivo procesado. Ahora haz clic en 'Subir Partida'.");
    };
    if (file.name.endsWith(".csv")) {
        reader.readAsBinaryString(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
});

document.getElementById("subirBtn").addEventListener("click", async function () {
    const temporadaId = document.getElementById("temporadaId").value.trim();
    if (!temporadaId) return alert("Ingresa el ID de la temporada.");
    if (!partidaJson) return alert("Primero selecciona un archivo.");
    const { error } = await supabaseClient
        .from('partidas')
        .insert([{ temporada_id: temporadaId, fecha: new Date().toISOString(), datos: partidaJson }]);
    if (error) {
        alert('Error al subir partida: ' + error.message);
    } else {
        alert('Partida subida correctamente');
        partidaJson = null;
        document.getElementById("excelInput").value = "";
        cargarPartidas(temporadaId);
    }
});

async function cargarPartidas(temporadaId) {
    const { data, error } = await supabaseClient.from('partidas').select('*')
        .eq('temporada_id', temporadaId)
        .order('fecha', { ascending: true });
    if (error) {
        document.getElementById("partidasArea").innerHTML = "Error al consultar partidas.";
        return;
    }
    let html = "";
    data.forEach((partida, idx) => {
        html += `<div class="mb-2"><b>Partida ${idx + 1} (${new Date(partida.fecha).toLocaleString()}):</b><br>`;
        html += `<pre style="background:#333;color:#fff;padding:8px;border-radius:6px;">${JSON.stringify(partida.datos, null, 2)}</pre></div>`;
    });
    document.getElementById("partidasArea").innerHTML = html;
    if (data.length > 0) {
        analizarDatos(data);
    } else {
        document.getElementById("statsArea").innerHTML = "";
    }
}

function analizarDatos(partidas) {
    // Ejemplo: sumar victorias por jugador en todas las partidas
    const stats = {};
    partidas.forEach(partida => {
        partida.datos.forEach(row => {
            Object.entries(row).forEach(([jugador, puesto]) => {
                if (!stats[jugador]) stats[jugador] = { primero: 0, segundo: 0, tercero: 0, total: 0 };
                if (puesto == 1) stats[jugador].primero++;
                if (puesto == 2) stats[jugador].segundo++;
                if (puesto == 3) stats[jugador].tercero++;
                if (puesto > 0) stats[jugador].total++;
            });
        });
    });
    let html = `<table class="table table-dark table-bordered text-center"><thead><tr>
        <th>Jugador</th><th>1°</th><th>2°</th><th>3°</th><th>Total</th></tr></thead><tbody>`;
    Object.entries(stats).forEach(([jugador, s]) => {
        html += `<tr><td>${jugador}</td><td>${s.primero}</td><td>${s.segundo}</td><td>${s.tercero}</td><td>${s.total}</td></tr>`;
    });
    html += "</tbody></table>";
    document.getElementById("statsArea").innerHTML = html;
}

// Opcional: cargar partidas al ingresar el ID de temporada
document.getElementById("temporadaId").addEventListener("change", function () {
    const temporadaId = this.value.trim();
    if (temporadaId) cargarPartidas(temporadaId);
});