let map;
let directionsService;
let directionsRenderer;

function initMap() {
  // Initialize the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 33.753746, lng: -84.38633 }, // Georgia State University
    zoom: 15,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
}

function calculateAndDisplayRoute(start, end, mode) {
  directionsService.route(
    {
      origin: start,
      destination: end,
      travelMode: mode,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);

        const navigationLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          start
        )}&destination=${encodeURIComponent(
          end
        )}&travelmode=${mode.toLowerCase()}`;

        // Check if button already exists
        let startNavigationButton = document.querySelector(
          ".start-navigation-button"
        );
        if (!startNavigationButton) {
          // Create button if it doesn't exist
          startNavigationButton = document.createElement("a");
          startNavigationButton.className = "btn start-navigation-button"; // Use your existing button class
          startNavigationButton.style.marginTop = "20px";
          document
            .querySelector(".container")
            .appendChild(startNavigationButton);
        }

        // Update button properties
        startNavigationButton.href = navigationLink;
        startNavigationButton.target = "_blank";
        startNavigationButton.textContent = "Start Navigation in Google Maps";
        // Display turn-by-turn directions after the button
        const directionsPanel = document.getElementById("directions-panel");
        directionsPanel.innerHTML = "<h3>Turn-by-Turn Directions</h3>"; // Clear previous directions and add a heading
        response.routes[0].legs[0].steps.forEach((step, index) => {
          const stepElement = document.createElement("div");
          stepElement.innerHTML = `<strong>Step ${index + 1}:</strong> ${
            step.instructions
          }`;
          directionsPanel.appendChild(stepElement);
        });
      } else {
        console.error("Directions request failed due to " + status);
        alert(
          "Directions request failed. Please check the addresses and try again."
        );
      }
    }
  );
}

document
  .getElementById("navigation-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const mode = document.getElementById("mode").value;

    calculateAndDisplayRoute(start, end, mode);
  });

window.initMap = initMap;
