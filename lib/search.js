var Util = require('./google_map.js');
let airports = require("json!../data/airports_us.json");

// callback for Google Map
window.initMap = Util.createMap

var Search = (function() {
  let timerID;
  let markers = [];
  let paths = [];

  function handleInputChange(e) {
    //sets a delay for the callback to be executed
    //avoids unnecessary computation, executes when user pauses typing for 300ms
    clearTimeout(timerID);
    timerID = setTimeout(function() {
      let input = e.target.value.toLowerCase();
      let airportIDs = Object.keys(airports);

      //loop through airports, filter by input
      let filteredList = airportIDs.filter((key) =>
        isAirportMatch(key, input)
      ).slice(0, 10);

      createSearchResults(filteredList);
    }, 300);
  }

  function createSearchResults(list) {
    //remove previous search results before adding new ones
    let dataList = document.getElementById('airports');
    while (dataList.firstChild) dataList.removeChild(dataList.firstChild);

    //create <option> elements, set it's value, append to datalist
    list.forEach((key) => {
      let option = document.createElement('option');
      option.value =
      `${airports[key].name} (${airports[key].IATA}) - ${airports[key].city}`;
      dataList.appendChild(option);
    });
  }

  function isAirportMatch(key, input) {
    return airports[key].IATA.toLowerCase().includes(input) ||
    airports[key].city.toLowerCase().includes(input) ||
    airports[key].name.toLowerCase().includes(input);
  }

  function changeHeader(markers, distance) {
    let newHeader = `Total trip distance: ${distance} nautical miles`;
    document.getElementById('header').innerHTML = newHeader;
  }


  function handleSubmit() {
    //clear markers
    markers = Util.clearMarkers(markers);

    //gets the lat and lng from JSON data and places markers on map
    placeMarkers();

    //reset bounds of map
    Util.resetBounds(markers);

    //clear paths and draw new path
    paths = Util.clearPaths(paths);
    paths.push(Util.drawPath(markers));

    //calculate distance and display it
    let nautMiles = Util.calcDistance(markers);
    changeHeader(markers, nautMiles);
  }

  function placeMarkers() {
    let inputVal1 = document.getElementById('input1').value;
    let inputVal2 = document.getElementById('input2').value;
    let matches1 = inputVal1.match(/^[^\(]+/);
    let matches2 = inputVal2.match(/^[^\(]+/);
    let matches = [matches1, matches2];

    //loop through both inputs, assume "" and null values
    for (let i = 0; i < matches.length; i++) {
      if (matches[i]) {
        let location = airports[matches[i][0].trim()];
        markers.push(Util.setMarkers(location));
      }
    }
  }

  function attachInputListeners() {
    let elements = document.getElementsByTagName('input');
    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener("keyup", handleInputChange);
    }
  }

  return {
    attachInputListeners: attachInputListeners,
    handleSubmit: handleSubmit
  }

})();

document.addEventListener("DOMContentLoaded", function() {
  Search.attachInputListeners();
  document.getElementById('submit').addEventListener('click', Search.handleSubmit);
});
