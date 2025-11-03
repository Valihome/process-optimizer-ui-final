// script.js
// URL-ul Backend-ului tău LIVE pe Render
const API_BASE_URL = 'https://process-optimizer-api.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // ... (restul logicii de DOMContentLoaded și click events) ...
    const analizaForm = document.getElementById('analiza-form');
    analizaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const procesText = document.getElementById('proces-input').value;
        if (procesText.trim() === "") {
            alert("Te rog descrie procesul.");
            return;
        }
        trimitePentruAnaliza(procesText);
    });
    // ...
});

function trimitePentruAnaliza(procesText) {
    // ... (Logica de afișare mesaj așteptare) ...

    const apiEndpoint = `${API_BASE_URL}/api/analyze`; // Apelul corect

    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: procesText }),
    })
    // ... (restul logicii .then() și .catch(), inclusiv afiseazaRezultatele)
}

// ... (Nu uita să incluzi și funcția afiseazaRezultatele(data)) ...
