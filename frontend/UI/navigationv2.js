let map;
let directionsService;
let directionsRenderer;

function initMap() {
  console.log("Initializing map..."); // Debugging log
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 33.753746, lng: -84.38633 }, // Default center (Georgia State University)
    zoom: 12,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // Define the route with three points
  const routeWithWaypoints = {
    origin: "6360 Jimmy Carter Blvd, Norcross, GA 30071", // Starting point
    destination: "156 Heaton Park Dr, Atlanta, GA 30307", // Final destination
    waypoints: [
      {
        location: "5660 Buford Hwy NE, Doraville, GA 30340", // Intermediate stop
        stopover: true, // Indicates this is a stopover point
      },
    ],
    travelMode: google.maps.TravelMode.DRIVING, // Mode of travel
  };

  // Display the route with waypoints
  directionsService.route(routeWithWaypoints, (response, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(response);
      console.log("Route with waypoints displayed successfully!"); // Debugging log
    } else {
      console.error("Route with waypoints failed due to " + status);
    }
  });
}

// Load the Google Maps API script
function loadGoogleMapsScript() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCshta0wk-KdGcS79W3n68hFte-aKb4rhg&callback=initMap`;
  script.async = true;
  document.head.appendChild(script);
}

// Call the function to load the Google Maps API script
loadGoogleMapsScript();

function calculateAndDisplayRoute() {
  console.log("Calculating route...");
  const start = document.getElementById("startDestination").value;
  const end = document.getElementById("finalDestination").value;
  console.log("Start:", start); // Debugging log
  console.log("End:", end); // Debugging log
  const waypoints = [];

  // Determine the travel mode based on user input
  let travelMode = google.maps.TravelMode.DRIVING; // Default mode
  const transport = document.getElementById("transport").value;

  if (transport === "Walking") {
    travelMode = google.maps.TravelMode.WALKING;
  } else if (transport === "Bicycling") {
    travelMode = google.maps.TravelMode.BICYCLING;
  } else if (transport === "Transit") {
    travelMode = google.maps.TravelMode.TRANSIT;
  }

  // Collect waypoints based on user input
  if (transport === "Driving") {
    const drivingType = document.querySelector(
      'input[name="drivingType"]:checked'
    ).value;
    if (drivingType === "MartaStation") {
      const martaStationPark =
        document.getElementById("martaStationPark").value;
      waypoints.push({ location: martaStationPark, stopover: true });
    } else if (drivingType === "ParkingDeck") {
      const parkingDeck = document.getElementById("parkingDeck").value;
      waypoints.push({ location: parkingDeck, stopover: true });
    }
  } else if (transport === "Marta") {
    const martaStationPark = document.getElementById("martaStationPark").value;
    const martaStationExit = document.getElementById("martaStationExit").value;
    waypoints.push({ location: martaStationPark, stopover: true });
    waypoints.push({ location: martaStationExit, stopover: true });
  } else if (transport === "Walking") {
    const walkingType = document.querySelector(
      'input[name="walkingType"]:checked'
    ).value;
    if (walkingType === "MartaStation") {
      const martaStationWalk =
        document.getElementById("martaStationWalk").value;
      waypoints.push({ location: martaStationWalk, stopover: true });
    }
  }

  // Calculate the route
  directionsService.route(
    {
      origin: start,
      destination: end,
      waypoints: waypoints,
      travelMode: travelMode, // Use the correct travel mode
    },
    (response, status) => {
      if (status === "OK") {
        // Display the route on the map
        directionsRenderer.setDirections(response);

        // Generate a Google Maps link
        const googleMapsLink = generateGoogleMapsLink(
          start,
          end,
          waypoints,
          travelMode
        );
        console.log("Google Maps Link:", googleMapsLink); // Debugging log
        displayGoogleMapsLink(googleMapsLink);
      } else {
        console.error("Directions request failed due to " + status);
        alert(
          "Directions request failed. Please check the addresses and try again."
        );
      }
    }
  );
}

// Generate a Google Maps link
function generateGoogleMapsLink(start, end, waypoints, travelMode) {
  const waypointsParam = waypoints
    .map((waypoint) => waypoint.location)
    .join("|");
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    start
  )}&destination=${encodeURIComponent(end)}&waypoints=${encodeURIComponent(
    waypointsParam
  )}&travelmode=${travelMode.toLowerCase()}`;
}

function displayGoogleMapsLink(link) {
  const existingLinkContainer = document.querySelector(".link-container");
  if (existingLinkContainer) {
    existingLinkContainer.remove();
  }

  const linkContainer = document.createElement("div");
  linkContainer.className = "link-container"; // Add the CSS class
  linkContainer.innerHTML = `<a href="${link}" target="_blank">Open in Google Maps</a>`;
  document.querySelector(".container").appendChild(linkContainer);
  console.log("Link displayed:", link);
}

