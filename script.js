// script.js
const API_BASE_URL = 'https://process-optimizer-api.onrender.com';

// Elementele cheie
const loadingAnimation = document.getElementById('loading-animation');
const rezultateContainer = document.getElementById('rezultate');
const pageContent = document.getElementById('page-content');

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

    // NOU: Functie pentru a face elementele sa apara secvential
    function setupAppearAnimation() {
        const observerOptions = {
            root: null, // Observa in raport cu viewport-ul
            rootMargin: '0px',
            threshold: 0.1 // Cand 10% din element e vizibil
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Opreste observarea dupa animatie
                }
            });
        };

        const appearObserver = new IntersectionObserver(observerCallback, observerOptions);

        // Aplica observatorul pe elementele cu clasa .animate-appear
        document.querySelectorAll('.animate-appear').forEach(element => {
            appearObserver.observe(element);
        });
    }

    // Afiseaza continutul paginii si porneste animatiile initiale
    document.body.classList.remove('initial-hidden');
    pageContent.style.opacity = '1';
    setupAppearAnimation(); 
});

/**
 * Trimite descrierea procesului și domeniul către API-ul Backend.
 */
function trimitePentruAnaliza(domeniu, procesText) {
    // Ascunde rezultatele vechi si afiseaza animatia de loading
    rezultateContainer.style.display = 'none';
    rezultateContainer.classList.remove('is-visible');
    rezultateContainer.innerHTML = ''; // Curata pentru noua analiza

    loadingAnimation.style.display = 'flex'; // Afiseaza animatia de loading
    loadingAnimation.classList.add('is-visible'); // Animația de apariție a loading-ului
    
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
        loadingAnimation.classList.remove('is-visible');
        loadingAnimation.style.display = 'none';
        
        rezultateContainer.innerHTML = `<h2 class="error" style="text-align: center; margin-top: 50px;">Eroare de conexiune!</h2><p style="text-align: center; color: var(--secondary-color);">${error.message}</p>`;
        rezultateContainer.style.display = 'block';
        rezultateContainer.classList.add('is-visible');
    });
}

/**
 * Prelucrează și afișează datele JSON primite de la Backend.
 */
function afiseazaRezultatele(data) {
    // Ascunde animatia de loading
    loadingAnimation.classList.remove('is-visible');
    
    // Asteapta ca animatia de fade-out a loading-ului sa se termine
    setTimeout(() => {
        loadingAnimation.style.display = 'none';
        
        if (data.error) {
            rezultateContainer.innerHTML = `<h2 class="error" style="text-align: center; margin-top: 50px;">Eroare de analiza:</h2><p style="text-align: center; color: var(--secondary-color);">${data.error}</p>`;
            rezultateContainer.style.display = 'block';
            rezultateContainer.classList.add('is-visible');
            return;
        }

        let htmlContent = `
            <h2 class="animate-appear delay-1">Analiza Generala</h2>
            <p class="animate-appear delay-2" style="font-style: italic; border-left: 3px solid var(--primary-color); padding-left: 10px;">${data.analiza_generala}</p>
            <hr style="margin-top: 40px; border-color: var(--border-color);" class="animate-appear delay-3">
            <h3 class="animate-appear delay-4" style="color: var(--text-color);">Oportunitati de Optimizare</h3>
        `;
        
        if (data.oportunitati_optimizare && data.oportunitati_optimizare.length > 0) {
            data.oportunitati_optimizare.forEach((oportunitate, index) => {
                const safePrompt = oportunitate.prompt_cod_relevant.replace(/"/g, '&quot;');
                
                // Fiecare card apare cu o intarziere suplimentara
                htmlContent += `
                    <div class="card animate-appear delay-${5 + index}"> 
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
            htmlContent += '<p class="animate-appear delay-5" style="text-align: center; color: var(--secondary-color);">Nu au fost identificate oportunitati clare de optimizare.</p>';
        }

        htmlContent += `
            <hr style="margin-top: 40px; border-color: var(--border-color);" class="animate-appear delay-${5 + data.oportunitati_optimizare.length}">
            <h3 class="animate-appear delay-${6 + data.oportunitati_optimizare.length}" style="color: var(--secondary-color);">Pasi Urmatori</h3>
            <p class="animate-appear delay-${7 + data.oportunitati_optimizare.length}">${data.next_steps}</p>
        `;

        rezultateContainer.innerHTML = htmlContent;
        rezultateContainer.style.display = 'block';
        
        // Re-aplica observer-ul pe noile elemente animate din rezultate
        const observerOptions = {
            root: null, 
            rootMargin: '0px',
            threshold: 0.1 
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); 
                }
            });
        };
        const appearObserver = new IntersectionObserver(observerCallback, observerOptions);
        document.querySelectorAll('#rezultate .animate-appear').forEach(element => {
            appearObserver.observe(element);
        });

    }, 600); // Asteapta mai mult pentru o tranzitie mai fluida
}
