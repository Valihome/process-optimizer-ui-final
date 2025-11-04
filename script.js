document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-analysis-btn');
    const introSection = document.getElementById('intro');
    const analysisContent = document.getElementById('analysis-content');
    const analizaForm = document.getElementById('analiza-form');
    const rezultateContainer = document.getElementById('rezultate');

    // Functie pentru a trece de la Pagina de Bun Venit la Pagina de Analiza
    startBtn.addEventListener('click', () => {
        introSection.style.display = 'none'; // Ascunde pagina de bun venit
        analysisContent.style.display = 'block'; // Arata pagina de analiza (formular + disclaimer)
        window.scrollTo(0, 0); // Scrolleaza in partea de sus a paginii
    });


    // Logica de Trimite Formularul (Pastrata de la versiunile anterioare)
    analizaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const domeniu = document.getElementById('domeniu-select').value;
        const procesText = document.getElementById('proces-input').value;

        if (!procesText) {
            rezultateContainer.innerHTML = '<p class="error">Va rugam descrieti procesul in caseta de text.</p>';
            rezultateContainer.style.display = 'block';
            return;
        }

        // 1. Pregateste ecranul pentru rezultate
        trimitePentruAnaliza(domeniu, procesText);
    });

    function trimitePentruAnaliza(domeniu, procesText) {
        // Facem containerul de rezultate vizibil
        rezultateContainer.style.display = 'block'; 
        rezultateContainer.innerHTML = '<h2>Se analizeaza procesul... Va rugam asteptati.</h2>'; 

        const apiUrl = 'https://process-optimizer-api.onrender.com/api/analyze'; // URL-ul tau de Backend pe Render

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ domeniu: domeniu, description: procesText }),
        })
        .then(response => {
            if (!response.ok) {
                // Dacă răspunsul nu este OK (ex: 500 Server Error)
                return response.json().then(errorData => {
                    throw new Error(errorData.error || `Eroare HTTP: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            // 2. Afiseaza rezultatele
            afiseazaRezultatele(data);
        })
        .catch(error => {
            console.error('Eroare la Fetch:', error);
            rezultateContainer.innerHTML = `<h2 class="error">Eroare la procesarea cererii:</h2><p class="error">${error.message}</p><p>Va rugam verificati log-urile Backend-ului sau incercati din nou.</p>`;
        });
    }

    function afiseazaRezultatele(data) {
        if (data.error) {
            rezultateContainer.innerHTML = `<h2 class="error">Eroare de Raspuns AI</h2><p class="error">${data.error}</p>`;
            return;
        }

        let html = '<h2>Analiza Procesului Dvs.</h2>';
        
        // 1. Analiza Generala
        html += `<div class="card">
                    <h3>Rezumat General</h3>
                    <p>${data.analiza_generala}</p>
                 </div>`;

        // 2. Oportunitati de Optimizare
        html += '<h3>Oportunitati de Automatizare si Eficientizare</h3>';
        
        data.oportunitati_optimizare.forEach((oportunitate, index) => {
            html += `<div class="card">
                        <h4>Oportunitatea #${index + 1}: ${oportunitate.solutie_recomandata}</h4>
                        <ul>
                            <li><strong>Pasul Original:</strong> ${oportunitate.pas_proces_original}</li>
                            <li><strong>Tip Ineficienta:</strong> ${oportunitate.tip_ineficienta}</li>
                            <li><strong>Impact Estim.:</strong> ${oportunitate.impact_estimat}</li>
                            <li><strong>Instrument Sugerat:</strong> ${oportunitate.instrument_sugerat}</li>
                            <li><strong>Cod/Prompt Relevant:</strong> <textarea readonly class="prompt-code">${oportunitate.prompt_cod_relevant}</textarea></li>
                        </ul>
                    </div>`;
        });

        // 3. Next Steps
        html += `<div class="card">
                    <h3>Următorii Pași</h3>
                    <p>${data.next_steps}</p>
                 </div>`;

        rezultateContainer.innerHTML = html;
    }
});
