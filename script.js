// script.js

// URL-ul Backend-ului tău LIVE pe Render
const API_BASE_URL = 'https://process-optimizer-api.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const analizaForm = document.getElementById('analiza-form');
    analizaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Citim ambele câmpuri
        const domeniuSelectat = document.getElementById('domeniu-select').value;
        const procesText = document.getElementById('proces-input').value;

        if (domeniuSelectat.trim() === "") {
            alert("Te rog alege un Domeniu pentru a începe analiza.");
            return;
        }
        if (procesText.trim() === "") {
            alert("Te rog descrie procesul pentru a începe analiza.");
            return;
        }
        
        // Apelăm funcția cu ambele argumente
        trimitePentruAnaliza(domeniuSelectat, procesText);
    });

    // Adaugă ascultător de evenimente pentru butoanele de copiere
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('copy-btn')) {
            const codeToCopy = event.target.getAttribute('data-code');
            // Folosim navigator.clipboard.writeText pentru a copia
            navigator.clipboard.writeText(codeToCopy).then(() => {
                alert('Codul de automatizare a fost copiat!');
            }).catch(err => {
                console.error('Eroare la copiere:', err);
            });
        }
    });
});

/**
 * Trimite descrierea procesului și domeniul către API-ul Backend.
 * @param {string} domeniu - Domeniul selectat de utilizator.
 * @param {string} procesText - Descrierea procesului introdusă de utilizator.
 */
function trimitePentruAnaliza(domeniu, procesText) {
    const rezultateContainer = document.getElementById('rezultate');
    // Mesaj de așteptare
    rezultateContainer.innerHTML = '<h2>Se analizează procesul... Vă rugăm așteptați.</h2>'; 

    const apiEndpoint = `${API_BASE_URL}/api/analyze`; 

    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            // Trimitem ambele câmpuri
            domeniu: domeniu,
            description: procesText 
        }),
    })
    .then(response => {
        if (!response.ok) {
            // Dacă răspunsul HTTP nu este OK, aruncăm o eroare
            throw new Error(`Eroare HTTP la apelarea API-ului: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Apelăm funcția care afișează rezultatele (aceasta nu mai este "not defined")
        afiseazaRezultatele(data); 
    })
    .catch(error => {
        console.error('Eroare la trimiterea datelor sau la procesare:', error);
        // Afișăm eroarea în interfața utilizatorului
        rezultateContainer.innerHTML = `<h2 class="error">Eroare de conexiune!</h2><p>Nu s-a putut finaliza cererea către API. Detalii: ${error.message}</p>`;
    });
}

/**
 * Prelucrează și afișează datele JSON primite de la Backend.
 * @param {object} data - Obiectul JSON cu analiza procesului (datele simulate/reale).
 */
function afiseazaRezultatele(data) {
    const rezultateContainer = document.getElementById('rezultate');
    rezultateContainer.innerHTML = ''; // Curăță conținutul

    if (data.error) {
        rezultateContainer.innerHTML = `<h2 class="error">Eroare de analiză:</h2><p>${data.error}</p>`;
        return;
    }

    // 1. Analiza Generală
    let htmlContent = `
        <h2 style="color: var(--primary-color);">Analiză Generală</h2>
        <p style="font-style: italic; border-left: 3px solid var(--primary-color); padding-left: 10px;">${data.analiza_generala}</p>
        <hr>
        <h3 style="color: var(--secondary-color);">Oportunități de Optimizare</h3>
    `;
    
    // 2. Oportunitățile de Optimizare
    if (data.oportunitati_optimizare && data.oportunitati_optimizare.length > 0) {
        data.oportunitati_optimizare.forEach((oportunitate, index) => {
            // Escape pentru a folosi în data-code fără probleme
            const safePrompt = oportunitate.prompt_cod_relevant.replace(/"/g, '&quot;');
            
            htmlContent += `
                <div class="card">
                    <h4>${index + 1}. Pas original: **${oportunitate.pas_proces_original}**</h4>
                    <ul>
                        <li>**Ineficiență:** ${oportunitate.tip_ineficienta}</li>
                        <li>**Impact Estim.** (pe săptămână): ${oportunitate.impact_estimat}</li>
                        <li>**Soluție Recomandată:** ${oportunitate.solutie_recomandata} (Instrument: **${oportunitate.instrument_sugerat}**)</li>
                    </ul>
                    
                    <h5 style="margin-top: 15px;">Cod/Prompt Sugerat</h5>
                    <textarea readonly class="prompt-code" style="width: 100%; min-height: 80px; resize: none; margin-bottom: 10px;">${oportunitate.prompt_cod_relevant}</textarea>

                    <button class="copy-btn" data-code="${safePrompt}">Copiază Codul</button>
                </div>
            `;
        });
    } else {
         htmlContent += '<p>Nu au fost identificate oportunități clare de optimizare.</p>';
    }

    // 3. Finalizarea și pașii următori
    htmlContent += `
        <hr>
        <h3 style="color: #6c757d;">Pași Următori</h3>
        <p>${data.next_steps}</p>
    `;

    rezultateContainer.innerHTML = htmlContent;
}
