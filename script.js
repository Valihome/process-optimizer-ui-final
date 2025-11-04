// script.js
// ATENTIE: Inlocuieste cu URL-ul tau real (https://process-optimizer-api.onrender.com) daca este diferit
const API_BASE_URL = 'https://process-optimizer-api.onrender.com';

// Elementele cheie
const loadingAnimation = document.getElementById('loading-animation');
const rezultateContainer = document.getElementById('rezultate');
const introScreen = document.getElementById('intro-screen');
const appContent = document.getElementById('app-content');
const analizaForm = document.getElementById('analiza-form');
const procesInput = document.getElementById('proces-input');
const header = document.querySelector('#app-content header');

// Variabila globala pentru a stoca textul procesului introdus
let currentProcessText = '';

// Functie utilitara pentru a repara formatarea Markdown (elimina ** si le inlocuieste cu <strong>)
function formatMarkdown(text) {
    if (typeof text !== 'string') return text;
    // Inlocuieste **text** cu <strong>text</strong>
    return text.replace(/\*\*\s*(.*?)\s*\*\*/g, '<strong>$1</strong>');
}

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // I. LOGICA INTRODUCTIVA SI TRANZITIE
    // ----------------------------------------------------

    // 1. Initializare Animatii Text Intro
    function setupIntroAnimation() {
        // Observator pentru a declansa animatiile la aparitia in viewport
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); 
                }
            });
        };

        const introObserver = new IntersectionObserver(observerCallback, { threshold: 0.1 });

        document.querySelectorAll('.animate-intro-h1, .animate-intro-p').forEach(element => {
            introObserver.observe(element);
        });
    }
    setupIntroAnimation(); 

    // 2. Gestionarea Butonului de Start (Tranzitie Intro -> Aplicatie)
    document.getElementById('start-app-button').addEventListener('click', () => {
        introScreen.style.opacity = '0';
        
        setTimeout(() => {
            introScreen.style.display = 'none';
            appContent.style.display = 'block';
            appContent.offsetHeight; 
            appContent.style.opacity = '1';

            // Fortam aparitia headerului si formularului
            setupAppContentAnimation(); 
        }, 1000); // 1s pentru animatia de fade-out
    });


    // ----------------------------------------------------
    // II. LOGICA APLICATIEI SI ANIMATII
    // ----------------------------------------------------

    // 1. Functie pentru animatiile formularului/headerului
    function setupAppContentAnimation() {
        header.classList.add('initial-app-elements');
        analizaForm.classList.add('initial-app-elements');

        // Pornim animatia secventiala
        setTimeout(() => {
            header.classList.add('is-visible');
        }, 100); 

        setTimeout(() => {
            analizaForm.classList.add('is-visible');
        }, 400); 
    }
    
    // 2. Initializare Formular si Event Listener 
    analizaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const domeniuSelectat = document.getElementById('domeniu-select').value;
        const procesText = procesInput.value;

        if (domeniuSelectat.trim() === "") {
            alert("Te rog alege un Domeniu pentru a incepe analiza.");
            return;
        }
        if (procesText.trim() === "") {
            alert("Te rog descrie procesul pentru a incepe analiza.");
            return;
        }
        
        currentProcessText = procesText;

        trimitePentruAnaliza(domeniuSelectat, procesText);
    });

    // 3. Event Listener pentru Copiere Cod si Reset
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('copy-btn')) {
            const codeToCopy = event.target.getAttribute('data-code');
            navigator.clipboard.writeText(codeToCopy).then(() => {
                alert('Codul de automatizare a fost copiat!');
            }).catch(err => {
                console.error('Eroare la copiere:', err);
            });
        }
        
        if (event.target.id === 'reset-button') {
            rezultateContainer.classList.remove('is-visible');
            setTimeout(() => {
                rezultateContainer.style.display = 'none';
                analizaForm.style.display = 'block'; 
                analizaForm.classList.add('is-visible'); 
                procesInput.value = ''; 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }, 600); // Asteapta fade-out-ul rezultatelor
        }
    });

});

/**
 * Trimite descrierea procesului și domeniul către API-ul Backend.
 */
