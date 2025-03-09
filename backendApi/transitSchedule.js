const apiEndpoint = 'http://localhost:3000/marta/schedule';

async function fetchTrainSchedule() {
    const selectedStation = document.getElementById('stationSelect').value;
    if (selectedStation === "") {
        displayNoSelection();
        return;
    }

    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        console.log(data);

        const filteredData = selectedStation ? data.filter(train => train.STATION === selectedStation) : data;

        displaySchedule(filteredData);

        document.getElementById('schedule').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        displayError(error);
    }
}

async function initializePage() {
    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        populateStationDropdown(data);
        displayNoSelection();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        displayError(error);
    }
}

function populateStationDropdown(data) {
    const stationSelect = document.getElementById('stationSelect');
    const stations = [...new Set(data.map(train => train.STATION))];

    stations.sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));

    stationSelect.innerHTML = '<option value="">Pick Your Current Station</option>';

    stations.forEach(station => {
        const option = document.createElement('option');
        option.value = station.toUpperCase();
        option.textContent = station.toUpperCase();
        stationSelect.appendChild(option);
    });
}

function displaySchedule(data) {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = '';

    if (data.length === 0) {
        scheduleDiv.innerHTML = '<p>No train schedules available.</p>';
        return;
    }

    const uniqueDestinations = new Map();
    data.forEach(train => {
        if (!uniqueDestinations.has(train.DESTINATION)) {
            uniqueDestinations.set(train.DESTINATION, train);
        }
    });

    const scheduleContainer = document.createElement('div');
    scheduleContainer.classList.add('schedule-container');

    [...uniqueDestinations.values()].forEach((train, index) => {
        const currentTime = new Date();
        const randomMinutes = Math.floor(Math.random() * 30) + 1;
        const eventTime = new Date(currentTime.getTime() + randomMinutes * 60000);

        const formattedTime = eventTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const trainInfo = document.createElement('div');
        trainInfo.classList.add('train-box');
        trainInfo.innerHTML = `
            <p><strong>Destination:</strong> ${train.DESTINATION}</p>
            <p><strong>Arrival Time:</strong> ${formattedTime}</p>
        `;

        trainInfo.style.animationDelay = `${index * 0.2}s`;

        scheduleContainer.appendChild(trainInfo);
    });

    scheduleDiv.appendChild(scheduleContainer);
}

function displayNoSelection() {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = '<p>Please select a station to view the train schedule.</p>';
}

function displayError(error) {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = `<p>Error fetching train schedule: ${error.message}</p>`;
}

window.onload = initializePage;
document.getElementById('stationSelect').addEventListener('change', fetchTrainSchedule);
