# Airport Search

[Airport Search live!](https://wangytangy.github.io/airport_search/)

Airport Search is a simple app that allows users to search for airports
in the US, calculate their distance in nautical miles, and renders the trip
on Google Maps. The app is built with two simple modules, one for handling
search actions and one for handling Google Map actions. A JSON file of airport
data is provided for the scope of this project. Many APIs online require
paid subscriptions so I will not be making AJAX requests to external sources.

## Features
* Search for any airport in the US (with autocomplete)
* See a Google Map with search results plotted
* View trip distance in nautical miles

## Technologies Used
* JavaScript
* Google Maps/Geometry API
* JSON/json-loader package
* Webpack
* HTML5
* CSS3

##Implementation

### Search

The search function draws upon a JSON file with US airport data which is loaded
into the `search.js` file with the `json-loader` library. As users type in
a search query, the `handleInputChange` listener callback filters an array of keys that
reference JSON objects in O(n) time. A search query can either match an airport's
IATA code, name, or city.

A key optimization is setting a timeout restraint on `handleInputChange` to delay
execution for 300ms. On input change, the function clears the timeout and refreshes
the delay. This allows the function to execute only when the user pauses their typing,
saving unnecessary computation and allowing for smoother user experience.


```js
//search.js

function handleInputChange(e) {
  //sets a delay for the callback to be executed
  //avoids unnecessary computation until user pauses typing for 300ms
  clearTimeout(timerID);
  timerID = setTimeout(function() {
    let input = e.target.value.toLowerCase();
    let airportIDs = Object.keys(airports);

    //loop through airports, filter by input
    let filteredList = airportIDs.filter((key) =>
      isAirportMatch(key, input)
    ).slice(0, 10);

    //creates autocomplete search results
    createSearchResults(filteredList);
  }, 300);
}
```

The eligible search results are then converted into `<option>` tags which are
appended to a `<datalist>` element, which takes care of the rendering.

```js
//search.js

function createSearchResults(list) {
  //remove previous search results before adding new ones
  let dataList = document.getElementById('airports');
  while (dataList.firstChild) dataList.removeChild(dataList.firstChild);

  //create <option> elements, set it's value, append to datalist
  list.forEach((key) => {
    let option = document.createElement('option');
    option.value =
    `${airports[key].name} (${airports[key].IATA}) - ${airports[key].city}`;
    //append option to <datalist>
    dataList.appendChild(option);
  });
}
```

### Calculating Distance in Nautical Miles

Nautical miles between two airports are calculated after Google Maps markers
are instantiated. Google Map markers contain the lat and lng data needed to
calculate nautical miles on a geodesic path.

```js
//google_map.js

function calcDistance(markers) {
  //return 0 if only user submits fewer than 2 locations
  if (markers.length < 2) {
    return 0;
  }
  let startPos = markers[0].getPosition();
  let endPos = markers[1].getPosition();
  let dist = google.maps
    .geometry
    .spherical
    .computeDistanceBetween(startPos, endPos);
  let kilometers = dist/1000;
  let nautMiles = kilometers/1.852;
  nautMiles = Number(Math.round(nautMiles +'e2') +'e-2');
  return nautMiles;
}
```

These markers are passed into a `calcDistance` util function that uses
Google Geometry's `computeDistanceBetween` function to compute kilometers
between two lat/lng coordinates. I then convert kilometers into nautical miles
by dividing by 1.852 and rounding to 2 decimal digits.

### Google Map (placing markers and drawing path)

#### Render Google Map
Google Maps requires a callback function to render an initial map on
your webpage.

```js
//google_map.js
const Util = (function() {
let map;

  function createMap() {
    let usa = new google.maps.LatLng(37.09024, -95.712891);
    map = new google.maps.Map(document.getElementById('map'), {
      center: usa,
      zoom: 4
    });
  }
})();

//search.js
window.initMap = Util.createMap
```

#### Place Markers

When a search query is submitted, lat and lng coordinates extracted and
passed into a `setMarkers` util function that renders markers onto Google Maps.
Markers are pushed into a `markers` array to reference later for deletion/
used to render a path/etc. Before markers are placed, previous markers must
be cleared. This is accomplished with a `clearMarkers` util function.

```js
//search.js

let markers = [];

markers = Util.clearMarkers(markers);

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

//google_map.js

function setMarkers(location) {
  //create LatLng object
  let latLng = new google.maps.LatLng(
    +location.lat,
    +location.lng
  );

  //create Marker object, passing in LatLng and map objects
  let marker = new google.maps.Marker({
    position: latLng,
    title: location.name,
    map: map,
    animation: google.maps.Animation.DROP
  });

  //create infowindow to display title
  var infowindow = new google.maps.InfoWindow({
    content: location.name
  });

  //attach click listener on marker
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
  return marker;
}
```

#### Draw Polyline Path

A path between two airports is drawn by instantiating a Google Map
Polyline object. I pass in an array of two LatLng objects extracted from
the markers that are already set and set the `geodesic` property to `true`.
This allows the path be a curve that mimics the curvature of the Earth.
Similar to markers, each path must be stored in an array to be referenced
later for deletion.

```js
//google_map.js

function clearPaths(paths) {
  for (var i = 0; i < paths.length; i++) {
    paths[i].setMap(null);
  }
  return [];
}

function drawPath(markers) {
  const path = new google.maps.Polyline({
    geodesic: true,
    path: [markers[0].getPosition(), markers[1].getPosition()],
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  path.setMap(map);
  return path;
}
```
