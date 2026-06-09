//Czekanie na załadowanie strony
document.addEventListener('DOMContentLoaded', function() {

    //Obsługa formularza kalkulatora
    
    const form = document.getElementById('tripForm');
    
    //Jeśli formularz istnieje na stronie
    if (form) {
        //Dynamiczna zmiana symbolu waluty w inputach
        const currencySelect = document.getElementById('currency');
        const currencySymbols = document.querySelectorAll('.currency-symbol');
        currencySelect.addEventListener('change', function() {
            const selectedCurrency = this.value;
            currencySymbols.forEach(span => {
                span.textContent = selectedCurrency;
            });
        });
        //Obsługa wysłania formularza
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            //Walidacja danych (Bootstrap validation)
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            const destination = document.getElementById('destination').value;
            const days = parseInt(document.getElementById('days').value) || 0;
            const people = parseInt(document.getElementById('people').value) || 1;
            const transport = parseFloat(document.getElementById('transportCost').value) || 0;
            const accommodation = parseFloat(document.getElementById('accommodationCost').value) || 0;
            const daily = parseFloat(document.getElementById('dailyBudget').value) || 0;
            const currency = document.getElementById('currency').value;

            //Logika: Transport (razem) + (Nocleg * Dni) + (Jedzenie * Dni * Osoby)
            const totalAccommodation = accommodation * days;
            const totalFood = daily * days * people;
            const totalCost = transport + totalAccommodation + totalFood;
            
            //Obliczenie na osobę
            const costPerPerson = totalCost / people;

            //Wyświetlenie wyników
            document.getElementById('resDest').textContent = destination;
            document.getElementById('totalCost').textContent = totalCost.toFixed(2);
            document.getElementById('costPerPerson').textContent = costPerPerson.toFixed(2);
            
            //Aktualizacja walut w wyniku
            document.getElementById('resCurrency').textContent = currency;
            document.getElementById('resCurrencySmall').textContent = currency;

            //Pokazanie karty z wynikiem
            const resultCard = document.getElementById('resultCard');
            resultCard.classList.remove('d-none');
            
            //Płynne przewinięcie do wyniku
            resultCard.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

//Funkcja pomocnicza do resetowania (wywoływana przyciskiem w wyniku)
function resetForm() {
    document.getElementById('tripForm').reset();
    document.getElementById('tripForm').classList.remove('was-validated');
    document.getElementById('resultCard').classList.add('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

//Galeria i Filtrowanie

//Obsługa przycisków filtrowania
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-col');

if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            //Zmiana aktywnego przycisku
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            //Pobranie kategorii z klikniętego przycisku
            const filterValue = button.getAttribute('data-filter');

            //Pętla po zdjęciach
            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');

                if (filterValue === 'all' || filterValue === itemCategory) {
                    item.classList.remove('d-none');
                    item.classList.add('fade-in');
                } else {
                    item.classList.add('d-none');
                    item.classList.remove('fade-in');
                }
            });
        });
    });
}

//Funkcja otwierająca Modal ze zdjęciem
function openModal(element) {
    const imageSrc = element.src;
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.src = imageSrc;
        const myModal = new bootstrap.Modal(document.getElementById('imageModal'));
        myModal.show();
    }
}

//Obsługa formularza kontaktowego

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!contactForm.checkValidity()) {
            contactForm.classList.add('was-validated');
        } else {
            contactForm.classList.add('d-none');
            document.getElementById('successMessage').classList.remove('d-none');
        }
    }, false);
}

//Dashboard + Cele Oszczędnościowe

//Zamienia "4500 PLN" na liczbę
function parseAmount(str) {
    if (!str) return 0;
    //Usuwanie znaków innych niz cyfra
    const num = parseFloat(str.replace(/[^0-9.-]+/g,"")); 
    return isNaN(num) ? 0 : num;
}

//Domyślne dane
const defaultTrips = [
    { city: "Paryż, Francja", date: "12.07.2024", status: "W trakcie", budget: "4500 PLN", saved: 1500, isFinished: false },
    { city: "Tokio, Japonia", date: "05.10.2025", status: "Planowanie", budget: "12000 PLN", saved: 0, isFinished: false },
    { city: "Kraków, Polska", date: "01.05.2023", status: "Zakończone", budget: "800 PLN", saved: 800, isFinished: true }
];

function loadTrips() {
    const storedTrips = localStorage.getItem('myTrips');
    if (storedTrips) {
        let trips = JSON.parse(storedTrips);
        //Migracja, jeśli stare wpisy nie mają pola 'saved'
        trips.forEach(t => { if(t.saved === undefined) t.saved = 0; });
        return trips;
    } else {
        return defaultTrips;
    }
}

