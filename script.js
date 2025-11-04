document.addEventListener('DOMContentLoaded', () => {
    // Selectarea elementelor principale
    const introScreen = document.getElementById('intro-screen');
    const appContent = document.getElementById('app-content');
    const startButton = document.getElementById('start-app-button');
    const analizaForm = document.getElementById('analiza-form');
    const analizaButton = analizaForm.querySelector('button[type="submit"]'); // Selecteaza butonul de analiza
    const procesInput = document.getElementById('proces-input');
    const domeniuSelect = document.getElementById('domeniu-select');
    const rezultateSection = document.getElementById('rezultate');
    const loadingAnimation = document.getElementById('loading-animation');
    
    // URL-ul tau API Backend (Asigura-te ca URL-ul Render este corect)
    const API_URL = 'https://process-optimizer-api.onrender.com/api/analyze'; 

    // ----------------------------------------------------
    // 1. Animatie Introductiva
    // ----------------------------------------------------

    // Animatie la incarcarea paginii
    const animateElements = document.querySelectorAll('.animate-intro-h1, .intro-text-container p, .intro-button');
    setTimeout(() => {
        animateElements.forEach(el => el.classList.add('is-visible'));
    }, 100); 

    // Functie pentru a trece la aplicatie
    startButton.addEventListener('click', () => {
        introScreen.style.display = 'none'; // Ascunde ecranul de introducere
        
        // Face containerul aplicatiei vizibil (era "display: none" in HTML)
        appContent.style.display = 'flex'; 
        
        // Animatia de aparitie a formularului
        setTimeout(() => {
            // Face app-content opac (era opacity: 0 in HTML)
            appContent.style.opacity = 1; 
            
            // Adauga clasa pentru animatia elementelor din <main>
            document.querySelector('main').classList.add('initial-app-elements');
            
            // Arata formularul
            analizaForm.classList.add('is-visible');
        }, 50);
    });

    // ----------------------------------------------------
    // 2. Functia Principala de Analiza
    // ----------------------------------------------------

    analizaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const domeniu = domeniuSelect.value;
        const description = procesInput.value;

        if (!domeniu || !description) {
            alert("Va rugam selectati un domeniu si descrieti procesul.");
            return;
        }

        // FEEDBACK VIZUAL START: Schimba textul butonului si dezactiveaza-l
        analizaButton.textContent = 'Analiza in desfasurare...';
        analizaButton.disabled = true;

        // Ascunde rezultatele anterioare si afiseaza loading
        rezultateSection.style.display = 'none';
        loadingAnimation.style.display = 'flex';
        
        // Ascunde formularul usor in timpul incarcarii
        analizaForm.style.opacity = 0.5;

        await analizeazaProcesul(domeniu, description);
    });

    async function analizeazaProcesul(domeniu, description) {
        let response = null; 
        const originalButtonText = 'Analizeaza Procesul'; // Pentru a-l restabili

        try {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domeniu, description }),
            });

            analizaForm.style.opacity = 1; 

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Eroare HTTP ${response.status}.`;
                
                try {
                    const jsonError = JSON.parse(errorText);
                    errorMessage = jsonError.error || errorMessage;
                } catch (e) {
                    errorMessage = `${errorMessage} Detalii: ${errorText.substring(0, 200)}...`;
                }

                throw new Error(errorMessage);
            }

            // Raspuns de succes (200 OK)
            const data = await response.json(); 
            afiseazaRezultate(data, description);

            // FEEDBACK VIZUAL END (SUCCES): Restabileste Butonul
            analizaButton.textContent = originalButtonText; 
            analizaButton.disabled = false;

        } catch (error) {
            // Oprirea animatiei de incarcare
            loadingAnimation.style.display = 'none';

            let errorDetails = error.message;

            // Logica imbunatatita de tratare a erorilor de conexiune si JSON
            if (response && typeof response.text === 'function') {
                try {
                    errorDetails = await response.text();
                    
                    const jsonErr = JSON.parse(errorDetails);
                    if (jsonErr.error) {
                        errorDetails = jsonErr.error;
                    }
                } catch (e) {
                    if (error.message.includes('Unexpected end of JSON input')) {
                        errorDetails = 'Serverul API a raspuns incomplet (Timeout sau eroare interna). Verificati log-urile Backend-ului.';
                    } else {
                        errorDetails = error.message;
                    }
                }
            } else if (error.message.includes('Failed to fetch')) {
                errorDetails = 'Eroare de retea. Verificati ca URL-ul API Backend este corect si ca serverul ruleaza pe Render (status: Available).';
            }

            // FEEDBACK VIZUAL END (EROARE): Restabileste Butonul
            analizaButton.textContent = originalButtonText; 
            analizaButton.disabled = false;
            
            alert(`Eroare de conexiune! Detalii: ${errorDetails}`);
            console.error('Fetch Error:', error);
            
            analizaForm.style.opacity = 1; 
        }
    }

    // ----------------------------------------------------
    // 3. Functia de Afisare a Rezultatelor
    // ----------------------------------------------------

    function afiseazaRezultate(data, procesAnalizat) {
        loadingAnimation.style.display = 'none';
        rezultateSection.innerHTML = ''; // Curata rezultatele anterioare
        rezultateSection.style.display = 'block';
        
        // Adauga o intarziere pentru animatia de fade-in
        setTimeout(() => {
            rezultateSection.classList.add('is-visible');
        }, 50);


        // Titlul si Rezumatul
        rezultateSection.innerHTML += `
            <h2>Rezultate Analiza Automatizari</h2>
            <div id="proces-analizat-box" class="animate-appear delay-1">
                <h3>Proces Analizat:</h3>
                <p>${procesAnalizat}</p>
            </div>
            <div class="card animate-appear delay-2">
                <h4>Analiza Generala</h4>
                <p>${data.analiza_generala}</p>
            </div>
        `;

        // Carduri de Oportunitati
        rezultateSection.innerHTML += `<h3>Oportunitati de Optimizare</h3>`;

        data.oportunitati_optimizare.forEach((op, index) => {
            rezultateSection.innerHTML += `
                <div class="card animate-appear delay-${index + 3}">
                    <h4>Oportunitatea #${index + 1}</h4>
                    <ul>
                        <li><strong>Pasul Ineficient:</strong> ${op.pas_proces_original}</li>
                        <li><strong>Tip Ineficienta:</strong> ${op.tip_ineficienta}</li>
                        <li><strong>Solutie Recomandata:</strong> ${op.solutie_recomandata}</li>
                        <li><strong>Instrument Sugerat:</strong> ${op.instrument_sugerat}</li>
                        <li><strong>Impact Estimativ:</strong> ${op.impact_estimat}</li>
                    </ul>
                    
                    ${op.prompt_cod_relevant && op.prompt_cod_relevant.trim() !== 'N/A' ? 
                        `
                        <p><strong>Prompt/Cod Relevant:</strong></p>
                        <textarea class="prompt-code" readonly>${op.prompt_cod_relevant}</textarea>
                        <button class="copy-btn" onclick="copiazaCod(this)">Copiaza</button>
                        <div style="clear:both;"></div>
                        ` : ''
                    }
                </div>
            `;
        });
        
        // Next Steps
        rezultateSection.innerHTML += `
            <div class="card animate-appear delay-${data.oportunitati_optimizare.length + 3}">
                <h4>Urmatorii Pasi</h4>
                <p>${data.next_steps}</p>
            </div>
        `;

        // Activeaza animatiile
        const resultCards = rezultateSection.querySelectorAll('.animate-appear');
        resultCards.forEach(el => el.classList.add('is-visible'));
    }

    // ----------------------------------------------------
    // 4. Functia de Copiere Cod
    // ----------------------------------------------------

    window.copiazaCod = function(button) {
        const textarea = button.previousElementSibling;
        textarea.select();
        textarea.setSelectionRange(0, 99999); // Pentru mobile
        document.execCommand('copy');
        
        button.textContent = 'Copiat!';
        setTimeout(() => {
            button.textContent = 'Copiaza';
        }, 2000);
    };
});
