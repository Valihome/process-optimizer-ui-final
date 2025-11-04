document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-analysis-btn');
    const introSection = document.getElementById('intro');
    const analysisContent = document.getElementById('analysis-content');
    const analizaForm = document.getElementById('analiza-form');
    const rezultateContainer = document.getElementById('rezultate');
    const mainHeader = document.getElementById('main-header'); 
    const submitBtn = document.getElementById('submit-analysis-btn'); 

    // Functie pentru a trece de la Pagina de Bun Venit la Pagina de Analiza
    startBtn.addEventListener('click', () => {
        introSection.style.display = 'none'; 
        analysisContent.style.display = 'block'; 
        mainHeader.style.display = 'none'; 
        window.scrollTo(0, 0); 
    });


    // Logica de Trimite Formularul
    analizaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const domeniu = document.getElementById('domeniu-select').value;
        const procesText = document.getElementById('proces-input').value;

        if (!procesText) {
            rezultateContainer.innerHTML = '<p class="error">Va rugam descrieti procesul in caseta de text.</p>';
            rezultateContainer.style.display = 'block';
            return;
        }

        trimitePentruAnaliza(domeniu, procesText);
    });

    function trimitePentruAnaliza(domeniu, procesText) {
        // Ascunde butonul de trimitere imediat dupa apăsare
        submitBtn.style.display = 'none'; 
        
        rezultateContainer.style.display = 'block'; 
        rezultateContainer.innerHTML = '<h2>Se analizeaza procesul... Va rugam asteptati.</h2>'; 

        const apiUrl = 'https://process-optimizer-api.onrender.com/api/analyze'; 

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ domeniu: domeniu, description: procesText }),
        })
        .then(response => {
            submitBtn.style.display = 'block'; 

            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || `Eroare HTTP: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
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
        
        // 1. Analiza Generala (Rămâne vizibilă)
        html += `<div class="card general-card">
                    <h3>Rezumat General</h3>
                    <p>${data.analiza_generala}</p>
                 </div>`;

        // 2. Oportunitati de Optimizare (Acordeon)
        html += '<h3>Oportunitati de Automatizare si Eficientizare</h3>';
        
        data.oportunitati_optimizare.forEach((oportunitate, index) => {
            const accordionId = `accordion-${index}`;
            
            // Titlul acordionului (vizibil, clickabil)
            html += `<div class="accordion-item">
                        <button class="accordion-header" id="header-${accordionId}">
                            Oportunitatea #${index + 1}: ${oportunitate.solutie_recomandata}
                            <span class="accordion-icon">+</span>
                        </button>

                        <div class="accordion-content" id="${accordionId}">
                            <ul>
                                <li><strong>Pasul Original:</strong> ${oportunitate.pas_proces_original}</li>
                                <li><strong>Tip Ineficienta:</strong> ${oportunitate.tip_ineficienta}</li>
                                <li><strong>Impact Estim.:</strong> ${oportunitate.impact_estimat}</li>
                                <li><strong>Instrument Sugerat:</strong> ${oportunitate.instrument_sugerat}</li>
                            </ul>
                            <h4>Snippet de Cod/Prompt</h4>
                            <textarea readonly class="prompt-code">${oportunitate.prompt_cod_relevant}</textarea>
                        </div>
                    </div>`;
        });

        // 3. Next Steps (Rămâne vizibil)
        html += `<div class="card general-card">
                    <h3>Următorii Pași</h3>
                    <p>${data.next_steps}</p>
                 </div>`;

        rezultateContainer.innerHTML = html;
        
        // Adaugă event listener după ce conținutul este injectat în DOM
        setupAccordionListeners();
    }

    function setupAccordionListeners() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = document.getElementById(header.id.replace('header-', ''));
                const icon = header.querySelector('.accordion-icon');
                
                // Toggle clasa "active" pe header
                header.classList.toggle('active');

                if (content.style.maxHeight) {
                    // Dacă este deschis, închide-l
                    content.style.maxHeight = null;
                    icon.textContent = '+';
                } else {
                    // Dacă este închis, deschide-l
                    // Închide toate celelalte acordeoane
                    document.querySelectorAll('.accordion-content').forEach(otherContent => {
                         if (otherContent !== content) {
                             otherContent.style.maxHeight = null;
                             document.getElementById(`header-${otherContent.id}`).classList.remove('active');
                             document.getElementById(`header-${otherContent.id}`).querySelector('.accordion-icon').textContent = '+';
                         }
                    });
                    
                    // Setează înălțimea la înălțimea sa reală + o mică marjă
                    content.style.maxHeight = content.scrollHeight + 30 + "px";
                    icon.textContent = '—';
                }
            });
        });
    }
});
