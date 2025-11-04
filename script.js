document.addEventListener('DOMContentLoaded', () => {
    // Selectarea elementelor principale
    const introScreen = document.getElementById('intro-screen');
    const appContent = document.getElementById('app-content');
    const startButton = document.getElementById('start-app-button');
    const analizaForm = document.getElementById('analiza-form');
    const procesInput = document.getElementById('proces-input');
    const domeniuSelect = document.getElementById('domeniu-select');
    const rezultateSection = document.getElementById('rezultate');
    const loadingAnimation = document.getElementById('loading-animation');
    
    // URL-ul tău API Backend (Schimbă-l dacă URL-ul tău Render este diferit)
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
        introScreen.style.display = 'none';
        appContent.style.display = 'flex';
        
        // Animatia de aparitie a formularului
        setTimeout(() => {
            document.querySelector('main').classList.add('initial-app-elements');
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
            alert("Vă rugăm selectați un domeniu și descrieți procesul.");
            return;
        }

        // Ascunde rezultatele anterioare si afiseaza loading
        rezultateSection.style.display = 'none';
        loadingAnimation.style.display = 'flex';
        
        // Ascunde formularul usor in timpul incarcarii
        analizaForm.style.opacity = 0.5;

        await analizeazaProcesul(domeniu, description);
    });

    async function analizeazaProcesul(domeniu, description) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domeniu, description }),
            });

            analizaForm.style.opacity = 1; // Arata formularul la primirea raspunsului

            if (!response.ok) {
                // In caz de eroare (4xx sau 5xx), citeste mesajul de eroare din Backend
                const errorText = await response.text();
                let errorMessage = `Eroare HTTP ${response.status}.`;
                
                try {
                    const jsonError = JSON.parse(errorText);
                    errorMessage = jsonError.error || errorMessage;
                } catch (e) {
                    // Daca nu e JSON, afiseaza textul brut (e.g. o eroare generica de server)
                    errorMessage = `${errorMessage} Detalii: ${errorText.substring(0, 200)}...`;
                }

                throw new Error(errorMessage);
            }

            // Raspuns de succes (200 OK)
            const data = await response.json(); 
            afiseazaRezultate(data, description);

        } catch (error) {
            // Oprirea animatiei de incarcare
            loadingAnimation.style.display = 'none';

            let errorDetails = error.message;

            // Logica îmbunătățită de tratare a erorilor de conexiune și JSON
            // Incearca sa citeasca corpul raspunsului daca eroarea e legata de JSON parsing sau retea
            if (error.response && typeof error.response.text === 'function') {
                try {
                    // Incearca sa citeasca raspunsul ca text simplu
                    errorDetails = await error.response.text();
                    
                    // Incearca sa parseze mesajul de eroare JSON pe care l-am configurat in
