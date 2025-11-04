// script.js
const API_BASE_URL = 'https://process-optimizer-api.onrender.com';

// Elementele cheie
const loadingAnimation = document.getElementById('loading-animation');
const rezultateContainer = document.getElementById('rezultate');

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

    // 3. Initializare Intersection Observer pentru Animatii Fade-In
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
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
    
    // NOU: Etapa 1 - Incepe Animatia si Ascunde Rezultatele
    rezultateContainer.classList.remove('is-visible');
    rezultateContainer.innerHTML = '';
    
    loadingAnimation.style.display = 'block';
    loadingAnimation.classList.add('is-visible'); 
    
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
        // NOU: Etapa 2 - Afiseaza Rezultatele
        afiseazaRezultatele(data); 
    })
    .catch(error => {
        // NOU: Etapa 2b - Afiseaza Eroarea
        loadingAnimation.classList.remove('is-visible');
        loadingAnimation.style.display = 'none';
        
        rezultateContainer.innerHTML = `<h2 class="error">Eroare de conexiune!</h2><p>Nu s-a putut finaliza cererea catre API. Detalii: ${error.message}</p>`;
        rezultateContainer.classList.add('is-visible'); 
    });
}

/**
 * Prelucrează și afișează datele JSON primite de la Backend.
 */
function afiseazaRezultatele(data) {
    // NOU: Etapa 3 - Ascunde Animatia si Afiseaza Continutul Nou
    loadingAnimation.classList.remove('is-visible');
    
    // Asteapta ca animatia de fade-out a loading-ului sa se termine
    setTimeout(() => {
        loadingAnimation.style.display = 'none';
        
        rezultateContainer.innerHTML = ''; 

        if (data.error) {
            rezultateContainer.innerHTML = `<h2 class="error">Eroare de analiza:</h2><p>${data.error}</p>`;
            rezultateContainer.classList.add('is-visible');
            return;
        }

        let htmlContent = `
            <h2 style="color: var(--primary-color);">Analiza Generala</h2>
            <p style="font-style: italic; border-left: 3px solid var(--primary-color); padding-left: 10px;">${data.analiza_generala}</p>
            <hr style="margin-top: 40px; border-color: var(--border-color);">
            <h3 style="color: var(--text-color);">Oportunitati de Optimizare</h3>
        `;
        
        if (data.oportunitati_optimizare && data.oportunitati_optimizare.length > 0) {
            data.oportunitati_optimizare.forEach((oportunitate, index) => {
                const safePrompt = oportunitate.prompt_cod_relevant.replace(/"/g, '&quot;');
                
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

        htmlContent += `
            <hr style="margin-top: 40px; border-color: var(--border-color);">
            <h3 style="color: var(--secondary-color);">Pasi Urmatori</h3>
            <p>${data.next_steps}</p>
        `;

        rezultateContainer.innerHTML = htmlContent;
        rezultateContainer.classList.add('is-visible'); // Declanseaza animatia de aparitie
        
        // Observa noile carduri generate pentru a le anima
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
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

    }, 500); // Asteapta 500ms pentru a simula tranzitia fluida
}