function trimitePentruAnaliza(domeniu, procesText) {
    // Ascunde formularul si afiseaza animatia de loading
    analizaForm.classList.remove('is-visible');
    analizaForm.style.display = 'none';

    rezultateContainer.style.display = 'none';
    rezultateContainer.classList.remove('is-visible');
    rezultateContainer.innerHTML = ''; 

    loadingAnimation.style.display = 'flex'; 
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
            // Citeste mesajul de eroare din corpul raspunsului
            return response.json().then(errorData => {
                 throw new Error(errorData.error || `Eroare HTTP la apelarea API-ului: ${response.status} ${response.statusText}`);
            });
        }
        return response.json();
    })
    .then(data => {
        afiseazaRezultatele(data); 
    })
    .catch(error => {
        loadingAnimation.classList.remove('is-visible');
        loadingAnimation.style.display = 'none';
        
        // Mesaj de eroare mai detaliat
        const errorMessage = error.message.includes("Failed to fetch") 
            ? "Nu s-a putut stabili conexiunea (API-ul este offline sau neaccesibil). Verificați log-urile Backend."
            : error.message;

        rezultateContainer.innerHTML = `<h2 class="error" style="text-align: center; margin-top: 50px;">Eroare de conexiune!</h2><p style="text-align: center; color: var(--secondary-color);">Detalii: ${errorMessage}</p><div style="text-align: center;"><button id="reset-button">Analizează un alt Proces</button></div>`;
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
            rezultateContainer.innerHTML = `<h2 class="error" style="text-align: center; margin-top: 50px;">Eroare de analiza:</h2><p style="text-align: center; color: var(--secondary-color);">${data.error}</p><div style="text-align: center;"><button id="reset-button">Analizează un alt Proces</button></div>`;
            rezultateContainer.style.display = 'block';
            rezultateContainer.classList.add('is-visible');
            return;
        }

        let htmlContent = `
            <div id="proces-analizat-box" class="animate-appear delay-1">
                <h3>Procesul Analizat</h3>
                <p style="white-space: pre-wrap; color: var(--text-color);">${currentProcessText}</p>
            </div>

            <h2 class="animate-appear delay-2">Analiza Generală</h2>
            <p class="animate-appear delay-3" style="font-style: italic; border-left: 3px solid var(--primary-color); padding-left: 10px;">${formatMarkdown(data.analiza_generala)}</p>
            <hr style="margin-top: 40px; border-color: var(--border-color);" class="animate-appear delay-4">
            <h3 class="animate-appear delay-5" style="color: var(--text-color);">Oportunități de Optimizare</h3>
        `;
        
        let baseDelay = 6; 
        
        if (data.oportunitati_optimizare && data.oportunitati_optimizare.length > 0) {
            data.oportunitati_optimizare.forEach((oportunitate, index) => {
                const safePrompt = oportunitate.prompt_cod_relevant.replace(/"/g, '&quot;');
                
                htmlContent += `
                    <div class="card animate-appear delay-${baseDelay + index}"> 
                        <h4>${index + 1}. Pas original: ${formatMarkdown(oportunitate.pas_proces_original)}</h4>
                        <ul>
                            <li><strong>Ineficienta:</strong> ${formatMarkdown(oportunitate.tip_ineficienta)}</li>
                            <li><strong>Impact Estim.:</strong> ${formatMarkdown(oportunitate.impact_estimat)}</li>
                            <li><strong>Solutie Recomandata:</strong> ${formatMarkdown(oportunitate.solutie_recomandata)} (Instrument: <strong>${formatMarkdown(oportunitate.instrument_sugerat)}</strong>)</li>
                        </ul>
                        
                        <h5 style="margin-top: 20px; color: var(--highlight-color);">Cod/Prompt Sugerat</h5>
                        <textarea readonly class="prompt-code">${oportunitate.prompt_cod_relevant}</textarea>

                        <button class="copy-btn" data-code="${safePrompt}">Copiaza Codul</button>
                    </div>
                `;
            });
        } else {
            htmlContent += '<p class="animate-appear delay-6" style="text-align: center; color: var(--secondary-color);">Nu au fost identificate oportunitati clare de optimizare.</p>';
        }

        const finalDelay = baseDelay + (data.oportunitati_optimizare ? data.oportunitati_optimizare.length : 0);
        htmlContent += `
            <hr style="margin-top: 40px; border-color: var(--border-color);" class="animate-appear delay-${finalDelay + 1}">
            <h3 class="animate-appear delay-${finalDelay + 2}" style="color: var(--secondary-color);">Pasi Urmatori</h3>
            <p class="animate-appear delay-${finalDelay + 3}">${formatMarkdown(data.next_steps)}</p>
            
            <div style="text-align: center;" class="animate-appear delay-${finalDelay + 4}">
                <button id="reset-button">Analizează un alt Proces</button>
            </div>
        `;

        rezultateContainer.innerHTML = htmlContent;
        rezultateContainer.style.display = 'block';
        rezultateContainer.classList.add('is-visible');
        
        // Re-aplica observer-ul pe noile elemente animate din rezultate
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        };
        const resultsObserver = new IntersectionObserver(observerCallback, { threshold: 0.1 });
        document.querySelectorAll('#rezultate .animate-appear').forEach(element => {
            resultsObserver.observe(element);
        });

    }, 600); 
}
