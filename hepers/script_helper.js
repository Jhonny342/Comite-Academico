document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('courseForm');
    const learningUnitsSelect = document.getElementById('learningUnits');
    const learningUnitsContainer = document.getElementById('learningUnitsContainer');
    const recordsList = document.getElementById('recordsList');

    learningUnitsSelect.addEventListener('change', function() {
        const units = parseInt(this.value);
        learningUnitsContainer.innerHTML = '';

        for (let i = 1; i <= units; i++) {
            const unitHtml = `
                <div class="mb-3 border p-3">
                    <h4>Learning Unit ${i}</h4>
                    <div class="mb-2">
                        <label for="competence${i}" class="form-label">Specific Competence</label>
                        <textarea class="form-control" id="competence${i}" required></textarea>
                    </div>
                    <div class="mb-2">
                        <label for="weeks${i}" class="form-label">Number of Weeks</label>
                        <input type="number" class="form-control" id="weeks${i}" required>
                    </div>
                    <div class="mb-2">
                        <label for="learningOutcome${i}" class="form-label">Learning Outcome</label>
                        <textarea class="form-control" id="learningOutcome${i}" required></textarea>
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
            `;
            learningUnitsContainer.insertAdjacentHTML('beforeend', unitHtml);
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate total percentages
        const saberInputs = document.querySelectorAll('.saber');
        const hacerSerInputs = document.querySelectorAll('.hacer-ser');
        let totalSaber = 0;
        let totalHacerSer = 0;

        saberInputs.forEach(input => totalSaber += parseInt(input.value) || 0);
        hacerSerInputs.forEach(input => totalHacerSer += parseInt(input.value) || 0);

        if (totalSaber + totalHacerSer !== 100) {
            alert('The sum of "El Saber" and "El Hacer-Ser" percentages must be 100%');
            return;
        }

        // Create record
        const record = {
            quarter: document.getElementById('quarter').value,
            subject: document.getElementById('subject').value,
            objective: document.getElementById('generalObjective').value,
            weeks: Array.from(document.querySelectorAll('[id^="weeks"]')).reduce((sum, input) => sum + parseInt(input.value), 0)
        };

        const row = `
            <tr>
                <td>${record.quarter}</td>
                <td>${record.subject}</td>
                <td>${record.objective.substring(0, 50)}...</td>
                <td>${record.weeks}</td>
                <td><button class="btn btn-info btn-sm" onclick="showDetails(this)">Details</button></td>
            </tr>
        `;
        recordsList.insertAdjacentHTML('beforeend', row);

        // Clear form
        form.reset();
        learningUnitsContainer.innerHTML = '';
    });
});

function showDetails(button) {
    const row = button.closest('tr');
    const cells = row.cells;

    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <p><strong>Quarter:</strong> ${cells[0].textContent}</p>
        <p><strong>Subject:</strong> ${cells[1].textContent}</p>
        <p><strong>General Objective:</strong> ${cells[2].textContent}</p>
        <p><strong>Total Weeks:</strong> ${cells[3].textContent}</p>
    `;

    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
}