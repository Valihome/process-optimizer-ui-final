// script.js
// URL-ul Backend-ului tău LIVE pe Render
const API_BASE_URL = 'https://process-optimizer-api.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const analizaForm = document.getElementById('analiza-form');
    analizaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // NOU: Citim ambele câmpuri
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
        
        // NOU: Apelăm funcția cu ambele argumente
        trimitePentruAnaliza(domeniuSelectat, procesText);
    });

    // Adaugă ascultător de evenimente pentru butoanele de copiere (rămâne neschimbat)
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
});

/**
 * Trimite descrierea procesului și domeniul către API-ul Backend.
 * @param {string} domeniu - Domeniul selectat de utilizator.
 * @param {string} procesText - Descrierea procesului introdusă de utilizator.
 */
function trimitePentruAnaliza(domeniu, procesText) {
    const rezultateContainer = document.getElementById('rezultate');
    rezultateContainer.innerHTML = '<h2>Se analizează procesul... Vă rugăm așteptați.</h2>'; // Mesaj de așteptare

    const apiEndpoint = `${API_BASE_URL}/api/analyze`; 

    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            // NOU: Trimitem ambele câmpuri
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
        console.error('Eroare la trimiterea datelor:', error);
        rezultateContainer.innerHTML = `<h2 class="error">Eroare de conexiune!</h2><p>Nu s-a putut contacta API-ul Backend. Detalii: ${error.message}</p>`;
    });
}

// ... (Funcția afiseazaRezultatele(data) rămâne neschimbată) ...
// Asigură-te că includeți funcția afiseazaRezultatele în fișier.