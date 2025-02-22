document.addEventListener("DOMContentLoaded", ()=>{


    const URL = "https://apiflowershop.onrender.com/api/asignaturas";


    GetCourses(URL);
    
   const courseForm = document.getElementById("courseForm");
   const courseSelect = document.getElementById("courses_select");
   const careerFamilySelect = document.getElementById("careerFamily_select");
   const quarterSelect = document.getElementById("quarter_select");
   const learningUnitsSelect = document.getElementById("learningUnits_select");
   const professorInput = document.getElementById("professor_input");
   const durationInput = document.getElementById("duration_input");
   const competenceLevelTextarea = document.getElementById("competenceLevel_textarea");
   const generalObjectiveTextarea = document.getElementById("generalObjective_textarea");


    courseForm.addEventListener("submit",async (e)=>
    {
        e.preventDefault();
        sessionStorage.removeItem('id_subject');
        sessionStorage.removeItem('selectedUnits');
        sessionStorage.removeItem('quantity_units');


        let courseSelected = courseSelect.value;
        let careerFamilySelected = careerFamilySelect.value;
        let quarterSelected = quarterSelect.value;
        let learningUnitsSelected = learningUnitsSelect.value;
        let professor = professorInput.value;
        let duration = durationInput.value;
        let competenceLevel = competenceLevelTextarea.value;
        let generalObjective = generalObjectiveTextarea.value;

        console.log("Fetch api script dice:");
        console.log("Course Selected:", courseSelected);
        console.log("Career Family Selected:", careerFamilySelected);
        console.log("Quarter Selected:", quarterSelected);
        console.log("Learning Units Selected:", learningUnitsSelected);
        console.log("Professor:", professor);
        console.log("Duration:", duration);
        console.log("Competence Level:", competenceLevel);
        console.log("General Objective:", generalObjective)

        const newCourse = {
            Nombre: courseSelected,
            Profesor: professor,
            Duración: duration,
            Familia_carrera: careerFamilySelected,
            Numero_unidades: learningUnitsSelected,
            Cuatrimestre: quarterSelected,
            Nivel_competencia: competenceLevel,
            Objetivo_generales: generalObjective
        };


        const dataNewIDCourse = await PostCourse(URL, newCourse);
      

        sessionStorage.setItem('id_subject',dataNewIDCourse);
        sessionStorage.setItem('quantity_units', learningUnitsSelected);
        window.location.href = 'learningUnits.html';
     
    });


    courseSelect.addEventListener("change", ()=>
    {
        let courseSelected = courseSelect.value;
        console.log(courseSelected);
    });


    careerFamilySelect.addEventListener("change", ()=>
    {
        let careerFamilySelected = careerFamilySelect.value;
        console.log(careerFamilySelected);
    });


    quarterSelect.addEventListener("change", ()=>
    {
        let quarterSelected = quarterSelect.value;
        console.log(quarterSelected);
    });


    learningUnitsSelect.addEventListener("change", ()=>
    {
        let learningUnitsSelected = learningUnitsSelect.value;
        console.log(learningUnitsSelected);
    });


});


async function GetCourses(URL)
{
    try {
        const response = await fetch(URL); 
        if(!response.ok)
        {
            throw new Error("Ocurrió un error durante la solicitud GET");
        }
        const data =await response.json();
        if(data)
        {
            console.log("Información trida con éxito");
            console.log(data);
        }
    } catch (error) 
    {
        console.error(error);
    }
}


async function GetOneCourse(URL, id) {
    URL = `${URL}/${id}`;
    try {
        const response = await fetch(URL); 
        if(!response.ok)
        {
            throw new Error("Fallo al solicitar un solo curso");
        }
        const data = await response.json();
        if(data)
        {
            console.log("Petición de un solo curso hecha con éxito");
            console.log(data);
        }
    } catch (error) {
        console.error(error);
    }
}


async function PostCourse(URL, courseData) {
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            } ,
            body: JSON.stringify(courseData)
        });
        if(!response.ok)
        {
            throw new Error("Error al realizar ");
        }
        const data = await response.json();
        if(data)
        {
            console.log("Post realizado con éxito");
            return data.id_asignaturas;
        }
    } catch (error) {
        console.error(error);
    }
}