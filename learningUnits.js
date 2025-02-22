document.addEventListener('DOMContentLoaded', function () {
    const URL = "https://apiflowershop.onrender.com/api/unidades-aprendizaje";
    const learningUnitsContainer = document.getElementById('learningUnitsContainer');
    const postUnitsButton = document.getElementById('post_units_button');

    // Recuperar el número de unidades de aprendizaje desde sessionStorage
    const units = sessionStorage.getItem('quantity_units');
    const idSubject = sessionStorage.getItem('id_subject');

    if (!units) {
        alert('No se encontraron datos. Redirigiendo...');
        window.location.href = 'index.html';
        return;
    }

    // Generar dinámicamente las unidades de aprendizaje
    for (let i = 1; i <= units; i++) {
        const unitHtml = `
            <div class="container my-5" id="unit${i}">
                <div class="mb-3 border p-3">
                    <h4 class="mb-3">Unidades Aprendizaje ${i}</h4>
                    <div class="mb-2">
                        <label for="competence${i}" class="form-label">Competencia</label>
                        <textarea class="form-control" id="competence${i}" required></textarea>
                    </div>
                    <div class="mb-2">
                        <label for="weeks${i}" class="form-label">Número de Semanas</label>
                        <input type="number" class="form-control" id="weeks${i}" required>
                    </div>
                    <div class="mb-2">
                        <label for="learningOutcome${i}" class="form-label">Resultado de Aprendizaje</label>
                        <textarea class="form-control" id="learningOutcome${i}" required></textarea>
                    </div>
                    <div class="mb-2">
                        <label for="integrativeTask${i}" class="form-label">Tareas integradoras</label>
                        <select class="form-select" id="integrativeTask${i}" required>
                                <option value="">Selecciona si contiene tareas integradoras</option>
                                <option value="Si">Si</option>
                                <option value="No">No</option>
                        </select>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <label for="saber${i}" class="form-label">El Saber (%)</label>
                            <input type="number" class="form-control saber" id="saber${i}" required>
                        </div>
                        <div class="col-md-6 mb-2">
                            <label for="hacerSer${i}" class="form-label">El Hacer-Ser (%)</label>
                            <input type="number" class="form-control hacer-ser" id="hacerSer${i}" required>
                        </div>
                    </div>
                </div>
            </div>
        `;
        learningUnitsContainer.insertAdjacentHTML('beforeend', unitHtml);
    }

    postUnitsButton.addEventListener("click", async () => {
        console.log("Botón clickeado");

        for (let i = 1; i <= units; i++) {
            const unit = {
                id_asignaturas: idSubject,
                Competencia: document.getElementById(`competence${i}`).value,
                Semanas: document.getElementById(`weeks${i}`).value,
                Resultado_aprendizaje: document.getElementById(`learningOutcome${i}`).value,
                Tareas_integradoras: document.getElementById(`integrativeTask${i}`).value,
                Porcentaje_saber: document.getElementById(`saber${i}`).value,
                Porcentaje_saber_ser: document.getElementById(`hacerSer${i}`).value
            };

            await PostLearningUnits(URL, unit);
        }

        window.location.href = 'courseRecords.html';
    });
});

async function PostLearningUnits(URL, unitData) {
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(unitData)
        });
        if (!response.ok) {
            throw new Error("Error al realizar post a una unidad");
        }
        const data = await response.json();
        if (data) {
            console.log("Post de una unidad realizada con éxito");
            console.log(data);
        }
    } catch (error) {
        console.error(error);
    }
}