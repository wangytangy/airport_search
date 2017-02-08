var Map = require('./google_map.js');
let airports = require("json!../data/airports_us.json");
let id;
let markers = [];
let paths = [];

window.initMap = function() {
  Map.createMap();
}

function handleInputChange(e) {
  //loop through airports, filter by input
  //create <option> element, set it's value
  //append option to <datalist>
  clearTimeout(id);
  id = setTimeout(function() {

    let inputID = e.target.id;
    let input = e.target.value.toLowerCase();
    let dataList = document.getElementById('airports');
    while (dataList.firstChild) dataList.removeChild(dataList.firstChild);
    let airportIDs = Object.keys(airports);

    let filteredList = airportIDs.filter((id) => {
      return (airports[id].IATA.toLowerCase().indexOf(input) !== -1 ||
      airports[id].city.toLowerCase().indexOf(input) !== -1 ||
      airports[id].name.toLowerCase().indexOf(input) !== -1)
    }).slice(0, 10);

    filteredList.forEach((id) => {
      let option = document.createElement('option');
      option.value = `${airports[id].name}` + " " + `(${airports[id].IATA})` + " - " + `${airports[id].city}`;
      dataList.appendChild(option);
    });
  }, 200);
}

function changeHeader(markers, distance) {
  let newHeader = `Total trip distance: `;
  newHeader += `${distance} nautical miles`;
  document.getElementById('header').innerHTML = newHeader;
}

function handleSubmit() {
  let inputVal1 = document.getElementById('input1').value;
  let inputVal2 = document.getElementById('input2').value;

  let matches1 = inputVal1.match(/^[^\(]+/);
  let matches2 = inputVal2.match(/^[^\(]+/);
  let matches = [matches1, matches2]

  //clear markers
  markers = Map.clearMarkers(markers);

  //loop through both inputs, assume "" and null values
  for (let i = 0; i < matches.length; i++) {
    if (matches[i]) {
      let location = airports[matches[i][0].trim()];
      markers.push(Map.setMarkers(location));
    }
  }
  //reset bounds of map
  Map.resetBounds(markers);

  //calculate distance and display it
  let nautMiles = Map.calcDistance(markers);
  changeHeader(markers, nautMiles);

  //clear paths
  path = Map.clearPaths(paths);
  //draw Map.polyline?
  path.push(Map.drawPath(markers));
}

function attachInputListeners() {
  let elements = document.getElementsByTagName('input');
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("keyup", handleInputChange);
  }
}

function attachButtonListener() {
  document.getElementById('submit').addEventListener('click', handleSubmit);
}


document.addEventListener("DOMContentLoaded", function() {
  attachInputListeners();
  attachButtonListener();
});
