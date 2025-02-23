document.addEventListener("DOMContentLoaded", function () {
  const URL = "https://apiflowershop.onrender.com/api/unidades-aprendizaje";
  const learningUnitsContainer = document.getElementById(
    "learningUnitsContainer"
  );
  const postUnitsButton = document.getElementById("post_units_button");
  const units = sessionStorage.getItem("quantity_units");
  const idSubject = sessionStorage.getItem("id_subject");

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

  const successModal = new bootstrap.Modal(
    document.getElementById("successModal"),
    {
      backdrop: "static",
    }
  );

  const infoModal = new bootstrap.Modal(document.getElementById("infoModal"));

  const helperModal = new bootstrap.Modal(
    document.getElementById("helperModal")
  );

  const validationModal = new bootstrap.Modal(
    document.getElementById("validationModal")
  );

  ValidateDataUnitsExistInSessionStorage(
    units,
    helperModal,
    postUnitsButton,
    infoModal
  );

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
                        <input type="number" class="form-control" id="weeks${i}" required min="1">
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
                            <input type="number" class="form-control saber" id="saber${i}" required min="1">
                        </div>
                        <div class="col-md-6 mb-2">
                            <label for="hacerSer${i}" class="form-label">El Hacer-Ser (%)</label>
                            <input type="number" class="form-control hacer-ser" id="hacerSer${i}" required min="1">
                        </div>
                    </div>
                </div>
            </div>
        `;
    learningUnitsContainer.insertAdjacentHTML("beforeend", unitHtml);
  }
  ValidateNumbersPercent();

  ClickButtonEvent(
    postUnitsButton,
    units,
    idSubject,
    URL,
    loadingModal,
    errorModal,
    successModal,
    validationModal
  );
});

function ValidateNumbersPercent() {
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
      if (this.value < 1) {
        this.value = 1;
      }
    });
  });
}

function ClickButtonEvent(
  postUnitsButton,
  units,
  idSubject,
  URL,
  loadingModal,
  errorModal,
  successModal,
  validationModal
) {
  postUnitsButton.addEventListener("click", async () => {
    let allUnitsProcessedSuccessfully = true;

    // Variables para acumular los porcentajes totales
    let totalSaber = 0;
    let totalHacerSer = 0;

    // Primero, recopilar y sumar los porcentajes de todas las unidades
    for (let i = 1; i <= units; i++) {
      const percentKnow =
        parseInt(document.getElementById(`saber${i}`).value) || 0;
      const percentDo =
        parseInt(document.getElementById(`hacerSer${i}`).value) || 0;

      totalSaber += percentKnow;
      totalHacerSer += percentDo;
    }

    // Validar que la suma total sea 100
    if (totalSaber + totalHacerSer !== 100) {
      loadingModal.hide();
      validationModal.show();
      allUnitsProcessedSuccessfully = false;
      return; // Detener el proceso si la validación falla
    }
    loadingModal.show();
    // Si la validación es exitosa, procesar cada unidad
    for (let i = 1; i <= units; i++) {
      const competence = document.getElementById(`competence${i}`).value;
      const weeks = document.getElementById(`weeks${i}`).value;
      const learningsResult = document.getElementById(
        `learningOutcome${i}`
      ).value;
      const integrativeTasks = document.getElementById(
        `integrativeTask${i}`
      ).value;
      const percentKnow = document.getElementById(`saber${i}`).value;
      const percentDo = document.getElementById(`hacerSer${i}`).value;

      try {
        await InsertUnitInServer(
          idSubject,
          competence,
          weeks,
          learningsResult,
          integrativeTasks,
          percentKnow,
          percentDo,
          URL
        );
      } catch (error) {
        console.error("Error al insertar la unidad en el servidor:", error);
        loadingModal.hide();
        errorModal.show();
        allUnitsProcessedSuccessfully = false;
        return; // Salir del bucle si hay un error
      }
    }

    if (allUnitsProcessedSuccessfully) {
      loadingModal.hide();
      successModal.show();
      await CleantSessionStorage();
      setTimeout(() => {
        NavigateToOtherPage("courseRecords.html");
      }, 3000);
    }
  });
}

async function InsertUnitInServer(
  idSubject,
  competence,
  weeks,
  learningsResult,
  integrativeTasks,
  percentKnow,
  percentDo,
  URL
) {
  const unit = {
    id_asignaturas: idSubject,
    Competencia: competence,
    Semanas: weeks,
    Resultado_aprendizaje: learningsResult,
    Tareas_integradoras: integrativeTasks,
    Porcentaje_saber: percentKnow,
    Porcentaje_saber_ser: percentDo,
  };

  await PostLearningUnits(URL, unit);
}

async function PostLearningUnits(URL, unitData) {
  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(unitData),
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

async function CleantSessionStorage() {
  await sessionStorage.removeItem("id_subject");
  await sessionStorage.removeItem("selectedUnits");
  await sessionStorage.removeItem("quantity_units");
}

const NavigateToOtherPage = (pageRoute) => (window.location.href = pageRoute);

function HelperModalTime(helperModal) {
  helperModal.show();
  setTimeout(() => {
    helperModal.hide();
  }, 3000);
}

function ValidateDataUnitsExistInSessionStorage(
  units,
  helperModal,
  postUnitsButton,
  infoModal
) {
  if (!units) {
    postUnitsButton.innerHTML = "";
    infoModal.show();
    setTimeout(() => {
      window.location.href = "index.html";
      return;
    }, 4000);
  } else {
    HelperModalTime(helperModal);
  }
}
