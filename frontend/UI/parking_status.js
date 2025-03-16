const parkingLotsData = {
    atlanta: [
      {
        name: "T Deck",
        location: "43 Auburn Ave NE, Atlanta, GA",
        googleMaps: "https://www.google.com/maps/place/T+Deck/@33.7556014,-84.3866261,18.12z/data=!4m5!3m4!1s0x0:0x2472be003b264767!8m2!3d33.755505!4d-84.3871025?shorturl=1",
        hours: `
          <strong>Student/Faculty/Staff/Visitor:</strong><br>
          Monday – Friday: 6:30am to 9:45 pm (Regular Hours)<br>
          Saturday – Sunday, and Monday – Friday<br>
          <bold>After Hours: Permit Access Only</bold>
        `,
        image: "images/T_deck.jpg",
        accessibility: "Yes",
      },
      {
        name: "G Deck",
        location: "121 Collins St, Atlanta, GA",
        googleMaps: "https://www.google.com/maps/place/G+Deck,+Atlanta,+GA+30303/@33.7518943,-84.3886963,17.78z/data=!4m5!3m4!1s0x88f50385c454022b:0x92020658b195760f!8m2!3d33.7520188!4d-84.3875506?shorturl=1",
        hours: `
          <strong>Faculty/Staff/Visitor Parking:</strong><br>
          Monday – Friday: 6:30 a.m. – 9:45 p.m.<br>
          Saturday: 7 a.m. – 9:30 p.m. (Collins St. Entrance only) (Central Ave. closes at 5 p.m.)<br>
          Sunday: 11 a.m. – 9:30 p.m. (Collins St. Entrance only)<br><br>
          <strong>Student Parking:</strong><br>
          Monday – Friday: After 4 p.m. – 9:45 p.m.<br>
          Saturday: 7 a.m. – 9:30 p.m. (Collins St. Entrance only)<br>
          Sunday: 11 a.m. – 9:30 p.m. (Collins St. Entrance only)
        `,
        image: "images/G_deck.jpg",
        accessibility: "Yes",
      },
      {
        name: "K Deck",
        location: "99 Gilmer Street, Atlanta, GA",
        googleMaps: "https://www.google.com/maps/place/K+Deck,+Atlanta,+GA+30303/@33.7511348,-84.3852029,18z/data=!3m1!4b1!4m5!3m4!1s0x88f5038f16826f45:0x43eb437fe435d0b0!8m2!3d33.7511348!4d-84.3841086?shorturl=1",
        hours: `
          6:30am – 9:45pm. No overnight parking.<br>
          Saturday/Sunday (Closed)
        `,
        image: "images/K_Deck.jpg",
        accessibility: "No",
      },
      {
        name: "N Deck",
        location: "99 Gilmer Street, Atlanta, GA",
        googleMaps: "https://www.google.com/maps/place/S+Deck,+Atlanta,+GA+30303/@33.7517045,-84.3846347,18z/data=!3m1!4b1!4m5!3m4!1s0x88f5038f2411d72d:0x6986f87b48a63074!8m2!3d33.7517045!4d-84.3835404?shorturl=1",
        hours: `
          6:30am – 9:45pm. No overnight parking.
        `,
        image: "images/N_Deck.jpg",
        accessibility: "No",
      },
      {
        name: "S Deck",
        location: "99 Gilmer Street, Atlanta, GA",
        googleMaps: "https://www.google.com/maps/place/S+Deck,+Atlanta,+GA+30303/@33.7517045,-84.3846347,18z/data=!3m1!4b1!4m5!3m4!1s0x88f5038f2411d72d:0x6986f87b48a63074!8m2!3d33.7517045!4d-84.3835404?shorturl=1",
        hours: `
          6:30am – 9:45pm. No overnight parking.
        `,
        image: "images/S_Deck.jpg",
        accessibility: "No",
      },
    ],
    alpharetta: [
      {
        name: "Alpharetta Campus",
        location: "3705 Brookside Parkway Alpharetta, GA 30022",
        googleMaps: "https://map.concept3d.com/?id=1108#!ce/29770?ct/29770?s/",
        hours: "6 AM - 9 PM",
        image: "images/Alpharetta_campus.jpg",
        accessibility: "Yes",
      },
    ],
    clarkston: [
      {
        name: "Clarkston Campus",
        location: "555 N Indian Creek Dr, Clarkston, GA",
        googleMaps: "https://map.concept3d.com/?id=1108#!ce/29770?ct/0,29788,29784?s/",
        hours: "7 AM - 8 PM",
        image: "images/Clarkston_campus.jpg",
        accessibility: "Yes",
      },
    ],
    decatur: [
      {
        name: "Decatur Campus",
        location: "3251 Panthersville Rd, Decatur, GA",
        googleMaps: "https://map.concept3d.com/?id=1108#!ce/22382,0,29779,29783,29784,29788,29770?ct/0,22382,29788,29784,29783,29782,29779,29770?mc/33.6892368746062,-84.27616059780122?z/17?lvl/0",
        hours: "6 AM - 9 PM",
        image: "images/decatur_campus.jpeg",
        accessibility: "Yes",
      },
    ],
    dunwoody: [
      {
        name: "Dunwoody Campus",
        location: "2101 Womack Rd, Dunwoody, GA",
        googleMaps: "https://map.concept3d.com/?id=1108#!ce/29770?ct/0,29788,29784?lvl/0?m/290127?mc/33.94174893455726,-84.30360496044159?s/?z/17",
        hours: "7 AM - 10 PM",
        image: "images/Dunwoody_campus.jpeg",
        accessibility: "Yes",
      },
    ],
    newton: [
      {
        name: "Newton Campus",
        location: "239 Cedar Ln, Covington, GA",
        googleMaps: "https://map.concept3d.com/?id=1108#!ce/29770?ct/0,29788,29784?lvl/0?mc/33.60906169230395,-83.75876784324647?z/16",
        hours: "7 AM - 7 PM",
        image: "images/newton_campus.jpg",
        accessibility: "Yes",
      },
    ],
  };
  
  function updateParkingLots() {
    const campus = document.getElementById("campus-select").value;
    const lotsContainer = document.getElementById("parking-lots");
    lotsContainer.innerHTML = ""; // Clear previous content
  
    parkingLotsData[campus].forEach((lot) => {
      const lotDiv = document.createElement("div");
      lotDiv.classList.add("lot");
      lotDiv.textContent = lot.name;
      lotDiv.onclick = () => openInfoBoard(lot);
      lotsContainer.appendChild(lotDiv);
    });
  }
  
  function openInfoBoard(lot) {
    document.getElementById("deck-image").src = lot.image;
    document.getElementById("deck-name").textContent = lot.name;
    document.getElementById("deck-address").innerHTML = `<a href="${lot.googleMaps}" target="_blank">${lot.location}</a>`;
    document.getElementById("deck-hours").innerHTML = lot.hours;
    document.getElementById("accessibility").innerHTML = lot.accessibility;
  
    document.getElementById("info-board").classList.remove("hidden");
    showPage(1);
  }
  
  function closeInfoBoard() {
    document.getElementById("info-board").classList.add("hidden");
  }
  
  function showPage(pageNumber) {
    document.getElementById("page1").classList.toggle("active", pageNumber === 1);
    document.getElementById("page2").classList.toggle("active", pageNumber === 2);
  }
  
  // Load default campus on page load
  window.onload = updateParkingLots;
  