// Check if user is logged in
function isUserLoggedIn() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return !!token;
}

// Save current route
async function saveCurrentRoute() {
  if (!isUserLoggedIn()) {
    alert("Please log in to save routes");
    return;
  }

  const routeName = prompt("Enter a name for this route:");
  if (!routeName) return;

  const transport = document.getElementById("transport").value;
  const start = document.getElementById("startDestination").value;
  const end = document.getElementById("finalDestination").value;

  const waypoints = [];

  // Collect waypoints based on current form state
  if (transport === "Driving") {
    const drivingType = document.querySelector(
      'input[name="drivingType"]:checked'
    )?.value;

    if (drivingType === "ParkingDeck") {
      const parkingDeck = document.getElementById("parkingDeck").value;
      if (parkingDeck)
        waypoints.push({ location: parkingDeck, stopover: true });
    } else if (drivingType === "MartaStation") {
      const martaStation = document.getElementById("martaStationPark").value;
      if (martaStation)
        waypoints.push({ location: martaStation, stopover: true });
    }
  } else if (transport === "Marta") {
    const martaStart = document.getElementById("martaStationPark").value;
    const martaEnd = document.getElementById("martaStationExit").value;
    if (martaStart) waypoints.push({ location: martaStart, stopover: true });
    if (martaEnd) waypoints.push({ location: martaEnd, stopover: true });
  } else if (transport === "Walking") {
    const walkingType = document.querySelector(
      'input[name="walkingType"]:checked'
    )?.value;
    if (walkingType === "MartaStation") {
      const martaStation = document.getElementById("martaStationWalk").value;
      if (martaStation)
        waypoints.push({ location: martaStation, stopover: true });
    }
  }

  try {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(
      "https://project-pantherpath.onrender.com/save-route",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          route_name: routeName,
          start_location: start,
          end_location: end,
          transport_mode: transport,
          waypoints: waypoints,
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      alert("Route saved successfully!");
      loadSavedRoutes(); // Refresh the list
    } else {
      alert(data.message || "Error saving route");
    }
  } catch (error) {
    console.error("Error saving route:", error);
    alert("Error saving route");
  }
}
// Load saved routes
async function loadSavedRoutes() {
  if (!isUserLoggedIn()) return;

  try {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(
      "https://project-pantherpath.onrender.com/saved-routes",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (response.ok) {
      displaySavedRoutes(data);
    } else {
      console.error("Error loading routes:", data.message);
    }
  } catch (error) {
    console.error("Error loading routes:", error);
  }
}

function displaySavedRoutes(routes) {
  try {
    // Create container if it doesn't exist
    let container = document.getElementById("savedRoutesContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "savedRoutesContainer";
      container.style.display = "none";
      container.innerHTML =
        '<h3>Your Saved Routes</h3><div id="savedRoutesList"></div>';
      document.querySelector(".container").appendChild(container);
    }

    const list =
      document.getElementById("savedRoutesList") ||
      container.querySelector("#savedRoutesList") ||
      document.createElement("div");

    list.id = "savedRoutesList"; // Ensure it has the correct ID
    list.innerHTML = ""; // Clear existing content

    if (!routes || routes.length === 0) {
      list.innerHTML =
        '<p>No saved routes found. Save your first route using the "Save Route" button.</p>';
      container.style.display = "block";
      return;
    }

    // Create route list items
    routes.forEach((route) => {
      const item = document.createElement("div");
      item.className = "saved-route";
      item.innerHTML = `
        <div class="route-info">
          <strong>${route.route_name}</strong>
          <div class="route-details">
            <span>From: ${route.start_location}</span>
            <span>To: ${route.end_location}</span>
            <span>Mode: ${route.transport_mode}</span>
          </div>
        </div>
        <div class="route-actions">
          <button class="load-btn" data-id="${route.route_id}">Load</button>
          <button class="delete-btn" data-id="${route.route_id}" data-name="${route.route_name}">Delete</button>
        </div>
      `;
      list.appendChild(item);
    });
    // Add event listeners
    document.querySelectorAll(".load-btn").forEach((btn) => {
      btn.addEventListener("click", () => loadRoute(btn.dataset.id));
    });

    // Update event listeners for delete buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const routeId = btn.dataset.id;
        const routeName = btn.dataset.name;
        showDeleteConfirmation(routeId, routeName);
      });
    });

    container.style.display = "block";
  } catch (error) {
    console.error("Error displaying routes:", error);
    // Fallback: Create a temporary error message
    const errorMsg = document.createElement("div");
    errorMsg.textContent = "Error loading saved routes";
    errorMsg.style.color = "red";
    document.querySelector(".container").appendChild(errorMsg);
  }
}

