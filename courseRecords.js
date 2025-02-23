document.addEventListener("DOMContentLoaded", async function () {
  const recordsList = document.getElementById("recordsList");
  const URL = "https://apiflowershop.onrender.com/api/asignaturas";
  const loadingModal = new bootstrap.Modal(
    document.getElementById("loadingModal"),
    {
      backdrop: "static",
    }
  );
  const errorModal = new bootstrap.Modal(
    document.getElementById("errorModal"),
    {
      backdrop: "static",
    }
  );

  loadingModal.show();

  async function fetchAssignments(loadingModal, errorModal) {
    try {
      const response = await fetch(URL);

      if (!response.ok) {
        throw new Error("Fallo al obtener asignaturas");
      }
      const data = await response.json();
      const ids = data.map((asignatura) => asignatura.id_asignaturas);

      for (const id of ids) {
        const weeks = await fetchWeeks(id);
      }
    } catch (error) {
      loadingModal.hide();
      errorModal.show();
      console.error("Error al obtener las asignaturas:", error);
    } finally {
      loadingModal.hide();
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

  fetchAssignments(loadingModal, errorModal);

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
          recordsList.insertAdjacentHTML("beforeend", row);
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
    const response = await fetch(
      `https://apiflowershop.onrender.com/api/asignaturas/${id_asignatura}`
    );
    if (!response.ok) {
      throw new Error("Error al obtener los detalles de la asignatura");
    }
    const data = await response.json();

    // Variables para acumular los totales
    let totalSaber = 0;
    let totalHacerSer = 0;
    let totalSemanas = 0;

    // Generar las filas dinámicas para las unidades de aprendizaje
    let unidadesApRows = "";
    if (data.unidadesAp && Array.isArray(data.unidadesAp)) {
      data.unidadesAp.forEach((unidad, index) => {
        // Sumar los porcentajes y semanas
        totalSaber += parseFloat(unidad.Porcentaje_saber) || 0;
        totalHacerSer += parseFloat(unidad.Porcentaje_saber_ser) || 0;
        totalSemanas += parseFloat(unidad.Semanas) || 0;

        unidadesApRows += `
                    <tr>
                        <td>${index + 1}</td> <!-- Número incremental -->
                        <td>${unidad.Competencia}</td>
                        <td>${unidad.Semanas}</td>
                        <td>${unidad.Resultado_aprendizaje}</td>
                        <td>${unidad.Tareas_integradoras}</td>
                        <td>${parseFloat(unidad.Porcentaje_saber).toFixed(
                          0
                        )}</td>
                        <td>${parseFloat(unidad.Porcentaje_saber_ser).toFixed(
                          0
                        )}</td>
                    </tr>
                `;
      });
    }

    const modalContent = document.getElementById("modalContent");
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
                        <td colspan="2"><b>Totales</b></td>
                        <td><b>${totalSemanas}</b></td>
                        <td></td>
                        <td></td>
                        <td><b>${totalSaber.toFixed(0)}%</b></td>
                        <td><b>${totalHacerSer.toFixed(0)}%</b></td>
                    </tr>
                </tbody>
            </table>
        </div>
        `;

    const modal = new bootstrap.Modal(document.getElementById("detailModal"));
    modal.show();
  } catch (error) {
    console.error("Error al obtener los detalles de la asignatura:", error);
  }
}