function saveTrips(trips) {
    localStorage.setItem('myTrips', JSON.stringify(trips));
    renderTable();
    renderSavings();
}

//Rysowanie tabeli (Główna lista)
function renderTable() {
    const tbody = document.getElementById('tripsTableBody');
    if (!tbody) return;

    const trips = loadTrips();
    tbody.innerHTML = '';

    trips.forEach((trip, index) => {
        const row = document.createElement('tr');
        
        let badgeClass = 'bg-secondary';
        if (trip.status === 'W trakcie') badgeClass = 'bg-warning text-dark';
        if (trip.status === 'Planowanie') badgeClass = 'bg-info text-dark';
        if (trip.status === 'Zakończone' || trip.isFinished) badgeClass = 'bg-success';

        row.innerHTML = `
            <td class="fw-bold city-name">${trip.city}</td>
            <td>${trip.date}</td>
            <td><span class="badge ${badgeClass} status-badge">${trip.status}</span></td>
            <td class="trip-budget">${trip.budget}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-success me-1" ${trip.isFinished ? 'disabled' : ''} onclick="finishTrip(${index})" title="Zakończ">✓</button>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editTrip(${index})">Edytuj</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTrip(${index})">Usuń</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

//Rysowanie celów oszczędnościowych
function renderSavings() {
    const container = document.getElementById('savingsContainer');
    if (!container) return;

    const trips = loadTrips();
    container.innerHTML = '';

    //Pokazanie tylko wycieczek, które nie są zakończone
    const activeTrips = trips.filter(t => !t.isFinished);

    if (activeTrips.length === 0) {
        container.innerHTML = '<p class="text-muted text-center small">Brak aktywnych celów. Dodaj podróż!</p>';
        return;
    }

    //Pętla po wszystkich wycieczkach
    trips.forEach((trip, index) => {
        if (trip.isFinished) return; //Ukrycie zakończonych w sekcji oszczędzania

        const budgetNum = parseAmount(trip.budget);
        const savedNum = trip.saved || 0;
        
        //Obliczanie prcentu
        let percent = 0;
        if (budgetNum > 0) {
            percent = Math.round((savedNum / budgetNum) * 100);
        }
        if (percent > 100) percent = 100;

        //Kolor paska
        const progressColor = percent >= 100 ? 'bg-success' : 'bg-warning text-dark';

        const item = document.createElement('div');
        item.className = 'mb-4';
        item.innerHTML = `
            <div class="d-flex justify-content-between mb-1 align-items-center">
                <span class="fw-bold">${trip.city}</span>
                <small class="text-muted">${savedNum} / ${trip.budget}</small>
            </div>
            <div class="progress" style="height: 25px; cursor: pointer;" onclick="addToSavings(${index})" title="Kliknij, aby dodać wpłatę">
                <div class="progress-bar ${progressColor}" role="progressbar" style="width: ${percent}%;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
                    ${percent}%
                </div>
            </div>
            <div class="d-flex justify-content-end mt-1">
                <button class="btn btn-sm btn-link text-decoration-none p-0" onclick="addToSavings(${index})">+ Wpłać środki</button>
            </div>
        `;
        container.appendChild(item);
    });
}

//Funkcja dodawania pieniędzy
function addToSavings(index) {
    const trips = loadTrips();
    const trip = trips[index];
    
    //Prompt o kwotę
    const amountStr = prompt(`Ile chcesz odłożyć na wyjazd do: ${trip.city}?`, "100");
    if (!amountStr) return;

    const amount = parseAmount(amountStr);
    
    if (amount > 0) {
        // Zwiększenie odłożonej kwoty
        trip.saved = (trip.saved || 0) + amount;
        
        // NOWA FUNKCJA: Zmiana statusu z "Planowanie" na "W trakcie"
        if (trip.status === "Planowanie") {
            trip.status = "W trakcie";
        }
        
        // Zapisanie zmian (to automatycznie odświeży tabelę i paski postępu)
        saveTrips(trips);
    } else {
        alert("Podaj poprawną kwotę!");
    }
}

//Lista Rzeczy do Spakowania (To-Do)
//Domyślna lista rzeczy
const defaultItems = [
    { text: "Paszport", checked: false },
    { text: "Bilety lotnicze", checked: false },
    { text: "Ubezpieczenie", checked: false },
    { text: "Powerbank", checked: true },
    { text: "Krem z filtrem", checked: false }
];

//Pobieranie listy z pamięci
function loadPackingList() {
    const storedList = localStorage.getItem('packingList');
    if (storedList) {
        return JSON.parse(storedList);
    } else {
        return defaultItems;
    }
}

//Zapisywanie listy
function savePackingList(list) {
    localStorage.setItem('packingList', JSON.stringify(list));
    renderPackingList(); //Odświeżanie widoku
}

//Rysowanie listy w HTML
function renderPackingList() {
    const listContainer = document.getElementById('packingList');
    if (!listContainer) return;

    const items = loadPackingList();
    listContainer.innerHTML = '';

    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = "list-group-item d-flex align-items-center justify-content-between";
        
        //Przekreślenia jeśli zaznaczone
        const textStyle = item.checked ? 'text-decoration-line-through text-muted' : '';
        const isChecked = item.checked ? 'checked' : '';

        li.innerHTML = `
            <div class="d-flex align-items-center">
                <input class="form-check-input me-3" type="checkbox" ${isChecked} onchange="toggleItem(${index})">
                <label class="form-check-label ${textStyle}">${item.text}</label>
            </div>
            <button class="btn btn-sm text-danger border-0 bg-transparent" onclick="deleteItem(${index})" title="Usuń">✕</button>
        `;
        listContainer.appendChild(li);
    });
}

//Akcje listy
//Przełączanie statusu
function toggleItem(index) {
    const items = loadPackingList();
    items[index].checked = !items[index].checked;
    savePackingList(items);
}

//Usuwanie elementu z listy
function deleteItem(index) {
    const items = loadPackingList();
    items.splice(index, 1);
    savePackingList(items);
}

//Dodawanie nowego elementu
document.addEventListener('DOMContentLoaded', function() {
    renderPackingList();

    const addItemBtn = document.getElementById('addItemBtn');
    const newItemInput = document.getElementById('newItemInput');

    if (addItemBtn && newItemInput) {
        
        //Funkcja dodawania
        const handleAdd = () => {
            const text = newItemInput.value.trim();
            if (text === "") return;

            const items = loadPackingList();
            items.push({ text: text, checked: false });
            savePackingList(items);
            
            newItemInput.value = "";
        };

        addItemBtn.addEventListener('click', handleAdd);

        newItemInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleAdd();
        });
    }
});

//Obsługa podstrony "Dodaj Podróż"

const addTripForm = document.getElementById('addTripForm');

if (addTripForm) {
    addTripForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        //Walidacja (Bootstrap)
        if (!addTripForm.checkValidity()) {
            addTripForm.classList.add('was-validated');
            return;
        }

        //Pobieranie danych z formularza
        const city = document.getElementById('newCity').value;
        const dateRaw = document.getElementById('newDate').value; // Data w formacie YYYY-MM-DD
        const budget = document.getElementById('newBudget').value;

        //Formatowanie daty
        let dateFormatted = dateRaw;
        if (dateRaw) {
            const d = new Date(dateRaw);
            dateFormatted = d.toLocaleDateString('pl-PL');
        } else {
            dateFormatted = '-';
        }

        //Tworzenie obiektu podróży
        const newTrip = {
            city: city,
            date: dateFormatted,
            status: "Planowanie",
            budget: budget + " PLN",
            saved: 0,
            isFinished: false
        };

        //Pobieranie starej listy, dodanie nowej, zapis
        const trips = loadTrips();
        trips.push(newTrip);
        saveTrips(trips);

        //Przekierowanie do Dashboardu
        window.location.href = 'dashboard.html';
    });
}

//Pozostałe akcje
//Obsługa celów
document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    renderSavings();

    const addBtn = document.getElementById('addTripBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            const city = prompt("Podaj cel podróży:");
            if (!city) return;
            const date = prompt("Data:");
            const budget = prompt("Budżet (np. 2000 PLN):");

            const newTrip = {
                city: city,
                date: date || '-',
                status: "Planowanie",
                budget: budget || '0 PLN',
                saved: 0,
                isFinished: false
            };

            const trips = loadTrips();
            trips.push(newTrip);
            saveTrips(trips);
        });
    }
});

function deleteTrip(index) {
    if (confirm("Usunąć ten wpis?")) {
        const trips = loadTrips();
        trips.splice(index, 1);
        saveTrips(trips);
    }
}

function editTrip(index) {
    const trips = loadTrips();
    const trip = trips[index];

    const newCity = prompt("Edytuj cel:", trip.city);
    if (newCity === null) return;
    const newDate = prompt("Edytuj datę:", trip.date);
    if (newDate === null) return;
    const newBudget = prompt("Edytuj budżet:", trip.budget);
    if (newBudget === null) return;

    trip.city = newCity;
    trip.date = newDate;
    trip.budget = newBudget;
    saveTrips(trips);
}

function finishTrip(index) {
    const trips = loadTrips();
    trips[index].status = "Zakończone";
    trips[index].isFinished = true;
    saveTrips(trips);
}