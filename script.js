// script.js
// URL-ul Backend-ului tău LIVE pe Render
const API_BASE_URL = 'https://process-optimizer-api.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initializare Formular si Event Listener
    const analizaForm = document.getElementById('analiza-form');
    analizaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const domeniuSelectat = document.getElementById('domeniu-select').value;
        const procesText = document.getElementById('proces-input').value;

        if (domeniuSelectat.trim() === "") {
            alert("Te rog alege un Domeniu pentru a incepe analiza.");
            return;
        }
        if (procesText.trim() === "") {
            alert("Te rog descrie procesul pentru a incepe analiza.");
            return;
        }
        
        trimitePentruAnaliza(domeniuSelectat, procesText);
    });

    // 2. Event Listener pentru Copiere Cod
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('copy-btn')) {
            const codeToCopy = event.target.getAttribute('data-code');
            navigator.clipboard.writeText(codeToCopy).then(() => {
                alert('Codul de automatizare a fost copiat!');
            }).catch(err => {
                console.error('Eroare la copiere:', err);
            });
        }
    });

    // NOU: 3. Initializare Intersection Observer pentru Animatii
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Adauga clasa is-visible cand elementul intra in viewport
                entry.target.classList.add('is-visible');
                // Opreste observarea, animatia se face o singura data
                observer.unobserve(entry.target);
            }
        });
    }, {
        // Porneste animatia cand 10% din element este vizibil
        threshold: 0.1 
    });

    // Observa toate elementele care au clasa .fade-in-section
    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });
});

/**
 * Trimite descrierea procesului și domeniul către API-ul Backend.
 */
function trimitePentruAnaliza(domeniu, procesText) {
    const rezultateContainer = document.getElementById('rezultate');
    rezultateContainer.innerHTML = '<h2>Se analizeaza procesul... Va rugam asteptati.</h2>'; 

    const apiEndpoint = `${API_BASE_URL}/api/analyze`; 

    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            domeniu: domeniu,
            description: procesText 
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Eroare HTTP la apelarea API-ului: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        afiseazaRezultatele(data); 
    })
    .catch(error => {
        console.error('Eroare la trimiterea datelor sau la procesare:', error);
        rezultateContainer.innerHTML = `<h2 class="error">Eroare de conexiune!</h2><p>Nu s-a putut finaliza cererea catre API. Detalii: ${error.message}</p>`;
    });
}

/**
 * Prelucrează și afișează datele JSON primite de la Backend.
 */
function afiseazaRezultatele(data) {
    const rezultateContainer = document.getElementById('rezultate');
    rezultateContainer.innerHTML = ''; 

    if (data.error) {
        rezultateContainer.innerHTML = `<h2 class="error">Eroare de analiza:</h2><p>${data.error}</p>`;
        return;
    }

    // 1. Analiza Generala
    let htmlContent = `
        <h2 style="color: var(--primary-color);">Analiza Generala</h2>
        <p style="font-style: italic; border-left: 3px solid var(--primary-color); padding-left: 10px;">${data.analiza_generala}</p>
        <hr style="margin-top: 40px; border-color: var(--border-color);">
        <h3 style="color: var(--text-color);">Oportunitati de Optimizare</h3>
    `;
    
    // 2. Oportunitatile de Optimizare
    if (data.oportunitati_optimizare && data.oportunitati_optimizare.length > 0) {
        data.oportunitati_optimizare.forEach((oportunitate, index) => {
            const safePrompt = oportunitate.prompt_cod_relevant.replace(/"/g, '&quot;');
            
            // Atentie: Adaugam clasa 'card' pentru a beneficia de animatii
            htmlContent += `
                <div class="card"> 
                    <h4>${index + 1}. Pas original: **${oportunitate.pas_proces_original}**</h4>
                    <ul>
                        <li><strong>Ineficienta:</strong> ${oportunitate.tip_ineficienta}</li>
                        <li><strong>Impact Estim.:</strong> ${oportunitate.impact_estimat}</li>
                        <li><strong>Solutie Recomandata:</strong> ${oportunitate.solutie_recomandata} (Instrument: <strong>${oportunitate.instrument_sugerat}</strong>)</li>
                    </ul>
                    
                    <h5 style="margin-top: 20px; color: var(--highlight-color);">Cod/Prompt Sugerat</h5>
                    <textarea readonly class="prompt-code">${oportunitate.prompt_cod_relevant}</textarea>

                    <button class="copy-btn" data-code="${safePrompt}">Copiaza Codul</button>
                </div>
            `;
        });
    } else {
         htmlContent += '<p>Nu au fost identificate oportunitati clare de optimizare.</p>';
    }

    // 3. Finalizarea si pasii urmatori
    htmlContent += `
        <hr style="margin-top: 40px; border-color: var(--border-color);">
        <h3 style="color: var(--secondary-color);">Pasi Urmatori</h3>
        <p>${data.next_steps}</p>
    `;

    rezultateContainer.innerHTML = htmlContent;

    // NOU: Observa noile carduri generate pentru a le anima
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Adauga clasa is-visible pentru a declansa animatia
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('#rezultate .card').forEach(card => {
        observer.observe(card);
    });
}
