document.addEventListener('DOMContentLoaded', async function () {
    const recordsList = document.getElementById('recordsList');
    const URL = "https://apiflowershop.onrender.com/api/asignaturas";

    async function fetchAssignments() {
        try {
            // Realizamos la solicitud para obtener las asignaturas
            const response = await fetch(URL);

            if (!response.ok) {
                throw new Error("Fallo al obtener asignaturas");
            }

            // Parseamos la respuesta a JSON
            const data = await response.json();

            // Suponiendo que 'data' es un array de asignaturas, extraemos sus IDs
            const ids = data.map(asignatura => asignatura.id_asignaturas);

            // Llamamos a fetchWeeks para cada asignatura con su ID
            for (const id of ids) {
                const weeks = await fetchWeeks(id);
            }

        } catch (error) {
            console.error("Error al obtener las asignaturas:", error);
        }
    }

    async function fetchWeeks(id_asignaturas) {
        try {
            const response = await fetch(`${URL}/${id_asignaturas}`);

            if (!response.ok) {
                throw new Error("Fallo al obtener detalles de la asignatura");
            }

            const data = await response.json();

            if (data.unidadesAp && Array.isArray(data.unidadesAp)) {
                return data.unidadesAp.reduce((total, unidad) => {
                    return total + (unidad.Semanas || 0);
                }, 0);
            }

            console.log("No se encontraron unidadesAp válidas");
            return 0;
        } catch (error) {
            console.error("Error al obtener las semanas:", error);
            return 0;
        }
    }

    // Llamamos a la función principal para iniciar el proceso
    fetchAssignments();


    async function fetchData() {
        try {
            const response = await fetch(URL);
            if (!response.ok) {
                throw new Error("Ocurrió un error durante la solicitud GET");
            }
            const data = await response.json();

            if (data && data.length > 0) {
                recordsList.innerHTML = "";

                for (const record of data) {
                    const Semanas = await fetchWeeks(record.id_asignaturas);

                    const row = `
                        <tr>
                            <td class="text-center">${record.Cuatrimestre}</td>
                            <td class="text-center">${record.Familia_carrera}</td>
                            <td>${record.Objetivo_generales}</td>
                            <td class="text-center">${Semanas}</td>
                            <td class="text-center"><button class="btn btn-info btn-sm" onclick="showDetails(${record.id_asignaturas})">Detalles</button></td>
                        </tr>
                    `;
                    recordsList.insertAdjacentHTML('beforeend', row);
                }
            } else {
                console.warn("No se encontraron asignaturas.");
            }
        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    }

    await fetchData();
});

async function showDetails(id_asignatura) {
    try {
        const response = await fetch(`https://apiflowershop.onrender.com/api/asignaturas/${id_asignatura}`);
        if (!response.ok) {
            throw new Error("Error al obtener los detalles de la asignatura");
        }
        const data = await response.json();

        // Generar las filas dinámicas para las unidades de aprendizaje
        let unidadesApRows = '';
        if (data.unidadesAp && Array.isArray(data.unidadesAp)) {
            data.unidadesAp.forEach((unidad, index) => {
                unidadesApRows += `
                    <tr>
                        <td>${index + 1}</td> <!-- Número incremental -->
                        <td>${unidad.Competencia}</td>
                        <td>${unidad.Semanas}</td>
                        <td>${unidad.Resultado_aprendizaje}</td>
                        <td>${unidad.Tareas_integradoras}</td>
                        <td>${parseFloat(unidad.Porcentaje_saber).toFixed(0)}</td>
                        <td>${parseFloat(unidad.Porcentaje_saber_ser).toFixed(0)}</td>
                    </tr>
                `;
            });
        }

        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
        <div class="table-responsive">
            <table class="table table-bordered">
                <tbody>
                    <tr>
                        <th class="table-active text-white">Asignatura:</th>
                        <td>${data.Nombre}</td>
                        <th class="table-active text-white">Familia:</th>
                        <td>${data.Familia_carrera}</td>
                        <th class="table-active text-white">Duración:</th>
                        <td>${data.Duración} hrs</td>
                    </tr>
                    <tr>
                        <th class="table-active text-white">Cuatrimestre:</th>
                        <td>${data.Cuatrimestre}</td>
                        <th class="table-active text-white">Profesor:</th>
                        <td colspan="3">${data.Profesor}</td>
                    </tr>
                    <tr>
                        <th class="table-active text-white">Nivel de Competencia:</th>
                        <td colspan="5">${data.Nivel_competencia}</td>
                    </tr>
                    <tr>
                        <th class="table-active text-white">Objetivos Generales:</th>
                        <td colspan="5">${data.Objetivo_generales}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="table-responsive">
            <table class="table table-striped table-bordered text-center">
                <thead>
                    <tr class="align-middle">
                        <th class="table-active text-white" rowspan="2">U.A.</th>
                        <th class="table-active text-white" rowspan="2">Competencia Específica por UA</th>
                        <th class="table-active text-white" rowspan="2">Num. Semanas</th>
                        <th class="table-active text-white" rowspan="2">Resultado de Aprendizaje</th>
                        <th class="table-active text-white" rowspan="2">TI (Si/No)</th>
                        <th class="table-active text-white" colspan="2">Ponderación para EVALUACIÓN</th>
                    </tr>
                    <tr>
                        <th class="table-active text-white">SABER</th>
                        <th class="table-active text-white">HACER+SER</th>
                    </tr>
                </thead>
                <tbody>
                    ${unidadesApRows} <!-- Aquí se insertan las filas dinámicas -->
                    <tr>
                        <td></td>
                        <td></td>
                        <td><b>15</b></td>
                        <td></td>
                        <td></td>
                        <td><b>40%</b></td>
                        <td><b>60%</b></td>
                    </tr>
                </tbody>
            </table>
        </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('detailModal'));
        modal.show();
    } catch (error) {
        console.error("Error al obtener los detalles de la asignatura:", error);
    }
}