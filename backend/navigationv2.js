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
