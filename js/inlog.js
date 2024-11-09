// Functie om de naam op te slaan in localStorage en de gebruiker naar inlog1.html te sturen
function saveName() {
    var name = document.getElementById('name').value;
    if (name) {
        localStorage.setItem('userName', name);
        window.location.href = 'inlog1.html'; // Gaat naar de volgende pagina
    }
}

// Wacht tot de DOM volledig is geladen
document.addEventListener('DOMContentLoaded', function () {
    var loginForm = document.getElementById('loginForm');

    // Als het formulier op de inlog.html staat
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Voorkomt standaard submitgedrag
            saveName(); // Slaat de naam op en navigeert naar de volgende pagina
        });
    }

    // Als de gebruiker op de inlog1.html pagina is
    var helloElement = document.getElementById('hello');
    if (helloElement) {
        // Verwijder "ACCESS GRANTED" na 2 seconden
        setTimeout(function () {
            var accessText = document.querySelector('.h2');
            if (accessText) {
                accessText.remove(); // Verwijder de 'ACCESS GRANTED' tekst
            }
        }, 2000);

        // Functie om de naam weer te geven
        function displayText() {
            var name = localStorage.getItem('userName') || 'USER';
            document.getElementById("hello").textContent = "GOOD LUCK WITH THE MISSION, " + name.toUpperCase();
        }

        // Roep de displayText functie aan na 2,5 seconden
        setTimeout(displayText, 2500);
    }
});

setTimeout(() => {
    const sometext = document.getElementById('hello');

    sometext.style.display = 'none';

}, 5500);