// Create the saved routes container if it doesn't exist
function createSavedRoutesContainer() {
  const container = document.createElement("div");
  container.id = "savedRoutesContainer";
  document.querySelector(".container").appendChild(container);
  return container;
}

// Load a specific route
async function loadRoute(routeId) {
  try {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(
      `https://project-pantherpath.onrender.com/saved-routes/${routeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const route = await response.json();
    if (response.ok) {
      // Populate basic fields
      document.getElementById("transport").value = route.transport_mode;
      document.getElementById("startDestination").value = route.start_location;

      // Update form based on transport mode
      updateForm();

      // Set fields based on transport mode and waypoints
      if (route.transport_mode === "Driving") {
        // Determine driving type from waypoints
        if (route.waypoints && route.waypoints.length > 0) {
          const firstWaypoint = route.waypoints[0].location;

          // Check if this is a parking deck or MARTA station
          const isParkingDeck = firstWaypoint.includes("Parking Deck");
          const drivingType = isParkingDeck ? "ParkingDeck" : "MartaStation";

          // Set the radio button
          document.querySelector(
            `input[name="drivingType"][value="${drivingType}"]`
          ).checked = true;
          updateDrivingOptions();

          if (isParkingDeck) {
            document.getElementById("parkingDeck").value = firstWaypoint;
          } else {
            document.getElementById("martaStationPark").value = firstWaypoint;
          }
        }

        // Set final destination
        document.getElementById("finalDestination").value = route.end_location;
      } else if (route.transport_mode === "Marta") {
        if (route.waypoints && route.waypoints.length >= 2) {
          document.getElementById("martaStationPark").value =
            route.waypoints[0].location;
          document.getElementById("martaStationExit").value =
            route.waypoints[1].location;
        }
        document.getElementById("finalDestination").value = route.end_location;
      } else if (route.transport_mode === "Walking") {
        // Determine walking type from waypoints
        if (route.waypoints && route.waypoints.length > 0) {
          document.querySelector(
            'input[name="walkingType"][value="MartaStation"]'
          ).checked = true;
          updateWalkingOptions();
          document.getElementById("martaStationWalk").value =
            route.waypoints[0].location;
        } else {
          document.querySelector(
            'input[name="walkingType"][value="Campus"]'
          ).checked = true;
          updateWalkingOptions();
        }
        document.getElementById("finalDestination").value = route.end_location;
      }

      alert(`Route "${route.route_name}" loaded successfully`);
    } else {
      alert(route.message || "Error loading route");
    }
  } catch (error) {
    console.error("Error loading route:", error);
    alert("Error loading route");
  }
}

// Delete Confirmation Modal
function showDeleteConfirmation(routeId, routeName) {
  const modal = document.createElement("div");
  modal.className = "delete-modal";
  modal.innerHTML = `
    <div class="delete-modal-content">
      <h3>Delete Route</h3>
      <p>Are you sure you want to delete <strong>"${routeName}"</strong>?</p>
      <p>This action cannot be undone.</p>
      <div class="delete-modal-buttons">
        <button class="delete-modal-btn cancel">Cancel</button>
        <button class="delete-modal-btn confirm">Delete</button>
      </div>
    </div>
  `;

  // Add event listeners
  modal.querySelector(".confirm").addEventListener("click", async () => {
    modal.style.opacity = "0";
    try {
      await performRouteDeletion(routeId);
      modal.remove();
    } catch (error) {
      modal.remove();
      showErrorModal("Failed to delete route");
    }
  });

  modal.querySelector(".cancel").addEventListener("click", () => {
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 300);
  });

  document.body.appendChild(modal);
  setTimeout(() => (modal.style.opacity = "1"), 10);
}

// Actual deletion logic
async function performRouteDeletion(routeId) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const response = await fetch(
    `https://project-pantherpath.onrender.com/saved-routes/${routeId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete route");
  }

  // Show success notification
  showSuccessNotification("Route deleted successfully");
  loadSavedRoutes();
}

// Success Notification
function showSuccessNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification success";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Error Modal
function showErrorModal(message) {
  const modal = document.createElement("div");
  modal.className = "delete-modal";
  modal.innerHTML = `
    <div class="delete-modal-content">
      <h3>Error</h3>
      <p>${message}</p>
      <button class="delete-modal-btn cancel" style="margin-top: 20px;">OK</button>
    </div>
  `;

  modal.querySelector("button").addEventListener("click", () => {
    modal.remove();
  });

  document.body.appendChild(modal);
}

// Add save button to the form
function addSaveButton() {
  const form = document.querySelector("form");
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Save Route";
  saveButton.onclick = saveCurrentRoute;
  form.appendChild(saveButton);
}

// Initialize saved routes functionality
function initSavedRoutes() {
  if (isUserLoggedIn()) {
    addSaveButton();
    loadSavedRoutes();
  }
}

initSavedRoutes();
