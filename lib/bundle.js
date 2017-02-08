/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(1);
	let airports = __webpack_require__(2);

	// callback for Google Map
	window.initMap = Util.createMap

	var Search = (function() {
	  let timerID;
	  let markers = [];
	  let paths = [];

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


/***/ },
/* 1 */
/***/ function(module, exports) {

	//google map util functions

	const Util = (function() {
	  let map;

	  function createMap() {
	    let usa = new google.maps.LatLng(37.09024, -95.712891);
	    map = new google.maps.Map(document.getElementById('map'), {
	      center: usa,
	      zoom: 4
	    });
	  }

	  function setMarkers(location) {
	    let latLng = new google.maps.LatLng(
	      +location.lat,
	      +location.lng
	    );
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

	  function clearMarkers(markers) {
	    for (var i = 0; i < markers.length; i++) {
	      markers[i].setMap(null);
	    }
	    return [];
	  }

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

	  function resetBounds(markers) {
	    let startPos = markers[0].getPosition();
	    let endPos = markers[1].getPosition();
	    let bounds = new google.maps.LatLngBounds();
	    bounds.extend(startPos);
	    bounds.extend(endPos);
	    map.fitBounds(bounds);
	  }

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

	  return {
	    createMap: createMap,
	    setMarkers: setMarkers,
	    clearMarkers: clearMarkers,
	    calcDistance: calcDistance,
	    resetBounds: resetBounds,
	    drawPath: drawPath,
	    clearPaths: clearPaths
	  }

	})();

	module.exports = Util;


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = {
		"Barter Island LRRS Airport": {
			"id": "3411",
			"name": "Barter Island LRRS Airport",
			"city": "Barter Island",
			"country": "United States",
			"IATA": "BTI",
			"ICAO": "PABA",
			"lat": "70.1340026855",
			"lng": "-143.582000732"
		},
		"Cape Lisburne LRRS Airport": {
			"id": "3413",
			"name": "Cape Lisburne LRRS Airport",
			"city": "Cape Lisburne",
			"country": "United States",
			"IATA": "LUR",
			"ICAO": "PALU",
			"lat": "68.87509918",
			"lng": "-166.1100006"
		},
		"Point Lay LRRS Airport": {
			"id": "3414",
			"name": "Point Lay LRRS Airport",
			"city": "Point Lay",
			"country": "United States",
			"IATA": "PIZ",
			"ICAO": "PPIZ",
			"lat": "69.73290253",
			"lng": "-163.0050049"
		},
		"Hilo International Airport": {
			"id": "3415",
			"name": "Hilo International Airport",
			"city": "Hilo",
			"country": "United States",
			"IATA": "ITO",
			"ICAO": "PHTO",
			"lat": "19.721399307250977",
			"lng": "-155.04800415039062"
		},
		"Orlando Executive Airport": {
			"id": "3416",
			"name": "Orlando Executive Airport",
			"city": "Orlando",
			"country": "United States",
			"IATA": "ORL",
			"ICAO": "KORL",
			"lat": "28.545499801636",
			"lng": "-81.332901000977"
		},
		"Bettles Airport": {
			"id": "3417",
			"name": "Bettles Airport",
			"city": "Bettles",
			"country": "United States",
			"IATA": "BTT",
			"ICAO": "PABT",
			"lat": "66.91390228",
			"lng": "-151.529007"
		},
		"Clear Airport": {
			"id": "3418",
			"name": "Clear Airport",
			"city": "Clear Mews",
			"country": "United States",
			"IATA": "Z84",
			"ICAO": "PACL",
			"lat": "64.301201",
			"lng": "-149.119995"
		},
		"Indian Mountain LRRS Airport": {
			"id": "3419",
			"name": "Indian Mountain LRRS Airport",
			"city": "Indian Mountains",
			"country": "United States",
			"IATA": "UTO",
			"ICAO": "PAIM",
			"lat": "65.99279785",
			"lng": "-153.7039948"
		},
		"Fort Yukon Airport": {
			"id": "3420",
			"name": "Fort Yukon Airport",
			"city": "Fort Yukon",
			"country": "United States",
			"IATA": "FYU",
			"ICAO": "PFYU",
			"lat": "66.57150268554688",
			"lng": "-145.25"
		},
		"Sparrevohn LRRS Airport": {
			"id": "3421",
			"name": "Sparrevohn LRRS Airport",
			"city": "Sparrevohn",
			"country": "United States",
			"IATA": "SVW",
			"ICAO": "PASV",
			"lat": "61.09740067",
			"lng": "-155.5740051"
		},
		"Bryant Army Heliport": {
			"id": "3422",
			"name": "Bryant Army Heliport",
			"city": "Fort Richardson",
			"country": "United States",
			"IATA": "FRN",
			"ICAO": "PAFR",
			"lat": "61.26639938",
			"lng": "-149.6529999"
		},
		"Tatalina LRRS Airport": {
			"id": "3423",
			"name": "Tatalina LRRS Airport",
			"city": "Tatalina",
			"country": "United States",
			"IATA": "TLJ",
			"ICAO": "PATL",
			"lat": "62.894401550299996",
			"lng": "-155.977005005"
		},
		"Cape Romanzof LRRS Airport": {
			"id": "3424",
			"name": "Cape Romanzof LRRS Airport",
			"city": "Cape Romanzof",
			"country": "United States",
			"IATA": "CZF",
			"ICAO": "PACZ",
			"lat": "61.78030014",
			"lng": "-166.0390015"
		},
		"Laurence G Hanscom Field": {
			"id": "3425",
			"name": "Laurence G Hanscom Field",
			"city": "Bedford",
			"country": "United States",
			"IATA": "BED",
			"ICAO": "KBED",
			"lat": "42.47000122",
			"lng": "-71.28900146"
		},
		"St Paul Island Airport": {
			"id": "3426",
			"name": "St Paul Island Airport",
			"city": "St. Paul Island",
			"country": "United States",
			"IATA": "SNP",
			"ICAO": "PASN",
			"lat": "57.167301177978516",
			"lng": "-170.22000122070312"
		},
		"Cape Newenham LRRS Airport": {
			"id": "3427",
			"name": "Cape Newenham LRRS Airport",
			"city": "Cape Newenham",
			"country": "United States",
			"IATA": "EHM",
			"ICAO": "PAEH",
			"lat": "58.646400451699996",
			"lng": "-162.06300354"
		},
		"St George Airport": {
			"id": "3428",
			"name": "St George Airport",
			"city": "Point Barrow",
			"country": "United States",
			"IATA": "STG",
			"ICAO": "PAPB",
			"lat": "56.578300476100004",
			"lng": "-169.662002563"
		},
		"Iliamna Airport": {
			"id": "3429",
			"name": "Iliamna Airport",
			"city": "Iliamna",
			"country": "United States",
			"IATA": "ILI",
			"ICAO": "PAIL",
			"lat": "59.75439835",
			"lng": "-154.9109955"
		},
		"Platinum Airport": {
			"id": "3430",
			"name": "Platinum Airport",
			"city": "Port Moller",
			"country": "United States",
			"IATA": "PTU",
			"ICAO": "PAPM",
			"lat": "59.01139831542969",
			"lng": "-161.82000732421875"
		},
		"Big Mountain Airport": {
			"id": "3431",
			"name": "Big Mountain Airport",
			"city": "Big Mountain",
			"country": "United States",
			"IATA": "BMX",
			"ICAO": "PABM",
			"lat": "59.3611984253",
			"lng": "-155.259002686"
		},
		"Oscoda Wurtsmith Airport": {
			"id": "3432",
			"name": "Oscoda Wurtsmith Airport",
			"city": "Oscoda",
			"country": "United States",
			"IATA": "OSC",
			"ICAO": "KOSC",
			"lat": "44.45159912",
			"lng": "-83.39409637"
		},
		"Marina Municipal Airport": {
			"id": "3433",
			"name": "Marina Municipal Airport",
			"city": "Fort Ord",
			"country": "United States",
			"IATA": "OAR",
			"ICAO": "KOAR",
			"lat": "36.68190002",
			"lng": "-121.762001"
		},
		"Sacramento Mather Airport": {
			"id": "3434",
			"name": "Sacramento Mather Airport",
			"city": "Sacramento",
			"country": "United States",
			"IATA": "MHR",
			"ICAO": "KMHR",
			"lat": "38.55390167",
			"lng": "-121.2979965"
		},
		"Bicycle Lake Army Air Field": {
			"id": "3435",
			"name": "Bicycle Lake Army Air Field",
			"city": "Fort Irwin",
			"country": "United States",
			"IATA": "BYS",
			"ICAO": "KBYS",
			"lat": "35.2804985046",
			"lng": "-116.629997253"
		},
		"Twentynine Palms (Self) Airport": {
			"id": "3436",
			"name": "Twentynine Palms (Self) Airport",
			"city": "Twenty Nine Palms",
			"country": "United States",
			"IATA": "NXP",
			"ICAO": "KNXP",
			"lat": "34.2961998",
			"lng": "-116.1620026"
		},
		"Fort Smith Regional Airport": {
			"id": "3437",
			"name": "Fort Smith Regional Airport",
			"city": "Fort Smith",
			"country": "United States",
			"IATA": "FSM",
			"ICAO": "KFSM",
			"lat": "35.33660125732422",
			"lng": "-94.36740112304688"
		},
		"Merrill Field": {
			"id": "3438",
			"name": "Merrill Field",
			"city": "Anchorage",
			"country": "United States",
			"IATA": "MRI",
			"ICAO": "PAMR",
			"lat": "61.2135009765625",
			"lng": "-149.843994140625"
		},
		"Grants-Milan Municipal Airport": {
			"id": "3439",
			"name": "Grants-Milan Municipal Airport",
			"city": "Grants",
			"country": "United States",
			"IATA": "GNT",
			"ICAO": "KGNT",
			"lat": "35.167301178",
			"lng": "-107.902000427"
		},
		"Ponca City Regional Airport": {
			"id": "3440",
			"name": "Ponca City Regional Airport",
			"city": "Ponca City",
			"country": "United States",
			"IATA": "PNC",
			"ICAO": "KPNC",
			"lat": "36.73199844",
			"lng": "-97.09980011"
		},
		"Hunter Army Air Field": {
			"id": "3441",
			"name": "Hunter Army Air Field",
			"city": "Hunter Aaf",
			"country": "United States",
			"IATA": "SVN",
			"ICAO": "KSVN",
			"lat": "32.00999832",
			"lng": "-81.14569855"
		},
		"Grand Forks International Airport": {
			"id": "3442",
			"name": "Grand Forks International Airport",
			"city": "Grand Forks",
			"country": "United States",
			"IATA": "GFK",
			"ICAO": "KGFK",
			"lat": "47.949299",
			"lng": "-97.176102"
		},
		"Grider Field": {
			"id": "3443",
			"name": "Grider Field",
			"city": "Pine Bluff",
			"country": "United States",
			"IATA": "PBF",
			"ICAO": "KPBF",
			"lat": "34.1730995178",
			"lng": "-91.9356002808"
		},
		"Whiting Field Naval Air Station - North": {
			"id": "3444",
			"name": "Whiting Field Naval Air Station - North",
			"city": "Milton",
			"country": "United States",
			"IATA": "NSE",
			"ICAO": "KNSE",
			"lat": "30.7241993",
			"lng": "-87.02189636"
		},
		"Hana Airport": {
			"id": "3445",
			"name": "Hana Airport",
			"city": "Hana",
			"country": "United States",
			"IATA": "HNM",
			"ICAO": "PHHN",
			"lat": "20.79560089111328",
			"lng": "-156.01400756835938"
		},
		"Ernest A. Love Field": {
			"id": "3446",
			"name": "Ernest A. Love Field",
			"city": "Prescott",
			"country": "United States",
			"IATA": "PRC",
			"ICAO": "KPRC",
			"lat": "34.65449905",
			"lng": "-112.4199982"
		},
		"Trenton Mercer Airport": {
			"id": "3447",
			"name": "Trenton Mercer Airport",
			"city": "Trenton",
			"country": "United States",
			"IATA": "TTN",
			"ICAO": "KTTN",
			"lat": "40.27669906616211",
			"lng": "-74.8134994506836"
		},
		"General Edward Lawrence Logan International Airport": {
			"id": "3448",
			"name": "General Edward Lawrence Logan International Airport",
			"city": "Boston",
			"country": "United States",
			"IATA": "BOS",
			"ICAO": "KBOS",
			"lat": "42.36429977",
			"lng": "-71.00520325"
		},
		"Travis Air Force Base": {
			"id": "3449",
			"name": "Travis Air Force Base",
			"city": "Fairfield",
			"country": "United States",
			"IATA": "SUU",
			"ICAO": "KSUU",
			"lat": "38.262699127197",
			"lng": "-121.92700195312"
		},
		"Griffiss International Airport": {
			"id": "3450",
			"name": "Griffiss International Airport",
			"city": "Rome",
			"country": "United States",
			"IATA": "RME",
			"ICAO": "KRME",
			"lat": "43.23379898",
			"lng": "-75.40699768"
		},
		"Wendover Airport": {
			"id": "3451",
			"name": "Wendover Airport",
			"city": "Wendover",
			"country": "United States",
			"IATA": "ENV",
			"ICAO": "KENV",
			"lat": "40.7187004089",
			"lng": "-114.03099823"
		},
		"Mobile Downtown Airport": {
			"id": "3452",
			"name": "Mobile Downtown Airport",
			"city": "Mobile",
			"country": "United States",
			"IATA": "BFM",
			"ICAO": "KBFM",
			"lat": "30.626800537100003",
			"lng": "-88.06809997559999"
		},
		"Metropolitan Oakland International Airport": {
			"id": "3453",
			"name": "Metropolitan Oakland International Airport",
			"city": "Oakland",
			"country": "United States",
			"IATA": "OAK",
			"ICAO": "KOAK",
			"lat": "37.72129821777344",
			"lng": "-122.22100067138672"
		},
		"Eppley Airfield": {
			"id": "3454",
			"name": "Eppley Airfield",
			"city": "Omaha",
			"country": "United States",
			"IATA": "OMA",
			"ICAO": "KOMA",
			"lat": "41.303199768066406",
			"lng": "-95.89409637451172"
		},
		"Port Angeles Cgas Airport": {
			"id": "3455",
			"name": "Port Angeles Cgas Airport",
			"city": "Port Angeles",
			"country": "United States",
			"IATA": "NOW",
			"ICAO": "KNOW",
			"lat": "48.14149856567383",
			"lng": "-123.41400146484375"
		},
		"Kahului Airport": {
			"id": "3456",
			"name": "Kahului Airport",
			"city": "Kahului",
			"country": "United States",
			"IATA": "OGG",
			"ICAO": "PHOG",
			"lat": "20.89859962463379",
			"lng": "-156.42999267578125"
		},
		"Wichita Mid Continent Airport": {
			"id": "3457",
			"name": "Wichita Mid Continent Airport",
			"city": "Wichita",
			"country": "United States",
			"IATA": "ICT",
			"ICAO": "KICT",
			"lat": "37.649898529052734",
			"lng": "-97.43309783935547"
		},
		"Kansas City International Airport": {
			"id": "3458",
			"name": "Kansas City International Airport",
			"city": "Kansas City",
			"country": "United States",
			"IATA": "MCI",
			"ICAO": "KMCI",
			"lat": "39.2976",
			"lng": "-94.713898"
		},
		"Dane County Regional Truax Field": {
			"id": "3459",
			"name": "Dane County Regional Truax Field",
			"city": "Madison",
			"country": "United States",
			"IATA": "MSN",
			"ICAO": "KMSN",
			"lat": "43.13990020751953",
			"lng": "-89.3375015258789"
		},
		"Dillingham Airport": {
			"id": "3460",
			"name": "Dillingham Airport",
			"city": "Dillingham",
			"country": "United States",
			"IATA": "DLG",
			"ICAO": "PADL",
			"lat": "59.04470062",
			"lng": "-158.5050049"
		},
		"Boone County Airport": {
			"id": "3461",
			"name": "Boone County Airport",
			"city": "Harrison",
			"country": "United States",
			"IATA": "HRO",
			"ICAO": "KHRO",
			"lat": "36.26150131225586",
			"lng": "-93.15470123291016"
		},
		"Phoenix Sky Harbor International Airport": {
			"id": "3462",
			"name": "Phoenix Sky Harbor International Airport",
			"city": "Phoenix",
			"country": "United States",
			"IATA": "PHX",
			"ICAO": "KPHX",
			"lat": "33.43429946899414",
			"lng": "-112.01200103759766"
		},
		"Bangor International Airport": {
			"id": "3463",
			"name": "Bangor International Airport",
			"city": "Bangor",
			"country": "United States",
			"IATA": "BGR",
			"ICAO": "KBGR",
			"lat": "44.80739974975586",
			"lng": "-68.8281021118164"
		},
		"Fort Lauderdale Executive Airport": {
			"id": "3464",
			"name": "Fort Lauderdale Executive Airport",
			"city": "Fort Lauderdale",
			"country": "United States",
			"IATA": "FXE",
			"ICAO": "KFXE",
			"lat": "26.1972999573",
			"lng": "-80.1707000732"
		},
		"East Texas Regional Airport": {
			"id": "3465",
			"name": "East Texas Regional Airport",
			"city": "Longview",
			"country": "United States",
			"IATA": "GGG",
			"ICAO": "KGGG",
			"lat": "32.38399887084961",
			"lng": "-94.71150207519531"
		},
		"Anderson Regional Airport": {
			"id": "3466",
			"name": "Anderson Regional Airport",
			"city": "Andersen",
			"country": "United States",
			"IATA": "AND",
			"ICAO": "KAND",
			"lat": "34.4945983887",
			"lng": "-82.70939636230001"
		},
		"Spokane International Airport": {
			"id": "3467",
			"name": "Spokane International Airport",
			"city": "Spokane",
			"country": "United States",
			"IATA": "GEG",
			"ICAO": "KGEG",
			"lat": "47.61989974975586",
			"lng": "-117.53399658203125"
		},
		"North Perry Airport": {
			"id": "3468",
			"name": "North Perry Airport",
			"city": "Hollywood",
			"country": "United States",
			"IATA": "HWO",
			"ICAO": "KHWO",
			"lat": "26.001199722299997",
			"lng": "-80.24069976810001"
		},
		"San Francisco International Airport": {
			"id": "3469",
			"name": "San Francisco International Airport",
			"city": "San Francisco",
			"country": "United States",
			"IATA": "SFO",
			"ICAO": "KSFO",
			"lat": "37.61899948120117",
			"lng": "-122.375"
		},
		"Cut Bank International Airport": {
			"id": "3470",
			"name": "Cut Bank International Airport",
			"city": "Cutbank",
			"country": "United States",
			"IATA": "CTB",
			"ICAO": "KCTB",
			"lat": "48.6083984375",
			"lng": "-112.375999451"
		},
		"Acadiana Regional Airport": {
			"id": "3471",
			"name": "Acadiana Regional Airport",
			"city": "Louisiana",
			"country": "United States",
			"IATA": "ARA",
			"ICAO": "KARA",
			"lat": "30.0378",
			"lng": "-91.883904"
		},
		"Gainesville Regional Airport": {
			"id": "3472",
			"name": "Gainesville Regional Airport",
			"city": "Gainesville",
			"country": "United States",
			"IATA": "GNV",
			"ICAO": "KGNV",
			"lat": "29.6900997162",
			"lng": "-82.2717971802"
		},
		"Memphis International Airport": {
			"id": "3473",
			"name": "Memphis International Airport",
			"city": "Memphis",
			"country": "United States",
			"IATA": "MEM",
			"ICAO": "KMEM",
			"lat": "35.04240036010742",
			"lng": "-89.97669982910156"
		},
		"Bisbee Douglas International Airport": {
			"id": "3474",
			"name": "Bisbee Douglas International Airport",
			"city": "Douglas",
			"country": "United States",
			"IATA": "DUG",
			"ICAO": "KDUG",
			"lat": "31.4689998627",
			"lng": "-109.603996277"
		},
		"Allen Army Airfield": {
			"id": "3475",
			"name": "Allen Army Airfield",
			"city": "Delta Junction",
			"country": "United States",
			"IATA": "BIG",
			"ICAO": "PABI",
			"lat": "63.9944992065",
			"lng": "-145.722000122"
		},
		"TSTC Waco Airport": {
			"id": "3476",
			"name": "TSTC Waco Airport",
			"city": "Waco",
			"country": "United States",
			"IATA": "CNW",
			"ICAO": "KCNW",
			"lat": "31.637800216699997",
			"lng": "-97.0740966797"
		},
		"Annette Island Airport": {
			"id": "3477",
			"name": "Annette Island Airport",
			"city": "Annette Island",
			"country": "United States",
			"IATA": "ANN",
			"ICAO": "PANT",
			"lat": "55.04240036010742",
			"lng": "-131.57200622558594"
		},
		"Caribou Municipal Airport": {
			"id": "3478",
			"name": "Caribou Municipal Airport",
			"city": "Caribou",
			"country": "United States",
			"IATA": "CAR",
			"ICAO": "KCAR",
			"lat": "46.871498107899995",
			"lng": "-68.0178985596"
		},
		"Little Rock Air Force Base": {
			"id": "3479",
			"name": "Little Rock Air Force Base",
			"city": "Jacksonville",
			"country": "United States",
			"IATA": "LRF",
			"ICAO": "KLRF",
			"lat": "34.916900634799994",
			"lng": "-92.14969635010002"
		},
		"Redstone Army Air Field": {
			"id": "3480",
			"name": "Redstone Army Air Field",
			"city": "Redstone",
			"country": "United States",
			"IATA": "HUA",
			"ICAO": "KHUA",
			"lat": "34.67869949",
			"lng": "-86.68479919"
		},
		"Pope Field": {
			"id": "3481",
			"name": "Pope Field",
			"city": "Fort Bragg",
			"country": "United States",
			"IATA": "POB",
			"ICAO": "KPOB",
			"lat": "35.1708984375",
			"lng": "-79.014503479004"
		},
		"Dalhart Municipal Airport": {
			"id": "3482",
			"name": "Dalhart Municipal Airport",
			"city": "Dalhart",
			"country": "United States",
			"IATA": "DHT",
			"ICAO": "KDHT",
			"lat": "36.0225982666",
			"lng": "-102.54699707"
		},
		"Laughlin Air Force Base": {
			"id": "3483",
			"name": "Laughlin Air Force Base",
			"city": "Del Rio",
			"country": "United States",
			"IATA": "DLF",
			"ICAO": "KDLF",
			"lat": "29.359500885",
			"lng": "-100.777999878"
		},
		"Los Angeles International Airport": {
			"id": "3484",
			"name": "Los Angeles International Airport",
			"city": "Los Angeles",
			"country": "United States",
			"IATA": "LAX",
			"ICAO": "KLAX",
			"lat": "33.94250107",
			"lng": "-118.4079971"
		},
		"Anniston Metropolitan Airport": {
			"id": "3485",
			"name": "Anniston Metropolitan Airport",
			"city": "Anniston",
			"country": "United States",
			"IATA": "ANB",
			"ICAO": "KANB",
			"lat": "33.58819962",
			"lng": "-85.85810089"
		},
		"Cleveland Hopkins International Airport": {
			"id": "3486",
			"name": "Cleveland Hopkins International Airport",
			"city": "Cleveland",
			"country": "United States",
			"IATA": "CLE",
			"ICAO": "KCLE",
			"lat": "41.4117012024",
			"lng": "-81.8498001099"
		},
		"Dover Air Force Base": {
			"id": "3487",
			"name": "Dover Air Force Base",
			"city": "Dover",
			"country": "United States",
			"IATA": "DOV",
			"ICAO": "KDOV",
			"lat": "39.12950134",
			"lng": "-75.46600342"
		},
		"Cincinnati Northern Kentucky International Airport": {
			"id": "3488",
			"name": "Cincinnati Northern Kentucky International Airport",
			"city": "Cincinnati",
			"country": "United States",
			"IATA": "CVG",
			"ICAO": "KCVG",
			"lat": "39.0488014221",
			"lng": "-84.6678009033"
		},
		"Tipton Airport": {
			"id": "3489",
			"name": "Tipton Airport",
			"city": "Fort Meade",
			"country": "United States",
			"IATA": "FME",
			"ICAO": "KFME",
			"lat": "39.08539962769999",
			"lng": "-76.7593994141"
		},
		"China Lake Naws (Armitage Field) Airport": {
			"id": "3490",
			"name": "China Lake Naws (Armitage Field) Airport",
			"city": "China Lake",
			"country": "United States",
			"IATA": "NID",
			"ICAO": "KNID",
			"lat": "35.6853981",
			"lng": "-117.6920013"
		},
		"Huron Regional Airport": {
			"id": "3491",
			"name": "Huron Regional Airport",
			"city": "Huron",
			"country": "United States",
			"IATA": "HON",
			"ICAO": "KHON",
			"lat": "44.38520050048828",
			"lng": "-98.22850036621094"
		},
		"Juneau International Airport": {
			"id": "3492",
			"name": "Juneau International Airport",
			"city": "Juneau",
			"country": "United States",
			"IATA": "JNU",
			"ICAO": "PAJN",
			"lat": "58.35499954223633",
			"lng": "-134.5760040283203"
		},
		"Lafayette Regional Airport": {
			"id": "3493",
			"name": "Lafayette Regional Airport",
			"city": "Lafayette",
			"country": "United States",
			"IATA": "LFT",
			"ICAO": "KLFT",
			"lat": "30.20529938",
			"lng": "-91.98760223"
		},
		"Newark Liberty International Airport": {
			"id": "3494",
			"name": "Newark Liberty International Airport",
			"city": "Newark",
			"country": "United States",
			"IATA": "EWR",
			"ICAO": "KEWR",
			"lat": "40.692501068115234",
			"lng": "-74.168701171875"
		},
		"Boise Air Terminal/Gowen field": {
			"id": "3495",
			"name": "Boise Air Terminal/Gowen field",
			"city": "Boise",
			"country": "United States",
			"IATA": "BOI",
			"ICAO": "KBOI",
			"lat": "43.56439972",
			"lng": "-116.2229996"
		},
		"Creech Air Force Base": {
			"id": "3496",
			"name": "Creech Air Force Base",
			"city": "Indian Springs",
			"country": "United States",
			"IATA": "INS",
			"ICAO": "KINS",
			"lat": "36.587200164799995",
			"lng": "-115.672996521"
		},
		"Garden City Regional Airport": {
			"id": "3497",
			"name": "Garden City Regional Airport",
			"city": "Garden City",
			"country": "United States",
			"IATA": "GCK",
			"ICAO": "KGCK",
			"lat": "37.9275016785",
			"lng": "-100.723999023"
		},
		"Minot International Airport": {
			"id": "3498",
			"name": "Minot International Airport",
			"city": "Minot",
			"country": "United States",
			"IATA": "MOT",
			"ICAO": "KMOT",
			"lat": "48.2593994140625",
			"lng": "-101.27999877929688"
		},
		"Wheeler Army Airfield": {
			"id": "3499",
			"name": "Wheeler Army Airfield",
			"city": "Wahiawa",
			"country": "United States",
			"IATA": "HHI",
			"ICAO": "PHHI",
			"lat": "21.48349953",
			"lng": "-158.0399933"
		},
		"Maxwell Air Force Base": {
			"id": "3500",
			"name": "Maxwell Air Force Base",
			"city": "Montgomery",
			"country": "United States",
			"IATA": "MXF",
			"ICAO": "KMXF",
			"lat": "32.38290023803711",
			"lng": "-86.36579895019531"
		},
		"Robinson Army Air Field": {
			"id": "3501",
			"name": "Robinson Army Air Field",
			"city": "Robinson",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KRBM",
			"lat": "34.85010147",
			"lng": "-92.30020142"
		},
		"Dallas Love Field": {
			"id": "3502",
			"name": "Dallas Love Field",
			"city": "Dallas",
			"country": "United States",
			"IATA": "DAL",
			"ICAO": "KDAL",
			"lat": "32.84709930419922",
			"lng": "-96.85179901123047"
		},
		"Butts AAF (Fort Carson) Air Field": {
			"id": "3503",
			"name": "Butts AAF (Fort Carson) Air Field",
			"city": "Fort Carson",
			"country": "United States",
			"IATA": "FCS",
			"ICAO": "KFCS",
			"lat": "38.67839813",
			"lng": "-104.7570038"
		},
		"Helena Regional Airport": {
			"id": "3504",
			"name": "Helena Regional Airport",
			"city": "Helena",
			"country": "United States",
			"IATA": "HLN",
			"ICAO": "KHLN",
			"lat": "46.6068000793457",
			"lng": "-111.98300170898438"
		},
		"Miramar Marine Corps Air Station - Mitscher Field": {
			"id": "3505",
			"name": "Miramar Marine Corps Air Station - Mitscher Field",
			"city": "Miramar",
			"country": "United States",
			"IATA": "NKX",
			"ICAO": "KNKX",
			"lat": "32.86840057",
			"lng": "-117.1429977"
		},
		"Luke Air Force Base": {
			"id": "3506",
			"name": "Luke Air Force Base",
			"city": "Phoenix",
			"country": "United States",
			"IATA": "LUF",
			"ICAO": "KLUF",
			"lat": "33.534999847399995",
			"lng": "-112.383003235"
		},
		"Hurlburt Field": {
			"id": "3507",
			"name": "Hurlburt Field",
			"city": "Mary Esther",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KHRT",
			"lat": "30.427799224853516",
			"lng": "-86.68930053710938"
		},
		"Jack Northrop Field Hawthorne Municipal Airport": {
			"id": "3508",
			"name": "Jack Northrop Field Hawthorne Municipal Airport",
			"city": "Hawthorne",
			"country": "United States",
			"IATA": "HHR",
			"ICAO": "KHHR",
			"lat": "33.922798",
			"lng": "-118.334999"
		},
		"Houlton International Airport": {
			"id": "3509",
			"name": "Houlton International Airport",
			"city": "Houlton",
			"country": "United States",
			"IATA": "HUL",
			"ICAO": "KHUL",
			"lat": "46.1231002808",
			"lng": "-67.792098999"
		},
		"Vance Air Force Base": {
			"id": "3510",
			"name": "Vance Air Force Base",
			"city": "Enid",
			"country": "United States",
			"IATA": "END",
			"ICAO": "KEND",
			"lat": "36.339199066199996",
			"lng": "-97.9164962769"
		},
		"Point Mugu Naval Air Station (Naval Base Ventura Co)": {
			"id": "3511",
			"name": "Point Mugu Naval Air Station (Naval Base Ventura Co)",
			"city": "Point Mugu",
			"country": "United States",
			"IATA": "NTD",
			"ICAO": "KNTD",
			"lat": "34.120300293",
			"lng": "-119.121002197"
		},
		"Edwards Air Force Base": {
			"id": "3512",
			"name": "Edwards Air Force Base",
			"city": "Edwards Afb",
			"country": "United States",
			"IATA": "EDW",
			"ICAO": "KEDW",
			"lat": "34.905399",
			"lng": "-117.884003"
		},
		"Lake Charles Regional Airport": {
			"id": "3513",
			"name": "Lake Charles Regional Airport",
			"city": "Lake Charles",
			"country": "United States",
			"IATA": "LCH",
			"ICAO": "KLCH",
			"lat": "30.126100540161133",
			"lng": "-93.22329711914062"
		},
		"Kona International At Keahole Airport": {
			"id": "3514",
			"name": "Kona International At Keahole Airport",
			"city": "Kona",
			"country": "United States",
			"IATA": "KOA",
			"ICAO": "PHKO",
			"lat": "19.738800048828125",
			"lng": "-156.04600524902344"
		},
		"Myrtle Beach International Airport": {
			"id": "3515",
			"name": "Myrtle Beach International Airport",
			"city": "Myrtle Beach",
			"country": "United States",
			"IATA": "MYR",
			"ICAO": "KMYR",
			"lat": "33.6796989441",
			"lng": "-78.9282989502"
		},
		"Lemoore Naval Air Station (Reeves Field) Airport": {
			"id": "3516",
			"name": "Lemoore Naval Air Station (Reeves Field) Airport",
			"city": "Lemoore",
			"country": "United States",
			"IATA": "NLC",
			"ICAO": "KNLC",
			"lat": "36.33300018",
			"lng": "-119.9520035"
		},
		"Nantucket Memorial Airport": {
			"id": "3517",
			"name": "Nantucket Memorial Airport",
			"city": "Nantucket",
			"country": "United States",
			"IATA": "ACK",
			"ICAO": "KACK",
			"lat": "41.25310135",
			"lng": "-70.06020355"
		},
		"Felker Army Air Field": {
			"id": "3518",
			"name": "Felker Army Air Field",
			"city": "Fort Eustis",
			"country": "United States",
			"IATA": "FAF",
			"ICAO": "KFAF",
			"lat": "37.132499694799996",
			"lng": "-76.60880279540001"
		},
		"Campbell AAF (Fort Campbell) Air Field": {
			"id": "3519",
			"name": "Campbell AAF (Fort Campbell) Air Field",
			"city": "Hopkinsville",
			"country": "United States",
			"IATA": "HOP",
			"ICAO": "KHOP",
			"lat": "36.668598175",
			"lng": "-87.49620056150002"
		},
		"Ronald Reagan Washington National Airport": {
			"id": "3520",
			"name": "Ronald Reagan Washington National Airport",
			"city": "Washington",
			"country": "United States",
			"IATA": "DCA",
			"ICAO": "KDCA",
			"lat": "38.8521",
			"lng": "-77.037697"
		},
		"Patuxent River Naval Air Station/Trapnell Field Aiport": {
			"id": "3521",
			"name": "Patuxent River Naval Air Station/Trapnell Field Aiport",
			"city": "Patuxent River",
			"country": "United States",
			"IATA": "NHK",
			"ICAO": "KNHK",
			"lat": "38.2859993",
			"lng": "-76.41179657"
		},
		"Palacios Municipal Airport": {
			"id": "3522",
			"name": "Palacios Municipal Airport",
			"city": "Palacios",
			"country": "United States",
			"IATA": "PSX",
			"ICAO": "KPSX",
			"lat": "28.727500915527",
			"lng": "-96.250999450684"
		},
		"Arkansas International Airport": {
			"id": "3523",
			"name": "Arkansas International Airport",
			"city": "Blytheville",
			"country": "United States",
			"IATA": "BYH",
			"ICAO": "KBYH",
			"lat": "35.9642982483",
			"lng": "-89.94400024410001"
		},
		"Atlantic City International Airport": {
			"id": "3524",
			"name": "Atlantic City International Airport",
			"city": "Atlantic City",
			"country": "United States",
			"IATA": "ACY",
			"ICAO": "KACY",
			"lat": "39.45759963989258",
			"lng": "-74.57720184326172"
		},
		"Tinker Air Force Base": {
			"id": "3525",
			"name": "Tinker Air Force Base",
			"city": "Oklahoma City",
			"country": "United States",
			"IATA": "TIK",
			"ICAO": "KTIK",
			"lat": "35.414699554443",
			"lng": "-97.386596679688"
		},
		"Pueblo Memorial Airport": {
			"id": "3527",
			"name": "Pueblo Memorial Airport",
			"city": "Pueblo",
			"country": "United States",
			"IATA": "PUB",
			"ICAO": "KPUB",
			"lat": "38.289100646972656",
			"lng": "-104.49700164794922"
		},
		"Northern Maine Regional Airport at Presque Isle": {
			"id": "3528",
			"name": "Northern Maine Regional Airport at Presque Isle",
			"city": "Presque Isle",
			"country": "United States",
			"IATA": "PQI",
			"ICAO": "KPQI",
			"lat": "46.68899918",
			"lng": "-68.0447998"
		},
		"Gray Army Air Field": {
			"id": "3530",
			"name": "Gray Army Air Field",
			"city": "Fort Lewis",
			"country": "United States",
			"IATA": "GRF",
			"ICAO": "KGRF",
			"lat": "47.07920074",
			"lng": "-122.5810013"
		},
		"Kodiak Airport": {
			"id": "3531",
			"name": "Kodiak Airport",
			"city": "Kodiak",
			"country": "United States",
			"IATA": "ADQ",
			"ICAO": "PADQ",
			"lat": "57.75",
			"lng": "-152.4940033"
		},
		"Upolu Airport": {
			"id": "3532",
			"name": "Upolu Airport",
			"city": "Opolu",
			"country": "United States",
			"IATA": "UPP",
			"ICAO": "PHUP",
			"lat": "20.265300750732422",
			"lng": "-155.86000061035156"
		},
		"Fort Lauderdale Hollywood International Airport": {
			"id": "3533",
			"name": "Fort Lauderdale Hollywood International Airport",
			"city": "Fort Lauderdale",
			"country": "United States",
			"IATA": "FLL",
			"ICAO": "KFLL",
			"lat": "26.072599411010742",
			"lng": "-80.15270233154297"
		},
		"Davis Field": {
			"id": "3534",
			"name": "Davis Field",
			"city": "Muskogee",
			"country": "United States",
			"IATA": "MKO",
			"ICAO": "KMKO",
			"lat": "35.65650177",
			"lng": "-95.36669922"
		},
		"Falls International Airport": {
			"id": "3535",
			"name": "Falls International Airport",
			"city": "International Falls",
			"country": "United States",
			"IATA": "INL",
			"ICAO": "KINL",
			"lat": "48.566200256347656",
			"lng": "-93.4030990600586"
		},
		"Salt Lake City International Airport": {
			"id": "3536",
			"name": "Salt Lake City International Airport",
			"city": "Salt Lake City",
			"country": "United States",
			"IATA": "SLC",
			"ICAO": "KSLC",
			"lat": "40.78839874267578",
			"lng": "-111.97799682617188"
		},
		"Childress Municipal Airport": {
			"id": "3537",
			"name": "Childress Municipal Airport",
			"city": "Childress",
			"country": "United States",
			"IATA": "CDS",
			"ICAO": "KCDS",
			"lat": "34.4337997437",
			"lng": "-100.288002014"
		},
		"Keesler Air Force Base": {
			"id": "3538",
			"name": "Keesler Air Force Base",
			"city": "Biloxi",
			"country": "United States",
			"IATA": "BIX",
			"ICAO": "KBIX",
			"lat": "30.4104003906",
			"lng": "-88.92440032959999"
		},
		"Lawson Army Air Field (Fort Benning)": {
			"id": "3539",
			"name": "Lawson Army Air Field (Fort Benning)",
			"city": "Fort Benning",
			"country": "United States",
			"IATA": "LSF",
			"ICAO": "KLSF",
			"lat": "32.337299346900004",
			"lng": "-84.9913024902"
		},
		"Marshall Army Air Field": {
			"id": "3541",
			"name": "Marshall Army Air Field",
			"city": "Fort Riley",
			"country": "United States",
			"IATA": "FRI",
			"ICAO": "KFRI",
			"lat": "39.05530167",
			"lng": "-96.76450348"
		},
		"Harrisburg International Airport": {
			"id": "3542",
			"name": "Harrisburg International Airport",
			"city": "Harrisburg",
			"country": "United States",
			"IATA": "MDT",
			"ICAO": "KMDT",
			"lat": "40.1935005188",
			"lng": "-76.7633972168"
		},
		"Lincoln Airport": {
			"id": "3543",
			"name": "Lincoln Airport",
			"city": "Lincoln",
			"country": "United States",
			"IATA": "LNK",
			"ICAO": "KLNK",
			"lat": "40.85100173950195",
			"lng": "-96.75920104980469"
		},
		"Capital City Airport": {
			"id": "8631",
			"name": "Capital City Airport",
			"city": "Frankfort",
			"country": "United States",
			"IATA": "FFT",
			"ICAO": "KFFT",
			"lat": "38.18249893",
			"lng": "-84.90470123"
		},
		"Waimea Kohala Airport": {
			"id": "3545",
			"name": "Waimea Kohala Airport",
			"city": "Kamuela",
			"country": "United States",
			"IATA": "MUE",
			"ICAO": "PHMU",
			"lat": "20.001300811767578",
			"lng": "-155.66799926757812"
		},
		"Massena International Richards Field": {
			"id": "3546",
			"name": "Massena International Richards Field",
			"city": "Massena",
			"country": "United States",
			"IATA": "MSS",
			"ICAO": "KMSS",
			"lat": "44.93579864501953",
			"lng": "-74.84559631347656"
		},
		"Hickory Regional Airport": {
			"id": "3547",
			"name": "Hickory Regional Airport",
			"city": "Hickory",
			"country": "United States",
			"IATA": "HKY",
			"ICAO": "KHKY",
			"lat": "35.74110031",
			"lng": "-81.38950348"
		},
		"Albert Whitted Airport": {
			"id": "3548",
			"name": "Albert Whitted Airport",
			"city": "St. Petersburg",
			"country": "United States",
			"IATA": "SPG",
			"ICAO": "KSPG",
			"lat": "27.765100479125977",
			"lng": "-82.62699890136719"
		},
		"Page Field": {
			"id": "3549",
			"name": "Page Field",
			"city": "Fort Myers",
			"country": "United States",
			"IATA": "FMY",
			"ICAO": "KFMY",
			"lat": "26.58659935",
			"lng": "-81.86329650879999"
		},
		"George Bush Intercontinental Houston Airport": {
			"id": "3550",
			"name": "George Bush Intercontinental Houston Airport",
			"city": "Houston",
			"country": "United States",
			"IATA": "IAH",
			"ICAO": "KIAH",
			"lat": "29.984399795532227",
			"lng": "-95.34140014648438"
		},
		"Millinocket Municipal Airport": {
			"id": "3551",
			"name": "Millinocket Municipal Airport",
			"city": "Millinocket",
			"country": "United States",
			"IATA": "MLT",
			"ICAO": "KMLT",
			"lat": "45.64780044555664",
			"lng": "-68.68560028076172"
		},
		"Andrews Air Force Base": {
			"id": "3552",
			"name": "Andrews Air Force Base",
			"city": "Camp Springs",
			"country": "United States",
			"IATA": "ADW",
			"ICAO": "KADW",
			"lat": "38.810798645",
			"lng": "-76.86699676510001"
		},
		"Smith Reynolds Airport": {
			"id": "3553",
			"name": "Smith Reynolds Airport",
			"city": "Winston-salem",
			"country": "United States",
			"IATA": "INT",
			"ICAO": "KINT",
			"lat": "36.13370132446289",
			"lng": "-80.22200012207031"
		},
		"Southern California Logistics Airport": {
			"id": "3554",
			"name": "Southern California Logistics Airport",
			"city": "Victorville",
			"country": "United States",
			"IATA": "VCV",
			"ICAO": "KVCV",
			"lat": "34.597499847399995",
			"lng": "-117.383003235"
		},
		"Bob Sikes Airport": {
			"id": "3555",
			"name": "Bob Sikes Airport",
			"city": "Crestview",
			"country": "United States",
			"IATA": "CEW",
			"ICAO": "KCEW",
			"lat": "30.778799057",
			"lng": "-86.522102356"
		},
		"Wheeler Sack Army Air Field": {
			"id": "3556",
			"name": "Wheeler Sack Army Air Field",
			"city": "Fort Drum",
			"country": "United States",
			"IATA": "GTB",
			"ICAO": "KGTB",
			"lat": "44.05559921",
			"lng": "-75.71949768"
		},
		"St Clair County International Airport": {
			"id": "3557",
			"name": "St Clair County International Airport",
			"city": "Port Huron",
			"country": "United States",
			"IATA": "PHN",
			"ICAO": "KPHN",
			"lat": "42.9109993",
			"lng": "-82.52890015"
		},
		"Meadows Field": {
			"id": "3558",
			"name": "Meadows Field",
			"city": "Bakersfield",
			"country": "United States",
			"IATA": "BFL",
			"ICAO": "KBFL",
			"lat": "35.43360138",
			"lng": "-119.0569992"
		},
		"El Paso International Airport": {
			"id": "3559",
			"name": "El Paso International Airport",
			"city": "El Paso",
			"country": "United States",
			"IATA": "ELP",
			"ICAO": "KELP",
			"lat": "31.80719948",
			"lng": "-106.3779984"
		},
		"Valley International Airport": {
			"id": "3560",
			"name": "Valley International Airport",
			"city": "Harlingen",
			"country": "United States",
			"IATA": "HRL",
			"ICAO": "KHRL",
			"lat": "26.228500366210938",
			"lng": "-97.65440368652344"
		},
		"Columbia Metropolitan Airport": {
			"id": "3561",
			"name": "Columbia Metropolitan Airport",
			"city": "Columbia",
			"country": "United States",
			"IATA": "CAE",
			"ICAO": "KCAE",
			"lat": "33.93880081176758",
			"lng": "-81.11949920654297"
		},
		"Davis Monthan Air Force Base": {
			"id": "3562",
			"name": "Davis Monthan Air Force Base",
			"city": "Tucson",
			"country": "United States",
			"IATA": "DMA",
			"ICAO": "KDMA",
			"lat": "32.1665000916",
			"lng": "-110.883003235"
		},
		"Pensacola Naval Air Station/Forrest Sherman Field": {
			"id": "3563",
			"name": "Pensacola Naval Air Station/Forrest Sherman Field",
			"city": "Pensacola",
			"country": "United States",
			"IATA": "NPA",
			"ICAO": "KNPA",
			"lat": "30.35269928",
			"lng": "-87.31860352"
		},
		"Pensacola Regional Airport": {
			"id": "3564",
			"name": "Pensacola Regional Airport",
			"city": "Pensacola",
			"country": "United States",
			"IATA": "PNS",
			"ICAO": "KPNS",
			"lat": "30.473400115967",
			"lng": "-87.186599731445"
		},
		"Grand Forks Air Force Base": {
			"id": "3565",
			"name": "Grand Forks Air Force Base",
			"city": "Red River",
			"country": "United States",
			"IATA": "RDR",
			"ICAO": "KRDR",
			"lat": "47.961101532",
			"lng": "-97.4011993408"
		},
		"William P Hobby Airport": {
			"id": "3566",
			"name": "William P Hobby Airport",
			"city": "Houston",
			"country": "United States",
			"IATA": "HOU",
			"ICAO": "KHOU",
			"lat": "29.64539909",
			"lng": "-95.27890015"
		},
		"Buckley Air Force Base": {
			"id": "3567",
			"name": "Buckley Air Force Base",
			"city": "Buckley",
			"country": "United States",
			"IATA": "BKF",
			"ICAO": "KBKF",
			"lat": "39.701698303200004",
			"lng": "-104.751998901"
		},
		"Northway Airport": {
			"id": "3568",
			"name": "Northway Airport",
			"city": "Northway",
			"country": "United States",
			"IATA": "ORT",
			"ICAO": "PAOR",
			"lat": "62.9612999",
			"lng": "-141.9290009"
		},
		"Palmer Municipal Airport": {
			"id": "3569",
			"name": "Palmer Municipal Airport",
			"city": "Palmer",
			"country": "United States",
			"IATA": "PAQ",
			"ICAO": "PAAQ",
			"lat": "61.59489822387695",
			"lng": "-149.08900451660156"
		},
		"Pittsburgh International Airport": {
			"id": "3570",
			"name": "Pittsburgh International Airport",
			"city": "Pittsburgh",
			"country": "United States",
			"IATA": "PIT",
			"ICAO": "KPIT",
			"lat": "40.49150085",
			"lng": "-80.23290253"
		},
		"Wiley Post Will Rogers Memorial Airport": {
			"id": "3571",
			"name": "Wiley Post Will Rogers Memorial Airport",
			"city": "Barrow",
			"country": "United States",
			"IATA": "BRW",
			"ICAO": "PABR",
			"lat": "71.285402",
			"lng": "-156.766008"
		},
		"Ellington Airport": {
			"id": "3572",
			"name": "Ellington Airport",
			"city": "Houston",
			"country": "United States",
			"IATA": "EFD",
			"ICAO": "KEFD",
			"lat": "29.607299804700002",
			"lng": "-95.1587982178"
		},
		"Whidbey Island Naval Air Station /Ault Field/ Airport": {
			"id": "3573",
			"name": "Whidbey Island Naval Air Station /Ault Field/ Airport",
			"city": "Whidbey Island",
			"country": "United States",
			"IATA": "NUW",
			"ICAO": "KNUW",
			"lat": "48.35179901",
			"lng": "-122.6559982"
		},
		"Alice International Airport": {
			"id": "3574",
			"name": "Alice International Airport",
			"city": "Alice",
			"country": "United States",
			"IATA": "ALI",
			"ICAO": "KALI",
			"lat": "27.740900039699998",
			"lng": "-98.02690124510002"
		},
		"Moody Air Force Base": {
			"id": "3575",
			"name": "Moody Air Force Base",
			"city": "Valdosta",
			"country": "United States",
			"IATA": "VAD",
			"ICAO": "KVAD",
			"lat": "30.9678001404",
			"lng": "-83.1930007935"
		},
		"Miami International Airport": {
			"id": "3576",
			"name": "Miami International Airport",
			"city": "Miami",
			"country": "United States",
			"IATA": "MIA",
			"ICAO": "KMIA",
			"lat": "25.79319953918457",
			"lng": "-80.29060363769531"
		},
		"Seattle Tacoma International Airport": {
			"id": "3577",
			"name": "Seattle Tacoma International Airport",
			"city": "Seattle",
			"country": "United States",
			"IATA": "SEA",
			"ICAO": "KSEA",
			"lat": "47.44900131225586",
			"lng": "-122.30899810791016"
		},
		"Lovell Field": {
			"id": "3578",
			"name": "Lovell Field",
			"city": "Chattanooga",
			"country": "United States",
			"IATA": "CHA",
			"ICAO": "KCHA",
			"lat": "35.035301208496094",
			"lng": "-85.20379638671875"
		},
		"Igor I Sikorsky Memorial Airport": {
			"id": "3579",
			"name": "Igor I Sikorsky Memorial Airport",
			"city": "Stratford",
			"country": "United States",
			"IATA": "BDR",
			"ICAO": "KBDR",
			"lat": "41.16350173950195",
			"lng": "-73.1261978149414"
		},
		"Jackson-Medgar Wiley Evers International Airport": {
			"id": "3580",
			"name": "Jackson-Medgar Wiley Evers International Airport",
			"city": "Jackson",
			"country": "United States",
			"IATA": "JAN",
			"ICAO": "KJAN",
			"lat": "32.3111991882",
			"lng": "-90.0758972168"
		},
		"Scholes International At Galveston Airport": {
			"id": "3581",
			"name": "Scholes International At Galveston Airport",
			"city": "Galveston",
			"country": "United States",
			"IATA": "GLS",
			"ICAO": "KGLS",
			"lat": "29.265300750732422",
			"lng": "-94.86039733886719"
		},
		"Long Beach /Daugherty Field/ Airport": {
			"id": "3582",
			"name": "Long Beach /Daugherty Field/ Airport",
			"city": "Long Beach",
			"country": "United States",
			"IATA": "LGB",
			"ICAO": "KLGB",
			"lat": "33.81769943",
			"lng": "-118.1520004"
		},
		"Dillingham Airfield": {
			"id": "3583",
			"name": "Dillingham Airfield",
			"city": "Dillingham",
			"country": "United States",
			"IATA": "HDH",
			"ICAO": "PHDH",
			"lat": "21.5795001984",
			"lng": "-158.197006226"
		},
		"Williamsport Regional Airport": {
			"id": "3584",
			"name": "Williamsport Regional Airport",
			"city": "Williamsport",
			"country": "United States",
			"IATA": "IPT",
			"ICAO": "KIPT",
			"lat": "41.241798400878906",
			"lng": "-76.92109680175781"
		},
		"Indianapolis International Airport": {
			"id": "3585",
			"name": "Indianapolis International Airport",
			"city": "Indianapolis",
			"country": "United States",
			"IATA": "IND",
			"ICAO": "KIND",
			"lat": "39.7173",
			"lng": "-86.294403"
		},
		"Whiteman Air Force Base": {
			"id": "3586",
			"name": "Whiteman Air Force Base",
			"city": "Knobnoster",
			"country": "United States",
			"IATA": "SZL",
			"ICAO": "KSZL",
			"lat": "38.73030090332",
			"lng": "-93.547897338867"
		},
		"Akron Fulton International Airport": {
			"id": "3587",
			"name": "Akron Fulton International Airport",
			"city": "Akron",
			"country": "United States",
			"IATA": "AKC",
			"ICAO": "KAKR",
			"lat": "41.0374984741",
			"lng": "-81.4669036865"
		},
		"Greenwood–Leflore Airport": {
			"id": "3588",
			"name": "Greenwood–Leflore Airport",
			"city": "Greenwood",
			"country": "United States",
			"IATA": "GWO",
			"ICAO": "KGWO",
			"lat": "33.4943008423",
			"lng": "-90.0847015381"
		},
		"Westchester County Airport": {
			"id": "3589",
			"name": "Westchester County Airport",
			"city": "White Plains",
			"country": "United States",
			"IATA": "HPN",
			"ICAO": "KHPN",
			"lat": "41.06700134277344",
			"lng": "-73.70760345458984"
		},
		"Francis S Gabreski Airport": {
			"id": "3590",
			"name": "Francis S Gabreski Airport",
			"city": "West Hampton Beach",
			"country": "United States",
			"IATA": "FOK",
			"ICAO": "KFOK",
			"lat": "40.8437004089",
			"lng": "-72.6317977905"
		},
		"Jonesboro Municipal Airport": {
			"id": "3591",
			"name": "Jonesboro Municipal Airport",
			"city": "Jonesboro",
			"country": "United States",
			"IATA": "JBR",
			"ICAO": "KJBR",
			"lat": "35.83169937133789",
			"lng": "-90.64640045166016"
		},
		"Tonopah Test Range Airport": {
			"id": "3592",
			"name": "Tonopah Test Range Airport",
			"city": "Tonopah",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KTNX",
			"lat": "37.7988014221",
			"lng": "-116.78099823"
		},
		"Palm Beach County Park Airport": {
			"id": "3593",
			"name": "Palm Beach County Park Airport",
			"city": "West Palm Beach",
			"country": "United States",
			"IATA": "LNA",
			"ICAO": "KLNA",
			"lat": "26.59300041",
			"lng": "-80.08509827"
		},
		"North Island Naval Air Station-Halsey Field": {
			"id": "3594",
			"name": "North Island Naval Air Station-Halsey Field",
			"city": "San Diego",
			"country": "United States",
			"IATA": "NZY",
			"ICAO": "KNZY",
			"lat": "32.69919968",
			"lng": "-117.2149963"
		},
		"Biggs Army Air Field (Fort Bliss)": {
			"id": "3595",
			"name": "Biggs Army Air Field (Fort Bliss)",
			"city": "El Paso",
			"country": "United States",
			"IATA": "BIF",
			"ICAO": "KBIF",
			"lat": "31.84950066",
			"lng": "-106.3799973"
		},
		"Yuma MCAS/Yuma International Airport": {
			"id": "3596",
			"name": "Yuma MCAS/Yuma International Airport",
			"city": "Yuma",
			"country": "United States",
			"IATA": "YUM",
			"ICAO": "KNYL",
			"lat": "32.65660095",
			"lng": "-114.6060028"
		},
		"Cavern City Air Terminal": {
			"id": "3597",
			"name": "Cavern City Air Terminal",
			"city": "Carlsbad",
			"country": "United States",
			"IATA": "CNM",
			"ICAO": "KCNM",
			"lat": "32.337501525878906",
			"lng": "-104.26300048828125"
		},
		"Duluth International Airport": {
			"id": "3598",
			"name": "Duluth International Airport",
			"city": "Duluth",
			"country": "United States",
			"IATA": "DLH",
			"ICAO": "KDLH",
			"lat": "46.8420982361",
			"lng": "-92.19360351559999"
		},
		"Bethel Airport": {
			"id": "3599",
			"name": "Bethel Airport",
			"city": "Bethel",
			"country": "United States",
			"IATA": "BET",
			"ICAO": "PABE",
			"lat": "60.77980042",
			"lng": "-161.8379974"
		},
		"Bowman Field": {
			"id": "3600",
			"name": "Bowman Field",
			"city": "Louisville",
			"country": "United States",
			"IATA": "LOU",
			"ICAO": "KLOU",
			"lat": "38.2280006409",
			"lng": "-85.6636962891"
		},
		"Sierra Vista Municipal Libby Army Air Field": {
			"id": "3601",
			"name": "Sierra Vista Municipal Libby Army Air Field",
			"city": "Fort Huachuca",
			"country": "United States",
			"IATA": "FHU",
			"ICAO": "KFHU",
			"lat": "31.588499069213867",
			"lng": "-110.34400177001953"
		},
		"Lihue Airport": {
			"id": "3602",
			"name": "Lihue Airport",
			"city": "Lihue",
			"country": "United States",
			"IATA": "LIH",
			"ICAO": "PHLI",
			"lat": "21.97599983215332",
			"lng": "-159.33900451660156"
		},
		"Terre Haute International Hulman Field": {
			"id": "3603",
			"name": "Terre Haute International Hulman Field",
			"city": "Terre Haute",
			"country": "United States",
			"IATA": "HUF",
			"ICAO": "KHUF",
			"lat": "39.451499938964844",
			"lng": "-87.30760192871094"
		},
		"Havre City County Airport": {
			"id": "3604",
			"name": "Havre City County Airport",
			"city": "Havre",
			"country": "United States",
			"IATA": "HVR",
			"ICAO": "KHVR",
			"lat": "48.54299927",
			"lng": "-109.762001"
		},
		"Grant County International Airport": {
			"id": "3605",
			"name": "Grant County International Airport",
			"city": "Grant County Airport",
			"country": "United States",
			"IATA": "MWH",
			"ICAO": "KMWH",
			"lat": "47.20769882",
			"lng": "-119.3199997"
		},
		"Edward F Knapp State Airport": {
			"id": "3606",
			"name": "Edward F Knapp State Airport",
			"city": "Montpelier",
			"country": "United States",
			"IATA": "MPV",
			"ICAO": "KMPV",
			"lat": "44.20349884",
			"lng": "-72.56230164"
		},
		"San Nicolas Island Nolf Airport": {
			"id": "3607",
			"name": "San Nicolas Island Nolf Airport",
			"city": "San Nicolas Island",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KNSI",
			"lat": "33.23979949951172",
			"lng": "-119.45800018310547"
		},
		"Richmond International Airport": {
			"id": "3608",
			"name": "Richmond International Airport",
			"city": "Richmond",
			"country": "United States",
			"IATA": "RIC",
			"ICAO": "KRIC",
			"lat": "37.50519943237305",
			"lng": "-77.3197021484375"
		},
		"Shreveport Regional Airport": {
			"id": "3609",
			"name": "Shreveport Regional Airport",
			"city": "Shreveport",
			"country": "United States",
			"IATA": "SHV",
			"ICAO": "KSHV",
			"lat": "32.44660186767578",
			"lng": "-93.82559967041016"
		},
		"Merle K (Mudhole) Smith Airport": {
			"id": "3610",
			"name": "Merle K (Mudhole) Smith Airport",
			"city": "Cordova",
			"country": "United States",
			"IATA": "CDV",
			"ICAO": "PACV",
			"lat": "60.4917984",
			"lng": "-145.4779968"
		},
		"Norfolk International Airport": {
			"id": "3611",
			"name": "Norfolk International Airport",
			"city": "Norfolk",
			"country": "United States",
			"IATA": "ORF",
			"ICAO": "KORF",
			"lat": "36.89459991455078",
			"lng": "-76.20120239257812"
		},
		"Southeast Texas Regional Airport": {
			"id": "3612",
			"name": "Southeast Texas Regional Airport",
			"city": "Beaumont",
			"country": "United States",
			"IATA": "BPT",
			"ICAO": "KBPT",
			"lat": "29.9507999420166",
			"lng": "-94.02069854736328"
		},
		"Savannah Hilton Head International Airport": {
			"id": "3613",
			"name": "Savannah Hilton Head International Airport",
			"city": "Savannah",
			"country": "United States",
			"IATA": "SAV",
			"ICAO": "KSAV",
			"lat": "32.12760162",
			"lng": "-81.20210266"
		},
		"Hill Air Force Base": {
			"id": "3614",
			"name": "Hill Air Force Base",
			"city": "Ogden",
			"country": "United States",
			"IATA": "HIF",
			"ICAO": "KHIF",
			"lat": "41.12403",
			"lng": "-111.973086"
		},
		"Nome Airport": {
			"id": "3615",
			"name": "Nome Airport",
			"city": "Nome",
			"country": "United States",
			"IATA": "OME",
			"ICAO": "PAOM",
			"lat": "64.51219940185547",
			"lng": "-165.44500732421875"
		},
		"Scappoose Industrial Airpark": {
			"id": "3616",
			"name": "Scappoose Industrial Airpark",
			"city": "San Luis",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KSPB",
			"lat": "45.770999908447266",
			"lng": "-122.86199951171875"
		},
		"St Petersburg Clearwater International Airport": {
			"id": "3617",
			"name": "St Petersburg Clearwater International Airport",
			"city": "St. Petersburg",
			"country": "United States",
			"IATA": "PIE",
			"ICAO": "KPIE",
			"lat": "27.91020012",
			"lng": "-82.68740082"
		},
		"Menominee Marinette Twin County Airport": {
			"id": "3618",
			"name": "Menominee Marinette Twin County Airport",
			"city": "Macon",
			"country": "United States",
			"IATA": "MNM",
			"ICAO": "KMNM",
			"lat": "45.12670135498047",
			"lng": "-87.63839721679688"
		},
		"Lone Star Executive Airport": {
			"id": "3619",
			"name": "Lone Star Executive Airport",
			"city": "Conroe",
			"country": "United States",
			"IATA": "CXO",
			"ICAO": "KCXO",
			"lat": "30.3518009186",
			"lng": "-95.4144973755"
		},
		"Deadhorse Airport": {
			"id": "3620",
			"name": "Deadhorse Airport",
			"city": "Deadhorse",
			"country": "United States",
			"IATA": "SCC",
			"ICAO": "PASC",
			"lat": "70.19470215",
			"lng": "-148.4649963"
		},
		"San Antonio International Airport": {
			"id": "3621",
			"name": "San Antonio International Airport",
			"city": "San Antonio",
			"country": "United States",
			"IATA": "SAT",
			"ICAO": "KSAT",
			"lat": "29.533700942993164",
			"lng": "-98.46980285644531"
		},
		"Greater Rochester International Airport": {
			"id": "3622",
			"name": "Greater Rochester International Airport",
			"city": "Rochester",
			"country": "United States",
			"IATA": "ROC",
			"ICAO": "KROC",
			"lat": "43.118900299072266",
			"lng": "-77.67240142822266"
		},
		"Patrick Air Force Base": {
			"id": "3623",
			"name": "Patrick Air Force Base",
			"city": "Coco Beach",
			"country": "United States",
			"IATA": "COF",
			"ICAO": "KCOF",
			"lat": "28.2348995209",
			"lng": "-80.6100997925"
		},
		"Teterboro Airport": {
			"id": "3624",
			"name": "Teterboro Airport",
			"city": "Teterboro",
			"country": "United States",
			"IATA": "TEB",
			"ICAO": "KTEB",
			"lat": "40.85010147089999",
			"lng": "-74.060798645"
		},
		"Ellsworth Air Force Base": {
			"id": "3625",
			"name": "Ellsworth Air Force Base",
			"city": "Rapid City",
			"country": "United States",
			"IATA": "RCA",
			"ICAO": "KRCA",
			"lat": "44.14500046",
			"lng": "-103.1039963"
		},
		"Raleigh Durham International Airport": {
			"id": "3626",
			"name": "Raleigh Durham International Airport",
			"city": "Raleigh-durham",
			"country": "United States",
			"IATA": "RDU",
			"ICAO": "KRDU",
			"lat": "35.877601623535156",
			"lng": "-78.7874984741211"
		},
		"James M Cox Dayton International Airport": {
			"id": "3627",
			"name": "James M Cox Dayton International Airport",
			"city": "Dayton",
			"country": "United States",
			"IATA": "DAY",
			"ICAO": "KDAY",
			"lat": "39.902400970458984",
			"lng": "-84.21939849853516"
		},
		"Kenai Municipal Airport": {
			"id": "3628",
			"name": "Kenai Municipal Airport",
			"city": "Kenai",
			"country": "United States",
			"IATA": "ENA",
			"ICAO": "PAEN",
			"lat": "60.57310104370117",
			"lng": "-151.2449951171875"
		},
		"Mc Alester Regional Airport": {
			"id": "3629",
			"name": "Mc Alester Regional Airport",
			"city": "Mcalester",
			"country": "United States",
			"IATA": "MLC",
			"ICAO": "KMLC",
			"lat": "34.88240051",
			"lng": "-95.78350067"
		},
		"Niagara Falls International Airport": {
			"id": "3630",
			"name": "Niagara Falls International Airport",
			"city": "Niagara Falls",
			"country": "United States",
			"IATA": "IAG",
			"ICAO": "KIAG",
			"lat": "43.1072998046875",
			"lng": "-78.94619750976562"
		},
		"Coulter Field": {
			"id": "3631",
			"name": "Coulter Field",
			"city": "Bryan",
			"country": "United States",
			"IATA": "CFD",
			"ICAO": "KCFD",
			"lat": "30.715700149499998",
			"lng": "-96.3313980103"
		},
		"Wright Aaf (Fort Stewart)/Midcoast Regional Airport": {
			"id": "3632",
			"name": "Wright Aaf (Fort Stewart)/Midcoast Regional Airport",
			"city": "Wright",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KLHW",
			"lat": "31.88909912",
			"lng": "-81.56230164"
		},
		"Newport News Williamsburg International Airport": {
			"id": "3633",
			"name": "Newport News Williamsburg International Airport",
			"city": "Newport News",
			"country": "United States",
			"IATA": "PHF",
			"ICAO": "KPHF",
			"lat": "37.13190079",
			"lng": "-76.49299622"
		},
		"Esler Regional Airport": {
			"id": "3634",
			"name": "Esler Regional Airport",
			"city": "Alexandria",
			"country": "United States",
			"IATA": "ESF",
			"ICAO": "KESF",
			"lat": "31.3948993683",
			"lng": "-92.2957992554"
		},
		"Altus Air Force Base": {
			"id": "3635",
			"name": "Altus Air Force Base",
			"city": "Altus",
			"country": "United States",
			"IATA": "LTS",
			"ICAO": "KLTS",
			"lat": "34.667098999",
			"lng": "-99.2667007446"
		},
		"Tucson International Airport": {
			"id": "3636",
			"name": "Tucson International Airport",
			"city": "Tucson",
			"country": "United States",
			"IATA": "TUS",
			"ICAO": "KTUS",
			"lat": "32.1161003112793",
			"lng": "-110.94100189208984"
		},
		"Minot Air Force Base": {
			"id": "3637",
			"name": "Minot Air Force Base",
			"city": "Minot",
			"country": "United States",
			"IATA": "MIB",
			"ICAO": "KMIB",
			"lat": "48.41559982",
			"lng": "-101.3580017"
		},
		"Beale Air Force Base": {
			"id": "3638",
			"name": "Beale Air Force Base",
			"city": "Marysville",
			"country": "United States",
			"IATA": "BAB",
			"ICAO": "KBAB",
			"lat": "39.136100769",
			"lng": "-121.43699646"
		},
		"Greater Kankakee Airport": {
			"id": "3639",
			"name": "Greater Kankakee Airport",
			"city": "Kankakee",
			"country": "United States",
			"IATA": "IKK",
			"ICAO": "KIKK",
			"lat": "41.07139968869999",
			"lng": "-87.8462982178"
		},
		"Seymour Johnson Air Force Base": {
			"id": "3640",
			"name": "Seymour Johnson Air Force Base",
			"city": "Goldsboro",
			"country": "United States",
			"IATA": "GSB",
			"ICAO": "KGSB",
			"lat": "35.33940125",
			"lng": "-77.96060181"
		},
		"Theodore Francis Green State Airport": {
			"id": "3641",
			"name": "Theodore Francis Green State Airport",
			"city": "Providence",
			"country": "United States",
			"IATA": "PVD",
			"ICAO": "KPVD",
			"lat": "41.732601165771484",
			"lng": "-71.42040252685547"
		},
		"Salisbury Ocean City Wicomico Regional Airport": {
			"id": "3642",
			"name": "Salisbury Ocean City Wicomico Regional Airport",
			"city": "Salisbury",
			"country": "United States",
			"IATA": "SBY",
			"ICAO": "KSBY",
			"lat": "38.34049987792969",
			"lng": "-75.51029968261719"
		},
		"Rancho Murieta Airport": {
			"id": "3643",
			"name": "Rancho Murieta Airport",
			"city": "Rancho Murieta",
			"country": "United States",
			"IATA": "RIU",
			"ICAO": "KRIU",
			"lat": "38.48680114746094",
			"lng": "-121.10299682617188"
		},
		"Bob Hope Airport": {
			"id": "3644",
			"name": "Bob Hope Airport",
			"city": "Burbank",
			"country": "United States",
			"IATA": "BUR",
			"ICAO": "KBUR",
			"lat": "34.20069885253906",
			"lng": "-118.35900115966797"
		},
		"Detroit Metropolitan Wayne County Airport": {
			"id": "3645",
			"name": "Detroit Metropolitan Wayne County Airport",
			"city": "Detroit",
			"country": "United States",
			"IATA": "DTW",
			"ICAO": "KDTW",
			"lat": "42.212398529052734",
			"lng": "-83.35340118408203"
		},
		"Tampa International Airport": {
			"id": "3646",
			"name": "Tampa International Airport",
			"city": "Tampa",
			"country": "United States",
			"IATA": "TPA",
			"ICAO": "KTPA",
			"lat": "27.975500106811523",
			"lng": "-82.533203125"
		},
		"Pembina Municipal Airport": {
			"id": "3647",
			"name": "Pembina Municipal Airport",
			"city": "Pembina",
			"country": "United States",
			"IATA": "PMB",
			"ICAO": "KPMB",
			"lat": "48.9425010681",
			"lng": "-97.2407989502"
		},
		"Polk Army Air Field": {
			"id": "3648",
			"name": "Polk Army Air Field",
			"city": "Fort Polk",
			"country": "United States",
			"IATA": "POE",
			"ICAO": "KPOE",
			"lat": "31.0447998",
			"lng": "-93.1917038"
		},
		"Eielson Air Force Base": {
			"id": "3649",
			"name": "Eielson Air Force Base",
			"city": "Fairbanks",
			"country": "United States",
			"IATA": "EIL",
			"ICAO": "PAEI",
			"lat": "64.66570282",
			"lng": "-147.102005"
		},
		"Range Regional Airport": {
			"id": "3650",
			"name": "Range Regional Airport",
			"city": "Hibbing",
			"country": "United States",
			"IATA": "HIB",
			"ICAO": "KHIB",
			"lat": "47.38660049",
			"lng": "-92.83899689"
		},
		"Angelina County Airport": {
			"id": "3651",
			"name": "Angelina County Airport",
			"city": "Lufkin",
			"country": "United States",
			"IATA": "LFK",
			"ICAO": "KLFK",
			"lat": "31.2339992523",
			"lng": "-94.75"
		},
		"Midland International Airport": {
			"id": "3652",
			"name": "Midland International Airport",
			"city": "Midland",
			"country": "United States",
			"IATA": "MAF",
			"ICAO": "KMAF",
			"lat": "31.9424991607666",
			"lng": "-102.2020034790039"
		},
		"Austin Straubel International Airport": {
			"id": "3653",
			"name": "Austin Straubel International Airport",
			"city": "Green Bay",
			"country": "United States",
			"IATA": "GRB",
			"ICAO": "KGRB",
			"lat": "44.48509979248047",
			"lng": "-88.12960052490234"
		},
		"Ardmore Municipal Airport": {
			"id": "3654",
			"name": "Ardmore Municipal Airport",
			"city": "Ardmore",
			"country": "United States",
			"IATA": "ADM",
			"ICAO": "KADM",
			"lat": "34.30301",
			"lng": "-97.0196342"
		},
		"Mc Guire Air Force Base": {
			"id": "3655",
			"name": "Mc Guire Air Force Base",
			"city": "Wrightstown",
			"country": "United States",
			"IATA": "WRI",
			"ICAO": "KWRI",
			"lat": "40.0155983",
			"lng": "-74.59169769"
		},
		"Cherry Point MCAS /Cunningham Field/": {
			"id": "3656",
			"name": "Cherry Point MCAS /Cunningham Field/",
			"city": "Cherry Point",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KNKT",
			"lat": "34.90090179",
			"lng": "-76.88069916"
		},
		"Emanuel County Airport": {
			"id": "3657",
			"name": "Emanuel County Airport",
			"city": "Santa Barbara",
			"country": "United States",
			"IATA": "SBO",
			"ICAO": "KSBO",
			"lat": "32.609100341796875",
			"lng": "-82.36990356445312"
		},
		"Augusta Regional At Bush Field": {
			"id": "3658",
			"name": "Augusta Regional At Bush Field",
			"city": "Bush Field",
			"country": "United States",
			"IATA": "AGS",
			"ICAO": "KAGS",
			"lat": "33.36989974975586",
			"lng": "-81.9645004272461"
		},
		"Sloulin Field International Airport": {
			"id": "3659",
			"name": "Sloulin Field International Airport",
			"city": "Williston",
			"country": "United States",
			"IATA": "ISN",
			"ICAO": "KISN",
			"lat": "48.177898407",
			"lng": "-103.641998291"
		},
		"Bill & Hillary Clinton National Airport/Adams Field": {
			"id": "3660",
			"name": "Bill & Hillary Clinton National Airport/Adams Field",
			"city": "Little Rock",
			"country": "United States",
			"IATA": "LIT",
			"ICAO": "KLIT",
			"lat": "34.729400634799994",
			"lng": "-92.2242965698"
		},
		"Stewart International Airport": {
			"id": "3661",
			"name": "Stewart International Airport",
			"city": "Newburgh",
			"country": "United States",
			"IATA": "SWF",
			"ICAO": "KSWF",
			"lat": "41.50410079956055",
			"lng": "-74.10479736328125"
		},
		"Baudette International Airport": {
			"id": "3662",
			"name": "Baudette International Airport",
			"city": "Baudette",
			"country": "United States",
			"IATA": "BDE",
			"ICAO": "KBDE",
			"lat": "48.7284011841",
			"lng": "-94.612197876"
		},
		"Sacramento Executive Airport": {
			"id": "3663",
			"name": "Sacramento Executive Airport",
			"city": "Sacramento",
			"country": "United States",
			"IATA": "SAC",
			"ICAO": "KSAC",
			"lat": "38.5125007629",
			"lng": "-121.492996216"
		},
		"Homer Airport": {
			"id": "3664",
			"name": "Homer Airport",
			"city": "Homer",
			"country": "United States",
			"IATA": "HOM",
			"ICAO": "PAHO",
			"lat": "59.645599365234375",
			"lng": "-151.4770050048828"
		},
		"Waynesville-St. Robert Regional Forney field": {
			"id": "3665",
			"name": "Waynesville-St. Robert Regional Forney field",
			"city": "Fort Leonardwood",
			"country": "United States",
			"IATA": "TBN",
			"ICAO": "KTBN",
			"lat": "37.74160004",
			"lng": "-92.14070129"
		},
		"Dobbins Air Reserve Base": {
			"id": "3666",
			"name": "Dobbins Air Reserve Base",
			"city": "Marietta",
			"country": "United States",
			"IATA": "MGE",
			"ICAO": "KMGE",
			"lat": "33.91540146",
			"lng": "-84.51629639"
		},
		"Fairchild Air Force Base": {
			"id": "3667",
			"name": "Fairchild Air Force Base",
			"city": "Spokane",
			"country": "United States",
			"IATA": "SKA",
			"ICAO": "KSKA",
			"lat": "47.6151008606",
			"lng": "-117.65599823"
		},
		"Roscommon County - Blodgett Memorial Airport": {
			"id": "3668",
			"name": "Roscommon County - Blodgett Memorial Airport",
			"city": "Houghton Lake",
			"country": "United States",
			"IATA": "HTL",
			"ICAO": "KHTL",
			"lat": "44.359798",
			"lng": "-84.671095"
		},
		"Tyndall Air Force Base": {
			"id": "3669",
			"name": "Tyndall Air Force Base",
			"city": "Panama City",
			"country": "United States",
			"IATA": "PAM",
			"ICAO": "KPAM",
			"lat": "30.0695991516",
			"lng": "-85.57540130619999"
		},
		"Dallas Fort Worth International Airport": {
			"id": "3670",
			"name": "Dallas Fort Worth International Airport",
			"city": "Dallas-Fort Worth",
			"country": "United States",
			"IATA": "DFW",
			"ICAO": "KDFW",
			"lat": "32.89680099487305",
			"lng": "-97.03800201416016"
		},
		"Melbourne International Airport": {
			"id": "3671",
			"name": "Melbourne International Airport",
			"city": "Melbourne",
			"country": "United States",
			"IATA": "MLB",
			"ICAO": "KMLB",
			"lat": "28.102800369262695",
			"lng": "-80.64530181884766"
		},
		"McChord Air Force Base": {
			"id": "3672",
			"name": "McChord Air Force Base",
			"city": "Tacoma",
			"country": "United States",
			"IATA": "TCM",
			"ICAO": "KTCM",
			"lat": "47.1376991272",
			"lng": "-122.475997925"
		},
		"Austin Bergstrom International Airport": {
			"id": "3673",
			"name": "Austin Bergstrom International Airport",
			"city": "Austin",
			"country": "United States",
			"IATA": "AUS",
			"ICAO": "KAUS",
			"lat": "30.194499969482422",
			"lng": "-97.6698989868164"
		},
		"Rickenbacker International Airport": {
			"id": "3674",
			"name": "Rickenbacker International Airport",
			"city": "Columbus",
			"country": "United States",
			"IATA": "LCK",
			"ICAO": "KLCK",
			"lat": "39.813801",
			"lng": "-82.927803"
		},
		"Sawyer International Airport": {
			"id": "3675",
			"name": "Sawyer International Airport",
			"city": "Gwinn",
			"country": "United States",
			"IATA": "MQT",
			"ICAO": "KSAW",
			"lat": "46.353599548300004",
			"lng": "-87.395401001"
		},
		"McGhee Tyson Airport": {
			"id": "3676",
			"name": "McGhee Tyson Airport",
			"city": "Knoxville",
			"country": "United States",
			"IATA": "TYS",
			"ICAO": "KTYS",
			"lat": "35.81100082",
			"lng": "-83.9940033"
		},
		"Hood Army Air Field": {
			"id": "3677",
			"name": "Hood Army Air Field",
			"city": "Fort Hood",
			"country": "United States",
			"IATA": "HLR",
			"ICAO": "KHLR",
			"lat": "31.138700485199998",
			"lng": "-97.71450042720001"
		},
		"Lambert St Louis International Airport": {
			"id": "3678",
			"name": "Lambert St Louis International Airport",
			"city": "St. Louis",
			"country": "United States",
			"IATA": "STL",
			"ICAO": "KSTL",
			"lat": "38.74869918823242",
			"lng": "-90.37000274658203"
		},
		"Millville Municipal Airport": {
			"id": "3679",
			"name": "Millville Municipal Airport",
			"city": "Millville",
			"country": "United States",
			"IATA": "MIV",
			"ICAO": "KMIV",
			"lat": "39.367801666259766",
			"lng": "-75.07219696044922"
		},
		"Sheppard Air Force Base-Wichita Falls Municipal Airport": {
			"id": "3680",
			"name": "Sheppard Air Force Base-Wichita Falls Municipal Airport",
			"city": "Wichita Falls",
			"country": "United States",
			"IATA": "SPS",
			"ICAO": "KSPS",
			"lat": "33.98880005",
			"lng": "-98.49189758"
		},
		"Cincinnati Municipal Airport Lunken Field": {
			"id": "3681",
			"name": "Cincinnati Municipal Airport Lunken Field",
			"city": "Cincinnati",
			"country": "United States",
			"IATA": "LUK",
			"ICAO": "KLUK",
			"lat": "39.10329819",
			"lng": "-84.41860199"
		},
		"Hartsfield Jackson Atlanta International Airport": {
			"id": "3682",
			"name": "Hartsfield Jackson Atlanta International Airport",
			"city": "Atlanta",
			"country": "United States",
			"IATA": "ATL",
			"ICAO": "KATL",
			"lat": "33.63669967651367",
			"lng": "-84.4281005859375"
		},
		"Castle Airport": {
			"id": "3683",
			"name": "Castle Airport",
			"city": "Merced",
			"country": "United States",
			"IATA": "MER",
			"ICAO": "KMER",
			"lat": "37.38050079",
			"lng": "-120.5680008"
		},
		"Mc Clellan Airfield": {
			"id": "3684",
			"name": "Mc Clellan Airfield",
			"city": "Sacramento",
			"country": "United States",
			"IATA": "MCC",
			"ICAO": "KMCC",
			"lat": "38.66759872",
			"lng": "-121.401001"
		},
		"Gerald R. Ford International Airport": {
			"id": "3685",
			"name": "Gerald R. Ford International Airport",
			"city": "Grand Rapids",
			"country": "United States",
			"IATA": "GRR",
			"ICAO": "KGRR",
			"lat": "42.88079834",
			"lng": "-85.52279663"
		},
		"Winkler County Airport": {
			"id": "3686",
			"name": "Winkler County Airport",
			"city": "Wink",
			"country": "United States",
			"IATA": "INK",
			"ICAO": "KINK",
			"lat": "31.779600143399996",
			"lng": "-103.200996399"
		},
		"Fresno Yosemite International Airport": {
			"id": "3687",
			"name": "Fresno Yosemite International Airport",
			"city": "Fresno",
			"country": "United States",
			"IATA": "FAT",
			"ICAO": "KFAT",
			"lat": "36.77619934082031",
			"lng": "-119.71800231933594"
		},
		"Vero Beach Municipal Airport": {
			"id": "3688",
			"name": "Vero Beach Municipal Airport",
			"city": "Vero Beach",
			"country": "United States",
			"IATA": "VRB",
			"ICAO": "KVRB",
			"lat": "27.655599594116",
			"lng": "-80.417900085449"
		},
		"Imperial County Airport": {
			"id": "3689",
			"name": "Imperial County Airport",
			"city": "Imperial",
			"country": "United States",
			"IATA": "IPL",
			"ICAO": "KIPL",
			"lat": "32.834201812699995",
			"lng": "-115.57900238"
		},
		"Nashville International Airport": {
			"id": "3690",
			"name": "Nashville International Airport",
			"city": "Nashville",
			"country": "United States",
			"IATA": "BNA",
			"ICAO": "KBNA",
			"lat": "36.1245002746582",
			"lng": "-86.6781997680664"
		},
		"Laredo International Airport": {
			"id": "3691",
			"name": "Laredo International Airport",
			"city": "Laredo",
			"country": "United States",
			"IATA": "LRD",
			"ICAO": "KLRD",
			"lat": "27.543800354003906",
			"lng": "-99.46160125732422"
		},
		"Elmendorf Air Force Base": {
			"id": "3692",
			"name": "Elmendorf Air Force Base",
			"city": "Anchorage",
			"country": "United States",
			"IATA": "EDF",
			"ICAO": "PAED",
			"lat": "61.250999450683594",
			"lng": "-149.8070068359375"
		},
		"Ralph Wien Memorial Airport": {
			"id": "3693",
			"name": "Ralph Wien Memorial Airport",
			"city": "Kotzebue",
			"country": "United States",
			"IATA": "OTZ",
			"ICAO": "PAOT",
			"lat": "66.88469696",
			"lng": "-162.598999"
		},
		"Altoona Blair County Airport": {
			"id": "3694",
			"name": "Altoona Blair County Airport",
			"city": "Altoona",
			"country": "United States",
			"IATA": "AOO",
			"ICAO": "KAOO",
			"lat": "40.29639816",
			"lng": "-78.31999969"
		},
		"Dyess Air Force Base": {
			"id": "3695",
			"name": "Dyess Air Force Base",
			"city": "Abilene",
			"country": "United States",
			"IATA": "DYS",
			"ICAO": "KDYS",
			"lat": "32.4207992554",
			"lng": "-99.854598999"
		},
		"South Arkansas Regional At Goodwin Field": {
			"id": "3696",
			"name": "South Arkansas Regional At Goodwin Field",
			"city": "El Dorado",
			"country": "United States",
			"IATA": "ELD",
			"ICAO": "KELD",
			"lat": "33.22100067138672",
			"lng": "-92.81330108642578"
		},
		"La Guardia Airport": {
			"id": "3697",
			"name": "La Guardia Airport",
			"city": "New York",
			"country": "United States",
			"IATA": "LGA",
			"ICAO": "KLGA",
			"lat": "40.77719879",
			"lng": "-73.87259674"
		},
		"Tallahassee Regional Airport": {
			"id": "3698",
			"name": "Tallahassee Regional Airport",
			"city": "Tallahassee",
			"country": "United States",
			"IATA": "TLH",
			"ICAO": "KTLH",
			"lat": "30.396499633789062",
			"lng": "-84.35030364990234"
		},
		"Dupage Airport": {
			"id": "3699",
			"name": "Dupage Airport",
			"city": "West Chicago",
			"country": "United States",
			"IATA": "DPA",
			"ICAO": "KDPA",
			"lat": "41.90779877",
			"lng": "-88.24859619"
		},
		"Waco Regional Airport": {
			"id": "3700",
			"name": "Waco Regional Airport",
			"city": "Waco",
			"country": "United States",
			"IATA": "ACT",
			"ICAO": "KACT",
			"lat": "31.611299514770508",
			"lng": "-97.23049926757812"
		},
		"Augusta State Airport": {
			"id": "3701",
			"name": "Augusta State Airport",
			"city": "Augusta",
			"country": "United States",
			"IATA": "AUG",
			"ICAO": "KAUG",
			"lat": "44.320598602299995",
			"lng": "-69.7973022461"
		},
		"Hillsboro Municipal Airport": {
			"id": "3702",
			"name": "Hillsboro Municipal Airport",
			"city": "Hillsboro",
			"country": "United States",
			"IATA": "INJ",
			"ICAO": "KINJ",
			"lat": "32.08349991",
			"lng": "-97.09719849"
		},
		"Mc Kellar Sipes Regional Airport": {
			"id": "3704",
			"name": "Mc Kellar Sipes Regional Airport",
			"city": "Jackson",
			"country": "United States",
			"IATA": "MKL",
			"ICAO": "KMKL",
			"lat": "35.59989929",
			"lng": "-88.91560364"
		},
		"Molokai Airport": {
			"id": "3705",
			"name": "Molokai Airport",
			"city": "Molokai",
			"country": "United States",
			"IATA": "MKK",
			"ICAO": "PHMK",
			"lat": "21.15290069580078",
			"lng": "-157.0959930419922"
		},
		"Godman Army Air Field": {
			"id": "3706",
			"name": "Godman Army Air Field",
			"city": "Fort Knox",
			"country": "United States",
			"IATA": "FTK",
			"ICAO": "KFTK",
			"lat": "37.907100677500004",
			"lng": "-85.9720993042"
		},
		"New River MCAS /H/ /Mccutcheon Fld/ Airport": {
			"id": "3707",
			"name": "New River MCAS /H/ /Mccutcheon Fld/ Airport",
			"city": "Jacksonville",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KNCA",
			"lat": "34.70840073",
			"lng": "-77.43969727"
		},
		"San Angelo Regional Mathis Field": {
			"id": "3708",
			"name": "San Angelo Regional Mathis Field",
			"city": "San Angelo",
			"country": "United States",
			"IATA": "SJT",
			"ICAO": "KSJT",
			"lat": "31.35770034790039",
			"lng": "-100.49600219726562"
		},
		"Calexico International Airport": {
			"id": "3709",
			"name": "Calexico International Airport",
			"city": "Calexico",
			"country": "United States",
			"IATA": "CXL",
			"ICAO": "KCXL",
			"lat": "32.6694984436",
			"lng": "-115.513000488"
		},
		"Chico Municipal Airport": {
			"id": "3710",
			"name": "Chico Municipal Airport",
			"city": "Chico",
			"country": "United States",
			"IATA": "CIC",
			"ICAO": "KCIC",
			"lat": "39.79539871",
			"lng": "-121.8580017"
		},
		"Burlington International Airport": {
			"id": "3711",
			"name": "Burlington International Airport",
			"city": "Burlington",
			"country": "United States",
			"IATA": "BTV",
			"ICAO": "KBTV",
			"lat": "44.471900939899996",
			"lng": "-73.15329742429999"
		},
		"Jacksonville International Airport": {
			"id": "3712",
			"name": "Jacksonville International Airport",
			"city": "Jacksonville",
			"country": "United States",
			"IATA": "JAX",
			"ICAO": "KJAX",
			"lat": "30.49410057067871",
			"lng": "-81.68789672851562"
		},
		"Durango La Plata County Airport": {
			"id": "3713",
			"name": "Durango La Plata County Airport",
			"city": "Durango",
			"country": "United States",
			"IATA": "DRO",
			"ICAO": "KDRO",
			"lat": "37.1515007019",
			"lng": "-107.753997803"
		},
		"Washington Dulles International Airport": {
			"id": "3714",
			"name": "Washington Dulles International Airport",
			"city": "Washington",
			"country": "United States",
			"IATA": "IAD",
			"ICAO": "KIAD",
			"lat": "38.94449997",
			"lng": "-77.45580292"
		},
		"Easterwood Field": {
			"id": "3715",
			"name": "Easterwood Field",
			"city": "College Station",
			"country": "United States",
			"IATA": "CLL",
			"ICAO": "KCLL",
			"lat": "30.58860016",
			"lng": "-96.36380005"
		},
		"Felts Field": {
			"id": "3716",
			"name": "Felts Field",
			"city": "Spokane",
			"country": "United States",
			"IATA": "SFF",
			"ICAO": "KSFF",
			"lat": "47.682800292969",
			"lng": "-117.32299804688"
		},
		"General Mitchell International Airport": {
			"id": "3717",
			"name": "General Mitchell International Airport",
			"city": "Milwaukee",
			"country": "United States",
			"IATA": "MKE",
			"ICAO": "KMKE",
			"lat": "42.947200775146484",
			"lng": "-87.89659881591797"
		},
		"Abilene Regional Airport": {
			"id": "3718",
			"name": "Abilene Regional Airport",
			"city": "Abilene",
			"country": "United States",
			"IATA": "ABI",
			"ICAO": "KABI",
			"lat": "32.4113006592",
			"lng": "-99.68190002440001"
		},
		"Columbia Regional Airport": {
			"id": "3719",
			"name": "Columbia Regional Airport",
			"city": "Columbia",
			"country": "United States",
			"IATA": "COU",
			"ICAO": "KCOU",
			"lat": "38.81809997558594",
			"lng": "-92.21959686279297"
		},
		"Portland International Airport": {
			"id": "3720",
			"name": "Portland International Airport",
			"city": "Portland",
			"country": "United States",
			"IATA": "PDX",
			"ICAO": "KPDX",
			"lat": "45.58869934",
			"lng": "-122.5979996"
		},
		"Dade Collier Training and Transition Airport": {
			"id": "3721",
			"name": "Dade Collier Training and Transition Airport",
			"city": "Miami",
			"country": "United States",
			"IATA": "TNT",
			"ICAO": "KTNT",
			"lat": "25.861799240112",
			"lng": "-80.897003173828"
		},
		"Palm Beach International Airport": {
			"id": "3722",
			"name": "Palm Beach International Airport",
			"city": "West Palm Beach",
			"country": "United States",
			"IATA": "PBI",
			"ICAO": "KPBI",
			"lat": "26.68320083618164",
			"lng": "-80.09559631347656"
		},
		"Fort Worth Meacham International Airport": {
			"id": "3723",
			"name": "Fort Worth Meacham International Airport",
			"city": "Fort Worth",
			"country": "United States",
			"IATA": "FTW",
			"ICAO": "KFTW",
			"lat": "32.8198013306",
			"lng": "-97.36239624019998"
		},
		"Ogdensburg International Airport": {
			"id": "3724",
			"name": "Ogdensburg International Airport",
			"city": "Ogdensburg",
			"country": "United States",
			"IATA": "OGS",
			"ICAO": "KOGS",
			"lat": "44.6819000244",
			"lng": "-75.46549987790002"
		},
		"Boeing Field King County International Airport": {
			"id": "3726",
			"name": "Boeing Field King County International Airport",
			"city": "Seattle",
			"country": "United States",
			"IATA": "BFI",
			"ICAO": "KBFI",
			"lat": "47.529998779296875",
			"lng": "-122.302001953125"
		},
		"Lackland Air Force Base": {
			"id": "3727",
			"name": "Lackland Air Force Base",
			"city": "San Antonio",
			"country": "United States",
			"IATA": "SKF",
			"ICAO": "KSKF",
			"lat": "29.38419914",
			"lng": "-98.58110046"
		},
		"Honolulu International Airport": {
			"id": "3728",
			"name": "Honolulu International Airport",
			"city": "Honolulu",
			"country": "United States",
			"IATA": "HNL",
			"ICAO": "PHNL",
			"lat": "21.318700790405273",
			"lng": "-157.9219970703125"
		},
		"Des Moines International Airport": {
			"id": "3729",
			"name": "Des Moines International Airport",
			"city": "Des Moines",
			"country": "United States",
			"IATA": "DSM",
			"ICAO": "KDSM",
			"lat": "41.534000396728516",
			"lng": "-93.66310119628906"
		},
		"Coastal Carolina Regional Airport": {
			"id": "3730",
			"name": "Coastal Carolina Regional Airport",
			"city": "New Bern",
			"country": "United States",
			"IATA": "EWN",
			"ICAO": "KEWN",
			"lat": "35.0730018616",
			"lng": "-77.04290008539999"
		},
		"San Diego International Airport": {
			"id": "3731",
			"name": "San Diego International Airport",
			"city": "San Diego",
			"country": "United States",
			"IATA": "SAN",
			"ICAO": "KSAN",
			"lat": "32.7336006165",
			"lng": "-117.190002441"
		},
		"Monroe Regional Airport": {
			"id": "3732",
			"name": "Monroe Regional Airport",
			"city": "Monroe",
			"country": "United States",
			"IATA": "MLU",
			"ICAO": "KMLU",
			"lat": "32.51089859008789",
			"lng": "-92.0376968383789"
		},
		"Shaw Air Force Base": {
			"id": "3733",
			"name": "Shaw Air Force Base",
			"city": "Sumter",
			"country": "United States",
			"IATA": "SSC",
			"ICAO": "KSSC",
			"lat": "33.97269821",
			"lng": "-80.47059631"
		},
		"Ontario International Airport": {
			"id": "3734",
			"name": "Ontario International Airport",
			"city": "Ontario",
			"country": "United States",
			"IATA": "ONT",
			"ICAO": "KONT",
			"lat": "34.055999755859375",
			"lng": "-117.60099792480469"
		},
		"Majors Airport": {
			"id": "3735",
			"name": "Majors Airport",
			"city": "Greenvile",
			"country": "United States",
			"IATA": "GVT",
			"ICAO": "KGVT",
			"lat": "33.0677986145",
			"lng": "-96.0652999878"
		},
		"Roswell International Air Center Airport": {
			"id": "3736",
			"name": "Roswell International Air Center Airport",
			"city": "Roswell",
			"country": "United States",
			"IATA": "ROW",
			"ICAO": "KROW",
			"lat": "33.30160140991211",
			"lng": "-104.53099822998047"
		},
		"Coleman A. Young Municipal Airport": {
			"id": "3737",
			"name": "Coleman A. Young Municipal Airport",
			"city": "Detroit",
			"country": "United States",
			"IATA": "DET",
			"ICAO": "KDET",
			"lat": "42.40919876",
			"lng": "-83.00990295"
		},
		"Brownsville South Padre Island International Airport": {
			"id": "3738",
			"name": "Brownsville South Padre Island International Airport",
			"city": "Brownsville",
			"country": "United States",
			"IATA": "BRO",
			"ICAO": "KBRO",
			"lat": "25.90679931640625",
			"lng": "-97.4259033203125"
		},
		"Dothan Regional Airport": {
			"id": "3739",
			"name": "Dothan Regional Airport",
			"city": "Dothan",
			"country": "United States",
			"IATA": "DHN",
			"ICAO": "KDHN",
			"lat": "31.321300506591797",
			"lng": "-85.44960021972656"
		},
		"Cape May County Airport": {
			"id": "3740",
			"name": "Cape May County Airport",
			"city": "Wildwood",
			"country": "United States",
			"IATA": "WWD",
			"ICAO": "KWWD",
			"lat": "39.008499145500004",
			"lng": "-74.9083023071"
		},
		"Selfridge Angb Airport": {
			"id": "3742",
			"name": "Selfridge Angb Airport",
			"city": "Mount Clemens",
			"country": "United States",
			"IATA": "MTC",
			"ICAO": "KMTC",
			"lat": "42.608299255371094",
			"lng": "-82.83550262451172"
		},
		"Four Corners Regional Airport": {
			"id": "3743",
			"name": "Four Corners Regional Airport",
			"city": "Farmington",
			"country": "United States",
			"IATA": "FMN",
			"ICAO": "KFMN",
			"lat": "36.741199493399996",
			"lng": "-108.230003357"
		},
		"Corpus Christi International Airport": {
			"id": "3744",
			"name": "Corpus Christi International Airport",
			"city": "Corpus Christi",
			"country": "United States",
			"IATA": "CRP",
			"ICAO": "KCRP",
			"lat": "27.77039909362793",
			"lng": "-97.5011978149414"
		},
		"Syracuse Hancock International Airport": {
			"id": "3745",
			"name": "Syracuse Hancock International Airport",
			"city": "Syracuse",
			"country": "United States",
			"IATA": "SYR",
			"ICAO": "KSYR",
			"lat": "43.11119842529297",
			"lng": "-76.1063003540039"
		},
		"Naval Air Station Key West/Boca Chica Field": {
			"id": "3746",
			"name": "Naval Air Station Key West/Boca Chica Field",
			"city": "Key West",
			"country": "United States",
			"IATA": "NQX",
			"ICAO": "KNQX",
			"lat": "24.57579994",
			"lng": "-81.68890381"
		},
		"Chicago Midway International Airport": {
			"id": "3747",
			"name": "Chicago Midway International Airport",
			"city": "Chicago",
			"country": "United States",
			"IATA": "MDW",
			"ICAO": "KMDW",
			"lat": "41.7859992980957",
			"lng": "-87.75240325927734"
		},
		"Norman Y. Mineta San Jose International Airport": {
			"id": "3748",
			"name": "Norman Y. Mineta San Jose International Airport",
			"city": "San Jose",
			"country": "United States",
			"IATA": "SJC",
			"ICAO": "KSJC",
			"lat": "37.36259841918945",
			"lng": "-121.92900085449219"
		},
		"Lea County Regional Airport": {
			"id": "3749",
			"name": "Lea County Regional Airport",
			"city": "Hobbs",
			"country": "United States",
			"IATA": "HOB",
			"ICAO": "KHOB",
			"lat": "32.6875",
			"lng": "-103.2170029"
		},
		"Northeast Philadelphia Airport": {
			"id": "3750",
			"name": "Northeast Philadelphia Airport",
			"city": "Philadelphia",
			"country": "United States",
			"IATA": "PNE",
			"ICAO": "KPNE",
			"lat": "40.08190155",
			"lng": "-75.01059723"
		},
		"Denver International Airport": {
			"id": "3751",
			"name": "Denver International Airport",
			"city": "Denver",
			"country": "United States",
			"IATA": "DEN",
			"ICAO": "KDEN",
			"lat": "39.861698150635",
			"lng": "-104.672996521"
		},
		"Philadelphia International Airport": {
			"id": "3752",
			"name": "Philadelphia International Airport",
			"city": "Philadelphia",
			"country": "United States",
			"IATA": "PHL",
			"ICAO": "KPHL",
			"lat": "39.87189865112305",
			"lng": "-75.24109649658203"
		},
		"Sioux Gateway Col. Bud Day Field": {
			"id": "3753",
			"name": "Sioux Gateway Col. Bud Day Field",
			"city": "Sioux City",
			"country": "United States",
			"IATA": "SUX",
			"ICAO": "KSUX",
			"lat": "42.40259933",
			"lng": "-96.38439941"
		},
		"Middle Georgia Regional Airport": {
			"id": "3754",
			"name": "Middle Georgia Regional Airport",
			"city": "Macon",
			"country": "United States",
			"IATA": "MCN",
			"ICAO": "KMCN",
			"lat": "32.69279861450195",
			"lng": "-83.64920043945312"
		},
		"Truth Or Consequences Municipal Airport": {
			"id": "3755",
			"name": "Truth Or Consequences Municipal Airport",
			"city": "Truth Or Consequences",
			"country": "United States",
			"IATA": "TCS",
			"ICAO": "KTCS",
			"lat": "33.2369003296",
			"lng": "-107.272003174"
		},
		"Palmdale Regional/USAF Plant 42 Airport": {
			"id": "3756",
			"name": "Palmdale Regional/USAF Plant 42 Airport",
			"city": "Palmdale",
			"country": "United States",
			"IATA": "PMD",
			"ICAO": "KPMD",
			"lat": "34.62939835",
			"lng": "-118.0849991"
		},
		"Randolph Air Force Base": {
			"id": "3757",
			"name": "Randolph Air Force Base",
			"city": "San Antonio",
			"country": "United States",
			"IATA": "RND",
			"ICAO": "KRND",
			"lat": "29.52969933",
			"lng": "-98.27890015"
		},
		"El Centro Naf Airport": {
			"id": "3758",
			"name": "El Centro Naf Airport",
			"city": "El Centro",
			"country": "United States",
			"IATA": "NJK",
			"ICAO": "KNJK",
			"lat": "32.829200744628906",
			"lng": "-115.6719970703125"
		},
		"Port Columbus International Airport": {
			"id": "3759",
			"name": "Port Columbus International Airport",
			"city": "Columbus",
			"country": "United States",
			"IATA": "CMH",
			"ICAO": "KCMH",
			"lat": "39.99800109863281",
			"lng": "-82.89189910888672"
		},
		"Drake Field": {
			"id": "3760",
			"name": "Drake Field",
			"city": "Fayetteville",
			"country": "United States",
			"IATA": "FYV",
			"ICAO": "KFYV",
			"lat": "36.00510025024414",
			"lng": "-94.17009735107422"
		},
		"Henry Post Army Air Field (Fort Sill)": {
			"id": "3761",
			"name": "Henry Post Army Air Field (Fort Sill)",
			"city": "Fort Sill",
			"country": "United States",
			"IATA": "FSI",
			"ICAO": "KFSI",
			"lat": "34.64979935",
			"lng": "-98.40219879"
		},
		"Princeton Municipal Airport": {
			"id": "3762",
			"name": "Princeton Municipal Airport",
			"city": "Princeton",
			"country": "United States",
			"IATA": "PNM",
			"ICAO": "KPNM",
			"lat": "45.55989838",
			"lng": "-93.60820007"
		},
		"Wright-Patterson Air Force Base": {
			"id": "3763",
			"name": "Wright-Patterson Air Force Base",
			"city": "Dayton",
			"country": "United States",
			"IATA": "FFO",
			"ICAO": "KFFO",
			"lat": "39.8260993958",
			"lng": "-84.0483016968"
		},
		"Edward G. Pitka Sr Airport": {
			"id": "3764",
			"name": "Edward G. Pitka Sr Airport",
			"city": "Galena",
			"country": "United States",
			"IATA": "GAL",
			"ICAO": "PAGA",
			"lat": "64.73619843",
			"lng": "-156.9369965"
		},
		"Chandler Municipal Airport": {
			"id": "3765",
			"name": "Chandler Municipal Airport",
			"city": "Chandler",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KCHD",
			"lat": "33.2691",
			"lng": "-111.810997"
		},
		"Mineral Wells Airport": {
			"id": "3766",
			"name": "Mineral Wells Airport",
			"city": "Mineral Wells",
			"country": "United States",
			"IATA": "MWL",
			"ICAO": "KMWL",
			"lat": "32.7816009521",
			"lng": "-98.0602035522"
		},
		"Mc Connell Air Force Base": {
			"id": "3767",
			"name": "Mc Connell Air Force Base",
			"city": "Wichita",
			"country": "United States",
			"IATA": "IAB",
			"ICAO": "KIAB",
			"lat": "37.62189865",
			"lng": "-97.26820374"
		},
		"New Orleans NAS JRB/Alvin Callender Field": {
			"id": "3768",
			"name": "New Orleans NAS JRB/Alvin Callender Field",
			"city": "New Orleans",
			"country": "United States",
			"IATA": "NBG",
			"ICAO": "KNBG",
			"lat": "29.82530022",
			"lng": "-90.03500366"
		},
		"Beaufort County Airport": {
			"id": "3769",
			"name": "Beaufort County Airport",
			"city": "Beaufort",
			"country": "United States",
			"IATA": "BFT",
			"ICAO": "KARW",
			"lat": "32.4122009277",
			"lng": "-80.6343994141"
		},
		"Texarkana Regional Webb Field": {
			"id": "3770",
			"name": "Texarkana Regional Webb Field",
			"city": "Texarkana",
			"country": "United States",
			"IATA": "TXK",
			"ICAO": "KTXK",
			"lat": "33.45370101928711",
			"lng": "-93.99099731445312"
		},
		"Plattsburgh International Airport": {
			"id": "3771",
			"name": "Plattsburgh International Airport",
			"city": "Plattsburgh",
			"country": "United States",
			"IATA": "PBG",
			"ICAO": "KPBG",
			"lat": "44.650901794433594",
			"lng": "-73.46810150146484"
		},
		"Phillips Army Air Field": {
			"id": "3772",
			"name": "Phillips Army Air Field",
			"city": "Aberdeen",
			"country": "United States",
			"IATA": "APG",
			"ICAO": "KAPG",
			"lat": "39.466202",
			"lng": "-76.1688"
		},
		"Tucumcari Municipal Airport": {
			"id": "3773",
			"name": "Tucumcari Municipal Airport",
			"city": "Tucumcari",
			"country": "United States",
			"IATA": "TCC",
			"ICAO": "KTCC",
			"lat": "35.182800293",
			"lng": "-103.602996826"
		},
		"Ted Stevens Anchorage International Airport": {
			"id": "3774",
			"name": "Ted Stevens Anchorage International Airport",
			"city": "Anchorage",
			"country": "United States",
			"IATA": "ANC",
			"ICAO": "PANC",
			"lat": "61.174400329589844",
			"lng": "-149.99600219726562"
		},
		"Robert Gray  Army Air Field Airport": {
			"id": "3775",
			"name": "Robert Gray  Army Air Field Airport",
			"city": "Killeen",
			"country": "United States",
			"IATA": "GRK",
			"ICAO": "KGRK",
			"lat": "31.067199707",
			"lng": "-97.82890319820001"
		},
		"Black Rock Airport": {
			"id": "3776",
			"name": "Black Rock Airport",
			"city": "Zuni Pueblo",
			"country": "United States",
			"IATA": "ZUN",
			"ICAO": "KZUN",
			"lat": "35.08319854736328",
			"lng": "-108.79199981689453"
		},
		"Bellingham International Airport": {
			"id": "3777",
			"name": "Bellingham International Airport",
			"city": "Bellingham",
			"country": "United States",
			"IATA": "BLI",
			"ICAO": "KBLI",
			"lat": "48.79280090332031",
			"lng": "-122.53800201416016"
		},
		"Millington Regional Jetport Airport": {
			"id": "3778",
			"name": "Millington Regional Jetport Airport",
			"city": "Millington",
			"country": "United States",
			"IATA": "NQA",
			"ICAO": "KNQA",
			"lat": "35.356700897217",
			"lng": "-89.870300292969"
		},
		"Elkins-Randolph Co-Jennings Randolph Field": {
			"id": "3779",
			"name": "Elkins-Randolph Co-Jennings Randolph Field",
			"city": "Elkins",
			"country": "United States",
			"IATA": "EKN",
			"ICAO": "KEKN",
			"lat": "38.88940048",
			"lng": "-79.85710144"
		},
		"Hartford Brainard Airport": {
			"id": "3780",
			"name": "Hartford Brainard Airport",
			"city": "Hartford",
			"country": "United States",
			"IATA": "HFD",
			"ICAO": "KHFD",
			"lat": "41.736698150635",
			"lng": "-72.649398803711"
		},
		"North Central State Airport": {
			"id": "3781",
			"name": "North Central State Airport",
			"city": "Smithfield",
			"country": "United States",
			"IATA": "SFZ",
			"ICAO": "KSFZ",
			"lat": "41.9207992554",
			"lng": "-71.49140167239999"
		},
		"Mobile Regional Airport": {
			"id": "3782",
			"name": "Mobile Regional Airport",
			"city": "Mobile",
			"country": "United States",
			"IATA": "MOB",
			"ICAO": "KMOB",
			"lat": "30.691200256348",
			"lng": "-88.242797851562"
		},
		"Moffett Federal Airfield": {
			"id": "3783",
			"name": "Moffett Federal Airfield",
			"city": "Mountain View",
			"country": "United States",
			"IATA": "NUQ",
			"ICAO": "KNUQ",
			"lat": "37.416099548339844",
			"lng": "-122.04900360107422"
		},
		"Santa Fe Municipal Airport": {
			"id": "3784",
			"name": "Santa Fe Municipal Airport",
			"city": "Santa Fe",
			"country": "United States",
			"IATA": "SAF",
			"ICAO": "KSAF",
			"lat": "35.617099762",
			"lng": "-106.088996887"
		},
		"Barking Sands Airport": {
			"id": "3785",
			"name": "Barking Sands Airport",
			"city": "Barking Sands",
			"country": "United States",
			"IATA": "BKH",
			"ICAO": "PHBK",
			"lat": "22.022800445599998",
			"lng": "-159.785003662"
		},
		"Beauregard Regional Airport": {
			"id": "3786",
			"name": "Beauregard Regional Airport",
			"city": "Deridder",
			"country": "United States",
			"IATA": "DRI",
			"ICAO": "KDRI",
			"lat": "30.8316993713",
			"lng": "-93.33989715579999"
		},
		"Bradshaw Army Airfield": {
			"id": "3787",
			"name": "Bradshaw Army Airfield",
			"city": "Bradshaw Field",
			"country": "United States",
			"IATA": "BSF",
			"ICAO": "PHSF",
			"lat": "19.760099411",
			"lng": "-155.554000854"
		},
		"Nogales International Airport": {
			"id": "3788",
			"name": "Nogales International Airport",
			"city": "Nogales",
			"country": "United States",
			"IATA": "OLS",
			"ICAO": "KOLS",
			"lat": "31.417699813842773",
			"lng": "-110.8479995727539"
		},
		"Mac Dill Air Force Base": {
			"id": "3789",
			"name": "Mac Dill Air Force Base",
			"city": "Tampa",
			"country": "United States",
			"IATA": "MCF",
			"ICAO": "KMCF",
			"lat": "27.84930038",
			"lng": "-82.52120209"
		},
		"Scott AFB/Midamerica Airport": {
			"id": "3790",
			"name": "Scott AFB/Midamerica Airport",
			"city": "Belleville",
			"country": "United States",
			"IATA": "BLV",
			"ICAO": "KBLV",
			"lat": "38.5452",
			"lng": "-89.835197"
		},
		"Opa-locka Executive Airport": {
			"id": "3791",
			"name": "Opa-locka Executive Airport",
			"city": "Miami",
			"country": "United States",
			"IATA": "OPF",
			"ICAO": "KOPF",
			"lat": "25.90699959",
			"lng": "-80.27839661"
		},
		"Del Rio International Airport": {
			"id": "3792",
			"name": "Del Rio International Airport",
			"city": "Del Rio",
			"country": "United States",
			"IATA": "DRT",
			"ICAO": "KDRT",
			"lat": "29.3742008209",
			"lng": "-100.927001953"
		},
		"Southwest Florida International Airport": {
			"id": "3793",
			"name": "Southwest Florida International Airport",
			"city": "Fort Myers",
			"country": "United States",
			"IATA": "RSW",
			"ICAO": "KRSW",
			"lat": "26.53619956970215",
			"lng": "-81.75520324707031"
		},
		"King Salmon Airport": {
			"id": "3794",
			"name": "King Salmon Airport",
			"city": "King Salmon",
			"country": "United States",
			"IATA": "AKN",
			"ICAO": "PAKN",
			"lat": "58.67679977",
			"lng": "-156.6490021"
		},
		"Muir Army Air Field (Fort Indiantown Gap) Airport": {
			"id": "3795",
			"name": "Muir Army Air Field (Fort Indiantown Gap) Airport",
			"city": "Muir",
			"country": "United States",
			"IATA": "MUI",
			"ICAO": "KMUI",
			"lat": "40.43479919",
			"lng": "-76.56939697"
		},
		"Kapalua Airport": {
			"id": "3796",
			"name": "Kapalua Airport",
			"city": "Lahania-kapalua",
			"country": "United States",
			"IATA": "JHM",
			"ICAO": "PHJH",
			"lat": "20.962900161743164",
			"lng": "-156.67300415039062"
		},
		"John F Kennedy International Airport": {
			"id": "3797",
			"name": "John F Kennedy International Airport",
			"city": "New York",
			"country": "United States",
			"IATA": "JFK",
			"ICAO": "KJFK",
			"lat": "40.63980103",
			"lng": "-73.77890015"
		},
		"Homestead ARB Airport": {
			"id": "3798",
			"name": "Homestead ARB Airport",
			"city": "Homestead",
			"country": "United States",
			"IATA": "HST",
			"ICAO": "KHST",
			"lat": "25.48859978",
			"lng": "-80.38359833"
		},
		"Riverside Municipal Airport": {
			"id": "3799",
			"name": "Riverside Municipal Airport",
			"city": "Riverside",
			"country": "United States",
			"IATA": "RAL",
			"ICAO": "KRAL",
			"lat": "33.95190048",
			"lng": "-117.4449997"
		},
		"Sherman Army Air Field": {
			"id": "3800",
			"name": "Sherman Army Air Field",
			"city": "Fort Leavenworth",
			"country": "United States",
			"IATA": "FLV",
			"ICAO": "KFLV",
			"lat": "39.3683013916",
			"lng": "-94.9147033691"
		},
		"Wallops Flight Facility Airport": {
			"id": "3801",
			"name": "Wallops Flight Facility Airport",
			"city": "Wallops Island",
			"country": "United States",
			"IATA": "WAL",
			"ICAO": "KWAL",
			"lat": "37.9402008057",
			"lng": "-75.4664001465"
		},
		"Holloman Air Force Base": {
			"id": "3802",
			"name": "Holloman Air Force Base",
			"city": "Alamogordo",
			"country": "United States",
			"IATA": "HMN",
			"ICAO": "KHMN",
			"lat": "32.8525009155",
			"lng": "-106.107002258"
		},
		"Willow Grove Naval Air Station/Joint Reserve Base": {
			"id": "3803",
			"name": "Willow Grove Naval Air Station/Joint Reserve Base",
			"city": "Willow Grove",
			"country": "United States",
			"IATA": "NXX",
			"ICAO": "KNXX",
			"lat": "40.19979858",
			"lng": "-75.14820099"
		},
		"Cheyenne Regional Jerry Olson Field": {
			"id": "3804",
			"name": "Cheyenne Regional Jerry Olson Field",
			"city": "Cheyenne",
			"country": "United States",
			"IATA": "CYS",
			"ICAO": "KCYS",
			"lat": "41.15570068",
			"lng": "-104.8119965"
		},
		"Stockton Metropolitan Airport": {
			"id": "3805",
			"name": "Stockton Metropolitan Airport",
			"city": "Stockton",
			"country": "United States",
			"IATA": "SCK",
			"ICAO": "KSCK",
			"lat": "37.894199371338",
			"lng": "-121.2379989624"
		},
		"Charleston Air Force Base-International Airport": {
			"id": "3806",
			"name": "Charleston Air Force Base-International Airport",
			"city": "Charleston",
			"country": "United States",
			"IATA": "CHS",
			"ICAO": "KCHS",
			"lat": "32.89860153",
			"lng": "-80.04049683"
		},
		"Reno Tahoe International Airport": {
			"id": "3807",
			"name": "Reno Tahoe International Airport",
			"city": "Reno",
			"country": "United States",
			"IATA": "RNO",
			"ICAO": "KRNO",
			"lat": "39.49909973144531",
			"lng": "-119.76799774169922"
		},
		"Ketchikan International Airport": {
			"id": "3808",
			"name": "Ketchikan International Airport",
			"city": "Ketchikan",
			"country": "United States",
			"IATA": "KTN",
			"ICAO": "PAKT",
			"lat": "55.35559845",
			"lng": "-131.7140045"
		},
		"Willow Run Airport": {
			"id": "3809",
			"name": "Willow Run Airport",
			"city": "Detroit",
			"country": "United States",
			"IATA": "YIP",
			"ICAO": "KYIP",
			"lat": "42.23789978",
			"lng": "-83.53040314"
		},
		"Vandenberg Air Force Base": {
			"id": "3810",
			"name": "Vandenberg Air Force Base",
			"city": "Lompoc",
			"country": "United States",
			"IATA": "VBG",
			"ICAO": "KVBG",
			"lat": "34.7373008728",
			"lng": "-120.583999634"
		},
		"Birmingham-Shuttlesworth International Airport": {
			"id": "3811",
			"name": "Birmingham-Shuttlesworth International Airport",
			"city": "Birmingham",
			"country": "United States",
			"IATA": "BHM",
			"ICAO": "KBHM",
			"lat": "33.56290054",
			"lng": "-86.75350189"
		},
		"Lakehurst Maxfield Field Airport": {
			"id": "3812",
			"name": "Lakehurst Maxfield Field Airport",
			"city": "Lakehurst",
			"country": "United States",
			"IATA": "NEL",
			"ICAO": "KNEL",
			"lat": "40.03329849",
			"lng": "-74.353302"
		},
		"Nellis Air Force Base": {
			"id": "3814",
			"name": "Nellis Air Force Base",
			"city": "Las Vegas",
			"country": "United States",
			"IATA": "LSV",
			"ICAO": "KLSV",
			"lat": "36.2361984253",
			"lng": "-115.033996582"
		},
		"March ARB Airport": {
			"id": "3815",
			"name": "March ARB Airport",
			"city": "Riverside",
			"country": "United States",
			"IATA": "RIV",
			"ICAO": "KRIV",
			"lat": "33.88069916",
			"lng": "-117.2590027"
		},
		"Modesto City Co-Harry Sham Field": {
			"id": "3816",
			"name": "Modesto City Co-Harry Sham Field",
			"city": "Modesto",
			"country": "United States",
			"IATA": "MOD",
			"ICAO": "KMOD",
			"lat": "37.62580109",
			"lng": "-120.9540024"
		},
		"Sacramento International Airport": {
			"id": "3817",
			"name": "Sacramento International Airport",
			"city": "Sacramento",
			"country": "United States",
			"IATA": "SMF",
			"ICAO": "KSMF",
			"lat": "38.69540023803711",
			"lng": "-121.59100341796875"
		},
		"Waukegan National Airport": {
			"id": "3818",
			"name": "Waukegan National Airport",
			"city": "Chicago",
			"country": "United States",
			"IATA": "UGN",
			"ICAO": "KUGN",
			"lat": "42.422199249268",
			"lng": "-87.867897033691"
		},
		"City of Colorado Springs Municipal Airport": {
			"id": "3819",
			"name": "City of Colorado Springs Municipal Airport",
			"city": "Colorado Springs",
			"country": "United States",
			"IATA": "COS",
			"ICAO": "KCOS",
			"lat": "38.805801391602",
			"lng": "-104.70099639893"
		},
		"Buffalo Niagara International Airport": {
			"id": "3820",
			"name": "Buffalo Niagara International Airport",
			"city": "Buffalo",
			"country": "United States",
			"IATA": "BUF",
			"ICAO": "KBUF",
			"lat": "42.94049835",
			"lng": "-78.73220062"
		},
		"Griffing Sandusky Airport": {
			"id": "3821",
			"name": "Griffing Sandusky Airport",
			"city": "Sandusky",
			"country": "United States",
			"IATA": "SKY",
			"ICAO": "KSKY",
			"lat": "41.4333992004",
			"lng": "-82.6522979736"
		},
		"Snohomish County (Paine Field) Airport": {
			"id": "3822",
			"name": "Snohomish County (Paine Field) Airport",
			"city": "Everett",
			"country": "United States",
			"IATA": "PAE",
			"ICAO": "KPAE",
			"lat": "47.90629959",
			"lng": "-122.2819977"
		},
		"Mountain Home Air Force Base": {
			"id": "3823",
			"name": "Mountain Home Air Force Base",
			"city": "Mountain Home",
			"country": "United States",
			"IATA": "MUO",
			"ICAO": "KMUO",
			"lat": "43.043598",
			"lng": "-115.872002"
		},
		"Cedar City Regional Airport": {
			"id": "3824",
			"name": "Cedar City Regional Airport",
			"city": "Cedar City",
			"country": "United States",
			"IATA": "CDC",
			"ICAO": "KCDC",
			"lat": "37.70100021362305",
			"lng": "-113.0989990234375"
		},
		"Bradley International Airport": {
			"id": "3825",
			"name": "Bradley International Airport",
			"city": "Windsor Locks",
			"country": "United States",
			"IATA": "BDL",
			"ICAO": "KBDL",
			"lat": "41.9388999939",
			"lng": "-72.68319702149999"
		},
		"Mc Allen Miller International Airport": {
			"id": "3826",
			"name": "Mc Allen Miller International Airport",
			"city": "Mcallen",
			"country": "United States",
			"IATA": "MFE",
			"ICAO": "KMFE",
			"lat": "26.17580032",
			"lng": "-98.23860168"
		},
		"Norfolk Ns (Chambers Fld) Airport": {
			"id": "3827",
			"name": "Norfolk Ns (Chambers Fld) Airport",
			"city": "Norfolk",
			"country": "United States",
			"IATA": "NGU",
			"ICAO": "KNGU",
			"lat": "36.93759918",
			"lng": "-76.28929901"
		},
		"Westover ARB/Metropolitan Airport": {
			"id": "3828",
			"name": "Westover ARB/Metropolitan Airport",
			"city": "Chicopee Falls",
			"country": "United States",
			"IATA": "CEF",
			"ICAO": "KCEF",
			"lat": "42.19400024",
			"lng": "-72.53479767"
		},
		"Lubbock Preston Smith International Airport": {
			"id": "3829",
			"name": "Lubbock Preston Smith International Airport",
			"city": "Lubbock",
			"country": "United States",
			"IATA": "LBB",
			"ICAO": "KLBB",
			"lat": "33.66360092163086",
			"lng": "-101.822998046875"
		},
		"Chicago O'Hare International Airport": {
			"id": "3830",
			"name": "Chicago O'Hare International Airport",
			"city": "Chicago",
			"country": "United States",
			"IATA": "ORD",
			"ICAO": "KORD",
			"lat": "41.97859955",
			"lng": "-87.90480042"
		},
		"Boca Raton Airport": {
			"id": "3831",
			"name": "Boca Raton Airport",
			"city": "Boca Raton",
			"country": "United States",
			"IATA": "BCT",
			"ICAO": "KBCT",
			"lat": "26.3784999847",
			"lng": "-80.1076965332"
		},
		"Fairbanks International Airport": {
			"id": "3832",
			"name": "Fairbanks International Airport",
			"city": "Fairbanks",
			"country": "United States",
			"IATA": "FAI",
			"ICAO": "PAFA",
			"lat": "64.81510162",
			"lng": "-147.8560028"
		},
		"Quantico MCAF /Turner field": {
			"id": "3833",
			"name": "Quantico MCAF /Turner field",
			"city": "Quantico",
			"country": "United States",
			"IATA": "NYG",
			"ICAO": "KNYG",
			"lat": "38.50170135",
			"lng": "-77.30529785"
		},
		"Cannon Air Force Base": {
			"id": "3834",
			"name": "Cannon Air Force Base",
			"city": "Clovis",
			"country": "United States",
			"IATA": "CVS",
			"ICAO": "KCVS",
			"lat": "34.3828010559",
			"lng": "-103.321998596"
		},
		"Kaneohe Bay MCAS (Marion E. Carl Field) Airport": {
			"id": "3835",
			"name": "Kaneohe Bay MCAS (Marion E. Carl Field) Airport",
			"city": "Kaneohe Bay",
			"country": "United States",
			"IATA": "NGF",
			"ICAO": "PHNG",
			"lat": "21.4505004883",
			"lng": "-157.768005371"
		},
		"Offutt Air Force Base": {
			"id": "3836",
			"name": "Offutt Air Force Base",
			"city": "Omaha",
			"country": "United States",
			"IATA": "OFF",
			"ICAO": "KOFF",
			"lat": "41.118301391602",
			"lng": "-95.912498474121"
		},
		"Gulkana Airport": {
			"id": "3837",
			"name": "Gulkana Airport",
			"city": "Gulkana",
			"country": "United States",
			"IATA": "GKN",
			"ICAO": "PAGK",
			"lat": "62.1548996",
			"lng": "-145.4570007"
		},
		"Watertown International Airport": {
			"id": "3838",
			"name": "Watertown International Airport",
			"city": "Watertown",
			"country": "United States",
			"IATA": "ART",
			"ICAO": "KART",
			"lat": "43.99190139770508",
			"lng": "-76.02169799804688"
		},
		"Palm Springs International Airport": {
			"id": "3839",
			"name": "Palm Springs International Airport",
			"city": "Palm Springs",
			"country": "United States",
			"IATA": "PSP",
			"ICAO": "KPSP",
			"lat": "33.8297004699707",
			"lng": "-116.50700378417969"
		},
		"Rick Husband Amarillo International Airport": {
			"id": "3840",
			"name": "Rick Husband Amarillo International Airport",
			"city": "Amarillo",
			"country": "United States",
			"IATA": "AMA",
			"ICAO": "KAMA",
			"lat": "35.219398498535156",
			"lng": "-101.70600128173828"
		},
		"Fort Dodge Regional Airport": {
			"id": "3841",
			"name": "Fort Dodge Regional Airport",
			"city": "Fort Dodge",
			"country": "United States",
			"IATA": "FOD",
			"ICAO": "KFOD",
			"lat": "42.55149841",
			"lng": "-94.19259644"
		},
		"Barksdale Air Force Base": {
			"id": "3842",
			"name": "Barksdale Air Force Base",
			"city": "Shreveport",
			"country": "United States",
			"IATA": "BAD",
			"ICAO": "KBAD",
			"lat": "32.5018005371",
			"lng": "-93.6626968384"
		},
		"Topeka Regional Airport - Forbes Field": {
			"id": "3843",
			"name": "Topeka Regional Airport - Forbes Field",
			"city": "Topeka",
			"country": "United States",
			"IATA": "FOE",
			"ICAO": "KFOE",
			"lat": "38.950901031499995",
			"lng": "-95.66359710690001"
		},
		"Cotulla-La Salle County Airport": {
			"id": "3844",
			"name": "Cotulla-La Salle County Airport",
			"city": "Cotulla",
			"country": "United States",
			"IATA": "COT",
			"ICAO": "KCOT",
			"lat": "28.45669937",
			"lng": "-99.22029877"
		},
		"Wilmington International Airport": {
			"id": "3845",
			"name": "Wilmington International Airport",
			"city": "Wilmington",
			"country": "United States",
			"IATA": "ILM",
			"ICAO": "KILM",
			"lat": "34.270599365234375",
			"lng": "-77.90260314941406"
		},
		"Baton Rouge Metropolitan, Ryan Field": {
			"id": "3846",
			"name": "Baton Rouge Metropolitan, Ryan Field",
			"city": "Baton Rouge",
			"country": "United States",
			"IATA": "BTR",
			"ICAO": "KBTR",
			"lat": "30.53319931",
			"lng": "-91.14959717"
		},
		"Tyler Pounds Regional Airport": {
			"id": "3848",
			"name": "Tyler Pounds Regional Airport",
			"city": "Tyler",
			"country": "United States",
			"IATA": "TYR",
			"ICAO": "KTYR",
			"lat": "32.35409927368164",
			"lng": "-95.40239715576172"
		},
		"Baltimore/Washington International Thurgood Marshall Airport": {
			"id": "3849",
			"name": "Baltimore/Washington International Thurgood Marshall Airport",
			"city": "Baltimore",
			"country": "United States",
			"IATA": "BWI",
			"ICAO": "KBWI",
			"lat": "39.17539978",
			"lng": "-76.66829681"
		},
		"Hobart Regional Airport": {
			"id": "3850",
			"name": "Hobart Regional Airport",
			"city": "Hobart",
			"country": "United States",
			"IATA": "HBR",
			"ICAO": "KHBR",
			"lat": "34.991317",
			"lng": "-99.051313"
		},
		"Lanai Airport": {
			"id": "3851",
			"name": "Lanai Airport",
			"city": "Lanai",
			"country": "United States",
			"IATA": "LNY",
			"ICAO": "PHNY",
			"lat": "20.785600662231445",
			"lng": "-156.9510040283203"
		},
		"Alexandria International Airport": {
			"id": "3852",
			"name": "Alexandria International Airport",
			"city": "Alexandria",
			"country": "United States",
			"IATA": "AEX",
			"ICAO": "KAEX",
			"lat": "31.32740020751953",
			"lng": "-92.54979705810547"
		},
		"Condron Army Air Field": {
			"id": "3853",
			"name": "Condron Army Air Field",
			"city": "White Sands",
			"country": "United States",
			"IATA": "WSD",
			"ICAO": "KWSD",
			"lat": "32.34149933",
			"lng": "-106.4029999"
		},
		"Cold Bay Airport": {
			"id": "3854",
			"name": "Cold Bay Airport",
			"city": "Cold Bay",
			"country": "United States",
			"IATA": "CDB",
			"ICAO": "PACD",
			"lat": "55.20610046386719",
			"lng": "-162.72500610351562"
		},
		"Tulsa International Airport": {
			"id": "3855",
			"name": "Tulsa International Airport",
			"city": "Tulsa",
			"country": "United States",
			"IATA": "TUL",
			"ICAO": "KTUL",
			"lat": "36.19839859008789",
			"lng": "-95.88809967041016"
		},
		"Sitka Rocky Gutierrez Airport": {
			"id": "3856",
			"name": "Sitka Rocky Gutierrez Airport",
			"city": "Sitka",
			"country": "United States",
			"IATA": "SIT",
			"ICAO": "PASI",
			"lat": "57.04710006713867",
			"lng": "-135.36199951171875"
		},
		"Long Island Mac Arthur Airport": {
			"id": "3857",
			"name": "Long Island Mac Arthur Airport",
			"city": "Islip",
			"country": "United States",
			"IATA": "ISP",
			"ICAO": "KISP",
			"lat": "40.79520035",
			"lng": "-73.10019684"
		},
		"Minneapolis-St Paul International/Wold-Chamberlain Airport": {
			"id": "3858",
			"name": "Minneapolis-St Paul International/Wold-Chamberlain Airport",
			"city": "Minneapolis",
			"country": "United States",
			"IATA": "MSP",
			"ICAO": "KMSP",
			"lat": "44.881999969499994",
			"lng": "-93.22180175780001"
		},
		"New Castle Airport": {
			"id": "3859",
			"name": "New Castle Airport",
			"city": "Wilmington",
			"country": "United States",
			"IATA": "ILG",
			"ICAO": "KILG",
			"lat": "39.67869949",
			"lng": "-75.60649872"
		},
		"Unalaska Airport": {
			"id": "3860",
			"name": "Unalaska Airport",
			"city": "Unalaska",
			"country": "United States",
			"IATA": "DUT",
			"ICAO": "PADU",
			"lat": "53.900100708",
			"lng": "-166.544006348"
		},
		"Louis Armstrong New Orleans International Airport": {
			"id": "3861",
			"name": "Louis Armstrong New Orleans International Airport",
			"city": "New Orleans",
			"country": "United States",
			"IATA": "MSY",
			"ICAO": "KMSY",
			"lat": "29.99340057373047",
			"lng": "-90.25800323486328"
		},
		"Portland International Jetport Airport": {
			"id": "3862",
			"name": "Portland International Jetport Airport",
			"city": "Portland",
			"country": "United States",
			"IATA": "PWM",
			"ICAO": "KPWM",
			"lat": "43.64619827",
			"lng": "-70.30930328"
		},
		"Will Rogers World Airport": {
			"id": "3863",
			"name": "Will Rogers World Airport",
			"city": "Oklahoma City",
			"country": "United States",
			"IATA": "OKC",
			"ICAO": "KOKC",
			"lat": "35.39310073852539",
			"lng": "-97.60070037841797"
		},
		"Albany International Airport": {
			"id": "3864",
			"name": "Albany International Airport",
			"city": "Albany",
			"country": "United States",
			"IATA": "ALB",
			"ICAO": "KALB",
			"lat": "42.74829864501953",
			"lng": "-73.80169677734375"
		},
		"Valdez Pioneer Field": {
			"id": "3865",
			"name": "Valdez Pioneer Field",
			"city": "Valdez",
			"country": "United States",
			"IATA": "VDZ",
			"ICAO": "PAVD",
			"lat": "61.13389969",
			"lng": "-146.2480011"
		},
		"Langley Air Force Base": {
			"id": "3866",
			"name": "Langley Air Force Base",
			"city": "Hampton",
			"country": "United States",
			"IATA": "LFI",
			"ICAO": "KLFI",
			"lat": "37.082901001",
			"lng": "-76.360496521"
		},
		"John Wayne Airport-Orange County Airport": {
			"id": "3867",
			"name": "John Wayne Airport-Orange County Airport",
			"city": "Santa Ana",
			"country": "United States",
			"IATA": "SNA",
			"ICAO": "KSNA",
			"lat": "33.67570114",
			"lng": "-117.8679962"
		},
		"Columbus Air Force Base": {
			"id": "3868",
			"name": "Columbus Air Force Base",
			"city": "Colombus",
			"country": "United States",
			"IATA": "CBM",
			"ICAO": "KCBM",
			"lat": "33.6437988281",
			"lng": "-88.44380187990001"
		},
		"Kendall-Tamiami Executive Airport": {
			"id": "3869",
			"name": "Kendall-Tamiami Executive Airport",
			"city": "Kendall-tamiami",
			"country": "United States",
			"IATA": "TMB",
			"ICAO": "KTMB",
			"lat": "25.6478996277",
			"lng": "-80.432800293"
		},
		"Oceana NAS": {
			"id": "3870",
			"name": "Oceana NAS",
			"city": "Oceana",
			"country": "United States",
			"IATA": "NTU",
			"ICAO": "KNTU",
			"lat": "36.8207016",
			"lng": "-76.03350067"
		},
		"Grissom Air Reserve Base": {
			"id": "3871",
			"name": "Grissom Air Reserve Base",
			"city": "Peru",
			"country": "United States",
			"IATA": "GUS",
			"ICAO": "KGUS",
			"lat": "40.648101806599996",
			"lng": "-86.1520996094"
		},
		"Casper-Natrona County International Airport": {
			"id": "3872",
			"name": "Casper-Natrona County International Airport",
			"city": "Casper",
			"country": "United States",
			"IATA": "CPR",
			"ICAO": "KCPR",
			"lat": "42.90800095",
			"lng": "-106.4639969"
		},
		"Destin-Ft Walton Beach Airport": {
			"id": "3873",
			"name": "Destin-Ft Walton Beach Airport",
			"city": "Valparaiso",
			"country": "United States",
			"IATA": "VPS",
			"ICAO": "KVPS",
			"lat": "30.4832",
			"lng": "-86.525398"
		},
		"Craig Field": {
			"id": "3874",
			"name": "Craig Field",
			"city": "Selma",
			"country": "United States",
			"IATA": "SEM",
			"ICAO": "KSEM",
			"lat": "32.343898773193",
			"lng": "-86.987800598145"
		},
		"Key West International Airport": {
			"id": "3875",
			"name": "Key West International Airport",
			"city": "Key West",
			"country": "United States",
			"IATA": "EYW",
			"ICAO": "KEYW",
			"lat": "24.556100845336914",
			"lng": "-81.75959777832031"
		},
		"Charlotte Douglas International Airport": {
			"id": "3876",
			"name": "Charlotte Douglas International Airport",
			"city": "Charlotte",
			"country": "United States",
			"IATA": "CLT",
			"ICAO": "KCLT",
			"lat": "35.2140007019043",
			"lng": "-80.94309997558594"
		},
		"McCarran International Airport": {
			"id": "3877",
			"name": "McCarran International Airport",
			"city": "Las Vegas",
			"country": "United States",
			"IATA": "LAS",
			"ICAO": "KLAS",
			"lat": "36.08010101",
			"lng": "-115.1520004"
		},
		"Orlando International Airport": {
			"id": "3878",
			"name": "Orlando International Airport",
			"city": "Orlando",
			"country": "United States",
			"IATA": "MCO",
			"ICAO": "KMCO",
			"lat": "28.429399490356445",
			"lng": "-81.30899810791016"
		},
		"Florence Regional Airport": {
			"id": "3879",
			"name": "Florence Regional Airport",
			"city": "Florence",
			"country": "United States",
			"IATA": "FLO",
			"ICAO": "KFLO",
			"lat": "34.18539810180664",
			"lng": "-79.7238998413086"
		},
		"Great Falls International Airport": {
			"id": "3880",
			"name": "Great Falls International Airport",
			"city": "Great Falls",
			"country": "United States",
			"IATA": "GTF",
			"ICAO": "KGTF",
			"lat": "47.48199844",
			"lng": "-111.3710022"
		},
		"Youngstown Warren Regional Airport": {
			"id": "3881",
			"name": "Youngstown Warren Regional Airport",
			"city": "Youngstown",
			"country": "United States",
			"IATA": "YNG",
			"ICAO": "KYNG",
			"lat": "41.26070023",
			"lng": "-80.67910004"
		},
		"Ladd AAF Airfield": {
			"id": "3882",
			"name": "Ladd AAF Airfield",
			"city": "Fort Wainwright",
			"country": "United States",
			"IATA": "FBK",
			"ICAO": "PAFB",
			"lat": "64.83750153",
			"lng": "-147.6139984"
		},
		"Mc Minnville Municipal Airport": {
			"id": "3883",
			"name": "Mc Minnville Municipal Airport",
			"city": "Mackminnville",
			"country": "United States",
			"IATA": "MMV",
			"ICAO": "KMMV",
			"lat": "45.19440079",
			"lng": "-123.1360016"
		},
		"Robins Air Force Base": {
			"id": "3884",
			"name": "Robins Air Force Base",
			"city": "Macon",
			"country": "United States",
			"IATA": "WRB",
			"ICAO": "KWRB",
			"lat": "32.6400985718",
			"lng": "-83.5919036865"
		},
		"Pullman Moscow Regional Airport": {
			"id": "3944",
			"name": "Pullman Moscow Regional Airport",
			"city": "Pullman",
			"country": "United States",
			"IATA": "PUW",
			"ICAO": "KPUW",
			"lat": "46.7439",
			"lng": "-117.110001"
		},
		"Lewiston Nez Perce County Airport": {
			"id": "3945",
			"name": "Lewiston Nez Perce County Airport",
			"city": "Lewiston",
			"country": "United States",
			"IATA": "LWS",
			"ICAO": "KLWS",
			"lat": "46.3745002746582",
			"lng": "-117.01499938964844"
		},
		"Elmira Corning Regional Airport": {
			"id": "3946",
			"name": "Elmira Corning Regional Airport",
			"city": "Elmira",
			"country": "United States",
			"IATA": "ELM",
			"ICAO": "KELM",
			"lat": "42.1599006652832",
			"lng": "-76.8916015625"
		},
		"Ithaca Tompkins Regional Airport": {
			"id": "3947",
			"name": "Ithaca Tompkins Regional Airport",
			"city": "Ithaca",
			"country": "United States",
			"IATA": "ITH",
			"ICAO": "KITH",
			"lat": "42.49100112915039",
			"lng": "-76.4583969116211"
		},
		"Monterey Peninsula Airport": {
			"id": "3948",
			"name": "Monterey Peninsula Airport",
			"city": "Monterey",
			"country": "United States",
			"IATA": "MRY",
			"ICAO": "KMRY",
			"lat": "36.58700180053711",
			"lng": "-121.84300231933594"
		},
		"Santa Barbara Municipal Airport": {
			"id": "3949",
			"name": "Santa Barbara Municipal Airport",
			"city": "Santa Barbara",
			"country": "United States",
			"IATA": "SBA",
			"ICAO": "KSBA",
			"lat": "34.42620087",
			"lng": "-119.8399963"
		},
		"Daytona Beach International Airport": {
			"id": "3950",
			"name": "Daytona Beach International Airport",
			"city": "Daytona Beach",
			"country": "United States",
			"IATA": "DAB",
			"ICAO": "KDAB",
			"lat": "29.179899",
			"lng": "-81.058098"
		},
		"Talkeetna Airport": {
			"id": "4004",
			"name": "Talkeetna Airport",
			"city": "Talkeetna",
			"country": "United States",
			"IATA": "TKA",
			"ICAO": "PATK",
			"lat": "62.320499420166",
			"lng": "-150.09399414062"
		},
		"Tweed New Haven Airport": {
			"id": "4006",
			"name": "Tweed New Haven Airport",
			"city": "New Haven",
			"country": "United States",
			"IATA": "HVN",
			"ICAO": "KHVN",
			"lat": "41.26369858",
			"lng": "-72.88680267"
		},
		"Asheville Regional Airport": {
			"id": "4007",
			"name": "Asheville Regional Airport",
			"city": "Asheville",
			"country": "United States",
			"IATA": "AVL",
			"ICAO": "KAVL",
			"lat": "35.43619918823242",
			"lng": "-82.54180145263672"
		},
		"Piedmont Triad International Airport": {
			"id": "4008",
			"name": "Piedmont Triad International Airport",
			"city": "Greensboro",
			"country": "United States",
			"IATA": "GSO",
			"ICAO": "KGSO",
			"lat": "36.097801208496094",
			"lng": "-79.93730163574219"
		},
		"Joe Foss Field Airport": {
			"id": "4009",
			"name": "Joe Foss Field Airport",
			"city": "Sioux Falls",
			"country": "United States",
			"IATA": "FSD",
			"ICAO": "KFSD",
			"lat": "43.582000732400004",
			"lng": "-96.741897583"
		},
		"Manchester Airport": {
			"id": "4011",
			"name": "Manchester Airport",
			"city": "Manchester NH",
			"country": "United States",
			"IATA": "MHT",
			"ICAO": "KMHT",
			"lat": "42.93259811401367",
			"lng": "-71.43569946289062"
		},
		"Naples Municipal Airport": {
			"id": "4012",
			"name": "Naples Municipal Airport",
			"city": "Naples",
			"country": "United States",
			"IATA": "APF",
			"ICAO": "KAPF",
			"lat": "26.1525993347",
			"lng": "-81.7752990723"
		},
		"Louisville International Standiford Field": {
			"id": "4014",
			"name": "Louisville International Standiford Field",
			"city": "Louisville",
			"country": "United States",
			"IATA": "SDF",
			"ICAO": "KSDF",
			"lat": "38.1744",
			"lng": "-85.736"
		},
		"Charlottesville Albemarle Airport": {
			"id": "4015",
			"name": "Charlottesville Albemarle Airport",
			"city": "Charlottesville VA",
			"country": "United States",
			"IATA": "CHO",
			"ICAO": "KCHO",
			"lat": "38.13859939575195",
			"lng": "-78.4529037475586"
		},
		"Roanoke–Blacksburg Regional Airport": {
			"id": "4016",
			"name": "Roanoke–Blacksburg Regional Airport",
			"city": "Roanoke VA",
			"country": "United States",
			"IATA": "ROA",
			"ICAO": "KROA",
			"lat": "37.325500488299994",
			"lng": "-79.975402832"
		},
		"Blue Grass Airport": {
			"id": "4017",
			"name": "Blue Grass Airport",
			"city": "Lexington KY",
			"country": "United States",
			"IATA": "LEX",
			"ICAO": "KLEX",
			"lat": "38.0364990234375",
			"lng": "-84.60590362548828"
		},
		"Evansville Regional Airport": {
			"id": "4018",
			"name": "Evansville Regional Airport",
			"city": "Evansville",
			"country": "United States",
			"IATA": "EVV",
			"ICAO": "KEVV",
			"lat": "38.0369987488",
			"lng": "-87.5324020386"
		},
		"Albuquerque International Sunport Airport": {
			"id": "4019",
			"name": "Albuquerque International Sunport Airport",
			"city": "Albuquerque",
			"country": "United States",
			"IATA": "ABQ",
			"ICAO": "KABQ",
			"lat": "35.040199279785156",
			"lng": "-106.60900115966797"
		},
		"Gallatin Field": {
			"id": "4020",
			"name": "Gallatin Field",
			"city": "Bozeman",
			"country": "United States",
			"IATA": "BZN",
			"ICAO": "KBZN",
			"lat": "45.77750015",
			"lng": "-111.1529999"
		},
		"Billings Logan International Airport": {
			"id": "4021",
			"name": "Billings Logan International Airport",
			"city": "Billings",
			"country": "United States",
			"IATA": "BIL",
			"ICAO": "KBIL",
			"lat": "45.807701110839844",
			"lng": "-108.54299926757812"
		},
		"Bert Mooney Airport": {
			"id": "4022",
			"name": "Bert Mooney Airport",
			"city": "Butte",
			"country": "United States",
			"IATA": "BTM",
			"ICAO": "KBTM",
			"lat": "45.95479965209961",
			"lng": "-112.49700164794922"
		},
		"Cherry Capital Airport": {
			"id": "4023",
			"name": "Cherry Capital Airport",
			"city": "Traverse City",
			"country": "United States",
			"IATA": "TVC",
			"ICAO": "KTVC",
			"lat": "44.74140167236328",
			"lng": "-85.58219909667969"
		},
		"Hancock County-Bar Harbor Airport": {
			"id": "4025",
			"name": "Hancock County-Bar Harbor Airport",
			"city": "Bar Harbor",
			"country": "United States",
			"IATA": "BHB",
			"ICAO": "KBHB",
			"lat": "44.45000076",
			"lng": "-68.3615036"
		},
		"Knox County Regional Airport": {
			"id": "4026",
			"name": "Knox County Regional Airport",
			"city": "Rockland",
			"country": "United States",
			"IATA": "RKD",
			"ICAO": "KRKD",
			"lat": "44.06010056",
			"lng": "-69.09919739"
		},
		"Jackson Hole Airport": {
			"id": "4027",
			"name": "Jackson Hole Airport",
			"city": "Jacksn Hole",
			"country": "United States",
			"IATA": "JAC",
			"ICAO": "KJAC",
			"lat": "43.6072998046875",
			"lng": "-110.73799896240234"
		},
		"Chicago Rockford International Airport": {
			"id": "4028",
			"name": "Chicago Rockford International Airport",
			"city": "Rockford",
			"country": "United States",
			"IATA": "RFD",
			"ICAO": "KRFD",
			"lat": "42.19540023803711",
			"lng": "-89.09719848632812"
		},
		"Greenville Spartanburg International Airport": {
			"id": "4034",
			"name": "Greenville Spartanburg International Airport",
			"city": "Greenville",
			"country": "United States",
			"IATA": "GSP",
			"ICAO": "KGSP",
			"lat": "34.8956985474",
			"lng": "-82.2189025879"
		},
		"Central Illinois Regional Airport at Bloomington-Normal": {
			"id": "4037",
			"name": "Central Illinois Regional Airport at Bloomington-Normal",
			"city": "Bloomington",
			"country": "United States",
			"IATA": "BMI",
			"ICAO": "KBMI",
			"lat": "40.47710037",
			"lng": "-88.91590118"
		},
		"Gulfport Biloxi International Airport": {
			"id": "4038",
			"name": "Gulfport Biloxi International Airport",
			"city": "Gulfport",
			"country": "United States",
			"IATA": "GPT",
			"ICAO": "KGPT",
			"lat": "30.40730094909668",
			"lng": "-89.07009887695312"
		},
		"Kalamazoo Battle Creek International Airport": {
			"id": "4039",
			"name": "Kalamazoo Battle Creek International Airport",
			"city": "Kalamazoo",
			"country": "United States",
			"IATA": "AZO",
			"ICAO": "KAZO",
			"lat": "42.234901428222656",
			"lng": "-85.5521011352539"
		},
		"Toledo Express Airport": {
			"id": "4040",
			"name": "Toledo Express Airport",
			"city": "Toledo",
			"country": "United States",
			"IATA": "TOL",
			"ICAO": "KTOL",
			"lat": "41.58679962",
			"lng": "-83.80780029"
		},
		"Fort Wayne International Airport": {
			"id": "4041",
			"name": "Fort Wayne International Airport",
			"city": "Fort Wayne",
			"country": "United States",
			"IATA": "FWA",
			"ICAO": "KFWA",
			"lat": "40.97850037",
			"lng": "-85.19509888"
		},
		"Decatur Airport": {
			"id": "4042",
			"name": "Decatur Airport",
			"city": "Decatur",
			"country": "United States",
			"IATA": "DEC",
			"ICAO": "KDEC",
			"lat": "39.834598541259766",
			"lng": "-88.8656997680664"
		},
		"The Eastern Iowa Airport": {
			"id": "4043",
			"name": "The Eastern Iowa Airport",
			"city": "Cedar Rapids",
			"country": "United States",
			"IATA": "CID",
			"ICAO": "KCID",
			"lat": "41.884700775146484",
			"lng": "-91.71080017089844"
		},
		"La Crosse Municipal Airport": {
			"id": "4044",
			"name": "La Crosse Municipal Airport",
			"city": "La Crosse",
			"country": "United States",
			"IATA": "LSE",
			"ICAO": "KLSE",
			"lat": "43.879002",
			"lng": "-91.256699"
		},
		"Central Wisconsin Airport": {
			"id": "4045",
			"name": "Central Wisconsin Airport",
			"city": "Wassau",
			"country": "United States",
			"IATA": "CWA",
			"ICAO": "KCWA",
			"lat": "44.7775993347",
			"lng": "-89.6668014526"
		},
		"General Wayne A. Downing Peoria International Airport": {
			"id": "4046",
			"name": "General Wayne A. Downing Peoria International Airport",
			"city": "Peoria",
			"country": "United States",
			"IATA": "PIA",
			"ICAO": "KPIA",
			"lat": "40.664199829100006",
			"lng": "-89.6932983398"
		},
		"Appleton International Airport": {
			"id": "4047",
			"name": "Appleton International Airport",
			"city": "Appleton",
			"country": "United States",
			"IATA": "ATW",
			"ICAO": "KATW",
			"lat": "44.258098602299995",
			"lng": "-88.5190963745"
		},
		"Rochester International Airport": {
			"id": "4048",
			"name": "Rochester International Airport",
			"city": "Rochester",
			"country": "United States",
			"IATA": "RST",
			"ICAO": "KRST",
			"lat": "43.90829849243164",
			"lng": "-92.5"
		},
		"University of Illinois Willard Airport": {
			"id": "4049",
			"name": "University of Illinois Willard Airport",
			"city": "Champaign",
			"country": "United States",
			"IATA": "CMI",
			"ICAO": "KCMI",
			"lat": "40.03919983",
			"lng": "-88.27809906"
		},
		"Manhattan Regional Airport": {
			"id": "4050",
			"name": "Manhattan Regional Airport",
			"city": "Manhattan",
			"country": "United States",
			"IATA": "MHK",
			"ICAO": "KMHK",
			"lat": "39.14099884033203",
			"lng": "-96.6707992553711"
		},
		"Venango Regional Airport": {
			"id": "4058",
			"name": "Venango Regional Airport",
			"city": "Franklin",
			"country": "United States",
			"IATA": "FKL",
			"ICAO": "KFKL",
			"lat": "41.3778991699",
			"lng": "-79.8603973389"
		},
		"Grand Junction Regional Airport": {
			"id": "4063",
			"name": "Grand Junction Regional Airport",
			"city": "Grand Junction",
			"country": "United States",
			"IATA": "GJT",
			"ICAO": "KGJT",
			"lat": "39.1223983765",
			"lng": "-108.527000427"
		},
		"St George Municipal Airport": {
			"id": "4064",
			"name": "St George Municipal Airport",
			"city": "Saint George",
			"country": "United States",
			"IATA": "SGU",
			"ICAO": "KSGU",
			"lat": "37.0363888889",
			"lng": "-113.510305556"
		},
		"David Wayne Hooks Memorial Airport": {
			"id": "4065",
			"name": "David Wayne Hooks Memorial Airport",
			"city": "Houston",
			"country": "United States",
			"IATA": "DWH",
			"ICAO": "KDWH",
			"lat": "30.0618000031",
			"lng": "-95.55280303960001"
		},
		"Port O'Connor Private Airport": {
			"id": "4066",
			"name": "Port O'Connor Private Airport",
			"city": "Port O\\\\'Connor",
			"country": "United States",
			"IATA": "S46",
			"ICAO": "XS46",
			"lat": "28.42970085144043",
			"lng": "-96.44439697265625"
		},
		"Sarasota Bradenton International Airport": {
			"id": "4067",
			"name": "Sarasota Bradenton International Airport",
			"city": "Sarasota",
			"country": "United States",
			"IATA": "SRQ",
			"ICAO": "KSRQ",
			"lat": "27.39539909362793",
			"lng": "-82.55439758300781"
		},
		"Van Nuys Airport": {
			"id": "4071",
			"name": "Van Nuys Airport",
			"city": "Van Nuys",
			"country": "United States",
			"IATA": "VNY",
			"ICAO": "KVNY",
			"lat": "34.209800720215",
			"lng": "-118.48999786377"
		},
		"Quad City International Airport": {
			"id": "4072",
			"name": "Quad City International Airport",
			"city": "Moline",
			"country": "United States",
			"IATA": "MLI",
			"ICAO": "KMLI",
			"lat": "41.44850158691406",
			"lng": "-90.50749969482422"
		},
		"Panama City-Bay Co International Airport": {
			"id": "4073",
			"name": "Panama City-Bay Co International Airport",
			"city": "Panama City",
			"country": "United States",
			"IATA": "PFN",
			"ICAO": "KPFN",
			"lat": "30.212099",
			"lng": "-85.6828"
		},
		"Bismarck Municipal Airport": {
			"id": "4083",
			"name": "Bismarck Municipal Airport",
			"city": "Bismarck",
			"country": "United States",
			"IATA": "BIS",
			"ICAO": "KBIS",
			"lat": "46.772701263427734",
			"lng": "-100.74600219726562"
		},
		"Telluride Regional Airport": {
			"id": "4084",
			"name": "Telluride Regional Airport",
			"city": "Telluride",
			"country": "United States",
			"IATA": "TEX",
			"ICAO": "KTEX",
			"lat": "37.9538002",
			"lng": "-107.9079971"
		},
		"Rapid City Regional Airport": {
			"id": "4087",
			"name": "Rapid City Regional Airport",
			"city": "Rapid City",
			"country": "United States",
			"IATA": "RAP",
			"ICAO": "KRAP",
			"lat": "44.0452995300293",
			"lng": "-103.05699920654297"
		},
		"Mc Clellan-Palomar Airport": {
			"id": "4088",
			"name": "Mc Clellan-Palomar Airport",
			"city": "Carlsbad",
			"country": "United States",
			"IATA": "CLD",
			"ICAO": "KCRQ",
			"lat": "33.12829971",
			"lng": "-117.2799988"
		},
		"Bishop International Airport": {
			"id": "4089",
			"name": "Bishop International Airport",
			"city": "Flint",
			"country": "United States",
			"IATA": "FNT",
			"ICAO": "KFNT",
			"lat": "42.96540069580078",
			"lng": "-83.74359893798828"
		},
		"Redding Municipal Airport": {
			"id": "4098",
			"name": "Redding Municipal Airport",
			"city": "Redding",
			"country": "United States",
			"IATA": "RDD",
			"ICAO": "KRDD",
			"lat": "40.50899887",
			"lng": "-122.2929993"
		},
		"Mahlon Sweet Field": {
			"id": "4099",
			"name": "Mahlon Sweet Field",
			"city": "Eugene",
			"country": "United States",
			"IATA": "EUG",
			"ICAO": "KEUG",
			"lat": "44.12459945678711",
			"lng": "-123.21199798583984"
		},
		"Idaho Falls Regional Airport": {
			"id": "4100",
			"name": "Idaho Falls Regional Airport",
			"city": "Idaho Falls",
			"country": "United States",
			"IATA": "IDA",
			"ICAO": "KIDA",
			"lat": "43.51459884643555",
			"lng": "-112.07099914550781"
		},
		"Rogue Valley International Medford Airport": {
			"id": "4101",
			"name": "Rogue Valley International Medford Airport",
			"city": "Medford",
			"country": "United States",
			"IATA": "MFR",
			"ICAO": "KMFR",
			"lat": "42.37419891357422",
			"lng": "-122.87300109863281"
		},
		"Roberts Field": {
			"id": "4103",
			"name": "Roberts Field",
			"city": "Redmond-Bend",
			"country": "United States",
			"IATA": "RDM",
			"ICAO": "KRDM",
			"lat": "44.2541008",
			"lng": "-121.1500015"
		},
		"Akron Canton Regional Airport": {
			"id": "4112",
			"name": "Akron Canton Regional Airport",
			"city": "Akron",
			"country": "United States",
			"IATA": "CAK",
			"ICAO": "KCAK",
			"lat": "40.916099548339844",
			"lng": "-81.44219970703125"
		},
		"Huntsville International Carl T Jones Field": {
			"id": "4113",
			"name": "Huntsville International Carl T Jones Field",
			"city": "Huntsville",
			"country": "United States",
			"IATA": "HSV",
			"ICAO": "KHSV",
			"lat": "34.637199401855",
			"lng": "-86.775100708008"
		},
		"Mid Ohio Valley Regional Airport": {
			"id": "4114",
			"name": "Mid Ohio Valley Regional Airport",
			"city": "PARKERSBURG",
			"country": "United States",
			"IATA": "PKB",
			"ICAO": "KPKB",
			"lat": "39.34510040283203",
			"lng": "-81.43920135498047"
		},
		"Montgomery Regional (Dannelly Field) Airport": {
			"id": "4115",
			"name": "Montgomery Regional (Dannelly Field) Airport",
			"city": "MONTGOMERY",
			"country": "United States",
			"IATA": "MGM",
			"ICAO": "KMGM",
			"lat": "32.30059814",
			"lng": "-86.39399719"
		},
		"Tri Cities Regional Tn Va Airport": {
			"id": "4116",
			"name": "Tri Cities Regional Tn Va Airport",
			"city": "BRISTOL",
			"country": "United States",
			"IATA": "TRI",
			"ICAO": "KTRI",
			"lat": "36.47520065307617",
			"lng": "-82.40740203857422"
		},
		"Barkley Regional Airport": {
			"id": "4117",
			"name": "Barkley Regional Airport",
			"city": "PADUCAH",
			"country": "United States",
			"IATA": "PAH",
			"ICAO": "KPAH",
			"lat": "37.06079864501953",
			"lng": "-88.7738037109375"
		},
		"Page Municipal Airport": {
			"id": "4124",
			"name": "Page Municipal Airport",
			"city": "Page",
			"country": "United States",
			"IATA": "PGA",
			"ICAO": "KPGA",
			"lat": "36.92610168",
			"lng": "-111.447998"
		},
		"Glacier Park International Airport": {
			"id": "4127",
			"name": "Glacier Park International Airport",
			"city": "Kalispell",
			"country": "United States",
			"IATA": "FCA",
			"ICAO": "KGPI",
			"lat": "48.31050109863281",
			"lng": "-114.25599670410156"
		},
		"MBS International Airport": {
			"id": "4128",
			"name": "MBS International Airport",
			"city": "Saginaw",
			"country": "United States",
			"IATA": "MBS",
			"ICAO": "KMBS",
			"lat": "43.532901763916016",
			"lng": "-84.07959747314453"
		},
		"Greater Binghamton/Edwin A Link field": {
			"id": "4129",
			"name": "Greater Binghamton/Edwin A Link field",
			"city": "Binghamton",
			"country": "United States",
			"IATA": "BGM",
			"ICAO": "KBGM",
			"lat": "42.20869827",
			"lng": "-75.97979736"
		},
		"Blythe Airport": {
			"id": "4136",
			"name": "Blythe Airport",
			"city": "Blythe",
			"country": "United States",
			"IATA": "BLH",
			"ICAO": "KBLH",
			"lat": "33.6192016602",
			"lng": "-114.717002869"
		},
		"Petersburg James A Johnson Airport": {
			"id": "4147",
			"name": "Petersburg James A Johnson Airport",
			"city": "Petersburg",
			"country": "United States",
			"IATA": "PSG",
			"ICAO": "PAPG",
			"lat": "56.80170059",
			"lng": "-132.9450073"
		},
		"Orlando Sanford International Airport": {
			"id": "4167",
			"name": "Orlando Sanford International Airport",
			"city": "Sanford",
			"country": "United States",
			"IATA": "SFB",
			"ICAO": "KSFB",
			"lat": "28.777599334716797",
			"lng": "-81.23750305175781"
		},
		"John Murtha Johnstown Cambria County Airport": {
			"id": "4169",
			"name": "John Murtha Johnstown Cambria County Airport",
			"city": "Johnstown",
			"country": "United States",
			"IATA": "JST",
			"ICAO": "KJST",
			"lat": "40.31610107421875",
			"lng": "-78.83390045166016"
		},
		"Missoula International Airport": {
			"id": "4216",
			"name": "Missoula International Airport",
			"city": "Missoula",
			"country": "United States",
			"IATA": "MSO",
			"ICAO": "KMSO",
			"lat": "46.91630173",
			"lng": "-114.0910034"
		},
		"Grand Canyon National Park Airport": {
			"id": "4219",
			"name": "Grand Canyon National Park Airport",
			"city": "Grand Canyon",
			"country": "United States",
			"IATA": "GCN",
			"ICAO": "KGCN",
			"lat": "35.95240020751953",
			"lng": "-112.14700317382812"
		},
		"Sugar Land Regional Airport": {
			"id": "4220",
			"name": "Sugar Land Regional Airport",
			"city": "Sugar Land",
			"country": "United States",
			"IATA": "SGR",
			"ICAO": "KSGR",
			"lat": "29.622299194336",
			"lng": "-95.65650177002"
		},
		"Centennial Airport": {
			"id": "4222",
			"name": "Centennial Airport",
			"city": "Denver",
			"country": "United States",
			"IATA": "APA",
			"ICAO": "KAPA",
			"lat": "39.57009888",
			"lng": "-104.848999"
		},
		"Clovis Municipal Airport": {
			"id": "4223",
			"name": "Clovis Municipal Airport",
			"city": "Clovis",
			"country": "United States",
			"IATA": "CVN",
			"ICAO": "KCVN",
			"lat": "34.4250984192",
			"lng": "-103.07900238"
		},
		"Fort Stockton Pecos County Airport": {
			"id": "4224",
			"name": "Fort Stockton Pecos County Airport",
			"city": "Fort Stockton",
			"country": "United States",
			"IATA": "FST",
			"ICAO": "KFST",
			"lat": "30.9157009125",
			"lng": "-102.916000366"
		},
		"Las Vegas Municipal Airport": {
			"id": "4225",
			"name": "Las Vegas Municipal Airport",
			"city": "Las Vegas",
			"country": "United States",
			"IATA": "LVS",
			"ICAO": "KLVS",
			"lat": "35.6542015076",
			"lng": "-105.141998291"
		},
		"West Houston Airport": {
			"id": "4226",
			"name": "West Houston Airport",
			"city": "Houston",
			"country": "United States",
			"IATA": "IWS",
			"ICAO": "KIWS",
			"lat": "29.818199157699997",
			"lng": "-95.67259979250001"
		},
		"La Junta Municipal Airport": {
			"id": "4227",
			"name": "La Junta Municipal Airport",
			"city": "La Junta",
			"country": "United States",
			"IATA": "LHX",
			"ICAO": "KLHX",
			"lat": "38.04970169",
			"lng": "-103.5090027"
		},
		"Las Cruces International Airport": {
			"id": "4228",
			"name": "Las Cruces International Airport",
			"city": "Las Cruces",
			"country": "United States",
			"IATA": "LRU",
			"ICAO": "KLRU",
			"lat": "32.289398193359375",
			"lng": "-106.9219970703125"
		},
		"Stephens County Airport": {
			"id": "4229",
			"name": "Stephens County Airport",
			"city": "Breckenridge",
			"country": "United States",
			"IATA": "BKD",
			"ICAO": "KBKD",
			"lat": "32.71900177",
			"lng": "-98.89099884030001"
		},
		"Draughon Miller Central Texas Regional Airport": {
			"id": "4230",
			"name": "Draughon Miller Central Texas Regional Airport",
			"city": "Temple",
			"country": "United States",
			"IATA": "TPL",
			"ICAO": "KTPL",
			"lat": "31.15250015258789",
			"lng": "-97.40779876708984"
		},
		"Ozona Municipal Airport": {
			"id": "4231",
			"name": "Ozona Municipal Airport",
			"city": "Ozona",
			"country": "United States",
			"IATA": "OZA",
			"ICAO": "KOZA",
			"lat": "30.735300064087",
			"lng": "-101.20300292969"
		},
		"Eagle County Regional Airport": {
			"id": "4250",
			"name": "Eagle County Regional Airport",
			"city": "Vail",
			"country": "United States",
			"IATA": "EGE",
			"ICAO": "KEGE",
			"lat": "39.64260101",
			"lng": "-106.9179993"
		},
		"Cuyahoga County Airport": {
			"id": "4253",
			"name": "Cuyahoga County Airport",
			"city": "Richmond Heights",
			"country": "United States",
			"IATA": "CGF",
			"ICAO": "KCGF",
			"lat": "41.5651016235",
			"lng": "-81.4863967896"
		},
		"Mansfield Lahm Regional Airport": {
			"id": "4254",
			"name": "Mansfield Lahm Regional Airport",
			"city": "Mansfield",
			"country": "United States",
			"IATA": "MFD",
			"ICAO": "KMFD",
			"lat": "40.82139968869999",
			"lng": "-82.5166015625"
		},
		"Columbus Metropolitan Airport": {
			"id": "4255",
			"name": "Columbus Metropolitan Airport",
			"city": "Columbus",
			"country": "United States",
			"IATA": "CSG",
			"ICAO": "KCSG",
			"lat": "32.516300201416016",
			"lng": "-84.93890380859375"
		},
		"Lawton Fort Sill Regional Airport": {
			"id": "4256",
			"name": "Lawton Fort Sill Regional Airport",
			"city": "Lawton",
			"country": "United States",
			"IATA": "LAW",
			"ICAO": "KLAW",
			"lat": "34.5676994324",
			"lng": "-98.4166030884"
		},
		"Fort Collins Loveland Municipal Airport": {
			"id": "4257",
			"name": "Fort Collins Loveland Municipal Airport",
			"city": "Fort Collins",
			"country": "United States",
			"IATA": "FNL",
			"ICAO": "KFNL",
			"lat": "40.4518013",
			"lng": "-105.011001587"
		},
		"Flagstaff Pulliam Airport": {
			"id": "4261",
			"name": "Flagstaff Pulliam Airport",
			"city": "Flagstaff",
			"country": "United States",
			"IATA": "FLG",
			"ICAO": "KFLG",
			"lat": "35.13850021",
			"lng": "-111.6709976"
		},
		"Lake Tahoe Airport": {
			"id": "4262",
			"name": "Lake Tahoe Airport",
			"city": "South Lake Tahoe",
			"country": "United States",
			"IATA": "TVL",
			"ICAO": "KTVL",
			"lat": "38.89390182495117",
			"lng": "-119.99500274658203"
		},
		"Joslin Field Magic Valley Regional Airport": {
			"id": "4263",
			"name": "Joslin Field Magic Valley Regional Airport",
			"city": "Twin Falls",
			"country": "United States",
			"IATA": "TWF",
			"ICAO": "KTWF",
			"lat": "42.48180008",
			"lng": "-114.487999"
		},
		"Martha's Vineyard Airport": {
			"id": "4265",
			"name": "Martha's Vineyard Airport",
			"city": "Vineyard Haven MA",
			"country": "United States",
			"IATA": "MVY",
			"ICAO": "KMVY",
			"lat": "41.3931007385",
			"lng": "-70.6143035889"
		},
		"Concord Municipal Airport": {
			"id": "4268",
			"name": "Concord Municipal Airport",
			"city": "Concord NH",
			"country": "United States",
			"IATA": "CON",
			"ICAO": "KCON",
			"lat": "43.20270157",
			"lng": "-71.50229645"
		},
		"Groton New London Airport": {
			"id": "4270",
			"name": "Groton New London Airport",
			"city": "Groton CT",
			"country": "United States",
			"IATA": "GON",
			"ICAO": "KGON",
			"lat": "41.330101013183594",
			"lng": "-72.04509735107422"
		},
		"St Cloud Regional Airport": {
			"id": "4271",
			"name": "St Cloud Regional Airport",
			"city": "Saint Cloud",
			"country": "United States",
			"IATA": "STC",
			"ICAO": "KSTC",
			"lat": "45.546600341796875",
			"lng": "-94.05989837646484"
		},
		"Golden Triangle Regional Airport": {
			"id": "4273",
			"name": "Golden Triangle Regional Airport",
			"city": "Columbus Mississippi",
			"country": "United States",
			"IATA": "GTR",
			"ICAO": "KGTR",
			"lat": "33.450298309299995",
			"lng": "-88.5914001465"
		},
		"Bowerman Airport": {
			"id": "4275",
			"name": "Bowerman Airport",
			"city": "Hoquiam",
			"country": "United States",
			"IATA": "HQM",
			"ICAO": "KHQM",
			"lat": "46.971199035599994",
			"lng": "-123.93699646"
		},
		"Erie International Tom Ridge Field": {
			"id": "4276",
			"name": "Erie International Tom Ridge Field",
			"city": "Erie",
			"country": "United States",
			"IATA": "ERI",
			"ICAO": "KERI",
			"lat": "42.0831270134",
			"lng": "-80.1738667488"
		},
		"Barnstable Municipal Boardman Polando Field": {
			"id": "4278",
			"name": "Barnstable Municipal Boardman Polando Field",
			"city": "Barnstable",
			"country": "United States",
			"IATA": "HYA",
			"ICAO": "KHYA",
			"lat": "41.66930008",
			"lng": "-70.28040314"
		},
		"Sedona Airport": {
			"id": "4280",
			"name": "Sedona Airport",
			"city": "Sedona",
			"country": "United States",
			"IATA": "SDX",
			"ICAO": "KSEZ",
			"lat": "34.848598480225",
			"lng": "-111.78800201416"
		},
		"Morgantown Municipal Walter L. Bill Hart Field": {
			"id": "4284",
			"name": "Morgantown Municipal Walter L. Bill Hart Field",
			"city": "Morgantown",
			"country": "United States",
			"IATA": "MGW",
			"ICAO": "KMGW",
			"lat": "39.64289856",
			"lng": "-79.91629791"
		},
		"Yeager Airport": {
			"id": "4285",
			"name": "Yeager Airport",
			"city": "Charleston",
			"country": "United States",
			"IATA": "CRW",
			"ICAO": "KCRW",
			"lat": "38.37310028076172",
			"lng": "-81.59320068359375"
		},
		"Wilkes Barre Scranton International Airport": {
			"id": "4286",
			"name": "Wilkes Barre Scranton International Airport",
			"city": "Scranton",
			"country": "United States",
			"IATA": "AVP",
			"ICAO": "KAVP",
			"lat": "41.338500976599995",
			"lng": "-75.72339630130001"
		},
		"Bemidji Regional Airport": {
			"id": "4287",
			"name": "Bemidji Regional Airport",
			"city": "Bemidji",
			"country": "United States",
			"IATA": "BJI",
			"ICAO": "KBJI",
			"lat": "47.50939941",
			"lng": "-94.93370056"
		},
		"Hector International Airport": {
			"id": "4292",
			"name": "Hector International Airport",
			"city": "Fargo",
			"country": "United States",
			"IATA": "FAR",
			"ICAO": "KFAR",
			"lat": "46.92070007324219",
			"lng": "-96.81580352783203"
		},
		"Charles B. Wheeler Downtown Airport": {
			"id": "4293",
			"name": "Charles B. Wheeler Downtown Airport",
			"city": "Kansas City",
			"country": "United States",
			"IATA": "MKC",
			"ICAO": "KMKC",
			"lat": "39.123199462890625",
			"lng": "-94.5927963256836"
		},
		"Gillette Campbell County Airport": {
			"id": "4296",
			"name": "Gillette Campbell County Airport",
			"city": "Gillette",
			"country": "United States",
			"IATA": "GCC",
			"ICAO": "KGCC",
			"lat": "44.348899841299996",
			"lng": "-105.539001465"
		},
		"University Park Airport": {
			"id": "4318",
			"name": "University Park Airport",
			"city": "State College Pennsylvania",
			"country": "United States",
			"IATA": "SCE",
			"ICAO": "KUNV",
			"lat": "40.8493003845",
			"lng": "-77.84870147710001"
		},
		"Key Field": {
			"id": "4335",
			"name": "Key Field",
			"city": "Meridian",
			"country": "United States",
			"IATA": "MEI",
			"ICAO": "KMEI",
			"lat": "32.33259963989258",
			"lng": "-88.75189971923828"
		},
		"Abraham Lincoln Capital Airport": {
			"id": "4336",
			"name": "Abraham Lincoln Capital Airport",
			"city": "Springfield",
			"country": "United States",
			"IATA": "SPI",
			"ICAO": "KSPI",
			"lat": "39.84410095",
			"lng": "-89.67790222"
		},
		"Cortez Municipal Airport": {
			"id": "4338",
			"name": "Cortez Municipal Airport",
			"city": "Cortez",
			"country": "United States",
			"IATA": "CEZ",
			"ICAO": "KCEZ",
			"lat": "37.3030014038",
			"lng": "-108.627998352"
		},
		"Yampa Valley Airport": {
			"id": "4339",
			"name": "Yampa Valley Airport",
			"city": "Hayden",
			"country": "United States",
			"IATA": "HDN",
			"ICAO": "KHDN",
			"lat": "40.48120117",
			"lng": "-107.2180023"
		},
		"Gallup Municipal Airport": {
			"id": "4340",
			"name": "Gallup Municipal Airport",
			"city": "Gallup",
			"country": "United States",
			"IATA": "GUP",
			"ICAO": "KGUP",
			"lat": "35.511100769",
			"lng": "-108.789001465"
		},
		"Liberal Mid-America Regional Airport": {
			"id": "4341",
			"name": "Liberal Mid-America Regional Airport",
			"city": "Liberal",
			"country": "United States",
			"IATA": "LBL",
			"ICAO": "KLBL",
			"lat": "37.0442009",
			"lng": "-100.9599991"
		},
		"Lamar Municipal Airport": {
			"id": "4342",
			"name": "Lamar Municipal Airport",
			"city": "Lamar",
			"country": "United States",
			"IATA": "LAA",
			"ICAO": "KLAA",
			"lat": "38.069698333699996",
			"lng": "-102.68800354"
		},
		"Renner Field-Goodland Municipal Airport": {
			"id": "4343",
			"name": "Renner Field-Goodland Municipal Airport",
			"city": "Goodland",
			"country": "United States",
			"IATA": "GLD",
			"ICAO": "KGLD",
			"lat": "39.37060165",
			"lng": "-101.6989975"
		},
		"Yellowstone Regional Airport": {
			"id": "4344",
			"name": "Yellowstone Regional Airport",
			"city": "Cody",
			"country": "United States",
			"IATA": "COD",
			"ICAO": "KCOD",
			"lat": "44.520198822",
			"lng": "-109.024002075"
		},
		"Springfield Branson National Airport": {
			"id": "4348",
			"name": "Springfield Branson National Airport",
			"city": "Springfield",
			"country": "United States",
			"IATA": "SGF",
			"ICAO": "KSGF",
			"lat": "37.24570084",
			"lng": "-93.38860321"
		},
		"Joplin Regional Airport": {
			"id": "4354",
			"name": "Joplin Regional Airport",
			"city": "Joplin",
			"country": "United States",
			"IATA": "JLN",
			"ICAO": "KJLN",
			"lat": "37.151798248291016",
			"lng": "-94.49829864501953"
		},
		"Lehigh Valley International Airport": {
			"id": "4355",
			"name": "Lehigh Valley International Airport",
			"city": "Allentown",
			"country": "United States",
			"IATA": "ABE",
			"ICAO": "KABE",
			"lat": "40.652099609375",
			"lng": "-75.44080352783203"
		},
		"Northwest Arkansas Regional Airport": {
			"id": "4356",
			"name": "Northwest Arkansas Regional Airport",
			"city": "Bentonville",
			"country": "United States",
			"IATA": "XNA",
			"ICAO": "KXNA",
			"lat": "36.281898",
			"lng": "-94.306801"
		},
		"South Bend Regional Airport": {
			"id": "4359",
			"name": "South Bend Regional Airport",
			"city": "South Bend",
			"country": "United States",
			"IATA": "SBN",
			"ICAO": "KSBN",
			"lat": "41.70869827270508",
			"lng": "-86.31729888916016"
		},
		"Smith Field": {
			"id": "4383",
			"name": "Smith Field",
			"city": "Fort Wayne IN",
			"country": "United States",
			"IATA": "SMD",
			"ICAO": "KSMD",
			"lat": "41.14339828",
			"lng": "-85.15280151"
		},
		"Arcata Airport": {
			"id": "4384",
			"name": "Arcata Airport",
			"city": "Arcata CA",
			"country": "United States",
			"IATA": "ACV",
			"ICAO": "KACV",
			"lat": "40.97809982299805",
			"lng": "-124.10900115966797"
		},
		"Albert J Ellis Airport": {
			"id": "4386",
			"name": "Albert J Ellis Airport",
			"city": "Jacksonville NC",
			"country": "United States",
			"IATA": "OAJ",
			"ICAO": "KOAJ",
			"lat": "34.8292007446",
			"lng": "-77.61209869380001"
		},
		"Tuscaloosa Regional Airport": {
			"id": "4387",
			"name": "Tuscaloosa Regional Airport",
			"city": "Tuscaloosa AL",
			"country": "United States",
			"IATA": "TCL",
			"ICAO": "KTCL",
			"lat": "33.220600128174",
			"lng": "-87.611396789551"
		},
		"Dubuque Regional Airport": {
			"id": "4388",
			"name": "Dubuque Regional Airport",
			"city": "Dubuque IA",
			"country": "United States",
			"IATA": "DBQ",
			"ICAO": "KDBQ",
			"lat": "42.40200043",
			"lng": "-90.70950317"
		},
		"Aberdeen Regional Airport": {
			"id": "5714",
			"name": "Aberdeen Regional Airport",
			"city": "Aberdeen",
			"country": "United States",
			"IATA": "ABR",
			"ICAO": "KABR",
			"lat": "45.449100494384766",
			"lng": "-98.42179870605469"
		},
		"Southwest Georgia Regional Airport": {
			"id": "5715",
			"name": "Southwest Georgia Regional Airport",
			"city": "Albany",
			"country": "United States",
			"IATA": "ABY",
			"ICAO": "KABY",
			"lat": "31.535499572753906",
			"lng": "-84.19450378417969"
		},
		"Athens Ben Epps Airport": {
			"id": "5716",
			"name": "Athens Ben Epps Airport",
			"city": "Athens",
			"country": "United States",
			"IATA": "AHN",
			"ICAO": "KAHN",
			"lat": "33.94860076904297",
			"lng": "-83.32630157470703"
		},
		"Alamogordo White Sands Regional Airport": {
			"id": "5717",
			"name": "Alamogordo White Sands Regional Airport",
			"city": "Alamogordo",
			"country": "United States",
			"IATA": "ALM",
			"ICAO": "KALM",
			"lat": "32.8399009705",
			"lng": "-105.990997314"
		},
		"Waterloo Regional Airport": {
			"id": "5718",
			"name": "Waterloo Regional Airport",
			"city": "Waterloo",
			"country": "United States",
			"IATA": "ALO",
			"ICAO": "KALO",
			"lat": "42.557098388671875",
			"lng": "-92.40029907226562"
		},
		"Walla Walla Regional Airport": {
			"id": "5719",
			"name": "Walla Walla Regional Airport",
			"city": "Walla Walla",
			"country": "United States",
			"IATA": "ALW",
			"ICAO": "KALW",
			"lat": "46.09489822",
			"lng": "-118.288002"
		},
		"Alpena County Regional Airport": {
			"id": "5720",
			"name": "Alpena County Regional Airport",
			"city": "Alpena",
			"country": "United States",
			"IATA": "APN",
			"ICAO": "KAPN",
			"lat": "45.0780983",
			"lng": "-83.56030273"
		},
		"Watertown Regional Airport": {
			"id": "5721",
			"name": "Watertown Regional Airport",
			"city": "Watertown",
			"country": "United States",
			"IATA": "ATY",
			"ICAO": "KATY",
			"lat": "44.91400146",
			"lng": "-97.15470123"
		},
		"Bradford Regional Airport": {
			"id": "5722",
			"name": "Bradford Regional Airport",
			"city": "Bradford",
			"country": "United States",
			"IATA": "BFD",
			"ICAO": "KBFD",
			"lat": "41.8031005859375",
			"lng": "-78.64009857177734"
		},
		"Western Neb. Rgnl/William B. Heilig Airport": {
			"id": "5723",
			"name": "Western Neb. Rgnl/William B. Heilig Airport",
			"city": "Scottsbluff",
			"country": "United States",
			"IATA": "BFF",
			"ICAO": "KBFF",
			"lat": "41.87400055",
			"lng": "-103.5960007"
		},
		"Raleigh County Memorial Airport": {
			"id": "5724",
			"name": "Raleigh County Memorial Airport",
			"city": "Beckley",
			"country": "United States",
			"IATA": "BKW",
			"ICAO": "KBKW",
			"lat": "37.787300109899995",
			"lng": "-81.1241989136"
		},
		"Brunswick Golden Isles Airport": {
			"id": "5725",
			"name": "Brunswick Golden Isles Airport",
			"city": "Brunswick",
			"country": "United States",
			"IATA": "BQK",
			"ICAO": "KBQK",
			"lat": "31.258800506591797",
			"lng": "-81.46649932861328"
		},
		"Southeast Iowa Regional Airport": {
			"id": "5726",
			"name": "Southeast Iowa Regional Airport",
			"city": "Burlington",
			"country": "United States",
			"IATA": "BRL",
			"ICAO": "KBRL",
			"lat": "40.783199310302734",
			"lng": "-91.12550354003906"
		},
		"Jack Mc Namara Field Airport": {
			"id": "5727",
			"name": "Jack Mc Namara Field Airport",
			"city": "Crescent City",
			"country": "United States",
			"IATA": "CEC",
			"ICAO": "KCEC",
			"lat": "41.78020096",
			"lng": "-124.2369995"
		},
		"Cape Girardeau Regional Airport": {
			"id": "5728",
			"name": "Cape Girardeau Regional Airport",
			"city": "Cape Girardeau",
			"country": "United States",
			"IATA": "CGI",
			"ICAO": "KCGI",
			"lat": "37.22529983520508",
			"lng": "-89.57080078125"
		},
		"Chippewa County International Airport": {
			"id": "5729",
			"name": "Chippewa County International Airport",
			"city": "Sault Ste Marie",
			"country": "United States",
			"IATA": "CIU",
			"ICAO": "KCIU",
			"lat": "46.25080108642578",
			"lng": "-84.47239685058594"
		},
		"North Central West Virginia Airport": {
			"id": "5730",
			"name": "North Central West Virginia Airport",
			"city": "Clarksburg",
			"country": "United States",
			"IATA": "CKB",
			"ICAO": "KCKB",
			"lat": "39.2966003418",
			"lng": "-80.2281036377"
		},
		"William R Fairchild International Airport": {
			"id": "5731",
			"name": "William R Fairchild International Airport",
			"city": "Port Angeles",
			"country": "United States",
			"IATA": "CLM",
			"ICAO": "KCLM",
			"lat": "48.120201110839844",
			"lng": "-123.5"
		},
		"Houghton County Memorial Airport": {
			"id": "5732",
			"name": "Houghton County Memorial Airport",
			"city": "Hancock",
			"country": "United States",
			"IATA": "CMX",
			"ICAO": "KCMX",
			"lat": "47.168399810791016",
			"lng": "-88.48909759521484"
		},
		"Dodge City Regional Airport": {
			"id": "5733",
			"name": "Dodge City Regional Airport",
			"city": "Dodge City",
			"country": "United States",
			"IATA": "DDC",
			"ICAO": "KDDC",
			"lat": "37.76340103149414",
			"lng": "-99.9655990600586"
		},
		"DuBois Regional Airport": {
			"id": "5734",
			"name": "DuBois Regional Airport",
			"city": "Du Bois",
			"country": "United States",
			"IATA": "DUJ",
			"ICAO": "KDUJ",
			"lat": "41.17829895",
			"lng": "-78.8986969"
		},
		"Chippewa Valley Regional Airport": {
			"id": "5735",
			"name": "Chippewa Valley Regional Airport",
			"city": "Eau Claire",
			"country": "United States",
			"IATA": "EAU",
			"ICAO": "KEAU",
			"lat": "44.86579895019531",
			"lng": "-91.48429870605469"
		},
		"Elko Regional Airport": {
			"id": "5736",
			"name": "Elko Regional Airport",
			"city": "Elko",
			"country": "United States",
			"IATA": "EKO",
			"ICAO": "KEKO",
			"lat": "40.82490158081055",
			"lng": "-115.79199981689453"
		},
		"New Bedford Regional Airport": {
			"id": "5737",
			"name": "New Bedford Regional Airport",
			"city": "New Bedford",
			"country": "United States",
			"IATA": "EWB",
			"ICAO": "KEWB",
			"lat": "41.67610168457031",
			"lng": "-70.95690155029297"
		},
		"Fayetteville Regional Grannis Field": {
			"id": "5738",
			"name": "Fayetteville Regional Grannis Field",
			"city": "Fayetteville",
			"country": "United States",
			"IATA": "FAY",
			"ICAO": "KFAY",
			"lat": "34.9911994934082",
			"lng": "-78.88030242919922"
		},
		"Wokal Field Glasgow International Airport": {
			"id": "5739",
			"name": "Wokal Field Glasgow International Airport",
			"city": "Glasgow",
			"country": "United States",
			"IATA": "GGW",
			"ICAO": "KGGW",
			"lat": "48.212501525878906",
			"lng": "-106.61499786376953"
		},
		"Central Nebraska Regional Airport": {
			"id": "5740",
			"name": "Central Nebraska Regional Airport",
			"city": "Grand Island",
			"country": "United States",
			"IATA": "GRI",
			"ICAO": "KGRI",
			"lat": "40.967498779296875",
			"lng": "-98.30960083007812"
		},
		"Memorial Field": {
			"id": "5741",
			"name": "Memorial Field",
			"city": "Hot Springs",
			"country": "United States",
			"IATA": "HOT",
			"ICAO": "KHOT",
			"lat": "34.47800064086914",
			"lng": "-93.09619903564453"
		},
		"Tri-State/Milton J. Ferguson Field": {
			"id": "5742",
			"name": "Tri-State/Milton J. Ferguson Field",
			"city": "Huntington",
			"country": "United States",
			"IATA": "HTS",
			"ICAO": "KHTS",
			"lat": "38.36669922",
			"lng": "-82.55799866"
		},
		"Kirksville Regional Airport": {
			"id": "5744",
			"name": "Kirksville Regional Airport",
			"city": "Kirksville",
			"country": "United States",
			"IATA": "IRK",
			"ICAO": "KIRK",
			"lat": "40.09349822998047",
			"lng": "-92.5448989868164"
		},
		"Jamestown Regional Airport": {
			"id": "5745",
			"name": "Jamestown Regional Airport",
			"city": "Jamestown",
			"country": "United States",
			"IATA": "JMS",
			"ICAO": "KJMS",
			"lat": "46.92969894",
			"lng": "-98.67819977"
		},
		"Laramie Regional Airport": {
			"id": "5746",
			"name": "Laramie Regional Airport",
			"city": "Laramie",
			"country": "United States",
			"IATA": "LAR",
			"ICAO": "KLAR",
			"lat": "41.31209945678711",
			"lng": "-105.67500305175781"
		},
		"Arnold Palmer Regional Airport": {
			"id": "5747",
			"name": "Arnold Palmer Regional Airport",
			"city": "Latrobe",
			"country": "United States",
			"IATA": "LBE",
			"ICAO": "KLBE",
			"lat": "40.27590179",
			"lng": "-79.40480042"
		},
		"North Platte Regional Airport Lee Bird Field": {
			"id": "5748",
			"name": "North Platte Regional Airport Lee Bird Field",
			"city": "North Platte",
			"country": "United States",
			"IATA": "LBF",
			"ICAO": "KLBF",
			"lat": "41.12620163",
			"lng": "-100.6839981"
		},
		"Lebanon Municipal Airport": {
			"id": "5749",
			"name": "Lebanon Municipal Airport",
			"city": "Lebanon",
			"country": "United States",
			"IATA": "LEB",
			"ICAO": "KLEB",
			"lat": "43.626098632799994",
			"lng": "-72.30419921880001"
		},
		"Klamath Falls Airport": {
			"id": "5750",
			"name": "Klamath Falls Airport",
			"city": "Klamath Falls",
			"country": "United States",
			"IATA": "LMT",
			"ICAO": "KLMT",
			"lat": "42.15610122680664",
			"lng": "-121.73300170898438"
		},
		"Lancaster Airport": {
			"id": "5751",
			"name": "Lancaster Airport",
			"city": "Lancaster",
			"country": "United States",
			"IATA": "LNS",
			"ICAO": "KLNS",
			"lat": "40.121700286865234",
			"lng": "-76.29609680175781"
		},
		"Lewistown Municipal Airport": {
			"id": "5752",
			"name": "Lewistown Municipal Airport",
			"city": "Lewistown",
			"country": "United States",
			"IATA": "LWT",
			"ICAO": "KLWT",
			"lat": "47.04930114746094",
			"lng": "-109.46700286865234"
		},
		"Lynchburg Regional Preston Glenn Field": {
			"id": "5753",
			"name": "Lynchburg Regional Preston Glenn Field",
			"city": "Lynchburg",
			"country": "United States",
			"IATA": "LYH",
			"ICAO": "KLYH",
			"lat": "37.326698303222656",
			"lng": "-79.20040130615234"
		},
		"Muskegon County Airport": {
			"id": "5754",
			"name": "Muskegon County Airport",
			"city": "Muskegon",
			"country": "United States",
			"IATA": "MKG",
			"ICAO": "KMKG",
			"lat": "43.16949844",
			"lng": "-86.23819733"
		},
		"Frank Wiley Field": {
			"id": "5755",
			"name": "Frank Wiley Field",
			"city": "Miles City",
			"country": "United States",
			"IATA": "MLS",
			"ICAO": "KMLS",
			"lat": "46.428001403808594",
			"lng": "-105.88600158691406"
		},
		"Northwest Alabama Regional Airport": {
			"id": "5756",
			"name": "Northwest Alabama Regional Airport",
			"city": "Muscle Shoals",
			"country": "United States",
			"IATA": "MSL",
			"ICAO": "KMSL",
			"lat": "34.74530029",
			"lng": "-87.61019897"
		},
		"Southwest Oregon Regional Airport": {
			"id": "5757",
			"name": "Southwest Oregon Regional Airport",
			"city": "North Bend",
			"country": "United States",
			"IATA": "OTH",
			"ICAO": "KOTH",
			"lat": "43.41709899902344",
			"lng": "-124.24600219726562"
		},
		"Owensboro Daviess County Airport": {
			"id": "5758",
			"name": "Owensboro Daviess County Airport",
			"city": "Owensboro",
			"country": "United States",
			"IATA": "OWB",
			"ICAO": "KOWB",
			"lat": "37.74010086",
			"lng": "-87.16680145"
		},
		"Hattiesburg Laurel Regional Airport": {
			"id": "5759",
			"name": "Hattiesburg Laurel Regional Airport",
			"city": "Hattiesburg/Laurel",
			"country": "United States",
			"IATA": "PIB",
			"ICAO": "KPIB",
			"lat": "31.467100143432617",
			"lng": "-89.33709716796875"
		},
		"Pocatello Regional Airport": {
			"id": "5760",
			"name": "Pocatello Regional Airport",
			"city": "Pocatello",
			"country": "United States",
			"IATA": "PIH",
			"ICAO": "KPIH",
			"lat": "42.9098014831543",
			"lng": "-112.59600067138672"
		},
		"Pierre Regional Airport": {
			"id": "5761",
			"name": "Pierre Regional Airport",
			"city": "Pierre",
			"country": "United States",
			"IATA": "PIR",
			"ICAO": "KPIR",
			"lat": "44.38270187",
			"lng": "-100.2860031"
		},
		"Pellston Regional Airport of Emmet County Airport": {
			"id": "5762",
			"name": "Pellston Regional Airport of Emmet County Airport",
			"city": "Pellston",
			"country": "United States",
			"IATA": "PLN",
			"ICAO": "KPLN",
			"lat": "45.57089996",
			"lng": "-84.79669952"
		},
		"Portsmouth International at Pease Airport": {
			"id": "5763",
			"name": "Portsmouth International at Pease Airport",
			"city": "Portsmouth",
			"country": "United States",
			"IATA": "PSM",
			"ICAO": "KPSM",
			"lat": "43.0778999329",
			"lng": "-70.8233032227"
		},
		"Reading Regional Carl A Spaatz Field": {
			"id": "5764",
			"name": "Reading Regional Carl A Spaatz Field",
			"city": "Reading",
			"country": "United States",
			"IATA": "RDG",
			"ICAO": "KRDG",
			"lat": "40.378501892089844",
			"lng": "-75.96520233154297"
		},
		"Rhinelander Oneida County Airport": {
			"id": "5765",
			"name": "Rhinelander Oneida County Airport",
			"city": "Rhinelander",
			"country": "United States",
			"IATA": "RHI",
			"ICAO": "KRHI",
			"lat": "45.63119888305664",
			"lng": "-89.46749877929688"
		},
		"Rock Springs Sweetwater County Airport": {
			"id": "5766",
			"name": "Rock Springs Sweetwater County Airport",
			"city": "Rock Springs",
			"country": "United States",
			"IATA": "RKS",
			"ICAO": "KRKS",
			"lat": "41.59420013",
			"lng": "-109.0650024"
		},
		"Rutland - Southern Vermont Regional Airport": {
			"id": "5767",
			"name": "Rutland - Southern Vermont Regional Airport",
			"city": "Rutland",
			"country": "United States",
			"IATA": "RUT",
			"ICAO": "KRUT",
			"lat": "43.52939987",
			"lng": "-72.94960022"
		},
		"San Luis County Regional Airport": {
			"id": "5768",
			"name": "San Luis County Regional Airport",
			"city": "San Luis Obispo",
			"country": "United States",
			"IATA": "SBP",
			"ICAO": "KSBP",
			"lat": "35.236801147499996",
			"lng": "-120.641998291"
		},
		"Sheridan County Airport": {
			"id": "5769",
			"name": "Sheridan County Airport",
			"city": "Sheridan",
			"country": "United States",
			"IATA": "SHR",
			"ICAO": "KSHR",
			"lat": "44.76919937133789",
			"lng": "-106.9800033569336"
		},
		"Adirondack Regional Airport": {
			"id": "5770",
			"name": "Adirondack Regional Airport",
			"city": "Saranac Lake",
			"country": "United States",
			"IATA": "SLK",
			"ICAO": "KSLK",
			"lat": "44.38529968261719",
			"lng": "-74.2061996459961"
		},
		"Salina Municipal Airport": {
			"id": "5771",
			"name": "Salina Municipal Airport",
			"city": "Salina",
			"country": "United States",
			"IATA": "SLN",
			"ICAO": "KSLN",
			"lat": "38.79100036621094",
			"lng": "-97.6521987915039"
		},
		"Santa Maria Pub/Capt G Allan Hancock Field": {
			"id": "5772",
			"name": "Santa Maria Pub/Capt G Allan Hancock Field",
			"city": "Santa Maria",
			"country": "United States",
			"IATA": "SMX",
			"ICAO": "KSMX",
			"lat": "34.89889908",
			"lng": "-120.4570007"
		},
		"Tupelo Regional Airport": {
			"id": "5773",
			"name": "Tupelo Regional Airport",
			"city": "Tupelo",
			"country": "United States",
			"IATA": "TUP",
			"ICAO": "KTUP",
			"lat": "34.26810073852539",
			"lng": "-88.7698974609375"
		},
		"Quincy Regional Baldwin Field": {
			"id": "5774",
			"name": "Quincy Regional Baldwin Field",
			"city": "Quincy",
			"country": "United States",
			"IATA": "UIN",
			"ICAO": "KUIN",
			"lat": "39.94269943",
			"lng": "-91.19460297"
		},
		"Victoria Regional Airport": {
			"id": "5775",
			"name": "Victoria Regional Airport",
			"city": "Victoria",
			"country": "United States",
			"IATA": "VCT",
			"ICAO": "KVCT",
			"lat": "28.85260009765625",
			"lng": "-96.91850280761719"
		},
		"Valdosta Regional Airport": {
			"id": "5776",
			"name": "Valdosta Regional Airport",
			"city": "Valdosta",
			"country": "United States",
			"IATA": "VLD",
			"ICAO": "KVLD",
			"lat": "30.782499313354492",
			"lng": "-83.27670288085938"
		},
		"Worland Municipal Airport": {
			"id": "5777",
			"name": "Worland Municipal Airport",
			"city": "Worland",
			"country": "United States",
			"IATA": "WRL",
			"ICAO": "KWRL",
			"lat": "43.9656982421875",
			"lng": "-107.95099639892578"
		},
		"Yakima Air Terminal McAllister Field": {
			"id": "5779",
			"name": "Yakima Air Terminal McAllister Field",
			"city": "Yakima",
			"country": "United States",
			"IATA": "YKM",
			"ICAO": "KYKM",
			"lat": "46.56819916",
			"lng": "-120.5439987"
		},
		"Adak Airport": {
			"id": "5959",
			"name": "Adak Airport",
			"city": "Adak Island",
			"country": "United States",
			"IATA": "ADK",
			"ICAO": "PADK",
			"lat": "51.87799835205078",
			"lng": "-176.64599609375"
		},
		"Gustavus Airport": {
			"id": "5960",
			"name": "Gustavus Airport",
			"city": "Gustavus",
			"country": "United States",
			"IATA": "GST",
			"ICAO": "PAGS",
			"lat": "58.4253006",
			"lng": "-135.7070007"
		},
		"Skagway Airport": {
			"id": "5961",
			"name": "Skagway Airport",
			"city": "Skagway",
			"country": "United States",
			"IATA": "SGY",
			"ICAO": "PAGY",
			"lat": "59.46009826660156",
			"lng": "-135.3159942626953"
		},
		"Holy Cross Airport": {
			"id": "5962",
			"name": "Holy Cross Airport",
			"city": "Holy Cross",
			"country": "United States",
			"IATA": "HCR",
			"ICAO": "PAHC",
			"lat": "62.18830108642578",
			"lng": "-159.77499389648438"
		},
		"Haines Airport": {
			"id": "5963",
			"name": "Haines Airport",
			"city": "Haines",
			"country": "United States",
			"IATA": "HNS",
			"ICAO": "PAHN",
			"lat": "59.24380111694336",
			"lng": "-135.5240020751953"
		},
		"Kalskag Airport": {
			"id": "5964",
			"name": "Kalskag Airport",
			"city": "Kalskag",
			"country": "United States",
			"IATA": "KLG",
			"ICAO": "PALG",
			"lat": "61.53630065917969",
			"lng": "-160.34100341796875"
		},
		"McGrath Airport": {
			"id": "5965",
			"name": "McGrath Airport",
			"city": "Mcgrath",
			"country": "United States",
			"IATA": "MCG",
			"ICAO": "PAMC",
			"lat": "62.95289993",
			"lng": "-155.6060028"
		},
		"Mountain Village Airport": {
			"id": "5966",
			"name": "Mountain Village Airport",
			"city": "Mountain Village",
			"country": "United States",
			"IATA": "MOU",
			"ICAO": "PAMO",
			"lat": "62.095401763916016",
			"lng": "-163.6820068359375"
		},
		"Aniak Airport": {
			"id": "5967",
			"name": "Aniak Airport",
			"city": "Aniak",
			"country": "United States",
			"IATA": "ANI",
			"ICAO": "PANI",
			"lat": "61.581600189208984",
			"lng": "-159.54299926757812"
		},
		"Chevak Airport": {
			"id": "5968",
			"name": "Chevak Airport",
			"city": "Chevak",
			"country": "United States",
			"IATA": "VAK",
			"ICAO": "PAVA",
			"lat": "61.5409",
			"lng": "-165.6005"
		},
		"Wrangell Airport": {
			"id": "5969",
			"name": "Wrangell Airport",
			"city": "Wrangell",
			"country": "United States",
			"IATA": "WRG",
			"ICAO": "PAWG",
			"lat": "56.48429871",
			"lng": "-132.3699951"
		},
		"Kalaupapa Airport": {
			"id": "5989",
			"name": "Kalaupapa Airport",
			"city": "Molokai",
			"country": "United States",
			"IATA": "LUP",
			"ICAO": "PHLU",
			"lat": "21.21100044",
			"lng": "-156.973999"
		},
		"Aleknagik / New Airport": {
			"id": "6126",
			"name": "Aleknagik / New Airport",
			"city": "Aleknagik",
			"country": "United States",
			"IATA": "WKK",
			"ICAO": "5A8",
			"lat": "59.2826004028",
			"lng": "-158.617996216"
		},
		"Mercer County Airport": {
			"id": "6128",
			"name": "Mercer County Airport",
			"city": "Bluefield",
			"country": "United States",
			"IATA": "BLF",
			"ICAO": "KBLF",
			"lat": "37.295799255371094",
			"lng": "-81.20770263671875"
		},
		"Mid Delta Regional Airport": {
			"id": "6130",
			"name": "Mid Delta Regional Airport",
			"city": "Greenville",
			"country": "United States",
			"IATA": "GLH",
			"ICAO": "KGLH",
			"lat": "33.4828987121582",
			"lng": "-90.98560333251953"
		},
		"Tri Cities Airport": {
			"id": "9419",
			"name": "Tri Cities Airport",
			"city": "Endicott",
			"country": "United States",
			"IATA": "CZG",
			"ICAO": "KCZG",
			"lat": "42.078499",
			"lng": "-76.096296"
		},
		"Akutan Seaplane Base": {
			"id": "6134",
			"name": "Akutan Seaplane Base",
			"city": "Akutan",
			"country": "United States",
			"IATA": "KQA",
			"ICAO": "KQA",
			"lat": "54.1337704415",
			"lng": "-165.778895617"
		},
		"Lopez Island Airport": {
			"id": "6136",
			"name": "Lopez Island Airport",
			"city": "Lopez",
			"country": "United States",
			"IATA": "LPS",
			"ICAO": "S31",
			"lat": "48.4838981628418",
			"lng": "-122.93800354003906"
		},
		"Waikoloa Heliport": {
			"id": "6415",
			"name": "Waikoloa Heliport",
			"city": "Waikoloa Village",
			"country": "United States",
			"IATA": "WKL",
			"ICAO": "HI07",
			"lat": "19.9205",
			"lng": "-155.8607"
		},
		"Worcester Regional Airport": {
			"id": "6426",
			"name": "Worcester Regional Airport",
			"city": "Worcester",
			"country": "United States",
			"IATA": "ORH",
			"ICAO": "KORH",
			"lat": "42.26729965209961",
			"lng": "-71.87570190429688"
		},
		"Bremerton National Airport": {
			"id": "6445",
			"name": "Bremerton National Airport",
			"city": "Bremerton",
			"country": "United States",
			"IATA": "PWT",
			"ICAO": "KPWT",
			"lat": "47.490200042725",
			"lng": "-122.76499938965"
		},
		"Spencer Municipal Airport": {
			"id": "6446",
			"name": "Spencer Municipal Airport",
			"city": "Spencer",
			"country": "United States",
			"IATA": "SPW",
			"ICAO": "KSPW",
			"lat": "43.165500640869",
			"lng": "-95.202796936035"
		},
		"Jefferson City Memorial Airport": {
			"id": "6447",
			"name": "Jefferson City Memorial Airport",
			"city": "Jefferson City",
			"country": "United States",
			"IATA": "JEF",
			"ICAO": "KJEF",
			"lat": "38.5912017822",
			"lng": "-92.15609741210001"
		},
		"Provincetown Municipal Airport": {
			"id": "6456",
			"name": "Provincetown Municipal Airport",
			"city": "Provincetown",
			"country": "United States",
			"IATA": "PVC",
			"ICAO": "KPVC",
			"lat": "42.0718994141",
			"lng": "-70.2213973999"
		},
		"Fullerton Municipal Airport": {
			"id": "6481",
			"name": "Fullerton Municipal Airport",
			"city": "Fullerton",
			"country": "United States",
			"IATA": "FUL",
			"ICAO": "KFUL",
			"lat": "33.8720016479",
			"lng": "-117.980003357"
		},
		"Concord Regional Airport": {
			"id": "6482",
			"name": "Concord Regional Airport",
			"city": "Concord",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KJQF",
			"lat": "35.387798",
			"lng": "-80.709099"
		},
		"Friedman Memorial Airport": {
			"id": "6494",
			"name": "Friedman Memorial Airport",
			"city": "Hailey",
			"country": "United States",
			"IATA": "SUN",
			"ICAO": "KSUN",
			"lat": "43.50439835",
			"lng": "-114.2959976"
		},
		"Mason City Municipal Airport": {
			"id": "6500",
			"name": "Mason City Municipal Airport",
			"city": "Mason City",
			"country": "United States",
			"IATA": "MCW",
			"ICAO": "KMCW",
			"lat": "43.157798767100005",
			"lng": "-93.3312988281"
		},
		"Phoenix-Mesa-Gateway Airport": {
			"id": "6505",
			"name": "Phoenix-Mesa-Gateway Airport",
			"city": "Mesa",
			"country": "United States",
			"IATA": "AZA",
			"ICAO": "KIWA",
			"lat": "33.30780029",
			"lng": "-111.6549988"
		},
		"Anaktuvuk Pass Airport": {
			"id": "6712",
			"name": "Anaktuvuk Pass Airport",
			"city": "Anaktuvuk Pass",
			"country": "United States",
			"IATA": "AKP",
			"ICAO": "PAKP",
			"lat": "68.13359833",
			"lng": "-151.7429962"
		},
		"Anvik Airport": {
			"id": "6713",
			"name": "Anvik Airport",
			"city": "Anvik",
			"country": "United States",
			"IATA": "ANV",
			"ICAO": "PANV",
			"lat": "62.646702",
			"lng": "-160.190994"
		},
		"Atqasuk Edward Burnell Sr Memorial Airport": {
			"id": "6714",
			"name": "Atqasuk Edward Burnell Sr Memorial Airport",
			"city": "Atqasuk",
			"country": "United States",
			"IATA": "ATK",
			"ICAO": "PATQ",
			"lat": "70.46730041503906",
			"lng": "-157.43600463867188"
		},
		"Gambell Airport": {
			"id": "6715",
			"name": "Gambell Airport",
			"city": "Gambell",
			"country": "United States",
			"IATA": "GAM",
			"ICAO": "PAGM",
			"lat": "63.76679992675781",
			"lng": "-171.73300170898438"
		},
		"Hooper Bay Airport": {
			"id": "6716",
			"name": "Hooper Bay Airport",
			"city": "Hooper Bay",
			"country": "United States",
			"IATA": "HPB",
			"ICAO": "PAHP",
			"lat": "61.52389908",
			"lng": "-166.1470032"
		},
		"Kaltag Airport": {
			"id": "6717",
			"name": "Kaltag Airport",
			"city": "Kaltag",
			"country": "United States",
			"IATA": "KAL",
			"ICAO": "PAKV",
			"lat": "64.31909943",
			"lng": "-158.7409973"
		},
		"St Mary's Airport": {
			"id": "6718",
			"name": "St Mary's Airport",
			"city": "St Mary's",
			"country": "United States",
			"IATA": "KSM",
			"ICAO": "PASM",
			"lat": "62.0605011",
			"lng": "-163.302002"
		},
		"Kivalina Airport": {
			"id": "6719",
			"name": "Kivalina Airport",
			"city": "Kivalina",
			"country": "United States",
			"IATA": "KVL",
			"ICAO": "PAVL",
			"lat": "67.73619842529297",
			"lng": "-164.56300354003906"
		},
		"Mekoryuk Airport": {
			"id": "6720",
			"name": "Mekoryuk Airport",
			"city": "Mekoryuk",
			"country": "United States",
			"IATA": "MYU",
			"ICAO": "PAMY",
			"lat": "60.37139892578125",
			"lng": "-166.27099609375"
		},
		"Ruby Airport": {
			"id": "6722",
			"name": "Ruby Airport",
			"city": "Ruby",
			"country": "United States",
			"IATA": "RBY",
			"ICAO": "PARY",
			"lat": "64.72720337",
			"lng": "-155.4700012"
		},
		"Shishmaref Airport": {
			"id": "6723",
			"name": "Shishmaref Airport",
			"city": "Shishmaref",
			"country": "United States",
			"IATA": "SHH",
			"ICAO": "PASH",
			"lat": "66.249604",
			"lng": "-166.089112"
		},
		"Savoonga Airport": {
			"id": "6724",
			"name": "Savoonga Airport",
			"city": "Savoonga",
			"country": "United States",
			"IATA": "SVA",
			"ICAO": "PASA",
			"lat": "63.6864013671875",
			"lng": "-170.4929962158203"
		},
		"Noatak Airport": {
			"id": "6725",
			"name": "Noatak Airport",
			"city": "Noatak",
			"country": "United States",
			"IATA": "WTK",
			"ICAO": "PAWN",
			"lat": "67.56610107421875",
			"lng": "-162.97500610351562"
		},
		"Arctic Village Airport": {
			"id": "6729",
			"name": "Arctic Village Airport",
			"city": "Arctic Village",
			"country": "United States",
			"IATA": "ARC",
			"ICAO": "PARC",
			"lat": "68.1147",
			"lng": "-145.578995"
		},
		"Hagerstown Regional Richard A Henson Field": {
			"id": "6739",
			"name": "Hagerstown Regional Richard A Henson Field",
			"city": "Hagerstown",
			"country": "United States",
			"IATA": "HGR",
			"ICAO": "KHGR",
			"lat": "39.707901",
			"lng": "-77.72949982"
		},
		"Sand Point Airport": {
			"id": "6742",
			"name": "Sand Point Airport",
			"city": "Sand Point",
			"country": "United States",
			"IATA": "SDP",
			"ICAO": "PASD",
			"lat": "55.314998626708984",
			"lng": "-160.5229949951172"
		},
		"Deering Airport": {
			"id": "6755",
			"name": "Deering Airport",
			"city": "Deering",
			"country": "United States",
			"IATA": "DRG",
			"ICAO": "PADE",
			"lat": "66.0696029663",
			"lng": "-162.76600647"
		},
		"Igiugig Airport": {
			"id": "6763",
			"name": "Igiugig Airport",
			"city": "Igiugig",
			"country": "United States",
			"IATA": "IGG",
			"ICAO": "PAIG",
			"lat": "59.32400131225586",
			"lng": "-155.90199279785156"
		},
		"New Stuyahok Airport": {
			"id": "6764",
			"name": "New Stuyahok Airport",
			"city": "New Stuyahok",
			"country": "United States",
			"IATA": "KNW",
			"ICAO": "PANW",
			"lat": "59.4499015808",
			"lng": "-157.32800293"
		},
		"King Cove Airport": {
			"id": "6765",
			"name": "King Cove Airport",
			"city": "King Cove",
			"country": "United States",
			"IATA": "KVC",
			"ICAO": "PAVC",
			"lat": "55.11629867553711",
			"lng": "-162.26600646972656"
		},
		"Port Heiden Airport": {
			"id": "6766",
			"name": "Port Heiden Airport",
			"city": "Port Heiden",
			"country": "United States",
			"IATA": "PTH",
			"ICAO": "PAPH",
			"lat": "56.95909881591797",
			"lng": "-158.63299560546875"
		},
		"Togiak Airport": {
			"id": "6767",
			"name": "Togiak Airport",
			"city": "Togiak Village",
			"country": "United States",
			"IATA": "TOG",
			"ICAO": "PATG",
			"lat": "59.052799224853516",
			"lng": "-160.39700317382812"
		},
		"Delta County Airport": {
			"id": "6800",
			"name": "Delta County Airport",
			"city": "Escanaba",
			"country": "United States",
			"IATA": "ESC",
			"ICAO": "KESC",
			"lat": "45.7226982117",
			"lng": "-87.0936965942"
		},
		"Yakutat Airport": {
			"id": "6803",
			"name": "Yakutat Airport",
			"city": "Yakutat",
			"country": "United States",
			"IATA": "YAK",
			"ICAO": "PAYA",
			"lat": "59.5032997131",
			"lng": "-139.660003662"
		},
		"Williamson County Regional Airport": {
			"id": "6825",
			"name": "Williamson County Regional Airport",
			"city": "Marion",
			"country": "United States",
			"IATA": "MWA",
			"ICAO": "KMWA",
			"lat": "37.75500107",
			"lng": "-89.01110077"
		},
		"Ford Airport": {
			"id": "6837",
			"name": "Ford Airport",
			"city": "Iron Mountain",
			"country": "United States",
			"IATA": "IMT",
			"ICAO": "KIMT",
			"lat": "45.8184013367",
			"lng": "-88.1145019531"
		},
		"Marquette Airport": {
			"id": "6838",
			"name": "Marquette Airport",
			"city": "Marquette",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KMQT",
			"lat": "46.53390121459961",
			"lng": "-87.5614013671875"
		},
		"Allakaket Airport": {
			"id": "6839",
			"name": "Allakaket Airport",
			"city": "Allakaket",
			"country": "United States",
			"IATA": "AET",
			"ICAO": "PFAL",
			"lat": "66.5518035889",
			"lng": "-152.621994019"
		},
		"Michigan City Municipal Airport": {
			"id": "6844",
			"name": "Michigan City Municipal Airport",
			"city": "Michigan City",
			"country": "United States",
			"IATA": "MGC",
			"ICAO": "KMGC",
			"lat": "41.703300476100004",
			"lng": "-86.8211975098"
		},
		"Seward Airport": {
			"id": "6845",
			"name": "Seward Airport",
			"city": "Seward",
			"country": "United States",
			"IATA": "SWD",
			"ICAO": "PAWD",
			"lat": "60.12689971923828",
			"lng": "-149.41900634765625"
		},
		"Grand Marais Cook County Airport": {
			"id": "6849",
			"name": "Grand Marais Cook County Airport",
			"city": "Grand Marais",
			"country": "United States",
			"IATA": "GRM",
			"ICAO": "KCKC",
			"lat": "47.8382987976",
			"lng": "-90.38289642330001"
		},
		"Wausau Downtown Airport": {
			"id": "6853",
			"name": "Wausau Downtown Airport",
			"city": "Wausau",
			"country": "United States",
			"IATA": "AUW",
			"ICAO": "KAUW",
			"lat": "44.9262008667",
			"lng": "-89.6266021729"
		},
		"Delaware County Johnson Field": {
			"id": "6871",
			"name": "Delaware County Johnson Field",
			"city": "Muncie",
			"country": "United States",
			"IATA": "MIE",
			"ICAO": "KMIE",
			"lat": "40.2422981262207",
			"lng": "-85.3958969116211"
		},
		"Purdue University Airport": {
			"id": "6873",
			"name": "Purdue University Airport",
			"city": "Lafayette",
			"country": "United States",
			"IATA": "LAF",
			"ICAO": "KLAF",
			"lat": "40.41230010986328",
			"lng": "-86.93689727783203"
		},
		"Brown County Airport": {
			"id": "6876",
			"name": "Brown County Airport",
			"city": "Georgetown",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KGEO",
			"lat": "38.881900787353516",
			"lng": "-83.88269805908203"
		},
		"North Las Vegas Airport": {
			"id": "6877",
			"name": "North Las Vegas Airport",
			"city": "Las Vegas",
			"country": "United States",
			"IATA": "VGT",
			"ICAO": "KVGT",
			"lat": "36.21070098877",
			"lng": "-115.19400024414"
		},
		"Kenosha Regional Airport": {
			"id": "6878",
			"name": "Kenosha Regional Airport",
			"city": "Kenosha",
			"country": "United States",
			"IATA": "ENW",
			"ICAO": "KENW",
			"lat": "42.59569931",
			"lng": "-87.92780304"
		},
		"Montrose Regional Airport": {
			"id": "6880",
			"name": "Montrose Regional Airport",
			"city": "Montrose CO",
			"country": "United States",
			"IATA": "MTJ",
			"ICAO": "KMTJ",
			"lat": "38.509799957300004",
			"lng": "-107.893997192"
		},
		"Riverton Regional Airport": {
			"id": "6881",
			"name": "Riverton Regional Airport",
			"city": "Riverton WY",
			"country": "United States",
			"IATA": "RIW",
			"ICAO": "KRIW",
			"lat": "43.064201355",
			"lng": "-108.459999084"
		},
		"Eastern Oregon Regional At Pendleton Airport": {
			"id": "6883",
			"name": "Eastern Oregon Regional At Pendleton Airport",
			"city": "Pendleton",
			"country": "United States",
			"IATA": "PDT",
			"ICAO": "KPDT",
			"lat": "45.695098877",
			"lng": "-118.841003418"
		},
		"Wittman Regional Airport": {
			"id": "6909",
			"name": "Wittman Regional Airport",
			"city": "Oshkosh",
			"country": "United States",
			"IATA": "OSH",
			"ICAO": "KOSH",
			"lat": "43.98440170288086",
			"lng": "-88.55699920654297"
		},
		"Pangborn Memorial Airport": {
			"id": "6916",
			"name": "Pangborn Memorial Airport",
			"city": "Wenatchee",
			"country": "United States",
			"IATA": "EAT",
			"ICAO": "KEAT",
			"lat": "47.3988990784",
			"lng": "-120.207000732"
		},
		"NAS Fort Worth JRB/Carswell Field": {
			"id": "6948",
			"name": "NAS Fort Worth JRB/Carswell Field",
			"city": "Dallas",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KNFW",
			"lat": "32.76919937",
			"lng": "-97.4414978"
		},
		"Gary Chicago International Airport": {
			"id": "6956",
			"name": "Gary Chicago International Airport",
			"city": "Gary",
			"country": "United States",
			"IATA": "GYY",
			"ICAO": "KGYY",
			"lat": "41.61629867553711",
			"lng": "-87.41280364990234"
		},
		"Brainerd Lakes Regional Airport": {
			"id": "6957",
			"name": "Brainerd Lakes Regional Airport",
			"city": "Brainerd",
			"country": "United States",
			"IATA": "BRD",
			"ICAO": "KBRD",
			"lat": "46.39830017",
			"lng": "-94.13809967"
		},
		"Greenbrier Valley Airport": {
			"id": "6958",
			"name": "Greenbrier Valley Airport",
			"city": "Lewisburg",
			"country": "United States",
			"IATA": "LWB",
			"ICAO": "KLWB",
			"lat": "37.8582992554",
			"lng": "-80.3994979858"
		},
		"Pitt Greenville Airport": {
			"id": "6959",
			"name": "Pitt Greenville Airport",
			"city": "Greenville",
			"country": "United States",
			"IATA": "PGV",
			"ICAO": "KPGV",
			"lat": "35.6352005",
			"lng": "-77.38529968"
		},
		"Chefornak Airport": {
			"id": "6960",
			"name": "Chefornak Airport",
			"city": "Chefornak",
			"country": "United States",
			"IATA": "CYF",
			"ICAO": "PACK",
			"lat": "60.1492004395",
			"lng": "-164.285995483"
		},
		"Oxnard Airport": {
			"id": "6961",
			"name": "Oxnard Airport",
			"city": "Oxnard",
			"country": "United States",
			"IATA": "OXR",
			"ICAO": "KOXR",
			"lat": "34.200801849365",
			"lng": "-119.20700073242"
		},
		"Schenectady County Airport": {
			"id": "6968",
			"name": "Schenectady County Airport",
			"city": "Scotia NY",
			"country": "United States",
			"IATA": "SCH",
			"ICAO": "KSCH",
			"lat": "42.852500915527",
			"lng": "-73.928901672363"
		},
		"Northeast Florida Regional Airport": {
			"id": "6989",
			"name": "Northeast Florida Regional Airport",
			"city": "St. Augustine Airport",
			"country": "United States",
			"IATA": "UST",
			"ICAO": "KSGJ",
			"lat": "29.959199905396",
			"lng": "-81.339797973633"
		},
		"Charles M. Schulz Sonoma County Airport": {
			"id": "6992",
			"name": "Charles M. Schulz Sonoma County Airport",
			"city": "Santa Rosa",
			"country": "United States",
			"IATA": "STS",
			"ICAO": "KSTS",
			"lat": "38.50899887",
			"lng": "-122.8130035"
		},
		"Kissimmee Gateway Airport": {
			"id": "6993",
			"name": "Kissimmee Gateway Airport",
			"city": "Kissimmee",
			"country": "United States",
			"IATA": "ISM",
			"ICAO": "KISM",
			"lat": "28.2898006439",
			"lng": "-81.4371032715"
		},
		"Lake City Gateway Airport": {
			"id": "6994",
			"name": "Lake City Gateway Airport",
			"city": "Lake City",
			"country": "United States",
			"IATA": "LCQ",
			"ICAO": "KLCQ",
			"lat": "30.1819992065",
			"lng": "-82.57689666750001"
		},
		"Deland Municipal Sidney H Taylor Field": {
			"id": "6995",
			"name": "Deland Municipal Sidney H Taylor Field",
			"city": "DeLand",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KDED",
			"lat": "29.06699944",
			"lng": "-81.28379822"
		},
		"Haller Airpark": {
			"id": "6996",
			"name": "Haller Airpark",
			"city": "Green Cove Springs",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "7FL4",
			"lat": "29.904057",
			"lng": "-81.68515"
		},
		"Logan-Cache Airport": {
			"id": "6998",
			"name": "Logan-Cache Airport",
			"city": "Logan",
			"country": "United States",
			"IATA": "LGU",
			"ICAO": "KLGU",
			"lat": "41.7911987305",
			"lng": "-111.851997375"
		},
		"Brigham City Airport": {
			"id": "6999",
			"name": "Brigham City Airport",
			"city": "Brigham City",
			"country": "United States",
			"IATA": "BMC",
			"ICAO": "KBMC",
			"lat": "41.5523986816",
			"lng": "-112.06199646"
		},
		"Malad City Airport": {
			"id": "7000",
			"name": "Malad City Airport",
			"city": "Malad City",
			"country": "United States",
			"IATA": "MLD",
			"ICAO": "KMLD",
			"lat": "42.16659927368164",
			"lng": "-112.2969970703125"
		},
		"Aspen-Pitkin Co/Sardy Field": {
			"id": "7001",
			"name": "Aspen-Pitkin Co/Sardy Field",
			"city": "Aspen",
			"country": "United States",
			"IATA": "ASE",
			"ICAO": "KASE",
			"lat": "39.22320175",
			"lng": "-106.8690033"
		},
		"Kerrville Municipal Louis Schreiner Field": {
			"id": "7009",
			"name": "Kerrville Municipal Louis Schreiner Field",
			"city": "Kerrville",
			"country": "United States",
			"IATA": "ERV",
			"ICAO": "KERV",
			"lat": "29.9766998291",
			"lng": "-99.08570098879999"
		},
		"Sussex County Airport": {
			"id": "7011",
			"name": "Sussex County Airport",
			"city": "Georgetown",
			"country": "United States",
			"IATA": "GED",
			"ICAO": "KGED",
			"lat": "38.68920135",
			"lng": "-75.35890198"
		},
		"Great Bend Municipal Airport": {
			"id": "7013",
			"name": "Great Bend Municipal Airport",
			"city": "Great Bend",
			"country": "United States",
			"IATA": "GBN",
			"ICAO": "KGBD",
			"lat": "38.3442993164",
			"lng": "-98.8591995239"
		},
		"Hays Regional Airport": {
			"id": "7014",
			"name": "Hays Regional Airport",
			"city": "Hays",
			"country": "United States",
			"IATA": "HYS",
			"ICAO": "KHYS",
			"lat": "38.84220123",
			"lng": "-99.27320099"
		},
		"Spirit of St Louis Airport": {
			"id": "7015",
			"name": "Spirit of St Louis Airport",
			"city": "Null",
			"country": "United States",
			"IATA": "SUS",
			"ICAO": "KSUS",
			"lat": "38.662101745605",
			"lng": "-90.652000427246"
		},
		"Ely Municipal Airport": {
			"id": "7016",
			"name": "Ely Municipal Airport",
			"city": "Ely",
			"country": "United States",
			"IATA": "LYU",
			"ICAO": "KELO",
			"lat": "47.82450104",
			"lng": "-91.83070374"
		},
		"Grand Rapids Itasca Co-Gordon Newstrom field": {
			"id": "7017",
			"name": "Grand Rapids Itasca Co-Gordon Newstrom field",
			"city": "Grand Rapids MN",
			"country": "United States",
			"IATA": "GPZ",
			"ICAO": "KGPZ",
			"lat": "47.21110153",
			"lng": "-93.50980377"
		},
		"Thief River Falls Regional Airport": {
			"id": "7018",
			"name": "Thief River Falls Regional Airport",
			"city": "Thief River Falls",
			"country": "United States",
			"IATA": "TVF",
			"ICAO": "KTVF",
			"lat": "48.06570053",
			"lng": "-96.18499756"
		},
		"Eagle River Union Airport": {
			"id": "7019",
			"name": "Eagle River Union Airport",
			"city": "Eagle River",
			"country": "United States",
			"IATA": "EGV",
			"ICAO": "KEGV",
			"lat": "45.932300567599995",
			"lng": "-89.26830291750001"
		},
		"Lakeland-Noble F. Lee Memorial field": {
			"id": "7020",
			"name": "Lakeland-Noble F. Lee Memorial field",
			"city": "Minocqua - Woodruff",
			"country": "United States",
			"IATA": "ARV",
			"ICAO": "KARV",
			"lat": "45.92789841",
			"lng": "-89.73090363"
		},
		"Ankeny Regional Airport": {
			"id": "7021",
			"name": "Ankeny Regional Airport",
			"city": "Ankeny",
			"country": "United States",
			"IATA": "IKV",
			"ICAO": "KIKV",
			"lat": "41.69139862060547",
			"lng": "-93.56639862060547"
		},
		"Corpus Christi Naval Air Station/Truax Field": {
			"id": "7023",
			"name": "Corpus Christi Naval Air Station/Truax Field",
			"city": "Corpus Christi",
			"country": "United States",
			"IATA": "NGP",
			"ICAO": "KNGP",
			"lat": "27.69260025",
			"lng": "-97.29109955"
		},
		"Catalina Airport": {
			"id": "7025",
			"name": "Catalina Airport",
			"city": "Catalina Island",
			"country": "United States",
			"IATA": "AVX",
			"ICAO": "KAVX",
			"lat": "33.4049",
			"lng": "-118.416"
		},
		"Mojave Airport": {
			"id": "7026",
			"name": "Mojave Airport",
			"city": "Mojave",
			"country": "United States",
			"IATA": "MHV",
			"ICAO": "KMHV",
			"lat": "35.05939865",
			"lng": "-118.1520004"
		},
		"Hutchinson Municipal Airport": {
			"id": "7035",
			"name": "Hutchinson Municipal Airport",
			"city": "Hutchinson",
			"country": "United States",
			"IATA": "HUT",
			"ICAO": "KHUT",
			"lat": "38.0654983521",
			"lng": "-97.86060333250002"
		},
		"Rosecrans Memorial Airport": {
			"id": "7042",
			"name": "Rosecrans Memorial Airport",
			"city": "Rosecrans",
			"country": "United States",
			"IATA": "STJ",
			"ICAO": "KSTJ",
			"lat": "39.771900177002",
			"lng": "-94.909698486328"
		},
		"Volk Field": {
			"id": "7048",
			"name": "Volk Field",
			"city": "Camp Douglas",
			"country": "United States",
			"IATA": "VOK",
			"ICAO": "KVOK",
			"lat": "43.938999176025",
			"lng": "-90.253402709961"
		},
		"Gunnison Crested Butte Regional Airport": {
			"id": "7051",
			"name": "Gunnison Crested Butte Regional Airport",
			"city": "Gunnison",
			"country": "United States",
			"IATA": "GUC",
			"ICAO": "KGUC",
			"lat": "38.53390121",
			"lng": "-106.9329987"
		},
		"Zamperini Field": {
			"id": "7053",
			"name": "Zamperini Field",
			"city": "Torrance",
			"country": "United States",
			"IATA": "TOA",
			"ICAO": "KTOA",
			"lat": "33.803398132324",
			"lng": "-118.33999633789"
		},
		"Manistee Co Blacker Airport": {
			"id": "7054",
			"name": "Manistee Co Blacker Airport",
			"city": "Manistee",
			"country": "United States",
			"IATA": "MBL",
			"ICAO": "KMBL",
			"lat": "44.2723999",
			"lng": "-86.24690247"
		},
		"Charlotte County Airport": {
			"id": "7056",
			"name": "Charlotte County Airport",
			"city": "Punta Gorda",
			"country": "United States",
			"IATA": "PGD",
			"ICAO": "KPGD",
			"lat": "26.92020035",
			"lng": "-81.9905014"
		},
		"Northern Aroostook Regional Airport": {
			"id": "7058",
			"name": "Northern Aroostook Regional Airport",
			"city": "Frenchville",
			"country": "United States",
			"IATA": "WFK",
			"ICAO": "KFVE",
			"lat": "47.2854995728",
			"lng": "-68.31279754639999"
		},
		"Chautauqua County-Jamestown Airport": {
			"id": "7059",
			"name": "Chautauqua County-Jamestown Airport",
			"city": "Jamestown",
			"country": "United States",
			"IATA": "JHW",
			"ICAO": "KJHW",
			"lat": "42.15340042",
			"lng": "-79.25800323"
		},
		"Lake Cumberland Regional Airport": {
			"id": "7061",
			"name": "Lake Cumberland Regional Airport",
			"city": "Somerset",
			"country": "United States",
			"IATA": "SME",
			"ICAO": "KSME",
			"lat": "37.053398132299996",
			"lng": "-84.6158981323"
		},
		"Shenandoah Valley Regional Airport": {
			"id": "7062",
			"name": "Shenandoah Valley Regional Airport",
			"city": "Weyers Cave",
			"country": "United States",
			"IATA": "SHD",
			"ICAO": "KSHD",
			"lat": "38.2638015747",
			"lng": "-78.8964004517"
		},
		"Devils Lake Regional Airport": {
			"id": "7063",
			"name": "Devils Lake Regional Airport",
			"city": "Devils Lake",
			"country": "United States",
			"IATA": "DVL",
			"ICAO": "KDVL",
			"lat": "48.11420059",
			"lng": "-98.90879822"
		},
		"Dickinson Theodore Roosevelt Regional Airport": {
			"id": "7064",
			"name": "Dickinson Theodore Roosevelt Regional Airport",
			"city": "Dickinson",
			"country": "United States",
			"IATA": "DIK",
			"ICAO": "KDIK",
			"lat": "46.7974014282",
			"lng": "-102.802001953"
		},
		"Sidney Richland Municipal Airport": {
			"id": "7065",
			"name": "Sidney Richland Municipal Airport",
			"city": "Sidney",
			"country": "United States",
			"IATA": "SDY",
			"ICAO": "KSDY",
			"lat": "47.70690155",
			"lng": "-104.1930008"
		},
		"Chadron Municipal Airport": {
			"id": "7066",
			"name": "Chadron Municipal Airport",
			"city": "Chadron",
			"country": "United States",
			"IATA": "CDR",
			"ICAO": "KCDR",
			"lat": "42.837600708",
			"lng": "-103.095001221"
		},
		"Alliance Municipal Airport": {
			"id": "7067",
			"name": "Alliance Municipal Airport",
			"city": "Alliance",
			"country": "United States",
			"IATA": "AIA",
			"ICAO": "KAIA",
			"lat": "42.0531997681",
			"lng": "-102.804000854"
		},
		"Mc Cook Ben Nelson Regional Airport": {
			"id": "7068",
			"name": "Mc Cook Ben Nelson Regional Airport",
			"city": "McCook",
			"country": "United States",
			"IATA": "MCK",
			"ICAO": "KMCK",
			"lat": "40.20629883",
			"lng": "-100.5920029"
		},
		"The Florida Keys Marathon Airport": {
			"id": "7069",
			"name": "The Florida Keys Marathon Airport",
			"city": "Marathon",
			"country": "United States",
			"IATA": "MTH",
			"ICAO": "KMTH",
			"lat": "24.72610092",
			"lng": "-81.05139923"
		},
		"Dawson Community Airport": {
			"id": "7070",
			"name": "Dawson Community Airport",
			"city": "Glendive",
			"country": "United States",
			"IATA": "GDV",
			"ICAO": "KGDV",
			"lat": "47.13869858",
			"lng": "-104.8069992"
		},
		"L M Clayton Airport": {
			"id": "7071",
			"name": "L M Clayton Airport",
			"city": "Wolf Point",
			"country": "United States",
			"IATA": "OLF",
			"ICAO": "KOLF",
			"lat": "48.094501495399996",
			"lng": "-105.574996948"
		},
		"Yellowstone Airport": {
			"id": "7072",
			"name": "Yellowstone Airport",
			"city": "West Yellowstone",
			"country": "United States",
			"IATA": "WYS",
			"ICAO": "KWYS",
			"lat": "44.68840027",
			"lng": "-111.1179962"
		},
		"San Luis Valley Regional Bergman Field": {
			"id": "7073",
			"name": "San Luis Valley Regional Bergman Field",
			"city": "Alamosa",
			"country": "United States",
			"IATA": "ALS",
			"ICAO": "KALS",
			"lat": "37.434898",
			"lng": "-105.866997"
		},
		"Canyonlands Field": {
			"id": "7074",
			"name": "Canyonlands Field",
			"city": "Moab",
			"country": "United States",
			"IATA": "CNY",
			"ICAO": "KCNY",
			"lat": "38.75500107",
			"lng": "-109.7549973"
		},
		"Ely Airport Yelland Field": {
			"id": "7075",
			"name": "Ely Airport Yelland Field",
			"city": "Ely",
			"country": "United States",
			"IATA": "ELY",
			"ICAO": "KELY",
			"lat": "39.29970169",
			"lng": "-114.8420029"
		},
		"Vernal Regional Airport": {
			"id": "7076",
			"name": "Vernal Regional Airport",
			"city": "Vernal",
			"country": "United States",
			"IATA": "VEL",
			"ICAO": "KVEL",
			"lat": "40.4408989",
			"lng": "-109.5100021"
		},
		"Sierra Blanca Regional Airport": {
			"id": "7077",
			"name": "Sierra Blanca Regional Airport",
			"city": "Ruidoso",
			"country": "United States",
			"IATA": "SRR",
			"ICAO": "KSRR",
			"lat": "33.462799072266",
			"lng": "-105.53500366211"
		},
		"Show Low Regional Airport": {
			"id": "7078",
			"name": "Show Low Regional Airport",
			"city": "Show Low",
			"country": "United States",
			"IATA": "SOW",
			"ICAO": "KSOW",
			"lat": "34.265499115",
			"lng": "-110.005996704"
		},
		"McCall Municipal Airport": {
			"id": "7079",
			"name": "McCall Municipal Airport",
			"city": "McCall",
			"country": "United States",
			"IATA": "MYL",
			"ICAO": "KMYL",
			"lat": "44.88970184",
			"lng": "-116.1009979"
		},
		"Lemhi County Airport": {
			"id": "7080",
			"name": "Lemhi County Airport",
			"city": "Salmon",
			"country": "United States",
			"IATA": "SMN",
			"ICAO": "KSMN",
			"lat": "45.1237983704",
			"lng": "-113.880996704"
		},
		"Mammoth Yosemite Airport": {
			"id": "7081",
			"name": "Mammoth Yosemite Airport",
			"city": "Mammoth Lakes",
			"country": "United States",
			"IATA": "MMH",
			"ICAO": "KMMH",
			"lat": "37.62409973",
			"lng": "-118.8379974"
		},
		"Friday Harbor Airport": {
			"id": "7082",
			"name": "Friday Harbor Airport",
			"city": "Friday Harbor",
			"country": "United States",
			"IATA": "FRD",
			"ICAO": "KFHR",
			"lat": "48.5219993591",
			"lng": "-123.024002075"
		},
		"Orcas Island Airport": {
			"id": "7083",
			"name": "Orcas Island Airport",
			"city": "Eastsound",
			"country": "United States",
			"IATA": "ESD",
			"ICAO": "KORS",
			"lat": "48.7081985474",
			"lng": "-122.910003662"
		},
		"Astoria Regional Airport": {
			"id": "7085",
			"name": "Astoria Regional Airport",
			"city": "Astoria",
			"country": "United States",
			"IATA": "AST",
			"ICAO": "KAST",
			"lat": "46.158000946",
			"lng": "-123.878997803"
		},
		"Newport Municipal Airport": {
			"id": "7086",
			"name": "Newport Municipal Airport",
			"city": "Newport",
			"country": "United States",
			"IATA": "ONP",
			"ICAO": "KONP",
			"lat": "44.58039855957031",
			"lng": "-124.05799865722656"
		},
		"Emmonak Airport": {
			"id": "7087",
			"name": "Emmonak Airport",
			"city": "Emmonak",
			"country": "United States",
			"IATA": "EMK",
			"ICAO": "PAEM",
			"lat": "62.78609848",
			"lng": "-164.4909973"
		},
		"Unalakleet Airport": {
			"id": "7088",
			"name": "Unalakleet Airport",
			"city": "Unalakleet",
			"country": "United States",
			"IATA": "UNK",
			"ICAO": "PAUN",
			"lat": "63.88840103",
			"lng": "-160.798996"
		},
		"Ugnu-Kuparuk Airport": {
			"id": "7089",
			"name": "Ugnu-Kuparuk Airport",
			"city": "Kuparuk",
			"country": "United States",
			"IATA": "UUK",
			"ICAO": "PAKU",
			"lat": "70.33080291750001",
			"lng": "-149.598007202"
		},
		"Shageluk Airport": {
			"id": "7090",
			"name": "Shageluk Airport",
			"city": "Shageluk",
			"country": "United States",
			"IATA": "SHX",
			"ICAO": "PAHX",
			"lat": "62.6922988892",
			"lng": "-159.569000244"
		},
		"Nuiqsut Airport": {
			"id": "7092",
			"name": "Nuiqsut Airport",
			"city": "Nuiqsut",
			"country": "United States",
			"IATA": "NUI",
			"ICAO": "PAQT",
			"lat": "70.2099990845",
			"lng": "-151.005996704"
		},
		"Eek Airport": {
			"id": "7093",
			"name": "Eek Airport",
			"city": "Eek",
			"country": "United States",
			"IATA": "EEK",
			"ICAO": "PAEE",
			"lat": "60.21367264",
			"lng": "-162.0438843"
		},
		"Kasigluk Airport": {
			"id": "7094",
			"name": "Kasigluk Airport",
			"city": "Kasigluk",
			"country": "United States",
			"IATA": "KUK",
			"ICAO": "PFKA",
			"lat": "60.87440109",
			"lng": "-162.5240021"
		},
		"Kwethluk Airport": {
			"id": "7095",
			"name": "Kwethluk Airport",
			"city": "Kwethluk",
			"country": "United States",
			"IATA": "KWT",
			"ICAO": "PFKW",
			"lat": "60.790298461899994",
			"lng": "-161.444000244"
		},
		"Kwigillingok Airport": {
			"id": "7096",
			"name": "Kwigillingok Airport",
			"city": "Kwigillingok",
			"country": "United States",
			"IATA": "KWK",
			"ICAO": "PAGG",
			"lat": "59.876499",
			"lng": "-163.169005"
		},
		"Marshall Don Hunter Sr Airport": {
			"id": "7097",
			"name": "Marshall Don Hunter Sr Airport",
			"city": "Marshall",
			"country": "United States",
			"IATA": "MLL",
			"ICAO": "PADM",
			"lat": "61.8642997742",
			"lng": "-162.026000977"
		},
		"Russian Mission Airport": {
			"id": "7098",
			"name": "Russian Mission Airport",
			"city": "Russian Mission",
			"country": "United States",
			"IATA": "RSH",
			"ICAO": "PARS",
			"lat": "61.7788848877",
			"lng": "-161.319458008"
		},
		"Koliganek Airport": {
			"id": "7101",
			"name": "Koliganek Airport",
			"city": "Koliganek",
			"country": "United States",
			"IATA": "KGK",
			"ICAO": "PAJZ",
			"lat": "59.726600647",
			"lng": "-157.259002686"
		},
		"Manokotak Airport": {
			"id": "7103",
			"name": "Manokotak Airport",
			"city": "Manokotak",
			"country": "United States",
			"IATA": "KMO",
			"ICAO": "PAMB",
			"lat": "58.990200042699996",
			"lng": "-159.050003052"
		},
		"Chalkyitsik Airport": {
			"id": "7105",
			"name": "Chalkyitsik Airport",
			"city": "Chalkyitsik",
			"country": "United States",
			"IATA": "CIK",
			"ICAO": "PACI",
			"lat": "66.6449966431",
			"lng": "-143.740005493"
		},
		"Eagle Airport": {
			"id": "7106",
			"name": "Eagle Airport",
			"city": "Eagle",
			"country": "United States",
			"IATA": "EAA",
			"ICAO": "PAEG",
			"lat": "64.77639771",
			"lng": "-141.151001"
		},
		"Hughes Airport": {
			"id": "7107",
			"name": "Hughes Airport",
			"city": "Hughes",
			"country": "United States",
			"IATA": "HUS",
			"ICAO": "PAHU",
			"lat": "66.04109955",
			"lng": "-154.2630005"
		},
		"Huslia Airport": {
			"id": "7108",
			"name": "Huslia Airport",
			"city": "Huslia",
			"country": "United States",
			"IATA": "HSL",
			"ICAO": "PAHL",
			"lat": "65.69789886",
			"lng": "-156.3509979"
		},
		"Nulato Airport": {
			"id": "7111",
			"name": "Nulato Airport",
			"city": "Nulato",
			"country": "United States",
			"IATA": "NUL",
			"ICAO": "PANU",
			"lat": "64.72930145263672",
			"lng": "-158.07400512695312"
		},
		"Venetie Airport": {
			"id": "7114",
			"name": "Venetie Airport",
			"city": "Venetie",
			"country": "United States",
			"IATA": "VEE",
			"ICAO": "PAVE",
			"lat": "67.0086975098",
			"lng": "-146.365997314"
		},
		"Beaver Airport": {
			"id": "7115",
			"name": "Beaver Airport",
			"city": "Beaver",
			"country": "United States",
			"IATA": "WBQ",
			"ICAO": "PAWB",
			"lat": "66.362197876",
			"lng": "-147.406997681"
		},
		"Central Airport": {
			"id": "7116",
			"name": "Central Airport",
			"city": "Central",
			"country": "United States",
			"IATA": "CEM",
			"ICAO": "PACE",
			"lat": "65.57379913",
			"lng": "-144.7830048"
		},
		"Shungnak Airport": {
			"id": "7117",
			"name": "Shungnak Airport",
			"city": "Shungnak",
			"country": "United States",
			"IATA": "SHG",
			"ICAO": "PAGH",
			"lat": "66.88809967041",
			"lng": "-157.16200256348"
		},
		"Inyokern Airport": {
			"id": "7120",
			"name": "Inyokern Airport",
			"city": "Inyokern",
			"country": "United States",
			"IATA": "IYK",
			"ICAO": "KIYK",
			"lat": "35.65879822",
			"lng": "-117.8300018"
		},
		"Visalia Municipal Airport": {
			"id": "7121",
			"name": "Visalia Municipal Airport",
			"city": "Visalia",
			"country": "United States",
			"IATA": "VIS",
			"ICAO": "KVIS",
			"lat": "36.3186988831",
			"lng": "-119.392997742"
		},
		"Merced Regional Macready Field": {
			"id": "7122",
			"name": "Merced Regional Macready Field",
			"city": "Merced",
			"country": "United States",
			"IATA": "MCE",
			"ICAO": "KMCE",
			"lat": "37.28469849",
			"lng": "-120.5139999"
		},
		"Phoenix Goodyear Airport": {
			"id": "7126",
			"name": "Phoenix Goodyear Airport",
			"city": "Goodyear",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KGYR",
			"lat": "33.4225006104",
			"lng": "-112.375999451"
		},
		"Angoon Seaplane Base": {
			"id": "7135",
			"name": "Angoon Seaplane Base",
			"city": "Angoon",
			"country": "United States",
			"IATA": "AGN",
			"ICAO": "PAGN",
			"lat": "57.503601",
			"lng": "-134.585007"
		},
		"Elfin Cove Seaplane Base": {
			"id": "7136",
			"name": "Elfin Cove Seaplane Base",
			"city": "Elfin Cove",
			"country": "United States",
			"IATA": "ELV",
			"ICAO": "PAEL",
			"lat": "58.195201873799995",
			"lng": "-136.347000122"
		},
		"Funter Bay Seaplane Base": {
			"id": "7140",
			"name": "Funter Bay Seaplane Base",
			"city": "Funter Bay",
			"country": "United States",
			"IATA": "FNR",
			"ICAO": "PANR",
			"lat": "58.2543983459",
			"lng": "-134.897994995"
		},
		"Hoonah Airport": {
			"id": "7142",
			"name": "Hoonah Airport",
			"city": "Hoonah",
			"country": "United States",
			"IATA": "HNH",
			"ICAO": "PAOH",
			"lat": "58.0961",
			"lng": "-135.410111"
		},
		"Kake Airport": {
			"id": "7143",
			"name": "Kake Airport",
			"city": "Kake",
			"country": "United States",
			"IATA": "AFE",
			"ICAO": "PAFE",
			"lat": "56.9613990784",
			"lng": "-133.910003662"
		},
		"Metlakatla Seaplane Base": {
			"id": "7146",
			"name": "Metlakatla Seaplane Base",
			"city": "Metakatla",
			"country": "United States",
			"IATA": "MTM",
			"ICAO": "PAMM",
			"lat": "55.13100051879883",
			"lng": "-131.5780029296875"
		},
		"Hydaburg Seaplane Base": {
			"id": "7148",
			"name": "Hydaburg Seaplane Base",
			"city": "Hydaburg",
			"country": "United States",
			"IATA": "HYG",
			"ICAO": "PAHY",
			"lat": "55.206298828125",
			"lng": "-132.8280029296875"
		},
		"Egegik Airport": {
			"id": "7154",
			"name": "Egegik Airport",
			"city": "Egegik",
			"country": "United States",
			"IATA": "EGX",
			"ICAO": "PAII",
			"lat": "58.1855010986",
			"lng": "-157.375"
		},
		"Perryville Airport": {
			"id": "7157",
			"name": "Perryville Airport",
			"city": "Perryville",
			"country": "United States",
			"IATA": "KPV",
			"ICAO": "PAPE",
			"lat": "55.905998",
			"lng": "-159.162993"
		},
		"Pilot Point Airport": {
			"id": "7158",
			"name": "Pilot Point Airport",
			"city": "Pilot Point",
			"country": "United States",
			"IATA": "PIP",
			"ICAO": "PAPN",
			"lat": "57.5803985596",
			"lng": "-157.572006226"
		},
		"South Naknek Nr 2 Airport": {
			"id": "7159",
			"name": "South Naknek Nr 2 Airport",
			"city": "South Naknek",
			"country": "United States",
			"IATA": "WSN",
			"ICAO": "PFWS",
			"lat": "58.7033996582",
			"lng": "-157.007995605"
		},
		"Akhiok Airport": {
			"id": "7160",
			"name": "Akhiok Airport",
			"city": "Akhiok",
			"country": "United States",
			"IATA": "AKK",
			"ICAO": "PAKH",
			"lat": "56.9387016296",
			"lng": "-154.182998657"
		},
		"Karluk Airport": {
			"id": "7161",
			"name": "Karluk Airport",
			"city": "Karluk",
			"country": "United States",
			"IATA": "KYK",
			"ICAO": "PAKY",
			"lat": "57.5671005249",
			"lng": "-154.449996948"
		},
		"Larsen Bay Airport": {
			"id": "7162",
			"name": "Larsen Bay Airport",
			"city": "Larsen Bay",
			"country": "United States",
			"IATA": "KLN",
			"ICAO": "PALB",
			"lat": "57.5350990295",
			"lng": "-153.977996826"
		},
		"Ambler Airport": {
			"id": "7177",
			"name": "Ambler Airport",
			"city": "Ambler",
			"country": "United States",
			"IATA": "ABL",
			"ICAO": "PAFM",
			"lat": "67.106300354",
			"lng": "-157.856994629"
		},
		"Buckland Airport": {
			"id": "7178",
			"name": "Buckland Airport",
			"city": "Buckland",
			"country": "United States",
			"IATA": "BKC",
			"ICAO": "PABL",
			"lat": "65.9815979004",
			"lng": "-161.149002075"
		},
		"Bob Baker Memorial Airport": {
			"id": "7179",
			"name": "Bob Baker Memorial Airport",
			"city": "Kiana",
			"country": "United States",
			"IATA": "IAN",
			"ICAO": "PAIK",
			"lat": "66.9759979248",
			"lng": "-160.43699646"
		},
		"Kobuk Airport": {
			"id": "7180",
			"name": "Kobuk Airport",
			"city": "Kobuk",
			"country": "United States",
			"IATA": "OBU",
			"ICAO": "PAOB",
			"lat": "66.9123001099",
			"lng": "-156.897003174"
		},
		"Robert (Bob) Curtis Memorial Airport": {
			"id": "7181",
			"name": "Robert (Bob) Curtis Memorial Airport",
			"city": "Noorvik",
			"country": "United States",
			"IATA": "ORV",
			"ICAO": "PFNO",
			"lat": "66.81790161",
			"lng": "-161.0189972"
		},
		"Selawik Airport": {
			"id": "7182",
			"name": "Selawik Airport",
			"city": "Selawik",
			"country": "United States",
			"IATA": "WLK",
			"ICAO": "PASK",
			"lat": "66.60009766",
			"lng": "-159.9859924"
		},
		"Brevig Mission Airport": {
			"id": "7183",
			"name": "Brevig Mission Airport",
			"city": "Brevig Mission",
			"country": "United States",
			"IATA": "KTS",
			"ICAO": "PFKT",
			"lat": "65.3312988281",
			"lng": "-166.466003418"
		},
		"Elim Airport": {
			"id": "7184",
			"name": "Elim Airport",
			"city": "Elim",
			"country": "United States",
			"IATA": "ELI",
			"ICAO": "PFEL",
			"lat": "64.61470032",
			"lng": "-162.2720032"
		},
		"Golovin Airport": {
			"id": "7185",
			"name": "Golovin Airport",
			"city": "Golovin",
			"country": "United States",
			"IATA": "GLV",
			"ICAO": "PAGL",
			"lat": "64.5504989624",
			"lng": "-163.007003784"
		},
		"Teller Airport": {
			"id": "7186",
			"name": "Teller Airport",
			"city": "Teller",
			"country": "United States",
			"IATA": "TLA",
			"ICAO": "PATE",
			"lat": "65.2404022217",
			"lng": "-166.339004517"
		},
		"Wales Airport": {
			"id": "7187",
			"name": "Wales Airport",
			"city": "Wales",
			"country": "United States",
			"IATA": "WAA",
			"ICAO": "PAIW",
			"lat": "65.622593",
			"lng": "-168.095"
		},
		"White Mountain Airport": {
			"id": "7188",
			"name": "White Mountain Airport",
			"city": "White Mountain",
			"country": "United States",
			"IATA": "WMO",
			"ICAO": "PAWM",
			"lat": "64.689201355",
			"lng": "-163.412994385"
		},
		"Koyuk Alfred Adams Airport": {
			"id": "7190",
			"name": "Koyuk Alfred Adams Airport",
			"city": "Koyuk",
			"country": "United States",
			"IATA": "KKA",
			"ICAO": "PAKK",
			"lat": "64.9394989014",
			"lng": "-161.154006958"
		},
		"St Michael Airport": {
			"id": "7191",
			"name": "St Michael Airport",
			"city": "St. Michael",
			"country": "United States",
			"IATA": "SMK",
			"ICAO": "PAMK",
			"lat": "63.49010086",
			"lng": "-162.1100006"
		},
		"Shaktoolik Airport": {
			"id": "7192",
			"name": "Shaktoolik Airport",
			"city": "Shaktoolik",
			"country": "United States",
			"IATA": "SKK",
			"ICAO": "PFSH",
			"lat": "64.37110138",
			"lng": "-161.223999"
		},
		"Tin City Long Range Radar Station Airport": {
			"id": "7194",
			"name": "Tin City Long Range Radar Station Airport",
			"city": "Tin City",
			"country": "United States",
			"IATA": "TNC",
			"ICAO": "PATC",
			"lat": "65.56310272",
			"lng": "-167.9219971"
		},
		"Atka Airport": {
			"id": "7195",
			"name": "Atka Airport",
			"city": "Atka",
			"country": "United States",
			"IATA": "AKB",
			"ICAO": "PAAK",
			"lat": "52.22029877",
			"lng": "-174.2059937"
		},
		"Yakataga Airport": {
			"id": "7198",
			"name": "Yakataga Airport",
			"city": "Yakataga",
			"country": "United States",
			"IATA": "CYT",
			"ICAO": "PACY",
			"lat": "60.082000732400004",
			"lng": "-142.492996216"
		},
		"Alakanuk Airport": {
			"id": "7199",
			"name": "Alakanuk Airport",
			"city": "Alakanuk",
			"country": "United States",
			"IATA": "AUK",
			"ICAO": "PAUK",
			"lat": "62.680042266799994",
			"lng": "-164.659927368"
		},
		"Kipnuk Airport": {
			"id": "7201",
			"name": "Kipnuk Airport",
			"city": "Kipnuk",
			"country": "United States",
			"IATA": "KPN",
			"ICAO": "PAKI",
			"lat": "59.932998657199995",
			"lng": "-164.031005859"
		},
		"False Pass Airport": {
			"id": "7202",
			"name": "False Pass Airport",
			"city": "False Pass",
			"country": "United States",
			"IATA": "KFP",
			"ICAO": "PAKF",
			"lat": "54.8474006652832",
			"lng": "-163.41000366210938"
		},
		"Nelson Lagoon Airport": {
			"id": "7203",
			"name": "Nelson Lagoon Airport",
			"city": "Nelson Lagoon",
			"country": "United States",
			"IATA": "NLG",
			"ICAO": "PAOU",
			"lat": "56.007499694824",
			"lng": "-161.16000366211"
		},
		"Port Moller Airport": {
			"id": "7204",
			"name": "Port Moller Airport",
			"city": "Cold Bay",
			"country": "United States",
			"IATA": "PML",
			"ICAO": "PAAL",
			"lat": "56.0060005188",
			"lng": "-160.561004639"
		},
		"Klawock Airport": {
			"id": "7205",
			"name": "Klawock Airport",
			"city": "Klawock",
			"country": "United States",
			"IATA": "KLW",
			"ICAO": "PAKW",
			"lat": "55.579200744599994",
			"lng": "-133.076004028"
		},
		"Quinhagak Airport": {
			"id": "7206",
			"name": "Quinhagak Airport",
			"city": "Quinhagak",
			"country": "United States",
			"IATA": "KWN",
			"ICAO": "PAQH",
			"lat": "59.75510025",
			"lng": "-161.8450012"
		},
		"Kotlik Airport": {
			"id": "7207",
			"name": "Kotlik Airport",
			"city": "Kotlik",
			"country": "United States",
			"IATA": "KOT",
			"ICAO": "PFKO",
			"lat": "63.0306015015",
			"lng": "-163.533004761"
		},
		"Koyukuk Airport": {
			"id": "7208",
			"name": "Koyukuk Airport",
			"city": "Koyukuk",
			"country": "United States",
			"IATA": "KYU",
			"ICAO": "PFKU",
			"lat": "64.8760986328",
			"lng": "-157.727005005"
		},
		"Scammon Bay Airport": {
			"id": "7209",
			"name": "Scammon Bay Airport",
			"city": "Scammon Bay",
			"country": "United States",
			"IATA": "SCM",
			"ICAO": "PACM",
			"lat": "61.845298767100005",
			"lng": "-165.570999146"
		},
		"Nondalton Airport": {
			"id": "7210",
			"name": "Nondalton Airport",
			"city": "Nondalton",
			"country": "United States",
			"IATA": "NNL",
			"ICAO": "PANO",
			"lat": "59.980201721191",
			"lng": "-154.8390045166"
		},
		"Kongiganak Airport": {
			"id": "7213",
			"name": "Kongiganak Airport",
			"city": "Kongiganak",
			"country": "United States",
			"IATA": "KKH",
			"ICAO": "PADY",
			"lat": "59.960800170899994",
			"lng": "-162.880996704"
		},
		"Nikolai Airport": {
			"id": "7214",
			"name": "Nikolai Airport",
			"city": "Nikolai",
			"country": "United States",
			"IATA": "NIB",
			"ICAO": "PAFS",
			"lat": "63.01860046386719",
			"lng": "-154.35800170898438"
		},
		"Akiak Airport": {
			"id": "7217",
			"name": "Akiak Airport",
			"city": "Akiak",
			"country": "United States",
			"IATA": "AKI",
			"ICAO": "PFAK",
			"lat": "60.9029006958",
			"lng": "-161.231002808"
		},
		"Wainwright Airport": {
			"id": "7220",
			"name": "Wainwright Airport",
			"city": "Wainwright",
			"country": "United States",
			"IATA": "AIN",
			"ICAO": "PAWI",
			"lat": "70.6380004883",
			"lng": "-159.994995117"
		},
		"Chenega Bay Airport": {
			"id": "7233",
			"name": "Chenega Bay Airport",
			"city": "Chenega",
			"country": "United States",
			"IATA": "NCN",
			"ICAO": "PFCB",
			"lat": "60.0773010254",
			"lng": "-147.992004395"
		},
		"Tok Junction Airport": {
			"id": "7235",
			"name": "Tok Junction Airport",
			"city": "Tok",
			"country": "United States",
			"IATA": "TKJ",
			"ICAO": "PFTO",
			"lat": "63.32949829",
			"lng": "-142.9539948"
		},
		"Circle City /New/ Airport": {
			"id": "7236",
			"name": "Circle City /New/ Airport",
			"city": "Circle",
			"country": "United States",
			"IATA": "IRC",
			"ICAO": "PACR",
			"lat": "65.830498",
			"lng": "-144.076008"
		},
		"Sleetmute Airport": {
			"id": "7240",
			"name": "Sleetmute Airport",
			"city": "Sleetmute",
			"country": "United States",
			"IATA": "SLQ",
			"ICAO": "PASL",
			"lat": "61.7005004883",
			"lng": "-157.166000366"
		},
		"Healy River Airport": {
			"id": "7242",
			"name": "Healy River Airport",
			"city": "Healy",
			"country": "United States",
			"IATA": "HKB",
			"ICAO": "PAHV",
			"lat": "63.8661994934082",
			"lng": "-148.968994140625"
		},
		"Klawock Seaplane Base": {
			"id": "7244",
			"name": "Klawock Seaplane Base",
			"city": "Klawock",
			"country": "United States",
			"IATA": "AQC",
			"ICAO": "PAQC",
			"lat": "55.5546989440918",
			"lng": "-133.1020050048828"
		},
		"Minchumina Airport": {
			"id": "7245",
			"name": "Minchumina Airport",
			"city": "Lake Minchumina",
			"country": "United States",
			"IATA": "MHM",
			"ICAO": "PAMH",
			"lat": "63.88600158691406",
			"lng": "-152.302001953125"
		},
		"Manley Hot Springs Airport": {
			"id": "7246",
			"name": "Manley Hot Springs Airport",
			"city": "Manley Hot Springs",
			"country": "United States",
			"IATA": "MLY",
			"ICAO": "PAML",
			"lat": "64.99759674069999",
			"lng": "-150.643997192"
		},
		"Eastern WV Regional Airport/Shepherd Field": {
			"id": "7415",
			"name": "Eastern WV Regional Airport/Shepherd Field",
			"city": "Martinsburg",
			"country": "United States",
			"IATA": "MRB",
			"ICAO": "KMRB",
			"lat": "39.40190125",
			"lng": "-77.98459625"
		},
		"Rock Hill - York County Airport": {
			"id": "7494",
			"name": "Rock Hill - York County Airport",
			"city": "Rock Hill",
			"country": "United States",
			"IATA": "RKH",
			"ICAO": "KUZA",
			"lat": "34.9878006",
			"lng": "-81.05719757"
		},
		"Allegheny County Airport": {
			"id": "7495",
			"name": "Allegheny County Airport",
			"city": "Pittsburgh",
			"country": "United States",
			"IATA": "AGC",
			"ICAO": "KAGC",
			"lat": "40.354400634765625",
			"lng": "-79.9301986694336"
		},
		"Cecil Airport": {
			"id": "7496",
			"name": "Cecil Airport",
			"city": "Jacksonville",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KVQQ",
			"lat": "30.2187004089",
			"lng": "-81.876701355"
		},
		"Fulton County Airport Brown Field": {
			"id": "7497",
			"name": "Fulton County Airport Brown Field",
			"city": "Atlanta",
			"country": "United States",
			"IATA": "FTY",
			"ICAO": "KFTY",
			"lat": "33.7790985107",
			"lng": "-84.5214004517"
		},
		"Ohio State University Airport": {
			"id": "7511",
			"name": "Ohio State University Airport",
			"city": "Columbus",
			"country": "United States",
			"IATA": "OSU",
			"ICAO": "KOSU",
			"lat": "40.0797996521",
			"lng": "-83.072998046875"
		},
		"Addison Airport": {
			"id": "7513",
			"name": "Addison Airport",
			"city": "Addison",
			"country": "United States",
			"IATA": "ADS",
			"ICAO": "KADS",
			"lat": "32.9686012268",
			"lng": "-96.8364028931"
		},
		"Destin Executive Airport": {
			"id": "7514",
			"name": "Destin Executive Airport",
			"city": "Destin",
			"country": "United States",
			"IATA": "DTS",
			"ICAO": "KDTS",
			"lat": "30.40010071",
			"lng": "-86.47149658"
		},
		"Kinston Regional Jetport At Stallings Field": {
			"id": "7522",
			"name": "Kinston Regional Jetport At Stallings Field",
			"city": "Kinston",
			"country": "United States",
			"IATA": "ISO",
			"ICAO": "KISO",
			"lat": "35.331401825",
			"lng": "-77.60880279540001"
		},
		"First Flight Airport": {
			"id": "7523",
			"name": "First Flight Airport",
			"city": "Kill Devil Hills",
			"country": "United States",
			"IATA": "FFA",
			"ICAO": "KFFA",
			"lat": "36.0181999207",
			"lng": "-75.67130279540001"
		},
		"Provo Municipal Airport": {
			"id": "7579",
			"name": "Provo Municipal Airport",
			"city": "Provo",
			"country": "United States",
			"IATA": "PVU",
			"ICAO": "KPVU",
			"lat": "40.219200134277",
			"lng": "-111.72299957275"
		},
		"Steamboat Springs Bob Adams Field": {
			"id": "7580",
			"name": "Steamboat Springs Bob Adams Field",
			"city": "Steamboat Springs",
			"country": "United States",
			"IATA": "SBS",
			"ICAO": "KSBS",
			"lat": "40.5163002",
			"lng": "-106.8659973"
		},
		"Delta Municipal Airport": {
			"id": "7581",
			"name": "Delta Municipal Airport",
			"city": "Delta",
			"country": "United States",
			"IATA": "DTA",
			"ICAO": "KDTA",
			"lat": "39.3805999756",
			"lng": "-112.508003235"
		},
		"Richfield Municipal Airport": {
			"id": "7582",
			"name": "Richfield Municipal Airport",
			"city": "Richfield",
			"country": "United States",
			"IATA": "RIF",
			"ICAO": "KRIF",
			"lat": "38.73640060424805",
			"lng": "-112.0989990234375"
		},
		"Carbon County Regional/Buck Davis Field": {
			"id": "7583",
			"name": "Carbon County Regional/Buck Davis Field",
			"city": "Price",
			"country": "United States",
			"IATA": "PUC",
			"ICAO": "KPUC",
			"lat": "39.61389923",
			"lng": "-110.7509995"
		},
		"Los Alamos Airport": {
			"id": "7584",
			"name": "Los Alamos Airport",
			"city": "Los Alamos",
			"country": "United States",
			"IATA": "LAM",
			"ICAO": "KLAM",
			"lat": "35.8797988892",
			"lng": "-106.268997192"
		},
		"Lake Havasu City Airport": {
			"id": "7586",
			"name": "Lake Havasu City Airport",
			"city": "Lake Havasu City",
			"country": "United States",
			"IATA": "HII",
			"ICAO": "KHII",
			"lat": "34.571098",
			"lng": "-114.358002"
		},
		"Winslow Lindbergh Regional Airport": {
			"id": "7587",
			"name": "Winslow Lindbergh Regional Airport",
			"city": "Winslow",
			"country": "United States",
			"IATA": "INW",
			"ICAO": "KINW",
			"lat": "35.021900177",
			"lng": "-110.722999573"
		},
		"Douglas Municipal Airport": {
			"id": "8273",
			"name": "Douglas Municipal Airport",
			"city": "Douglas",
			"country": "United States",
			"IATA": "DQH",
			"ICAO": "KDQH",
			"lat": "31.476699829101562",
			"lng": "-82.8604965209961"
		},
		"Bartow Municipal Airport": {
			"id": "7621",
			"name": "Bartow Municipal Airport",
			"city": "Bartow",
			"country": "United States",
			"IATA": "BOW",
			"ICAO": "KBOW",
			"lat": "27.943399429299998",
			"lng": "-81.78340148930002"
		},
		"Livermore Municipal Airport": {
			"id": "7629",
			"name": "Livermore Municipal Airport",
			"city": "Livermore",
			"country": "United States",
			"IATA": "LVK",
			"ICAO": "KLVK",
			"lat": "37.6934013367",
			"lng": "-121.819999695"
		},
		"Mariposa Yosemite Airport": {
			"id": "7630",
			"name": "Mariposa Yosemite Airport",
			"city": "Mariposa",
			"country": "United States",
			"IATA": "RMY",
			"ICAO": "KMPI",
			"lat": "37.5108985901",
			"lng": "-120.040000916"
		},
		"Jacqueline Cochran Regional Airport": {
			"id": "7646",
			"name": "Jacqueline Cochran Regional Airport",
			"city": "Palm Springs",
			"country": "United States",
			"IATA": "TRM",
			"ICAO": "KTRM",
			"lat": "33.62670135498",
			"lng": "-116.16000366211"
		},
		"Santa Monica Municipal Airport": {
			"id": "7647",
			"name": "Santa Monica Municipal Airport",
			"city": "Santa Monica",
			"country": "United States",
			"IATA": "SMO",
			"ICAO": "KSMO",
			"lat": "34.015800476100004",
			"lng": "-118.450996399"
		},
		"Bermuda Dunes Airport": {
			"id": "7648",
			"name": "Bermuda Dunes Airport",
			"city": "Palm Springs",
			"country": "United States",
			"IATA": "UDD",
			"ICAO": "KUDD",
			"lat": "33.748401641846",
			"lng": "-116.27500152588"
		},
		"Scottsdale Airport": {
			"id": "7649",
			"name": "Scottsdale Airport",
			"city": "Scottsdale",
			"country": "United States",
			"IATA": "ZSY",
			"ICAO": "KSDL",
			"lat": "33.622898101807",
			"lng": "-111.91100311279"
		},
		"Olympia Regional Airport": {
			"id": "7650",
			"name": "Olympia Regional Airport",
			"city": "Olympia",
			"country": "United States",
			"IATA": "OLM",
			"ICAO": "KOLM",
			"lat": "46.9693985",
			"lng": "-122.9029999"
		},
		"Yolo County Davis Woodland Winters Airport": {
			"id": "7651",
			"name": "Yolo County Davis Woodland Winters Airport",
			"city": "Davis-Woodland-Winters",
			"country": "United States",
			"IATA": "DWA",
			"ICAO": "KDWA",
			"lat": "38.57910156",
			"lng": "-121.8570023"
		},
		"Garfield County Regional Airport": {
			"id": "7652",
			"name": "Garfield County Regional Airport",
			"city": "Rifle",
			"country": "United States",
			"IATA": "RIL",
			"ICAO": "KRIL",
			"lat": "39.52629852",
			"lng": "-107.7269974"
		},
		"Shively Field": {
			"id": "7653",
			"name": "Shively Field",
			"city": "SARATOGA",
			"country": "United States",
			"IATA": "SAA",
			"ICAO": "KSAA",
			"lat": "41.44490051269531",
			"lng": "-106.8239974975586"
		},
		"DeKalb Peachtree Airport": {
			"id": "7654",
			"name": "DeKalb Peachtree Airport",
			"city": "Atlanta",
			"country": "United States",
			"IATA": "PDK",
			"ICAO": "KPDK",
			"lat": "33.8755989075",
			"lng": "-84.3020019531"
		},
		"Monroe County Airport": {
			"id": "7655",
			"name": "Monroe County Airport",
			"city": "Bloomington",
			"country": "United States",
			"IATA": "BMG",
			"ICAO": "KBMG",
			"lat": "39.145999908447266",
			"lng": "-86.61669921875"
		},
		"Witham Field": {
			"id": "7656",
			"name": "Witham Field",
			"city": "Stuart",
			"country": "United States",
			"IATA": "SUA",
			"ICAO": "KSUA",
			"lat": "27.18169975",
			"lng": "-80.22109985"
		},
		"Morristown Municipal Airport": {
			"id": "7657",
			"name": "Morristown Municipal Airport",
			"city": "Morristown",
			"country": "United States",
			"IATA": "MMU",
			"ICAO": "KMMU",
			"lat": "40.799400329589844",
			"lng": "-74.41490173339844"
		},
		"Napa County Airport": {
			"id": "7658",
			"name": "Napa County Airport",
			"city": "Napa",
			"country": "United States",
			"IATA": "APC",
			"ICAO": "KAPC",
			"lat": "38.2132",
			"lng": "-122.280998"
		},
		"Brown Field Municipal Airport": {
			"id": "7659",
			"name": "Brown Field Municipal Airport",
			"city": "San Diego",
			"country": "United States",
			"IATA": "SDM",
			"ICAO": "KSDM",
			"lat": "32.572299957275",
			"lng": "-116.98000335693"
		},
		"Venice Municipal Airport": {
			"id": "7662",
			"name": "Venice Municipal Airport",
			"city": "Venice",
			"country": "United States",
			"IATA": "VNC",
			"ICAO": "KVNC",
			"lat": "27.071599960327",
			"lng": "-82.440299987793"
		},
		"Palm Beach County Glades Airport": {
			"id": "7663",
			"name": "Palm Beach County Glades Airport",
			"city": "Pahokee",
			"country": "United States",
			"IATA": "PHK",
			"ICAO": "KPHK",
			"lat": "26.78499985",
			"lng": "-80.69339752"
		},
		"Northwest Florida Beaches International Airport": {
			"id": "7669",
			"name": "Northwest Florida Beaches International Airport",
			"city": "Panama City",
			"country": "United States",
			"IATA": "ECP",
			"ICAO": "KECP",
			"lat": "30.357106",
			"lng": "-85.795414"
		},
		"San Bernardino International Airport": {
			"id": "7670",
			"name": "San Bernardino International Airport",
			"city": "San Bernardino",
			"country": "United States",
			"IATA": "SBD",
			"ICAO": "KSBD",
			"lat": "34.0954017639",
			"lng": "-117.23500061"
		},
		"San Carlos Airport": {
			"id": "7683",
			"name": "San Carlos Airport",
			"city": "San Carlos",
			"country": "United States",
			"IATA": "SQL",
			"ICAO": "KSQL",
			"lat": "37.511901855469",
			"lng": "-122.25"
		},
		"Rocky Mount Wilson Regional Airport": {
			"id": "7690",
			"name": "Rocky Mount Wilson Regional Airport",
			"city": "Rocky Mount",
			"country": "United States",
			"IATA": "RWI",
			"ICAO": "KRWI",
			"lat": "35.856300354003906",
			"lng": "-77.89189910888672"
		},
		"Whittier Airport": {
			"id": "7691",
			"name": "Whittier Airport",
			"city": "Whittier",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "PAWR",
			"lat": "60.777198791503906",
			"lng": "-148.7220001220703"
		},
		"Soldotna Airport": {
			"id": "7692",
			"name": "Soldotna Airport",
			"city": "Soldotna",
			"country": "United States",
			"IATA": "SXQ",
			"ICAO": "PASX",
			"lat": "60.47570037841797",
			"lng": "-151.03399658203125"
		},
		"Gillespie Field": {
			"id": "7693",
			"name": "Gillespie Field",
			"city": "El Cajon",
			"country": "United States",
			"IATA": "SEE",
			"ICAO": "KSEE",
			"lat": "32.826198577881",
			"lng": "-116.97200012207"
		},
		"San Clemente Island Naval Auxiliary Landing Field": {
			"id": "7694",
			"name": "San Clemente Island Naval Auxiliary Landing Field",
			"city": "San Clemente Island",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KNUC",
			"lat": "33.02270126",
			"lng": "-118.5879974"
		},
		"Truckee Tahoe Airport": {
			"id": "7702",
			"name": "Truckee Tahoe Airport",
			"city": "Truckee",
			"country": "United States",
			"IATA": "TKF",
			"ICAO": "KTRK",
			"lat": "39.319999694799996",
			"lng": "-120.13999939"
		},
		"Cobb County-Mc Collum Field": {
			"id": "7712",
			"name": "Cobb County-Mc Collum Field",
			"city": "Atlanta",
			"country": "United States",
			"IATA": "RYY",
			"ICAO": "KRYY",
			"lat": "34.01319885",
			"lng": "-84.59860229"
		},
		"Dell Flight Strip": {
			"id": "7716",
			"name": "Dell Flight Strip",
			"city": "Dell",
			"country": "United States",
			"IATA": "4U9",
			"ICAO": "K4U9",
			"lat": "44.7356987",
			"lng": "-112.720001221"
		},
		"Mission Field": {
			"id": "7717",
			"name": "Mission Field",
			"city": "Livingston-Montana",
			"country": "United States",
			"IATA": "LVM",
			"ICAO": "KLVM",
			"lat": "45.6994018555",
			"lng": "-110.447998047"
		},
		"Big Timber Airport": {
			"id": "7720",
			"name": "Big Timber Airport",
			"city": "Big Timber",
			"country": "United States",
			"IATA": "6S0",
			"ICAO": "K6S0",
			"lat": "45.806400299072266",
			"lng": "-109.98100280761719"
		},
		"Tulip City Airport": {
			"id": "7721",
			"name": "Tulip City Airport",
			"city": "Holland",
			"country": "United States",
			"IATA": "BIV",
			"ICAO": "KBIV",
			"lat": "42.742900848389",
			"lng": "-86.107398986816"
		},
		"Monument Valley Airport": {
			"id": "7727",
			"name": "Monument Valley Airport",
			"city": "Monument Valley",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "UT25",
			"lat": "37.016700744599994",
			"lng": "-110.200996399"
		},
		"Lakeland Linder Regional Airport": {
			"id": "7732",
			"name": "Lakeland Linder Regional Airport",
			"city": "Lakeland",
			"country": "United States",
			"IATA": "LAL",
			"ICAO": "KLAL",
			"lat": "27.988899231",
			"lng": "-82.0186004639"
		},
		"Indianola Municipal Airport": {
			"id": "7767",
			"name": "Indianola Municipal Airport",
			"city": "New York",
			"country": "United States",
			"IATA": "IDL",
			"ICAO": "KIDL",
			"lat": "33.485699",
			"lng": "-90.678902"
		},
		"French Valley Airport": {
			"id": "7769",
			"name": "French Valley Airport",
			"city": "Murrieta-Temecula",
			"country": "United States",
			"IATA": "RBK",
			"ICAO": "KF70",
			"lat": "33.5741996765",
			"lng": "-117.127998352"
		},
		"Carl R Keller Field": {
			"id": "7775",
			"name": "Carl R Keller Field",
			"city": "Port Clinton",
			"country": "United States",
			"IATA": "PCW",
			"ICAO": "KPCW",
			"lat": "41.516300201416016",
			"lng": "-82.86869812011719"
		},
		"Dayton-Wright Brothers Airport": {
			"id": "7776",
			"name": "Dayton-Wright Brothers Airport",
			"city": "Dayton",
			"country": "United States",
			"IATA": "MGY",
			"ICAO": "KMGY",
			"lat": "39.5890007019",
			"lng": "-84.224899292"
		},
		"Richmond Municipal Airport": {
			"id": "7777",
			"name": "Richmond Municipal Airport",
			"city": "Richmond",
			"country": "United States",
			"IATA": "RID",
			"ICAO": "KRID",
			"lat": "39.757198333740234",
			"lng": "-84.8427963256836"
		},
		"Findlay Airport": {
			"id": "7778",
			"name": "Findlay Airport",
			"city": "Findley",
			"country": "United States",
			"IATA": "FDY",
			"ICAO": "KFDY",
			"lat": "41.013500213600004",
			"lng": "-83.66870117190001"
		},
		"Black Hills Airport-Clyde Ice Field": {
			"id": "7809",
			"name": "Black Hills Airport-Clyde Ice Field",
			"city": "Spearfish-South Dakota",
			"country": "United States",
			"IATA": "SPF",
			"ICAO": "KSPF",
			"lat": "44.48030090332",
			"lng": "-103.78299713135"
		},
		"Olive Branch Airport": {
			"id": "7817",
			"name": "Olive Branch Airport",
			"city": "Olive Branch",
			"country": "United States",
			"IATA": "OLV",
			"ICAO": "KOLV",
			"lat": "34.9786987305",
			"lng": "-89.78690338130001"
		},
		"Rocky Mountain Metropolitan Airport": {
			"id": "7822",
			"name": "Rocky Mountain Metropolitan Airport",
			"city": "Broomfield-CO",
			"country": "United States",
			"IATA": "BJC",
			"ICAO": "KBJC",
			"lat": "39.90879822",
			"lng": "-105.1169968"
		},
		"Salem Municipal Airport/McNary Field": {
			"id": "7826",
			"name": "Salem Municipal Airport/McNary Field",
			"city": "Salem",
			"country": "United States",
			"IATA": "SLE",
			"ICAO": "KSLE",
			"lat": "44.90950012",
			"lng": "-123.0029984"
		},
		"Tunica Municipal Airport": {
			"id": "7827",
			"name": "Tunica Municipal Airport",
			"city": "Tunica",
			"country": "United States",
			"IATA": "UTM",
			"ICAO": "KUTA",
			"lat": "34.680999755859",
			"lng": "-90.346702575684"
		},
		"Lawrence J Timmerman Airport": {
			"id": "7839",
			"name": "Lawrence J Timmerman Airport",
			"city": "Milwaukee",
			"country": "United States",
			"IATA": "MWC",
			"ICAO": "KMWC",
			"lat": "43.11040115356445",
			"lng": "-88.0344009399414"
		},
		"Southern Wisconsin Regional Airport": {
			"id": "7840",
			"name": "Southern Wisconsin Regional Airport",
			"city": "Janesville",
			"country": "United States",
			"IATA": "JVL",
			"ICAO": "KJVL",
			"lat": "42.620300293",
			"lng": "-89.0416030884"
		},
		"Arlington Municipal Airport": {
			"id": "11141",
			"name": "Arlington Municipal Airport",
			"city": "Arlington",
			"country": "United States",
			"IATA": "AWO",
			"ICAO": "KAWO",
			"lat": "48.16070175",
			"lng": "-122.1589966"
		},
		"Gwinnett County Briscoe Field": {
			"id": "7847",
			"name": "Gwinnett County Briscoe Field",
			"city": "Lawrenceville",
			"country": "United States",
			"IATA": "LZU",
			"ICAO": "KLZU",
			"lat": "33.97809982",
			"lng": "-83.96240234"
		},
		"Bowling Green Warren County Regional Airport": {
			"id": "7848",
			"name": "Bowling Green Warren County Regional Airport",
			"city": "Bowling Green",
			"country": "United States",
			"IATA": "BWG",
			"ICAO": "KBWG",
			"lat": "36.964500427199994",
			"lng": "-86.41970062259999"
		},
		"Richard Lloyd Jones Jr Airport": {
			"id": "7849",
			"name": "Richard Lloyd Jones Jr Airport",
			"city": "Tulsa",
			"country": "United States",
			"IATA": "RVS",
			"ICAO": "KRVS",
			"lat": "36.039600372314",
			"lng": "-95.984596252441"
		},
		"Bryce Canyon Airport": {
			"id": "7857",
			"name": "Bryce Canyon Airport",
			"city": "Bryce Canyon",
			"country": "United States",
			"IATA": "BCE",
			"ICAO": "KBCE",
			"lat": "37.706401825",
			"lng": "-112.144996643"
		},
		"Burlington Alamance Regional Airport": {
			"id": "7859",
			"name": "Burlington Alamance Regional Airport",
			"city": "Burlington",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KBUY",
			"lat": "36.048500061035156",
			"lng": "-79.47489929199219"
		},
		"New Century Aircenter Airport": {
			"id": "7869",
			"name": "New Century Aircenter Airport",
			"city": "Olathe",
			"country": "United States",
			"IATA": "JCI",
			"ICAO": "KIXD",
			"lat": "38.8308982849",
			"lng": "-94.890296936"
		},
		"Easton Newnam Field": {
			"id": "7870",
			"name": "Easton Newnam Field",
			"city": "Easton",
			"country": "United States",
			"IATA": "ESN",
			"ICAO": "KESN",
			"lat": "38.8041992188",
			"lng": "-76.06900024410001"
		},
		"Yuba County Airport": {
			"id": "7875",
			"name": "Yuba County Airport",
			"city": "Yuba City",
			"country": "United States",
			"IATA": "MYV",
			"ICAO": "KMYV",
			"lat": "39.09780121",
			"lng": "-121.5699997"
		},
		"Halliburton Field": {
			"id": "7880",
			"name": "Halliburton Field",
			"city": "Duncan",
			"country": "United States",
			"IATA": "DUC",
			"ICAO": "KDUC",
			"lat": "34.47090149",
			"lng": "-97.9598999"
		},
		"Garner Field": {
			"id": "7885",
			"name": "Garner Field",
			"city": "Uvalde",
			"country": "United States",
			"IATA": "UVA",
			"ICAO": "KUVA",
			"lat": "29.2112998962",
			"lng": "-99.743598938"
		},
		"Lewis University Airport": {
			"id": "7886",
			"name": "Lewis University Airport",
			"city": "Lockport",
			"country": "United States",
			"IATA": "LOT",
			"ICAO": "KLOT",
			"lat": "41.6072998",
			"lng": "-88.09619904"
		},
		"Buchanan Field": {
			"id": "7888",
			"name": "Buchanan Field",
			"city": "Concord",
			"country": "United States",
			"IATA": "CCR",
			"ICAO": "KCCR",
			"lat": "37.9897003174",
			"lng": "-122.056999207"
		},
		"Ocean Reef Club Airport": {
			"id": "7889",
			"name": "Ocean Reef Club Airport",
			"city": "Ocean Reef Club Airport",
			"country": "United States",
			"IATA": "OCA",
			"ICAO": "07FA",
			"lat": "25.325399398804",
			"lng": "-80.274803161621"
		},
		"Ohio University Snyder Field": {
			"id": "7907",
			"name": "Ohio University Snyder Field",
			"city": "Athens",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KUNI",
			"lat": "39.2109985352",
			"lng": "-82.23139953610001"
		},
		"Springfield-Beckley Municipal Airport": {
			"id": "7908",
			"name": "Springfield-Beckley Municipal Airport",
			"city": "Springfield",
			"country": "United States",
			"IATA": "SGH",
			"ICAO": "KSGH",
			"lat": "39.840301513672",
			"lng": "-83.840202331543"
		},
		"Philip Billard Municipal Airport": {
			"id": "7925",
			"name": "Philip Billard Municipal Airport",
			"city": "Topeka",
			"country": "United States",
			"IATA": "TOP",
			"ICAO": "KTOP",
			"lat": "39.068698883057",
			"lng": "-95.622497558594"
		},
		"Benson Airstrip": {
			"id": "7928",
			"name": "Benson Airstrip",
			"city": "Uvalde",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "2XS8",
			"lat": "29.229400634765625",
			"lng": "-99.82389831542969"
		},
		"Rough River State Park Airport": {
			"id": "7929",
			"name": "Rough River State Park Airport",
			"city": "Null",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "K2I3",
			"lat": "37.610022",
			"lng": "-86.507262"
		},
		"Smyrna Airport": {
			"id": "7930",
			"name": "Smyrna Airport",
			"city": "Smyrna",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KMQY",
			"lat": "36.0089988708",
			"lng": "-86.5201034546"
		},
		"Franklin County Airport": {
			"id": "7931",
			"name": "Franklin County Airport",
			"city": "Sewanee",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KUOS",
			"lat": "35.205101013184",
			"lng": "-85.898101806641"
		},
		"Collin County Regional At Mc Kinney Airport": {
			"id": "7935",
			"name": "Collin County Regional At Mc Kinney Airport",
			"city": "DALLAS",
			"country": "United States",
			"IATA": "TKI",
			"ICAO": "KTKI",
			"lat": "33.17789841",
			"lng": "-96.59049988"
		},
		"Chicago Executive Airport": {
			"id": "7936",
			"name": "Chicago Executive Airport",
			"city": "Chicago-Wheeling",
			"country": "United States",
			"IATA": "PWK",
			"ICAO": "KPWK",
			"lat": "42.114222",
			"lng": "-87.901494"
		},
		"Southwest Washington Regional Airport": {
			"id": "7938",
			"name": "Southwest Washington Regional Airport",
			"city": "Kelso",
			"country": "United States",
			"IATA": "KLS",
			"ICAO": "KKLS",
			"lat": "46.11800003049999",
			"lng": "-122.898002625"
		},
		"Wilmington Airpark": {
			"id": "7978",
			"name": "Wilmington Airpark",
			"city": "Wilmington",
			"country": "United States",
			"IATA": "ILN",
			"ICAO": "KILN",
			"lat": "39.427898407",
			"lng": "-83.792098999"
		},
		"Marana Regional Airport": {
			"id": "7979",
			"name": "Marana Regional Airport",
			"city": "Tucson",
			"country": "United States",
			"IATA": "AVW",
			"ICAO": "KAVQ",
			"lat": "32.4095993042",
			"lng": "-111.218002319"
		},
		"Casa Grande Municipal Airport": {
			"id": "7980",
			"name": "Casa Grande Municipal Airport",
			"city": "Casa Grande",
			"country": "United States",
			"IATA": "CGZ",
			"ICAO": "KCGZ",
			"lat": "32.954899",
			"lng": "-111.766998"
		},
		"Mobile Airport": {
			"id": "7981",
			"name": "Mobile Airport",
			"city": "Mobile",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "1AZ0",
			"lat": "33.111900329589844",
			"lng": "-112.26899719238281"
		},
		"Buckeye Municipal Airport": {
			"id": "7982",
			"name": "Buckeye Municipal Airport",
			"city": "Buckeye",
			"country": "United States",
			"IATA": "BXK",
			"ICAO": "KBXK",
			"lat": "33.42039871",
			"lng": "-112.685997"
		},
		"Gila Bend Municipal Airport": {
			"id": "7983",
			"name": "Gila Bend Municipal Airport",
			"city": "Gila Bend",
			"country": "United States",
			"IATA": "E63",
			"ICAO": "KE63",
			"lat": "32.95809937",
			"lng": "-112.6780014"
		},
		"McMinn County Airport": {
			"id": "7984",
			"name": "McMinn County Airport",
			"city": "Athens",
			"country": "United States",
			"IATA": "MMI",
			"ICAO": "KMMI",
			"lat": "35.39730072",
			"lng": "-84.56259918"
		},
		"Sterling Municipal Airport": {
			"id": "7985",
			"name": "Sterling Municipal Airport",
			"city": "Sterling",
			"country": "United States",
			"IATA": "STK",
			"ICAO": "KSTK",
			"lat": "40.61529922",
			"lng": "-103.2649994"
		},
		"Rawlins Municipal Airport/Harvey Field": {
			"id": "7986",
			"name": "Rawlins Municipal Airport/Harvey Field",
			"city": "Rawlins",
			"country": "United States",
			"IATA": "RWL",
			"ICAO": "KRWL",
			"lat": "41.80559921",
			"lng": "-107.1999969"
		},
		"Essex County Airport": {
			"id": "7990",
			"name": "Essex County Airport",
			"city": "Caldwell",
			"country": "United States",
			"IATA": "CDW",
			"ICAO": "KCDW",
			"lat": "40.875198364300005",
			"lng": "-74.2814025879"
		},
		"Lee C Fine Memorial Airport": {
			"id": "7991",
			"name": "Lee C Fine Memorial Airport",
			"city": "Kaiser Lake Ozark",
			"country": "United States",
			"IATA": "AIZ",
			"ICAO": "KAIZ",
			"lat": "38.0960006714",
			"lng": "-92.54949951170002"
		},
		"Thomasville Regional Airport": {
			"id": "7998",
			"name": "Thomasville Regional Airport",
			"city": "Thomasville",
			"country": "United States",
			"IATA": "TVI",
			"ICAO": "KTVI",
			"lat": "30.901599884033",
			"lng": "-83.881301879883"
		},
		"Henderson Executive Airport": {
			"id": "7999",
			"name": "Henderson Executive Airport",
			"city": "Henderson",
			"country": "United States",
			"IATA": "HSH",
			"ICAO": "KHND",
			"lat": "35.9728012085",
			"lng": "-115.134002686"
		},
		"Henry Tift Myers Airport": {
			"id": "8005",
			"name": "Henry Tift Myers Airport",
			"city": "Tifton",
			"country": "United States",
			"IATA": "TMA",
			"ICAO": "KTMA",
			"lat": "31.4290008545",
			"lng": "-83.4885025024"
		},
		"Phoenix Deer Valley Airport": {
			"id": "8030",
			"name": "Phoenix Deer Valley Airport",
			"city": "Phoenix ",
			"country": "United States",
			"IATA": "DVT",
			"ICAO": "KDVT",
			"lat": "33.6883010864",
			"lng": "-112.083000183"
		},
		"Republic Airport": {
			"id": "8034",
			"name": "Republic Airport",
			"city": "Farmingdale",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KFRG",
			"lat": "40.7288017273",
			"lng": "-73.4133987427"
		},
		"South Texas Regional Airport at Hondo": {
			"id": "8042",
			"name": "South Texas Regional Airport at Hondo",
			"city": "Hondo",
			"country": "United States",
			"IATA": "HDO",
			"ICAO": "KHDO",
			"lat": "29.35950088501",
			"lng": "-99.176696777344"
		},
		"McKinley National Park Airport": {
			"id": "8050",
			"name": "McKinley National Park Airport",
			"city": "McKinley Park",
			"country": "United States",
			"IATA": "MCL",
			"ICAO": "PAIN",
			"lat": "63.7326011658",
			"lng": "-148.910995483"
		},
		"Lake Hood Seaplane Base": {
			"id": "8051",
			"name": "Lake Hood Seaplane Base",
			"city": "Anchorage",
			"country": "United States",
			"IATA": "LHD",
			"ICAO": "PALH",
			"lat": "61.18000030517578",
			"lng": "-149.9720001220703"
		},
		"Prospect Creek Airport": {
			"id": "8052",
			"name": "Prospect Creek Airport",
			"city": "Prospect Creek",
			"country": "United States",
			"IATA": "PPC",
			"ICAO": "PAPR",
			"lat": "66.814102172852",
			"lng": "-150.64399719238"
		},
		"Wheeling Ohio County Airport": {
			"id": "8062",
			"name": "Wheeling Ohio County Airport",
			"city": "Wheeling",
			"country": "United States",
			"IATA": "HLG",
			"ICAO": "KHLG",
			"lat": "40.1749992371",
			"lng": "-80.6463012695"
		},
		"Fitzgerald Municipal Airport": {
			"id": "8063",
			"name": "Fitzgerald Municipal Airport",
			"city": "Fitzgerald",
			"country": "United States",
			"IATA": "FZG",
			"ICAO": "KFZG",
			"lat": "31.683700561523438",
			"lng": "-83.27050018310547"
		},
		"Aransas County Airport": {
			"id": "8077",
			"name": "Aransas County Airport",
			"city": "Rockport",
			"country": "United States",
			"IATA": "RKP",
			"ICAO": "KRKP",
			"lat": "28.0867996216",
			"lng": "-97.0446014404"
		},
		"Crisp County Cordele Airport": {
			"id": "8117",
			"name": "Crisp County Cordele Airport",
			"city": "Cordele",
			"country": "United States",
			"IATA": "CKF",
			"ICAO": "KCKF",
			"lat": "31.98880005",
			"lng": "-83.77390289"
		},
		"Ormond Beach Municipal Airport": {
			"id": "8118",
			"name": "Ormond Beach Municipal Airport",
			"city": "Ormond Beach",
			"country": "United States",
			"IATA": "OMN",
			"ICAO": "KOMN",
			"lat": "29.300600051879883",
			"lng": "-81.11360168457031"
		},
		"Portland Troutdale Airport": {
			"id": "8121",
			"name": "Portland Troutdale Airport",
			"city": "Troutdale",
			"country": "United States",
			"IATA": "TTD",
			"ICAO": "KTTD",
			"lat": "45.54940032959",
			"lng": "-122.40100097656"
		},
		"Portland Hillsboro Airport": {
			"id": "8122",
			"name": "Portland Hillsboro Airport",
			"city": "Hillsboro",
			"country": "United States",
			"IATA": "HIO",
			"ICAO": "KHIO",
			"lat": "45.540401",
			"lng": "-122.949997"
		},
		"One Police Plaza Heliport": {
			"id": "8123",
			"name": "One Police Plaza Heliport",
			"city": "New York",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "NK39",
			"lat": "40.71260070800781",
			"lng": "-73.99960327148438"
		},
		"Bend Municipal Airport": {
			"id": "8133",
			"name": "Bend Municipal Airport",
			"city": "Bend",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KBDN",
			"lat": "44.09479904",
			"lng": "-121.2009964"
		},
		"Christmas Valley Airport": {
			"id": "8134",
			"name": "Christmas Valley Airport",
			"city": "Christmas Valley",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "K62S",
			"lat": "43.23649978637695",
			"lng": "-120.66600036621094"
		},
		"Burns Municipal Airport": {
			"id": "8135",
			"name": "Burns Municipal Airport",
			"city": "Burns",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KBNO",
			"lat": "43.5918998718",
			"lng": "-118.955001831"
		},
		"Prineville Airport": {
			"id": "8136",
			"name": "Prineville Airport",
			"city": "Prineville",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KS39",
			"lat": "44.286998748779",
			"lng": "-120.90399932861"
		},
		"Red Bluff Municipal Airport": {
			"id": "8137",
			"name": "Red Bluff Municipal Airport",
			"city": "Red Bluff",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KRBL",
			"lat": "40.1506996155",
			"lng": "-122.251998901"
		},
		"Marin County Airport - Gnoss Field": {
			"id": "8138",
			"name": "Marin County Airport - Gnoss Field",
			"city": "Novato",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KDVO",
			"lat": "38.143600463867",
			"lng": "-122.55599975586"
		},
		"Lake County Airport": {
			"id": "8139",
			"name": "Lake County Airport",
			"city": "Lakeview",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KLKV",
			"lat": "42.161098480199996",
			"lng": "-120.399002075"
		},
		"Tillamook Airport": {
			"id": "8140",
			"name": "Tillamook Airport",
			"city": "Tillamook",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KTMK",
			"lat": "45.4182014465",
			"lng": "-123.814002991"
		},
		"Ontario Municipal Airport": {
			"id": "8141",
			"name": "Ontario Municipal Airport",
			"city": "Ontario",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KONO",
			"lat": "44.020500183105",
			"lng": "-117.01399993896"
		},
		"Columbia Gorge Regional the Dalles Municipal Airport": {
			"id": "8142",
			"name": "Columbia Gorge Regional the Dalles Municipal Airport",
			"city": "The Dalles",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KDLS",
			"lat": "45.6184997559",
			"lng": "-121.166999817"
		},
		"Montgomery County Airpark": {
			"id": "8143",
			"name": "Montgomery County Airpark",
			"city": "Gaithersburg",
			"country": "United States",
			"IATA": "GAI",
			"ICAO": "KGAI",
			"lat": "39.168300628699996",
			"lng": "-77.1660003662"
		},
		"Charlevoix Municipal Airport": {
			"id": "8162",
			"name": "Charlevoix Municipal Airport",
			"city": "Charelvoix",
			"country": "United States",
			"IATA": "CVX",
			"ICAO": "KCVX",
			"lat": "45.3047981262207",
			"lng": "-85.2748031616211"
		},
		"Flagler County Airport": {
			"id": "8182",
			"name": "Flagler County Airport",
			"city": "Flagler",
			"country": "United States",
			"IATA": "XFL",
			"ICAO": "KXFL",
			"lat": "29.4673996",
			"lng": "-81.20629883"
		},
		"Morrisville Stowe State Airport": {
			"id": "8187",
			"name": "Morrisville Stowe State Airport",
			"city": "Morrisville",
			"country": "United States",
			"IATA": "MVL",
			"ICAO": "KMVL",
			"lat": "44.53459930419999",
			"lng": "-72.6139984131"
		},
		"Dallas Executive Airport": {
			"id": "8188",
			"name": "Dallas Executive Airport",
			"city": "Dallas",
			"country": "United States",
			"IATA": "RBD",
			"ICAO": "KRBD",
			"lat": "32.6809005737",
			"lng": "-96.8682022095"
		},
		"Westerly State Airport": {
			"id": "8194",
			"name": "Westerly State Airport",
			"city": "Washington County",
			"country": "United States",
			"IATA": "WST",
			"ICAO": "KWST",
			"lat": "41.3496017456",
			"lng": "-71.8033981323"
		},
		"Block Island State Airport": {
			"id": "8195",
			"name": "Block Island State Airport",
			"city": "Block Island",
			"country": "United States",
			"IATA": "BID",
			"ICAO": "KBID",
			"lat": "41.1680984497",
			"lng": "-71.577796936"
		},
		"Nightmute Airport": {
			"id": "8199",
			"name": "Nightmute Airport",
			"city": "Nightmute",
			"country": "United States",
			"IATA": "NME",
			"ICAO": "PAGT",
			"lat": "60.471000671387",
			"lng": "-164.70100402832"
		},
		"Toksook Bay Airport": {
			"id": "8200",
			"name": "Toksook Bay Airport",
			"city": "Toksook Bay",
			"country": "United States",
			"IATA": "OOK",
			"ICAO": "PAOO",
			"lat": "60.54140091",
			"lng": "-165.0870056"
		},
		"Decatur County Industrial Air Park": {
			"id": "8215",
			"name": "Decatur County Industrial Air Park",
			"city": "Bainbridge",
			"country": "United States",
			"IATA": "BGE",
			"ICAO": "KBGE",
			"lat": "30.9715004",
			"lng": "-84.63739777"
		},
		"Silver Springs Airport": {
			"id": "8219",
			"name": "Silver Springs Airport",
			"city": "Silver Springs",
			"country": "United States",
			"IATA": "SPZ",
			"ICAO": "KSPZ",
			"lat": "39.40299987792969",
			"lng": "-119.2509994506836"
		},
		"Whiteman Airport": {
			"id": "8220",
			"name": "Whiteman Airport",
			"city": "Los Angeles",
			"country": "United States",
			"IATA": "WHP",
			"ICAO": "KWHP",
			"lat": "34.2593002319",
			"lng": "-118.413002014"
		},
		"Madera Municipal Airport": {
			"id": "8221",
			"name": "Madera Municipal Airport",
			"city": "Madera",
			"country": "United States",
			"IATA": "MAE",
			"ICAO": "KMAE",
			"lat": "36.9886016846",
			"lng": "-120.111999512"
		},
		"Apalachicola Regional Airport": {
			"id": "8252",
			"name": "Apalachicola Regional Airport",
			"city": "Apalachicola",
			"country": "United States",
			"IATA": "AAF",
			"ICAO": "KAAF",
			"lat": "29.72750092",
			"lng": "-85.02749634"
		},
		"St Lucie County International Airport": {
			"id": "8274",
			"name": "St Lucie County International Airport",
			"city": "Fort Pierce",
			"country": "United States",
			"IATA": "FRP",
			"ICAO": "KFPR",
			"lat": "27.49510002",
			"lng": "-80.36830139"
		},
		"Taunton Municipal King Field": {
			"id": "8276",
			"name": "Taunton Municipal King Field",
			"city": "Taunton",
			"country": "United States",
			"IATA": "TAN",
			"ICAO": "KTAN",
			"lat": "41.8744010925293",
			"lng": "-71.0166015625"
		},
		"Plymouth Municipal Airport": {
			"id": "8277",
			"name": "Plymouth Municipal Airport",
			"city": "Plymouth",
			"country": "United States",
			"IATA": "PYM",
			"ICAO": "KPYM",
			"lat": "41.909000396728516",
			"lng": "-70.72879791259766"
		},
		"Quonset State Airport": {
			"id": "8278",
			"name": "Quonset State Airport",
			"city": "North Kingstown",
			"country": "United States",
			"IATA": "OQU",
			"ICAO": "KOQU",
			"lat": "41.597099304199",
			"lng": "-71.412101745605"
		},
		"Norwood Memorial Airport": {
			"id": "8280",
			"name": "Norwood Memorial Airport",
			"city": "Norwood",
			"country": "United States",
			"IATA": "OWD",
			"ICAO": "KOWD",
			"lat": "42.1904983521",
			"lng": "-71.1728973389"
		},
		"Barnes Municipal Airport": {
			"id": "8281",
			"name": "Barnes Municipal Airport",
			"city": "Westfield",
			"country": "United States",
			"IATA": "BAF",
			"ICAO": "KBAF",
			"lat": "42.157799",
			"lng": "-72.715599"
		},
		"Windham Airport": {
			"id": "8282",
			"name": "Windham Airport",
			"city": "Willimantic",
			"country": "United States",
			"IATA": "IJD",
			"ICAO": "KIJD",
			"lat": "41.74399948120117",
			"lng": "-72.1802978515625"
		},
		"Orange County Airport": {
			"id": "8283",
			"name": "Orange County Airport",
			"city": "Montgomery",
			"country": "United States",
			"IATA": "MGJ",
			"ICAO": "KMGJ",
			"lat": "41.50999832",
			"lng": "-74.26460266"
		},
		"Marshfield Municipal George Harlow Field": {
			"id": "8285",
			"name": "Marshfield Municipal George Harlow Field",
			"city": "Marshfield",
			"country": "United States",
			"IATA": "GHG",
			"ICAO": "KGHG",
			"lat": "42.09830093383789",
			"lng": "-70.67220306396484"
		},
		"Danbury Municipal Airport": {
			"id": "8286",
			"name": "Danbury Municipal Airport",
			"city": "Danbury",
			"country": "United States",
			"IATA": "DXR",
			"ICAO": "KDXR",
			"lat": "41.371498107899995",
			"lng": "-73.48220062259999"
		},
		"Boire Field": {
			"id": "8287",
			"name": "Boire Field",
			"city": "Nashua",
			"country": "United States",
			"IATA": "ASH",
			"ICAO": "KASH",
			"lat": "42.7817001343",
			"lng": "-71.51480102539999"
		},
		"Lawrence Municipal Airport": {
			"id": "8366",
			"name": "Lawrence Municipal Airport",
			"city": "Lawrence",
			"country": "United States",
			"IATA": "LWC",
			"ICAO": "KLWC",
			"lat": "39.01119995",
			"lng": "-95.21659851"
		},
		"Waterbury Oxford Airport": {
			"id": "8289",
			"name": "Waterbury Oxford Airport",
			"city": "Oxford",
			"country": "United States",
			"IATA": "OXC",
			"ICAO": "KOXC",
			"lat": "41.47859954834",
			"lng": "-73.135200500488"
		},
		"Fitchburg Municipal Airport": {
			"id": "8290",
			"name": "Fitchburg Municipal Airport",
			"city": "Fitchburg",
			"country": "United States",
			"IATA": "FIT",
			"ICAO": "KFIT",
			"lat": "42.554100036621094",
			"lng": "-71.75900268554688"
		},
		"Earl L. Small Jr. Field/Stockmar Airport": {
			"id": "8291",
			"name": "Earl L. Small Jr. Field/Stockmar Airport",
			"city": "Villa Rica",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "20GA",
			"lat": "33.756500244099996",
			"lng": "-84.88469696039999"
		},
		"Cartersville Airport": {
			"id": "8292",
			"name": "Cartersville Airport",
			"city": "Cartersville",
			"country": "United States",
			"IATA": "VPC",
			"ICAO": "KVPC",
			"lat": "34.12310028076172",
			"lng": "-84.84870147705078"
		},
		"Centre-Piedmont-Cherokee County Regional Airport": {
			"id": "8293",
			"name": "Centre-Piedmont-Cherokee County Regional Airport",
			"city": "Centre",
			"country": "United States",
			"IATA": "PYP",
			"ICAO": "KPYP",
			"lat": "34.089977",
			"lng": "-85.610069"
		},
		"Richard B Russell Airport": {
			"id": "8294",
			"name": "Richard B Russell Airport",
			"city": "Rome",
			"country": "United States",
			"IATA": "RMG",
			"ICAO": "KRMG",
			"lat": "34.3506011963",
			"lng": "-85.15799713130001"
		},
		"Northeast Alabama Regional Airport": {
			"id": "8295",
			"name": "Northeast Alabama Regional Airport",
			"city": "Gadsden",
			"country": "United States",
			"IATA": "GAD",
			"ICAO": "KGAD",
			"lat": "33.972599",
			"lng": "-86.088996"
		},
		"Knoxville Downtown Island Airport": {
			"id": "8296",
			"name": "Knoxville Downtown Island Airport",
			"city": "Knoxville",
			"country": "United States",
			"IATA": "DKX",
			"ICAO": "KDKX",
			"lat": "35.96390151977539",
			"lng": "-83.8739013671875"
		},
		"Barrow County Airport": {
			"id": "8297",
			"name": "Barrow County Airport",
			"city": "Winder",
			"country": "United States",
			"IATA": "WDR",
			"ICAO": "KWDR",
			"lat": "33.98289871",
			"lng": "-83.66739655"
		},
		"Plantation Airpark": {
			"id": "8298",
			"name": "Plantation Airpark",
			"city": "Sylvania",
			"country": "United States",
			"IATA": "JYL",
			"ICAO": "KJYL",
			"lat": "32.645301818847656",
			"lng": "-81.59709930419922"
		},
		"Dalton Municipal Airport": {
			"id": "8299",
			"name": "Dalton Municipal Airport",
			"city": "Dalton",
			"country": "United States",
			"IATA": "DNN",
			"ICAO": "KDNN",
			"lat": "34.72290039",
			"lng": "-84.87020111"
		},
		"West Georgia Regional O V Gray Field": {
			"id": "8300",
			"name": "West Georgia Regional O V Gray Field",
			"city": "Carrollton",
			"country": "United States",
			"IATA": "CTJ",
			"ICAO": "KCTJ",
			"lat": "33.63100051879883",
			"lng": "-85.1520004272461"
		},
		"Lagrange Callaway Airport": {
			"id": "8302",
			"name": "Lagrange Callaway Airport",
			"city": "LaGrange",
			"country": "United States",
			"IATA": "LGC",
			"ICAO": "KLGC",
			"lat": "33.0088996887",
			"lng": "-85.0726013184"
		},
		"Baldwin County Airport": {
			"id": "8303",
			"name": "Baldwin County Airport",
			"city": "Milledgeville",
			"country": "United States",
			"IATA": "MLJ",
			"ICAO": "KMLJ",
			"lat": "33.15420151",
			"lng": "-83.24069977"
		},
		"Harris County Airport": {
			"id": "8305",
			"name": "Harris County Airport",
			"city": "Pine Mountain",
			"country": "United States",
			"IATA": "PIM",
			"ICAO": "KPIM",
			"lat": "32.8406982422",
			"lng": "-84.8824005127"
		},
		"Peachtree City Falcon Field": {
			"id": "8306",
			"name": "Peachtree City Falcon Field",
			"city": "Atlanta",
			"country": "United States",
			"IATA": "FFC",
			"ICAO": "KFFC",
			"lat": "33.3572998046875",
			"lng": "-84.5718002319336"
		},
		"Lee Gilmer Memorial Airport": {
			"id": "8308",
			"name": "Lee Gilmer Memorial Airport",
			"city": "Gainesville",
			"country": "United States",
			"IATA": "GVL",
			"ICAO": "KGVL",
			"lat": "34.27259827",
			"lng": "-83.8302002"
		},
		"Harry Clever Field": {
			"id": "8312",
			"name": "Harry Clever Field",
			"city": "New Philadelpha",
			"country": "United States",
			"IATA": "PHD",
			"ICAO": "KPHD",
			"lat": "40.470901489258",
			"lng": "-81.419700622559"
		},
		"Darlington County Jetport Airport": {
			"id": "8313",
			"name": "Darlington County Jetport Airport",
			"city": "Darlington",
			"country": "United States",
			"IATA": "UDG",
			"ICAO": "KUDG",
			"lat": "34.44940186",
			"lng": "-79.89009857"
		},
		"Hilton Head Airport": {
			"id": "8314",
			"name": "Hilton Head Airport",
			"city": "Hilton Head Island",
			"country": "United States",
			"IATA": "HHH",
			"ICAO": "KHXD",
			"lat": "32.2243995667",
			"lng": "-80.6975021362"
		},
		"Daniel Field": {
			"id": "8318",
			"name": "Daniel Field",
			"city": "Augusta",
			"country": "United States",
			"IATA": "DNL",
			"ICAO": "KDNL",
			"lat": "33.4664993286",
			"lng": "-82.0393981934"
		},
		"Foothills Regional Airport": {
			"id": "8319",
			"name": "Foothills Regional Airport",
			"city": "Morganton",
			"country": "United States",
			"IATA": "MRN",
			"ICAO": "KMRN",
			"lat": "35.8202018737793",
			"lng": "-81.61139678955078"
		},
		"Pike County-Hatcher Field": {
			"id": "8320",
			"name": "Pike County-Hatcher Field",
			"city": "Pikeville",
			"country": "United States",
			"IATA": "PBX",
			"ICAO": "KPBX",
			"lat": "37.5617981",
			"lng": "-82.56639862"
		},
		"Mallards Landing Airport": {
			"id": "8321",
			"name": "Mallards Landing Airport",
			"city": "Locust Grove",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "GA04",
			"lat": "33.365699768066406",
			"lng": "-84.16519927978516"
		},
		"Toccoa Airport - R.G. Letourneau Field": {
			"id": "8322",
			"name": "Toccoa Airport - R.G. Letourneau Field",
			"city": "Toccoa",
			"country": "United States",
			"IATA": "TOC",
			"ICAO": "KTOC",
			"lat": "34.59379959",
			"lng": "-83.29579926"
		},
		"Fort Worth Alliance Airport": {
			"id": "8342",
			"name": "Fort Worth Alliance Airport",
			"city": "Fort Worth",
			"country": "United States",
			"IATA": "AFW",
			"ICAO": "KAFW",
			"lat": "32.9875984192",
			"lng": "-97.31880187990001"
		},
		"East Troy Municipal Airport": {
			"id": "8343",
			"name": "East Troy Municipal Airport",
			"city": "East Troy",
			"country": "United States",
			"IATA": "57C",
			"ICAO": "K57C",
			"lat": "42.79719924926758",
			"lng": "-88.37259674072266"
		},
		"Wellington Municipal Airport": {
			"id": "8367",
			"name": "Wellington Municipal Airport",
			"city": "Wellington",
			"country": "United States",
			"IATA": "EGT",
			"ICAO": "KEGT",
			"lat": "37.32360076904297",
			"lng": "-97.38829803466797"
		},
		"Pompano Beach Airpark": {
			"id": "8379",
			"name": "Pompano Beach Airpark",
			"city": "Pompano Beach",
			"country": "United States",
			"IATA": "PMP",
			"ICAO": "KPMP",
			"lat": "26.247100830078",
			"lng": "-80.111099243164"
		},
		"Shelby County Airport": {
			"id": "9305",
			"name": "Shelby County Airport",
			"city": "Shelbyville",
			"country": "United States",
			"IATA": "2H0",
			"ICAO": "K2H0",
			"lat": "39.410400390599996",
			"lng": "-88.8453979492"
		},
		"Sky Ranch At Carefree Airport": {
			"id": "8397",
			"name": "Sky Ranch At Carefree Airport",
			"city": "Carefree",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "18AZ",
			"lat": "33.81809997558594",
			"lng": "-111.89800262451172"
		},
		"Indianapolis Metropolitan Airport": {
			"id": "8409",
			"name": "Indianapolis Metropolitan Airport",
			"city": "Indianapolis",
			"country": "United States",
			"IATA": "UMP",
			"ICAO": "KUMP",
			"lat": "39.93519974",
			"lng": "-86.04499817"
		},
		"London-Corbin Airport/Magee Field": {
			"id": "8410",
			"name": "London-Corbin Airport/Magee Field",
			"city": "London",
			"country": "United States",
			"IATA": "LOZ",
			"ICAO": "KLOZ",
			"lat": "37.0821990967",
			"lng": "-84.08489990230001"
		},
		"Simmons Army Air Field": {
			"id": "8412",
			"name": "Simmons Army Air Field",
			"city": "Fredericksburg",
			"country": "United States",
			"IATA": "FBG",
			"ICAO": "KFBG",
			"lat": "35.13180161",
			"lng": "-78.93669891"
		},
		"John H Batten Airport": {
			"id": "8430",
			"name": "John H Batten Airport",
			"city": "Racine",
			"country": "United States",
			"IATA": "RAC",
			"ICAO": "KRAC",
			"lat": "42.7606010437",
			"lng": "-87.8152008057"
		},
		"Redlands Municipal Airport": {
			"id": "8443",
			"name": "Redlands Municipal Airport",
			"city": "Redlands",
			"country": "United States",
			"IATA": "REI",
			"ICAO": "KREI",
			"lat": "34.08530044555664",
			"lng": "-117.14600372314453"
		},
		"Flabob Airport": {
			"id": "8445",
			"name": "Flabob Airport",
			"city": "Riverside",
			"country": "United States",
			"IATA": "RIR",
			"ICAO": "KRIR",
			"lat": "33.98970031738281",
			"lng": "-117.41100311279297"
		},
		"Tacoma Narrows Airport": {
			"id": "8446",
			"name": "Tacoma Narrows Airport",
			"city": "Tacoma",
			"country": "United States",
			"IATA": "TIW",
			"ICAO": "KTIW",
			"lat": "47.26789856",
			"lng": "-122.5780029"
		},
		"Jack Edwards Airport": {
			"id": "8460",
			"name": "Jack Edwards Airport",
			"city": "Gulf Shores",
			"country": "United States",
			"IATA": "JKA",
			"ICAO": "KJKA",
			"lat": "30.29050064",
			"lng": "-87.67179871"
		},
		"Hazleton Municipal Airport": {
			"id": "8473",
			"name": "Hazleton Municipal Airport",
			"city": "Hazleton",
			"country": "United States",
			"IATA": "HZL",
			"ICAO": "KHZL",
			"lat": "40.986801147499996",
			"lng": "-75.9949035645"
		},
		"Greater Cumberland Regional Airport": {
			"id": "8474",
			"name": "Greater Cumberland Regional Airport",
			"city": "Cumberland",
			"country": "United States",
			"IATA": "CBE",
			"ICAO": "KCBE",
			"lat": "39.615398407",
			"lng": "-78.7609024048"
		},
		"Sugar Loaf Shores Airport": {
			"id": "8475",
			"name": "Sugar Loaf Shores Airport",
			"city": "Key West",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "7FA1",
			"lat": "24.648799896240234",
			"lng": "-81.57980346679688"
		},
		"Tri-County Regional Airport": {
			"id": "8493",
			"name": "Tri-County Regional Airport",
			"city": "Lone Rock",
			"country": "United States",
			"IATA": "LNR",
			"ICAO": "KLNR",
			"lat": "43.2117004395",
			"lng": "-90.181602478"
		},
		"Price County Airport": {
			"id": "8494",
			"name": "Price County Airport",
			"city": "Phillips",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KPBH",
			"lat": "45.70899963378906",
			"lng": "-90.40249633789062"
		},
		"Monroe Municipal Airport": {
			"id": "8495",
			"name": "Monroe Municipal Airport",
			"city": "Monroe",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KEFT",
			"lat": "42.614898681640625",
			"lng": "-89.59040069580078"
		},
		"Joliet Regional Airport": {
			"id": "8496",
			"name": "Joliet Regional Airport",
			"city": "Joliet",
			"country": "United States",
			"IATA": "JOT",
			"ICAO": "KJOT",
			"lat": "41.51779938",
			"lng": "-88.17549896"
		},
		"Illinois Valley Regional Airport-Walter A Duncan Field": {
			"id": "8497",
			"name": "Illinois Valley Regional Airport-Walter A Duncan Field",
			"city": "Peru",
			"country": "United States",
			"IATA": "VYS",
			"ICAO": "KVYS",
			"lat": "41.351898",
			"lng": "-89.153099"
		},
		"Jackson County Reynolds Field": {
			"id": "8499",
			"name": "Jackson County Reynolds Field",
			"city": "Jackson",
			"country": "United States",
			"IATA": "JXN",
			"ICAO": "KJXN",
			"lat": "42.259799957300004",
			"lng": "-84.45939636230001"
		},
		"Joseph A. Hardy Connellsville Airport": {
			"id": "8502",
			"name": "Joseph A. Hardy Connellsville Airport",
			"city": "Connellsville",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KVVS",
			"lat": "39.95920181",
			"lng": "-79.65709686"
		},
		"Bedford County Airport": {
			"id": "8503",
			"name": "Bedford County Airport",
			"city": "Bedford",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KHMZ",
			"lat": "40.08530045",
			"lng": "-78.5121994"
		},
		"Wings Field": {
			"id": "8504",
			"name": "Wings Field",
			"city": "Philadelphia",
			"country": "United States",
			"IATA": "BBX",
			"ICAO": "KLOM",
			"lat": "40.1375007629",
			"lng": "-75.2650985718"
		},
		"Okeechobee County Airport": {
			"id": "8505",
			"name": "Okeechobee County Airport",
			"city": "Okeechobee",
			"country": "United States",
			"IATA": "OBE",
			"ICAO": "KOBE",
			"lat": "27.262800216699997",
			"lng": "-80.8498001099"
		},
		"Sebring Regional Airport": {
			"id": "8506",
			"name": "Sebring Regional Airport",
			"city": "Sebring",
			"country": "United States",
			"IATA": "SEF",
			"ICAO": "KSEF",
			"lat": "27.45639992",
			"lng": "-81.3423996"
		},
		"Avon Park Executive Airport": {
			"id": "8507",
			"name": "Avon Park Executive Airport",
			"city": "Avon Park",
			"country": "United States",
			"IATA": "AVO",
			"ICAO": "KAVO",
			"lat": "27.59119987",
			"lng": "-81.52780151"
		},
		"Winter Haven Municipal Airport - Gilbert Field": {
			"id": "8508",
			"name": "Winter Haven Municipal Airport - Gilbert Field",
			"city": "Winter Haven",
			"country": "United States",
			"IATA": "GIF",
			"ICAO": "KGIF",
			"lat": "28.06290054",
			"lng": "-81.75330353"
		},
		"Zephyrhills Municipal Airport": {
			"id": "8509",
			"name": "Zephyrhills Municipal Airport",
			"city": "Zephyrhills",
			"country": "United States",
			"IATA": "ZPH",
			"ICAO": "KZPH",
			"lat": "28.2282009125",
			"lng": "-82.15589904790001"
		},
		"Ocala International Airport - Jim Taylor Field": {
			"id": "8510",
			"name": "Ocala International Airport - Jim Taylor Field",
			"city": "Ocala",
			"country": "United States",
			"IATA": "OCF",
			"ICAO": "KOCF",
			"lat": "29.17259979",
			"lng": "-82.22419739"
		},
		"Jesup Wayne County Airport": {
			"id": "8511",
			"name": "Jesup Wayne County Airport",
			"city": "Jesup",
			"country": "United States",
			"IATA": "JES",
			"ICAO": "KJES",
			"lat": "31.55400085",
			"lng": "-81.88249969"
		},
		"Madison Municipal Airport": {
			"id": "8512",
			"name": "Madison Municipal Airport",
			"city": "Madison",
			"country": "United States",
			"IATA": "52A",
			"ICAO": "K52A",
			"lat": "33.6120986938",
			"lng": "-83.46040344240001"
		},
		"Newnan Coweta County Airport": {
			"id": "8513",
			"name": "Newnan Coweta County Airport",
			"city": "Newnan",
			"country": "United States",
			"IATA": "CCO",
			"ICAO": "KCCO",
			"lat": "33.31159973144531",
			"lng": "-84.7697982788086"
		},
		"Thomson-McDuffie County Airport": {
			"id": "8514",
			"name": "Thomson-McDuffie County Airport",
			"city": "Thomson",
			"country": "United States",
			"IATA": "HQU",
			"ICAO": "KHQU",
			"lat": "33.52970123",
			"lng": "-82.51650238"
		},
		"Aiken Municipal Airport": {
			"id": "8515",
			"name": "Aiken Municipal Airport",
			"city": "Aiken",
			"country": "United States",
			"IATA": "AIK",
			"ICAO": "KAIK",
			"lat": "33.6493988037",
			"lng": "-81.68499755859999"
		},
		"Woodward Field": {
			"id": "8516",
			"name": "Woodward Field",
			"city": "Camden",
			"country": "United States",
			"IATA": "CDN",
			"ICAO": "KCDN",
			"lat": "34.2835998535",
			"lng": "-80.56490325930001"
		},
		"Lumberton Regional Airport": {
			"id": "8517",
			"name": "Lumberton Regional Airport",
			"city": "Lumberton",
			"country": "United States",
			"IATA": "LBT",
			"ICAO": "KLBT",
			"lat": "34.6099014282",
			"lng": "-79.05940246579999"
		},
		"Moore County Airport": {
			"id": "8519",
			"name": "Moore County Airport",
			"city": "Pinehurst-Southern Pines",
			"country": "United States",
			"IATA": "SOP",
			"ICAO": "KSOP",
			"lat": "35.23740005",
			"lng": "-79.3911972"
		},
		"Richmond County Airport": {
			"id": "8520",
			"name": "Richmond County Airport",
			"city": "Rockingham",
			"country": "United States",
			"IATA": "RCZ",
			"ICAO": "KRCZ",
			"lat": "34.8913",
			"lng": "-79.759598"
		},
		"Baraboo Wisconsin Dells Airport": {
			"id": "8524",
			"name": "Baraboo Wisconsin Dells Airport",
			"city": "Baraboo",
			"country": "United States",
			"IATA": "DLL",
			"ICAO": "KDLL",
			"lat": "43.52270126",
			"lng": "-89.77020264"
		},
		"Statesville Regional Airport": {
			"id": "8526",
			"name": "Statesville Regional Airport",
			"city": "Statesville",
			"country": "United States",
			"IATA": "SVH",
			"ICAO": "KSVH",
			"lat": "35.765300750732",
			"lng": "-80.953903198242"
		},
		"Burlington Municipal Airport": {
			"id": "8528",
			"name": "Burlington Municipal Airport",
			"city": "Burlington",
			"country": "United States",
			"IATA": "BUU",
			"ICAO": "KBUU",
			"lat": "42.69070053100586",
			"lng": "-88.30460357666016"
		},
		"William T. Piper Memorial Airport": {
			"id": "8532",
			"name": "William T. Piper Memorial Airport",
			"city": "Lock Haven",
			"country": "United States",
			"IATA": "LHV",
			"ICAO": "KLHV",
			"lat": "41.13560104",
			"lng": "-77.42230225"
		},
		"Zelienople Municipal Airport": {
			"id": "8538",
			"name": "Zelienople Municipal Airport",
			"city": "Zelienople",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KPJC",
			"lat": "40.80160141",
			"lng": "-80.16069794"
		},
		"Lorain County Regional Airport": {
			"id": "8542",
			"name": "Lorain County Regional Airport",
			"city": "Lorain-Elyria",
			"country": "United States",
			"IATA": "LPR",
			"ICAO": "KLPR",
			"lat": "41.34429932",
			"lng": "-82.17759705"
		},
		"Burke Lakefront Airport": {
			"id": "8544",
			"name": "Burke Lakefront Airport",
			"city": "Cleveland",
			"country": "United States",
			"IATA": "BKL",
			"ICAO": "KBKL",
			"lat": "41.51750183105469",
			"lng": "-81.68329620361328"
		},
		"Chautauqua County-Dunkirk Airport": {
			"id": "8545",
			"name": "Chautauqua County-Dunkirk Airport",
			"city": "Dunkirk",
			"country": "United States",
			"IATA": "DKK",
			"ICAO": "KDKK",
			"lat": "42.49330139",
			"lng": "-79.27200317"
		},
		"South Jersey Regional Airport": {
			"id": "8548",
			"name": "South Jersey Regional Airport",
			"city": "Mount Holly",
			"country": "United States",
			"IATA": "VAY",
			"ICAO": "KVAY",
			"lat": "39.942901611299995",
			"lng": "-74.845703125"
		},
		"Linden Airport": {
			"id": "8550",
			"name": "Linden Airport",
			"city": "Linden",
			"country": "United States",
			"IATA": "LDJ",
			"ICAO": "KLDJ",
			"lat": "40.617401123",
			"lng": "-74.2445983887"
		},
		"Tri State Steuben County Airport": {
			"id": "8553",
			"name": "Tri State Steuben County Airport",
			"city": "Angola",
			"country": "United States",
			"IATA": "ANQ",
			"ICAO": "KANQ",
			"lat": "41.639702",
			"lng": "-85.083504"
		},
		"Warsaw Municipal Airport": {
			"id": "8555",
			"name": "Warsaw Municipal Airport",
			"city": "Warsaw",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KASW",
			"lat": "41.27470016479492",
			"lng": "-85.84010314941406"
		},
		"Van Wert County Airport": {
			"id": "8556",
			"name": "Van Wert County Airport",
			"city": "Van Wert",
			"country": "United States",
			"IATA": "VNW",
			"ICAO": "KVNW",
			"lat": "40.86470031738281",
			"lng": "-84.6093978881836"
		},
		"Brooks Field": {
			"id": "8559",
			"name": "Brooks Field",
			"city": "Marshall",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KRMY",
			"lat": "42.25120162963867",
			"lng": "-84.95549774169922"
		},
		"Genesee County Airport": {
			"id": "8560",
			"name": "Genesee County Airport",
			"city": "Batavia",
			"country": "United States",
			"IATA": "GVQ",
			"ICAO": "KGVQ",
			"lat": "43.03170013",
			"lng": "-78.16760254"
		},
		"Clearwater Air Park": {
			"id": "8565",
			"name": "Clearwater Air Park",
			"city": "Clearwater",
			"country": "United States",
			"IATA": "CLW",
			"ICAO": "KCLW",
			"lat": "27.9766998291",
			"lng": "-82.7586975098"
		},
		"Chicago Meigs Airport": {
			"id": "8593",
			"name": "Chicago Meigs Airport",
			"city": "Chicago",
			"country": "United States",
			"IATA": "CGX",
			"ICAO": "KCGX",
			"lat": "41.85879898071289",
			"lng": "-87.60790252685547"
		},
		"Pickens County Airport": {
			"id": "8601",
			"name": "Pickens County Airport",
			"city": "Jasper",
			"country": "United States",
			"IATA": "JZP",
			"ICAO": "KJZP",
			"lat": "34.453399658203125",
			"lng": "-84.4573974609375"
		},
		"Grand Strand Airport": {
			"id": "8604",
			"name": "Grand Strand Airport",
			"city": "North Myrtle Beach",
			"country": "United States",
			"IATA": "CRE",
			"ICAO": "KCRE",
			"lat": "33.8116989136",
			"lng": "-78.72389984130001"
		},
		"Lansing Municipal Airport": {
			"id": "8606",
			"name": "Lansing Municipal Airport",
			"city": "Lansing",
			"country": "United States",
			"IATA": "IGQ",
			"ICAO": "KIGQ",
			"lat": "41.5349006652832",
			"lng": "-87.52950286865234"
		},
		"Ramona Airport": {
			"id": "8608",
			"name": "Ramona Airport",
			"city": "Ramona",
			"country": "United States",
			"IATA": "RNM",
			"ICAO": "KRNM",
			"lat": "33.03919982910156",
			"lng": "-116.91500091552734"
		},
		"Branch County Memorial Airport": {
			"id": "8624",
			"name": "Branch County Memorial Airport",
			"city": "Coldwater",
			"country": "United States",
			"IATA": "OEB",
			"ICAO": "KOEB",
			"lat": "41.9333992",
			"lng": "-85.05259705"
		},
		"Wilkes Barre Wyoming Valley Airport": {
			"id": "8625",
			"name": "Wilkes Barre Wyoming Valley Airport",
			"city": "Wilkes-Barre",
			"country": "United States",
			"IATA": "WBW",
			"ICAO": "KWBW",
			"lat": "41.2971992493",
			"lng": "-75.8511962891"
		},
		"Willoughby Lost Nation Municipal Airport": {
			"id": "8626",
			"name": "Willoughby Lost Nation Municipal Airport",
			"city": "Willoughby",
			"country": "United States",
			"IATA": "LNN",
			"ICAO": "KLNN",
			"lat": "41.683998107899995",
			"lng": "-81.3897018433"
		},
		"Auburn Lewiston Municipal Airport": {
			"id": "8632",
			"name": "Auburn Lewiston Municipal Airport",
			"city": "Lewiston",
			"country": "United States",
			"IATA": "LEW",
			"ICAO": "KLEW",
			"lat": "44.048500061",
			"lng": "-70.2835006714"
		},
		"Bloyer Field": {
			"id": "8639",
			"name": "Bloyer Field",
			"city": "Tomah",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KY72",
			"lat": "43.97499847",
			"lng": "-90.48349762"
		},
		"Marco Island Airport": {
			"id": "8641",
			"name": "Marco Island Airport",
			"city": "Marco Island Airport",
			"country": "United States",
			"IATA": "MRK",
			"ICAO": "KMKY",
			"lat": "25.9950008392",
			"lng": "-81.6725006104"
		},
		"Drummond Island Airport": {
			"id": "8644",
			"name": "Drummond Island Airport",
			"city": "Drummond Island",
			"country": "United States",
			"IATA": "DRM",
			"ICAO": "KDRM",
			"lat": "46.0093002319",
			"lng": "-83.74389648440001"
		},
		"Gladwin Zettel Memorial Airport": {
			"id": "8646",
			"name": "Gladwin Zettel Memorial Airport",
			"city": "Gladwin",
			"country": "United States",
			"IATA": "GDW",
			"ICAO": "KGDW",
			"lat": "43.9706001282",
			"lng": "-84.47499847410002"
		},
		"South Haven Area Regional Airport": {
			"id": "8648",
			"name": "South Haven Area Regional Airport",
			"city": "South Haven",
			"country": "United States",
			"IATA": "LWA",
			"ICAO": "KLWA",
			"lat": "42.351200103759766",
			"lng": "-86.25569915771484"
		},
		"Marshfield Municipal Airport": {
			"id": "8653",
			"name": "Marshfield Municipal Airport",
			"city": "Marshfield",
			"country": "United States",
			"IATA": "MFI",
			"ICAO": "KMFI",
			"lat": "44.6369018555",
			"lng": "-90.18930053710001"
		},
		"Alexander Field South Wood County Airport": {
			"id": "8654",
			"name": "Alexander Field South Wood County Airport",
			"city": "Wisconsin Rapids",
			"country": "United States",
			"IATA": "ISW",
			"ICAO": "KISW",
			"lat": "44.3602981567",
			"lng": "-89.83899688720001"
		},
		"Clinton Municipal Airport": {
			"id": "8655",
			"name": "Clinton Municipal Airport",
			"city": "Clinton",
			"country": "United States",
			"IATA": "CWI",
			"ICAO": "KCWI",
			"lat": "41.8311004639",
			"lng": "-90.3291015625"
		},
		"Beverly Municipal Airport": {
			"id": "8658",
			"name": "Beverly Municipal Airport",
			"city": "Beverly",
			"country": "United States",
			"IATA": "BVY",
			"ICAO": "KBVY",
			"lat": "42.584201812699995",
			"lng": "-70.91649627689999"
		},
		"Poplar Bluff Municipal Airport": {
			"id": "8664",
			"name": "Poplar Bluff Municipal Airport",
			"city": "Poplar Bluff",
			"country": "United States",
			"IATA": "POF",
			"ICAO": "KPOF",
			"lat": "36.773899078369",
			"lng": "-90.324897766113"
		},
		"Somerset Airport": {
			"id": "8665",
			"name": "Somerset Airport",
			"city": "Somerville",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KSMQ",
			"lat": "40.625999450683594",
			"lng": "-74.67019653320312"
		},
		"Eastport Municipal Airport": {
			"id": "8666",
			"name": "Eastport Municipal Airport",
			"city": "Eastport",
			"country": "United States",
			"IATA": "EPM",
			"ICAO": "KEPM",
			"lat": "44.910099029541016",
			"lng": "-67.01270294189453"
		},
		"Keokuk Municipal Airport": {
			"id": "8667",
			"name": "Keokuk Municipal Airport",
			"city": "Keokuk",
			"country": "United States",
			"IATA": "EOK",
			"ICAO": "KEOK",
			"lat": "40.459899902299995",
			"lng": "-91.4284973145"
		},
		"St Paul Downtown Holman Field": {
			"id": "8681",
			"name": "St Paul Downtown Holman Field",
			"city": "St. Paul",
			"country": "United States",
			"IATA": "STP",
			"ICAO": "KSTP",
			"lat": "44.93450164794922",
			"lng": "-93.05999755859375"
		},
		"Oconomowoc Airport": {
			"id": "8693",
			"name": "Oconomowoc Airport",
			"city": "Oconomowoc",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "0WI8",
			"lat": "43.13890075683594",
			"lng": "-88.47229766845703"
		},
		"Butler Co Regional Airport - Hogan Field": {
			"id": "8706",
			"name": "Butler Co Regional Airport - Hogan Field",
			"city": "Hamilton",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KHAO",
			"lat": "39.363800048799995",
			"lng": "-84.5220031738"
		},
		"Fond du Lac County Airport": {
			"id": "8742",
			"name": "Fond du Lac County Airport",
			"city": "Fond du Lac",
			"country": "United States",
			"IATA": "FLD",
			"ICAO": "KFLD",
			"lat": "43.7711982727",
			"lng": "-88.48840332030001"
		},
		"Waupaca Municipal Airport": {
			"id": "8743",
			"name": "Waupaca Municipal Airport",
			"city": "Waupaca",
			"country": "United States",
			"IATA": "PCZ",
			"ICAO": "KPCZ",
			"lat": "44.33330154",
			"lng": "-89.01979828"
		},
		"Stevens Point Municipal Airport": {
			"id": "8744",
			"name": "Stevens Point Municipal Airport",
			"city": "Stevens Point",
			"country": "United States",
			"IATA": "STE",
			"ICAO": "KSTE",
			"lat": "44.5452003479",
			"lng": "-89.530296325684"
		},
		"Luce County Airport": {
			"id": "8747",
			"name": "Luce County Airport",
			"city": "Newberry",
			"country": "United States",
			"IATA": "ERY",
			"ICAO": "KERY",
			"lat": "46.31119918823242",
			"lng": "-85.4572982788086"
		},
		"Galion Municipal Airport": {
			"id": "8759",
			"name": "Galion Municipal Airport",
			"city": "Galion",
			"country": "United States",
			"IATA": "GQQ",
			"ICAO": "KGQQ",
			"lat": "40.7533988953",
			"lng": "-82.7238006592"
		},
		"Clarksville–Montgomery County Regional Airport": {
			"id": "8763",
			"name": "Clarksville–Montgomery County Regional Airport",
			"city": "Clarksville",
			"country": "United States",
			"IATA": "CKV",
			"ICAO": "KCKV",
			"lat": "36.6218986511",
			"lng": "-87.4150009155"
		},
		"Lompoc Airport": {
			"id": "8771",
			"name": "Lompoc Airport",
			"city": "Lompoc",
			"country": "United States",
			"IATA": "LPC",
			"ICAO": "KLPC",
			"lat": "34.665599823",
			"lng": "-120.468002319"
		},
		"Chester County G O Carlson Airport": {
			"id": "8772",
			"name": "Chester County G O Carlson Airport",
			"city": "Coatesville",
			"country": "United States",
			"IATA": "CTH",
			"ICAO": "KMQS",
			"lat": "39.97900009",
			"lng": "-75.8655014"
		},
		"Lake Placid Airport": {
			"id": "8777",
			"name": "Lake Placid Airport",
			"city": "Lake Placid",
			"country": "United States",
			"IATA": "LKP",
			"ICAO": "KLKP",
			"lat": "44.2644996643",
			"lng": "-73.96189880370001"
		},
		"Lima Allen County Airport": {
			"id": "8784",
			"name": "Lima Allen County Airport",
			"city": "Lima",
			"country": "United States",
			"IATA": "AOH",
			"ICAO": "KAOH",
			"lat": "40.706902",
			"lng": "-84.026703"
		},
		"Malcolm McKinnon Airport": {
			"id": "8789",
			"name": "Malcolm McKinnon Airport",
			"city": "Brunswick",
			"country": "United States",
			"IATA": "SSI",
			"ICAO": "KSSI",
			"lat": "31.15180016",
			"lng": "-81.39129639"
		},
		"Beaver County Airport": {
			"id": "8790",
			"name": "Beaver County Airport",
			"city": "Beaver Falls",
			"country": "United States",
			"IATA": "BFP",
			"ICAO": "KBVI",
			"lat": "40.7724990845",
			"lng": "-80.39140319820001"
		},
		"Georgetown County Airport": {
			"id": "8792",
			"name": "Georgetown County Airport",
			"city": "Georgetown",
			"country": "United States",
			"IATA": "GGE",
			"ICAO": "KGGE",
			"lat": "33.3116989136",
			"lng": "-79.3196029663"
		},
		"Hardwick Field": {
			"id": "8793",
			"name": "Hardwick Field",
			"city": "Cleveland",
			"country": "United States",
			"IATA": "HDI",
			"ICAO": "KHDI",
			"lat": "35.22010040283203",
			"lng": "-84.8323974609375"
		},
		"Renton Municipal Airport": {
			"id": "8796",
			"name": "Renton Municipal Airport",
			"city": "Renton",
			"country": "United States",
			"IATA": "RNT",
			"ICAO": "KRNT",
			"lat": "47.4930992126",
			"lng": "-122.216003418"
		},
		"Brackett Field": {
			"id": "8798",
			"name": "Brackett Field",
			"city": "La Verne",
			"country": "United States",
			"IATA": "POC",
			"ICAO": "KPOC",
			"lat": "34.091598510742",
			"lng": "-117.78199768066"
		},
		"Cross City Airport": {
			"id": "8801",
			"name": "Cross City Airport",
			"city": "Cross City",
			"country": "United States",
			"IATA": "CTY",
			"ICAO": "KCTY",
			"lat": "29.6354999542",
			"lng": "-83.10479736330001"
		},
		"Oconee County Regional Airport": {
			"id": "8802",
			"name": "Oconee County Regional Airport",
			"city": "Clemson",
			"country": "United States",
			"IATA": "CEU",
			"ICAO": "KCEU",
			"lat": "34.6719017",
			"lng": "-82.8864975"
		},
		"Beech Factory Airport": {
			"id": "8804",
			"name": "Beech Factory Airport",
			"city": "Wichita",
			"country": "United States",
			"IATA": "BEC",
			"ICAO": "KBEC",
			"lat": "37.694499969499994",
			"lng": "-97.21499633790002"
		},
		"Tom B. David Field": {
			"id": "8808",
			"name": "Tom B. David Field",
			"city": "Calhoun",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KCZL",
			"lat": "34.45539856",
			"lng": "-84.93920135"
		},
		"Habersham County Airport": {
			"id": "8809",
			"name": "Habersham County Airport",
			"city": "Cornelia",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KAJR",
			"lat": "34.49990082",
			"lng": "-83.55670166"
		},
		"Georgetown Municipal Airport": {
			"id": "8811",
			"name": "Georgetown Municipal Airport",
			"city": "Georgetown",
			"country": "United States",
			"IATA": "GTU",
			"ICAO": "KGTU",
			"lat": "30.678800582885742",
			"lng": "-97.67939758300781"
		},
		"Old Rhinebeck Airport": {
			"id": "8812",
			"name": "Old Rhinebeck Airport",
			"city": "Rhinebeck",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "NY94",
			"lat": "41.9715004",
			"lng": "-73.86289978"
		},
		"Sidney Municipal-Lloyd W Carr Field": {
			"id": "8815",
			"name": "Sidney Municipal-Lloyd W Carr Field",
			"city": "Sidney",
			"country": "United States",
			"IATA": "SNY",
			"ICAO": "KSNY",
			"lat": "41.10129929",
			"lng": "-102.9850006"
		},
		"Kalaeloa Airport": {
			"id": "8824",
			"name": "Kalaeloa Airport",
			"city": "Kapolei",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "PHJR",
			"lat": "21.3074",
			"lng": "-158.070009"
		},
		"Iosco County Airport": {
			"id": "8833",
			"name": "Iosco County Airport",
			"city": "East Tawas",
			"country": "United States",
			"IATA": "ECA",
			"ICAO": "K6D9",
			"lat": "44.312801",
			"lng": "-83.422302"
		},
		"Madison County Executive Airport-Tom Sharp Jr Field": {
			"id": "8834",
			"name": "Madison County Executive Airport-Tom Sharp Jr Field",
			"city": "Huntsville",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KMDQ",
			"lat": "34.8614006",
			"lng": "-86.55750275"
		},
		"Leesburg Executive Airport": {
			"id": "8835",
			"name": "Leesburg Executive Airport",
			"city": "Leesburg",
			"country": "United States",
			"IATA": "JYO",
			"ICAO": "KJYO",
			"lat": "39.077999114990234",
			"lng": "-77.55750274658203"
		},
		"Anoka County-Blaine Arpt(Janes Field) Airport": {
			"id": "8838",
			"name": "Anoka County-Blaine Arpt(Janes Field) Airport",
			"city": "Anoka",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KANE",
			"lat": "45.14500046",
			"lng": "-93.21140289"
		},
		"Williamson Sodus Airport": {
			"id": "8850",
			"name": "Williamson Sodus Airport",
			"city": "Williamson",
			"country": "United States",
			"IATA": "SDC",
			"ICAO": "KSDC",
			"lat": "43.23469925",
			"lng": "-77.1210022"
		},
		"Boulder Municipal Airport": {
			"id": "8854",
			"name": "Boulder Municipal Airport",
			"city": "Boulder",
			"country": "United States",
			"IATA": "WBU",
			"ICAO": "KBDU",
			"lat": "40.0393981934",
			"lng": "-105.225997925"
		},
		"Palo Alto Airport of Santa Clara County": {
			"id": "8864",
			"name": "Palo Alto Airport of Santa Clara County",
			"city": "Palo Alto",
			"country": "United States",
			"IATA": "PAO",
			"ICAO": "KPAO",
			"lat": "37.461101532",
			"lng": "-122.114997864"
		},
		"Falcon Field": {
			"id": "8869",
			"name": "Falcon Field",
			"city": "Mesa",
			"country": "United States",
			"IATA": "FFZ",
			"ICAO": "KFFZ",
			"lat": "33.4608001709",
			"lng": "-111.727996826"
		},
		"Coolidge Municipal Airport": {
			"id": "8870",
			"name": "Coolidge Municipal Airport",
			"city": "Cooldige",
			"country": "United States",
			"IATA": "P08",
			"ICAO": "KP08",
			"lat": "32.9359016418457",
			"lng": "-111.427001953125"
		},
		"Cottonwood Airport": {
			"id": "8871",
			"name": "Cottonwood Airport",
			"city": "Cottonwood",
			"country": "United States",
			"IATA": "P52",
			"ICAO": "KP52",
			"lat": "34.7299995422",
			"lng": "-112.035003662"
		},
		"Ak-Chin Regional Airport": {
			"id": "8874",
			"name": "Ak-Chin Regional Airport",
			"city": "Phoenix",
			"country": "United States",
			"IATA": "A39",
			"ICAO": "KA39",
			"lat": "32.9908056",
			"lng": "-111.9185278"
		},
		"Wickenburg Municipal Airport": {
			"id": "8875",
			"name": "Wickenburg Municipal Airport",
			"city": "Wickenburg",
			"country": "United States",
			"IATA": "E25",
			"ICAO": "KE25",
			"lat": "33.96889877",
			"lng": "-112.7990036"
		},
		"Oakland County International Airport": {
			"id": "8877",
			"name": "Oakland County International Airport",
			"city": "Pontiac",
			"country": "United States",
			"IATA": "PTK",
			"ICAO": "KPTK",
			"lat": "42.665500640869",
			"lng": "-83.420097351074"
		},
		"Dillant Hopkins Airport": {
			"id": "8888",
			"name": "Dillant Hopkins Airport",
			"city": "Keene",
			"country": "United States",
			"IATA": "EEN",
			"ICAO": "KEEN",
			"lat": "42.898399353027344",
			"lng": "-72.27079772949219"
		},
		"Glasgow Industrial Airport": {
			"id": "8893",
			"name": "Glasgow Industrial Airport",
			"city": "Glasgow",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "07MT",
			"lat": "48.42110061645508",
			"lng": "-106.52799987792969"
		},
		"Iowa City Municipal Airport": {
			"id": "8925",
			"name": "Iowa City Municipal Airport",
			"city": "Iowa City",
			"country": "United States",
			"IATA": "IOW",
			"ICAO": "KIOW",
			"lat": "41.639198303200004",
			"lng": "-91.5465011597"
		},
		"Windom Municipal Airport": {
			"id": "8928",
			"name": "Windom Municipal Airport",
			"city": "Windom",
			"country": "United States",
			"IATA": "MWM",
			"ICAO": "KMWM",
			"lat": "43.91339874267578",
			"lng": "-95.1093978881836"
		},
		"Longview Ranch Airport": {
			"id": "8931",
			"name": "Longview Ranch Airport",
			"city": "Longview",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "OG39",
			"lat": "44.66170120239258",
			"lng": "-119.6520004272461"
		},
		"Lee Airport": {
			"id": "8935",
			"name": "Lee Airport",
			"city": "Annapolis",
			"country": "United States",
			"IATA": "ANP",
			"ICAO": "KANP",
			"lat": "38.942902",
			"lng": "-76.568398"
		},
		"Pecos Municipal Airport": {
			"id": "8950",
			"name": "Pecos Municipal Airport",
			"city": "Pecos",
			"country": "United States",
			"IATA": "PEQ",
			"ICAO": "KPEQ",
			"lat": "31.382400512695",
			"lng": "-103.51100158691"
		},
		"Hattiesburg Bobby L Chain Municipal Airport": {
			"id": "8951",
			"name": "Hattiesburg Bobby L Chain Municipal Airport",
			"city": "Hattiesburg",
			"country": "United States",
			"IATA": "HBG",
			"ICAO": "KHBG",
			"lat": "31.26479912",
			"lng": "-89.25279999"
		},
		"Chan Gurney Municipal Airport": {
			"id": "8958",
			"name": "Chan Gurney Municipal Airport",
			"city": "Yankton",
			"country": "United States",
			"IATA": "YKN",
			"ICAO": "KYKN",
			"lat": "42.916698455811",
			"lng": "-97.385902404785"
		},
		"Hayward Executive Airport": {
			"id": "8982",
			"name": "Hayward Executive Airport",
			"city": "Hayward",
			"country": "United States",
			"IATA": "HWD",
			"ICAO": "KHWD",
			"lat": "37.659198761",
			"lng": "-122.122001648"
		},
		"Ann Arbor Municipal Airport": {
			"id": "8989",
			"name": "Ann Arbor Municipal Airport",
			"city": "Ann Arbor",
			"country": "United States",
			"IATA": "ARB",
			"ICAO": "KARB",
			"lat": "42.2229995728",
			"lng": "-83.74559783939999"
		},
		"Atlanta South Regional Airport/Tara Field": {
			"id": "9066",
			"name": "Atlanta South Regional Airport/Tara Field",
			"city": "Hampton",
			"country": "United States",
			"IATA": "4A7",
			"ICAO": "K4A7",
			"lat": "33.389099",
			"lng": "-84.332397"
		},
		"Comarapa Airport": {
			"id": "9093",
			"name": "Comarapa Airport",
			"city": "Salt Lake City",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "SLCR",
			"lat": "-17.91360092163086",
			"lng": "-64.5177993774414"
		},
		"Immokalee Regional Airport": {
			"id": "9102",
			"name": "Immokalee Regional Airport",
			"city": "Immokalee ",
			"country": "United States",
			"IATA": "IMM",
			"ICAO": "KIMM",
			"lat": "26.43320084",
			"lng": "-81.40100098"
		},
		"Rancho San Simeon Airport": {
			"id": "9104",
			"name": "Rancho San Simeon Airport",
			"city": "Cambria",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "66CA",
			"lat": "35.60770034790039",
			"lng": "-121.11000061035156"
		},
		"Dinwiddie County Airport": {
			"id": "9120",
			"name": "Dinwiddie County Airport",
			"city": "Petersburg",
			"country": "United States",
			"IATA": "PTB",
			"ICAO": "KPTB",
			"lat": "37.183799743652",
			"lng": "-77.507400512695"
		},
		"Sheboygan County Memorial Airport": {
			"id": "9126",
			"name": "Sheboygan County Memorial Airport",
			"city": "Sheboygan",
			"country": "United States",
			"IATA": "SBM",
			"ICAO": "KSBM",
			"lat": "43.76959991",
			"lng": "-87.85140228"
		},
		"Pinal Airpark": {
			"id": "9138",
			"name": "Pinal Airpark",
			"city": "Marana",
			"country": "United States",
			"IATA": "MZJ",
			"ICAO": "KMZJ",
			"lat": "32.5106010437",
			"lng": "-111.32800293"
		},
		"Glendale Municipal Airport": {
			"id": "9139",
			"name": "Glendale Municipal Airport",
			"city": "Glendale",
			"country": "United States",
			"IATA": "GEU",
			"ICAO": "KGEU",
			"lat": "33.52690124511719",
			"lng": "-112.29499816894531"
		},
		"Safford Regional Airport": {
			"id": "9140",
			"name": "Safford Regional Airport",
			"city": "Safford",
			"country": "United States",
			"IATA": "SAD",
			"ICAO": "KSAD",
			"lat": "32.85480118",
			"lng": "-109.6350021"
		},
		"Sikeston Memorial Municipal Airport": {
			"id": "9164",
			"name": "Sikeston Memorial Municipal Airport",
			"city": "Sikeston",
			"country": "United States",
			"IATA": "SIK",
			"ICAO": "KSIK",
			"lat": "36.898899078369",
			"lng": "-89.561798095703"
		},
		"Floyd Bennett Memorial Airport": {
			"id": "9178",
			"name": "Floyd Bennett Memorial Airport",
			"city": "Queensbury",
			"country": "United States",
			"IATA": "GFL",
			"ICAO": "KGFL",
			"lat": "43.3412017822",
			"lng": "-73.6102981567"
		},
		"Saratoga County Airport": {
			"id": "9179",
			"name": "Saratoga County Airport",
			"city": "Ballston Spa",
			"country": "United States",
			"IATA": "5B2",
			"ICAO": "K5B2",
			"lat": "43.05130005",
			"lng": "-73.86119843"
		},
		"Crystal River Airport": {
			"id": "9182",
			"name": "Crystal River Airport",
			"city": "Crystal River",
			"country": "United States",
			"IATA": "CGC",
			"ICAO": "KCGC",
			"lat": "28.867300033569336",
			"lng": "-82.57129669189453"
		},
		"Martin State Airport": {
			"id": "9183",
			"name": "Martin State Airport",
			"city": "Baltimore",
			"country": "United States",
			"IATA": "MTN",
			"ICAO": "KMTN",
			"lat": "39.32569885",
			"lng": "-76.4138031"
		},
		"Lincoln Regional Karl Harder Field": {
			"id": "9184",
			"name": "Lincoln Regional Karl Harder Field",
			"city": "Lincoln",
			"country": "United States",
			"IATA": "LHM",
			"ICAO": "KLHM",
			"lat": "38.90919876098633",
			"lng": "-121.35099792480469"
		},
		"Fostoria Metropolitan Airport": {
			"id": "9185",
			"name": "Fostoria Metropolitan Airport",
			"city": "Fostoria",
			"country": "United States",
			"IATA": "FZI",
			"ICAO": "KFZI",
			"lat": "41.19079971",
			"lng": "-83.39450073"
		},
		"Eastern Slopes Regional Airport": {
			"id": "9186",
			"name": "Eastern Slopes Regional Airport",
			"city": "Fryeburg",
			"country": "United States",
			"IATA": "IZG",
			"ICAO": "KIZG",
			"lat": "43.991100311299995",
			"lng": "-70.9478988647"
		},
		"Coral Creek Airport": {
			"id": "9187",
			"name": "Coral Creek Airport",
			"city": "Placida",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "FA54",
			"lat": "26.85449981689453",
			"lng": "-82.2511978149414"
		},
		"Lakefront Airport": {
			"id": "9188",
			"name": "Lakefront Airport",
			"city": "New Orleans",
			"country": "United States",
			"IATA": "NEW",
			"ICAO": "KNEW",
			"lat": "30.042400360107",
			"lng": "-90.028297424316"
		},
		"Coeur D'Alene - Pappy Boyington Field": {
			"id": "9189",
			"name": "Coeur D'Alene - Pappy Boyington Field",
			"city": "Coeur d'Alene",
			"country": "United States",
			"IATA": "COE",
			"ICAO": "KCOE",
			"lat": "47.77429962",
			"lng": "-116.8199997"
		},
		"Beaumont Municipal Airport": {
			"id": "9190",
			"name": "Beaumont Municipal Airport",
			"city": "Beaumont",
			"country": "United States",
			"IATA": "BMT",
			"ICAO": "KBMT",
			"lat": "30.0706996918",
			"lng": "-94.21579742430002"
		},
		"Vermilion Regional Airport": {
			"id": "9191",
			"name": "Vermilion Regional Airport",
			"city": "Danville",
			"country": "United States",
			"IATA": "DNV",
			"ICAO": "KDNV",
			"lat": "40.19919968",
			"lng": "-87.59590149"
		},
		"Space Coast Regional Airport": {
			"id": "9199",
			"name": "Space Coast Regional Airport",
			"city": "Titusville",
			"country": "United States",
			"IATA": "TIX",
			"ICAO": "KTIX",
			"lat": "28.514799118042",
			"lng": "-80.799201965332"
		},
		"Andrau Airpark": {
			"id": "9225",
			"name": "Andrau Airpark",
			"city": "Houston",
			"country": "United States",
			"IATA": "AAP",
			"ICAO": "KAAP",
			"lat": "29.722499847399998",
			"lng": "-95.58830261230001"
		},
		"Flying Cloud Airport": {
			"id": "9226",
			"name": "Flying Cloud Airport",
			"city": "Eden Prairie",
			"country": "United States",
			"IATA": "FCM",
			"ICAO": "KFCM",
			"lat": "44.8272018433",
			"lng": "-93.45709991460001"
		},
		"Johnson County Executive Airport": {
			"id": "9228",
			"name": "Johnson County Executive Airport",
			"city": "Olathe",
			"country": "United States",
			"IATA": "OJC",
			"ICAO": "KOJC",
			"lat": "38.84759903",
			"lng": "-94.73760223"
		},
		"Brandywine Airport": {
			"id": "9249",
			"name": "Brandywine Airport",
			"city": "West Goshen Township",
			"country": "United States",
			"IATA": "OQN",
			"ICAO": "KOQN",
			"lat": "39.9901008605957",
			"lng": "-75.58190155029297"
		},
		"Manassas Regional Airport/Harry P. Davis Field": {
			"id": "9251",
			"name": "Manassas Regional Airport/Harry P. Davis Field",
			"city": "Manassas",
			"country": "United States",
			"IATA": "MNZ",
			"ICAO": "KHEF",
			"lat": "38.72140121",
			"lng": "-77.51540375"
		},
		"Texas Gulf Coast Regional Airport": {
			"id": "9252",
			"name": "Texas Gulf Coast Regional Airport",
			"city": "Angleton",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KLBX",
			"lat": "29.1086006165",
			"lng": "-95.462097168"
		},
		"Enumclaw Airport": {
			"id": "9348",
			"name": "Enumclaw Airport",
			"city": "Enumclaw",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "WA77",
			"lat": "47.195701599121094",
			"lng": "-122.02200317382812"
		},
		"Fairfield County Airport": {
			"id": "9390",
			"name": "Fairfield County Airport",
			"city": "Winnsboro",
			"country": "United States",
			"IATA": "FDW",
			"ICAO": "KFDW",
			"lat": "34.31549835205078",
			"lng": "-81.10880279541016"
		},
		"Skyhaven Airport": {
			"id": "9396",
			"name": "Skyhaven Airport",
			"city": "Rochester",
			"country": "United States",
			"IATA": "DAW",
			"ICAO": "KDAW",
			"lat": "43.28409957885742",
			"lng": "-70.9292984008789"
		},
		"Newton City-County Airport": {
			"id": "9399",
			"name": "Newton City-County Airport",
			"city": "Newton",
			"country": "United States",
			"IATA": "EWK",
			"ICAO": "KEWK",
			"lat": "38.058200836199994",
			"lng": "-97.2744979858"
		},
		"Taszár Air Base": {
			"id": "9403",
			"name": "Taszár Air Base",
			"city": "Columbus",
			"country": "United States",
			"IATA": "TZR",
			"ICAO": "LHTA",
			"lat": "46.39310073852539",
			"lng": "17.917499542236328"
		},
		"Fort Bridger Airport": {
			"id": "9406",
			"name": "Fort Bridger Airport",
			"city": "Fort Bridger",
			"country": "United States",
			"IATA": "FBR",
			"ICAO": "KFBR",
			"lat": "41.3918991089",
			"lng": "-110.406997681"
		},
		"Prosser Airport": {
			"id": "9407",
			"name": "Prosser Airport",
			"city": "Prosser",
			"country": "United States",
			"IATA": "S40",
			"ICAO": "KS40",
			"lat": "46.21340179",
			"lng": "-119.7910004"
		},
		"Chehalis Centralia Airport": {
			"id": "9408",
			"name": "Chehalis Centralia Airport",
			"city": "Chehalis",
			"country": "United States",
			"IATA": "CLS",
			"ICAO": "KCLS",
			"lat": "46.676998138399995",
			"lng": "-122.983001709"
		},
		"Desert Aire Airport": {
			"id": "9409",
			"name": "Desert Aire Airport",
			"city": "Mattawa",
			"country": "United States",
			"IATA": "M94",
			"ICAO": "KM94",
			"lat": "46.687400817871094",
			"lng": "-119.9209976196289"
		},
		"Evanston-Uinta County Airport-Burns Field": {
			"id": "9411",
			"name": "Evanston-Uinta County Airport-Burns Field",
			"city": "Evanston",
			"country": "United States",
			"IATA": "EVW",
			"ICAO": "KEVW",
			"lat": "41.27479935",
			"lng": "-111.0350037"
		},
		"Sabetha Municipal Airport": {
			"id": "9412",
			"name": "Sabetha Municipal Airport",
			"city": "Sabetha",
			"country": "United States",
			"IATA": "K83",
			"ICAO": "KK83",
			"lat": "39.90420150756836",
			"lng": "-95.77940368652344"
		},
		"Mt Pleasant Regional-Faison field": {
			"id": "9413",
			"name": "Mt Pleasant Regional-Faison field",
			"city": "Mount Pleasant",
			"country": "United States",
			"IATA": "LRO",
			"ICAO": "KLRO",
			"lat": "32.89780045",
			"lng": "-79.78289795"
		},
		"Souther Field": {
			"id": "9414",
			"name": "Souther Field",
			"city": "Americus",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KACJ",
			"lat": "32.1108017",
			"lng": "-84.18890381"
		},
		"Weedon Field": {
			"id": "9415",
			"name": "Weedon Field",
			"city": "Eufala",
			"country": "United States",
			"IATA": "EUF",
			"ICAO": "KEUF",
			"lat": "31.9512996674",
			"lng": "-85.1288986206"
		},
		"Saluda County Airport": {
			"id": "9416",
			"name": "Saluda County Airport",
			"city": "Saluda",
			"country": "United States",
			"IATA": "6J4",
			"ICAO": "K6J4",
			"lat": "33.92679977416992",
			"lng": "-81.79460144042969"
		},
		"Dare County Regional Airport": {
			"id": "9417",
			"name": "Dare County Regional Airport",
			"city": "Manteo",
			"country": "United States",
			"IATA": "MEO",
			"ICAO": "KMQI",
			"lat": "35.91899872",
			"lng": "-75.69550323"
		},
		"Auburn Opelika Robert G. Pitts Airport": {
			"id": "9418",
			"name": "Auburn Opelika Robert G. Pitts Airport",
			"city": "Auburn",
			"country": "United States",
			"IATA": "AUO",
			"ICAO": "KAUO",
			"lat": "32.61510086",
			"lng": "-85.43399811"
		},
		"Bessemer Airport": {
			"id": "9428",
			"name": "Bessemer Airport",
			"city": "Bessemer",
			"country": "United States",
			"IATA": "EKY",
			"ICAO": "KEKY",
			"lat": "33.31290054",
			"lng": "-86.92590332"
		},
		"Colorado Springs East Airport": {
			"id": "9429",
			"name": "Colorado Springs East Airport",
			"city": "Ellicott",
			"country": "United States",
			"IATA": "A50",
			"ICAO": "KA50",
			"lat": "38.8744010925293",
			"lng": "-104.41000366210938"
		},
		"Crystal Airport": {
			"id": "9447",
			"name": "Crystal Airport",
			"city": "Crystal",
			"country": "United States",
			"IATA": "MIC",
			"ICAO": "KMIC",
			"lat": "45.0620002746582",
			"lng": "-93.35389709472656"
		},
		"Clarke County Airport": {
			"id": "9448",
			"name": "Clarke County Airport",
			"city": "Quitman",
			"country": "United States",
			"IATA": "23M",
			"ICAO": "K23M",
			"lat": "32.0848999023",
			"lng": "-88.738899231"
		},
		"W H 'Bud' Barron Airport": {
			"id": "9450",
			"name": "W H 'Bud' Barron Airport",
			"city": "Dublin",
			"country": "United States",
			"IATA": "DBN",
			"ICAO": "KDBN",
			"lat": "32.56439972",
			"lng": "-82.98529816"
		},
		"Corvallis Municipal Airport": {
			"id": "9488",
			"name": "Corvallis Municipal Airport",
			"city": "Corvallis",
			"country": "United States",
			"IATA": "CVO",
			"ICAO": "KCVO",
			"lat": "44.49720001",
			"lng": "-123.2900009"
		},
		"El Almendro Airport": {
			"id": "9500",
			"name": "El Almendro Airport",
			"city": "Scranton",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "SCRT",
			"lat": "-35.96055603027344",
			"lng": "-71.7933349609375"
		},
		"San Agustin Airport": {
			"id": "9511",
			"name": "San Agustin Airport",
			"city": "Morristown",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "MRST",
			"lat": "10.066666603088379",
			"lng": "-84.88333129882812"
		},
		"Cowra Airport": {
			"id": "9533",
			"name": "Cowra Airport",
			"city": "Chatsworth",
			"country": "United States",
			"IATA": "CWT",
			"ICAO": "YCWR",
			"lat": "-33.84469985961914",
			"lng": "148.6490020751953"
		},
		"Ogden Hinckley Airport": {
			"id": "9543",
			"name": "Ogden Hinckley Airport",
			"city": "Ogden",
			"country": "United States",
			"IATA": "OGD",
			"ICAO": "KOGD",
			"lat": "41.195899963379",
			"lng": "-112.0120010376"
		},
		"Robert S Kerr Airport": {
			"id": "9545",
			"name": "Robert S Kerr Airport",
			"city": "Poteau",
			"country": "United States",
			"IATA": "RKR",
			"ICAO": "KRKR",
			"lat": "35.02159881591797",
			"lng": "-94.62129974365234"
		},
		"Colorado Plains Regional Airport": {
			"id": "9546",
			"name": "Colorado Plains Regional Airport",
			"city": "Akron",
			"country": "United States",
			"IATA": "AKO",
			"ICAO": "KAKO",
			"lat": "40.1755981445",
			"lng": "-103.222000122"
		},
		"Sanderson Field": {
			"id": "9547",
			"name": "Sanderson Field",
			"city": "Shelton",
			"country": "United States",
			"IATA": "SHN",
			"ICAO": "KSHN",
			"lat": "47.233600616455",
			"lng": "-123.14800262451"
		},
		"Napakiak Airport": {
			"id": "9739",
			"name": "Napakiak Airport",
			"city": "Napakiak",
			"country": "United States",
			"IATA": "WNA",
			"ICAO": "PANA",
			"lat": "60.69029998779297",
			"lng": "-161.97900390625"
		},
		"Napaskiak Airport": {
			"id": "9744",
			"name": "Napaskiak Airport",
			"city": "Napaskiak",
			"country": "United States",
			"IATA": "PKA",
			"ICAO": "PAPK",
			"lat": "60.70289993",
			"lng": "-161.7779999"
		},
		"Tok Airport": {
			"id": "9746",
			"name": "Tok Airport",
			"city": "Tok",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "PATJ",
			"lat": "63.303333",
			"lng": "-143.001111"
		},
		"Causey Airport": {
			"id": "9754",
			"name": "Causey Airport",
			"city": "Liberty",
			"country": "United States",
			"IATA": "2A5",
			"ICAO": "K2A5",
			"lat": "35.911800384521484",
			"lng": "-79.61759948730469"
		},
		"Doylestown Airport": {
			"id": "9763",
			"name": "Doylestown Airport",
			"city": "Doylestown",
			"country": "United States",
			"IATA": "DYL",
			"ICAO": "KDYL",
			"lat": "40.3330001831",
			"lng": "-75.1222991943"
		},
		"Warren Field": {
			"id": "9772",
			"name": "Warren Field",
			"city": "Washington",
			"country": "United States",
			"IATA": "OCW",
			"ICAO": "KOCW",
			"lat": "35.570499420166",
			"lng": "-77.049797058105"
		},
		"Hyde County Airport": {
			"id": "9773",
			"name": "Hyde County Airport",
			"city": "Engelhard",
			"country": "United States",
			"IATA": "7W6",
			"ICAO": "K7W6",
			"lat": "35.562400817871094",
			"lng": "-75.9552001953125"
		},
		"Stillwater Regional Airport": {
			"id": "9776",
			"name": "Stillwater Regional Airport",
			"city": "Stillwater",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KSWO",
			"lat": "36.161201477051",
			"lng": "-97.08570098877"
		},
		"Okmulgee Regional Airport": {
			"id": "9777",
			"name": "Okmulgee Regional Airport",
			"city": "Okmulgee",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KOKM",
			"lat": "35.668098449707",
			"lng": "-95.948699951172"
		},
		"Cushing Municipal Airport": {
			"id": "9778",
			"name": "Cushing Municipal Airport",
			"city": "Cushing",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KCUH",
			"lat": "35.9499015808",
			"lng": "-96.7731018066"
		},
		"Clinton Sherman Airport": {
			"id": "9779",
			"name": "Clinton Sherman Airport",
			"city": "Clinton",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KCSM",
			"lat": "35.3398017883",
			"lng": "-99.20050048830001"
		},
		"Strother Field": {
			"id": "9780",
			"name": "Strother Field",
			"city": "Winfield",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KWLD",
			"lat": "37.168598175",
			"lng": "-97.0375976562"
		},
		"Wiley Post Airport": {
			"id": "9781",
			"name": "Wiley Post Airport",
			"city": "Oklahoma City",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KPWA",
			"lat": "35.53419876",
			"lng": "-97.64710236"
		},
		"Shreveport Downtown Airport": {
			"id": "9782",
			"name": "Shreveport Downtown Airport",
			"city": "Shreveport",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KDTN",
			"lat": "32.5401992798",
			"lng": "-93.7450027466"
		},
		"Stephenville Clark Regional Airport": {
			"id": "9783",
			"name": "Stephenville Clark Regional Airport",
			"city": "Stephenville",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KSEP",
			"lat": "32.215301513672",
			"lng": "-98.177696228027"
		},
		"Perry Municipal Airport": {
			"id": "9784",
			"name": "Perry Municipal Airport",
			"city": "Perry",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KF22",
			"lat": "36.38560104370117",
			"lng": "-97.2771987915039"
		},
		"Hamilton Municipal Airport": {
			"id": "9786",
			"name": "Hamilton Municipal Airport",
			"city": "Hamilton",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KMNZ",
			"lat": "31.6658992767334",
			"lng": "-98.14859771728516"
		},
		"Ada Municipal Airport": {
			"id": "9787",
			"name": "Ada Municipal Airport",
			"city": "Ada",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KADH",
			"lat": "34.8042984009",
			"lng": "-96.67130279540001"
		},
		"Mesquite Metro Airport": {
			"id": "9788",
			"name": "Mesquite Metro Airport",
			"city": "Misquite",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KHQZ",
			"lat": "32.74700164794922",
			"lng": "-96.53040313720703"
		},
		"Denton Municipal Airport": {
			"id": "9789",
			"name": "Denton Municipal Airport",
			"city": "Denton",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KDTO",
			"lat": "33.2006988525",
			"lng": "-97.19799804690001"
		},
		"Austin Executive Airport": {
			"id": "9790",
			"name": "Austin Executive Airport",
			"city": "Austin",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KEDC",
			"lat": "30.3974931",
			"lng": "-97.5663935"
		},
		"Lago Vista Tx Rusty Allen Airport": {
			"id": "9791",
			"name": "Lago Vista Tx Rusty Allen Airport",
			"city": "Lago Vista",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KRYW",
			"lat": "30.498600006103516",
			"lng": "-97.96949768066406"
		},
		"Brenham Municipal Airport": {
			"id": "9792",
			"name": "Brenham Municipal Airport",
			"city": "Brenham",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "K11R",
			"lat": "30.21899986",
			"lng": "-96.3742981"
		},
		"Lakeway Airpark": {
			"id": "9793",
			"name": "Lakeway Airpark",
			"city": "Lakeway",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "K3R9",
			"lat": "30.357500076293945",
			"lng": "-97.99449920654297"
		},
		"Iraan Municipal Airport": {
			"id": "9794",
			"name": "Iraan Municipal Airport",
			"city": "Iraan",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "K2F0",
			"lat": "30.9057006836",
			"lng": "-101.891998291"
		},
		"Kestrel Airpark": {
			"id": "9795",
			"name": "Kestrel Airpark",
			"city": "San Antonio",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "K1T7",
			"lat": "29.812700271606445",
			"lng": "-98.42530059814453"
		},
		"Wilkes County Airport": {
			"id": "9797",
			"name": "Wilkes County Airport",
			"city": "North Wilkesboro",
			"country": "United States",
			"IATA": "UKF",
			"ICAO": "KUKF",
			"lat": "36.2228012085",
			"lng": "-81.09829711910001"
		},
		"Charleston Executive Airport": {
			"id": "9798",
			"name": "Charleston Executive Airport",
			"city": "Charleston",
			"country": "United States",
			"IATA": "JZI",
			"ICAO": "KJZI",
			"lat": "32.70090103149414",
			"lng": "-80.00289916992188"
		},
		"Danville Regional Airport": {
			"id": "9799",
			"name": "Danville Regional Airport",
			"city": "Danville",
			"country": "United States",
			"IATA": "DAN",
			"ICAO": "KDAN",
			"lat": "36.572898864746094",
			"lng": "-79.33609771728516"
		},
		"Brookneal/Campbell County Airport": {
			"id": "9800",
			"name": "Brookneal/Campbell County Airport",
			"city": "Brookneal",
			"country": "United States",
			"IATA": "0V4",
			"ICAO": "K0V4",
			"lat": "37.141700744599994",
			"lng": "-79.01640319820001"
		},
		"Cheraw Municipal Airport/Lynch Bellinger Field": {
			"id": "9806",
			"name": "Cheraw Municipal Airport/Lynch Bellinger Field",
			"city": "Cheraw",
			"country": "United States",
			"IATA": "CQW",
			"ICAO": "KCQW",
			"lat": "34.71289825",
			"lng": "-79.95700073"
		},
		"Wauchula Municipal Airport": {
			"id": "9808",
			"name": "Wauchula Municipal Airport",
			"city": "Wuchula",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KCHN",
			"lat": "27.51490020752",
			"lng": "-81.880500793457"
		},
		"Conway Horry County Airport": {
			"id": "9847",
			"name": "Conway Horry County Airport",
			"city": "Conway",
			"country": "United States",
			"IATA": "HYW",
			"ICAO": "KHYW",
			"lat": "33.82849884",
			"lng": "-79.12220001"
		},
		"Asheboro Regional Airport": {
			"id": "9938",
			"name": "Asheboro Regional Airport",
			"city": "Asheboro",
			"country": "United States",
			"IATA": "HBI",
			"ICAO": "KHBI",
			"lat": "35.65449905",
			"lng": "-79.8946991"
		},
		"Henderson Field": {
			"id": "9942",
			"name": "Henderson Field",
			"city": "Wallace",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KACZ",
			"lat": "34.717899322509766",
			"lng": "-78.00360107421875"
		},
		"Emporia Greensville Regional Airport": {
			"id": "9943",
			"name": "Emporia Greensville Regional Airport",
			"city": "Emporia",
			"country": "United States",
			"IATA": "EMV",
			"ICAO": "KEMV",
			"lat": "36.6869010925293",
			"lng": "-77.48280334472656"
		},
		"El Monte Airport": {
			"id": "10017",
			"name": "El Monte Airport",
			"city": "El Monte",
			"country": "United States",
			"IATA": "EMT",
			"ICAO": "KEMT",
			"lat": "34.086101532",
			"lng": "-118.035003662"
		},
		"Kee Field": {
			"id": "10062",
			"name": "Kee Field",
			"city": "Pineville",
			"country": "United States",
			"IATA": "I16",
			"ICAO": "KI16",
			"lat": "37.600399017333984",
			"lng": "-81.5593032836914"
		},
		"Stinson Municipal Airport": {
			"id": "10102",
			"name": "Stinson Municipal Airport",
			"city": "Stinson",
			"country": "United States",
			"IATA": "SSF",
			"ICAO": "KSSF",
			"lat": "29.336999893188",
			"lng": "-98.471099853516"
		},
		"Sallisaw Municipal Airport": {
			"id": "10103",
			"name": "Sallisaw Municipal Airport",
			"city": "Sallisaw",
			"country": "United States",
			"IATA": "JSV",
			"ICAO": "KJSV",
			"lat": "35.4382019",
			"lng": "-94.80280304"
		},
		"Jasper County Airport-Bell Field": {
			"id": "10104",
			"name": "Jasper County Airport-Bell Field",
			"city": "Jasper",
			"country": "United States",
			"IATA": "JAS",
			"ICAO": "KJAS",
			"lat": "30.88570023",
			"lng": "-94.03489685"
		},
		"El Dorado Springs Memorial Airport": {
			"id": "10105",
			"name": "El Dorado Springs Memorial Airport",
			"city": "El dorado springs",
			"country": "United States",
			"IATA": "87K",
			"ICAO": "K87K",
			"lat": "37.8567008972168",
			"lng": "-93.99909973144531"
		},
		"Marfa Municipal Airport": {
			"id": "10106",
			"name": "Marfa Municipal Airport",
			"city": "Marfa",
			"country": "United States",
			"IATA": "MRF",
			"ICAO": "KMRF",
			"lat": "30.371099",
			"lng": "-104.017997"
		},
		"Alpine Casparis Municipal Airport": {
			"id": "10107",
			"name": "Alpine Casparis Municipal Airport",
			"city": "Alpine",
			"country": "United States",
			"IATA": "E38",
			"ICAO": "KE38",
			"lat": "30.384199142499998",
			"lng": "-103.683998108"
		},
		"Cable Airport": {
			"id": "10117",
			"name": "Cable Airport",
			"city": "Upland",
			"country": "United States",
			"IATA": "CCB",
			"ICAO": "KCCB",
			"lat": "34.1115989685",
			"lng": "-117.68800354"
		},
		"Mount Sterling Montgomery County Airport": {
			"id": "10121",
			"name": "Mount Sterling Montgomery County Airport",
			"city": "Mount Sterling",
			"country": "United States",
			"IATA": "IOB",
			"ICAO": "KIOB",
			"lat": "38.05810165",
			"lng": "-83.979599"
		},
		"Elkhart Municipal Airport": {
			"id": "10122",
			"name": "Elkhart Municipal Airport",
			"city": "Elkhart",
			"country": "United States",
			"IATA": "EKI",
			"ICAO": "KEKM",
			"lat": "41.7193984985",
			"lng": "-86.00319671630001"
		},
		"Nappanee Municipal Airport": {
			"id": "10123",
			"name": "Nappanee Municipal Airport",
			"city": "Nappanee ",
			"country": "United States",
			"IATA": "C03",
			"ICAO": "KC03",
			"lat": "41.44620132446289",
			"lng": "-85.93479919433594"
		},
		"Jim Hamilton L.B. Owens Airport": {
			"id": "10128",
			"name": "Jim Hamilton L.B. Owens Airport",
			"city": "Columbia",
			"country": "United States",
			"IATA": "CUB",
			"ICAO": "KCUB",
			"lat": "33.970500946",
			"lng": "-80.9952011108"
		},
		"Grove Municipal Airport": {
			"id": "10129",
			"name": "Grove Municipal Airport",
			"city": "Grove",
			"country": "United States",
			"IATA": "GMJ",
			"ICAO": "KGMJ",
			"lat": "36.60680008",
			"lng": "-94.73860168"
		},
		"Mc Pherson Airport": {
			"id": "10130",
			"name": "Mc Pherson Airport",
			"city": "Mc Pherson",
			"country": "United States",
			"IATA": "MPR",
			"ICAO": "KMPR",
			"lat": "38.35240173",
			"lng": "-97.69129944"
		},
		"Donaldson Center Airport": {
			"id": "10131",
			"name": "Donaldson Center Airport",
			"city": "Greenville",
			"country": "United States",
			"IATA": "GYH",
			"ICAO": "KGYH",
			"lat": "34.7583007812",
			"lng": "-82.3764038086"
		},
		"Perry Houston County Airport": {
			"id": "10132",
			"name": "Perry Houston County Airport",
			"city": "Perry",
			"country": "United States",
			"IATA": "PXE",
			"ICAO": "KPXE",
			"lat": "32.51060104370117",
			"lng": "-83.76730346679688"
		},
		"Hartsville Regional Airport": {
			"id": "10133",
			"name": "Hartsville Regional Airport",
			"city": "Hartsville",
			"country": "United States",
			"IATA": "HVS",
			"ICAO": "KHVS",
			"lat": "34.4030990601",
			"lng": "-80.11920166019999"
		},
		"Horace Williams Airport": {
			"id": "10134",
			"name": "Horace Williams Airport",
			"city": "Chapel Hill",
			"country": "United States",
			"IATA": "IGX",
			"ICAO": "KIGX",
			"lat": "35.935001",
			"lng": "-79.065902"
		},
		"Brunswick County Airport": {
			"id": "10138",
			"name": "Brunswick County Airport",
			"city": "Oak Island",
			"country": "United States",
			"IATA": "SUT",
			"ICAO": "KSUT",
			"lat": "33.9292984",
			"lng": "-78.07499695"
		},
		"Chesterfield County Airport": {
			"id": "10139",
			"name": "Chesterfield County Airport",
			"city": "Richmond",
			"country": "United States",
			"IATA": "FCI",
			"ICAO": "KFCI",
			"lat": "37.40650177",
			"lng": "-77.52500153"
		},
		"Henderson Oxford Airport": {
			"id": "10144",
			"name": "Henderson Oxford Airport",
			"city": "Oxford",
			"country": "United States",
			"IATA": "HNZ",
			"ICAO": "KHNZ",
			"lat": "36.36159897",
			"lng": "-78.52919769"
		},
		"Leesburg International Airport": {
			"id": "10145",
			"name": "Leesburg International Airport",
			"city": "Leesburg",
			"country": "United States",
			"IATA": "LEE",
			"ICAO": "KLEE",
			"lat": "28.82309914",
			"lng": "-81.80870056"
		},
		"Chino Airport": {
			"id": "10162",
			"name": "Chino Airport",
			"city": "Chino",
			"country": "United States",
			"IATA": "CNO",
			"ICAO": "KCNO",
			"lat": "33.97470093",
			"lng": "-117.637001"
		},
		"Madison County Airport": {
			"id": "10169",
			"name": "Madison County Airport",
			"city": "London",
			"country": "United States",
			"IATA": "UYF",
			"ICAO": "KUYF",
			"lat": "39.93270111",
			"lng": "-83.46199799"
		},
		"Paso Robles Municipal Airport": {
			"id": "10185",
			"name": "Paso Robles Municipal Airport",
			"city": "Paso Robles",
			"country": "United States",
			"IATA": "PRB",
			"ICAO": "KPRB",
			"lat": "35.67290115",
			"lng": "-120.6269989"
		},
		"Half Moon Bay Airport": {
			"id": "10360",
			"name": "Half Moon Bay Airport",
			"city": "Half Moon Bay",
			"country": "United States",
			"IATA": "HAF",
			"ICAO": "KHAF",
			"lat": "37.513401031499995",
			"lng": "-122.500999451"
		},
		"General WM J Fox Airfield": {
			"id": "10371",
			"name": "General WM J Fox Airfield",
			"city": "Lancaster",
			"country": "United States",
			"IATA": "WJF",
			"ICAO": "KWJF",
			"lat": "34.74110031",
			"lng": "-118.2190018"
		},
		"Person County Airport": {
			"id": "10831",
			"name": "Person County Airport",
			"city": "Roxboro",
			"country": "United States",
			"IATA": "TDF",
			"ICAO": "KTDF",
			"lat": "36.28490067",
			"lng": "-78.98419952"
		},
		"Talladega Municipal Airport": {
			"id": "11004",
			"name": "Talladega Municipal Airport",
			"city": "Talladega",
			"country": "United States",
			"IATA": "ASN",
			"ICAO": "KASN",
			"lat": "33.569900512699995",
			"lng": "-86.05090332030001"
		},
		"Greenville Downtown Airport": {
			"id": "11005",
			"name": "Greenville Downtown Airport",
			"city": "Greenville",
			"country": "United States",
			"IATA": "GMU",
			"ICAO": "KGMU",
			"lat": "34.847900390599996",
			"lng": "-82.34999847410002"
		},
		"Mankato Regional Airport": {
			"id": "11008",
			"name": "Mankato Regional Airport",
			"city": "Mankato",
			"country": "United States",
			"IATA": "MKT",
			"ICAO": "KMKT",
			"lat": "44.22159958",
			"lng": "-93.91870117"
		},
		"Troy Municipal Airport": {
			"id": "11010",
			"name": "Troy Municipal Airport",
			"city": "Troy",
			"country": "United States",
			"IATA": "TOI",
			"ICAO": "KTOI",
			"lat": "31.860399246216",
			"lng": "-86.012100219727"
		},
		"Merkel Field Sylacauga Municipal Airport": {
			"id": "11011",
			"name": "Merkel Field Sylacauga Municipal Airport",
			"city": "Sylacauga",
			"country": "United States",
			"IATA": "SCD",
			"ICAO": "KSCD",
			"lat": "33.17179870605469",
			"lng": "-86.30549621582031"
		},
		"Enterprise Municipal Airport": {
			"id": "11012",
			"name": "Enterprise Municipal Airport",
			"city": "Enterprise",
			"country": "United States",
			"IATA": "EDN",
			"ICAO": "KEDN",
			"lat": "31.29969978",
			"lng": "-85.89990234"
		},
		"Ryan Field": {
			"id": "11017",
			"name": "Ryan Field",
			"city": "Tucson",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KRYN",
			"lat": "32.1422004699707",
			"lng": "-111.17500305175781"
		},
		"Thomas C Russell Field": {
			"id": "11022",
			"name": "Thomas C Russell Field",
			"city": "Alexander City",
			"country": "United States",
			"IATA": "ALX",
			"ICAO": "KALX",
			"lat": "32.914699554399995",
			"lng": "-85.9629974365"
		},
		"Meriden Markham Municipal Airport": {
			"id": "11035",
			"name": "Meriden Markham Municipal Airport",
			"city": "Meriden",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KMMK",
			"lat": "41.50870132446289",
			"lng": "-72.82949829101562"
		},
		"Ridgely Airpark": {
			"id": "11067",
			"name": "Ridgely Airpark",
			"city": "Ridgely",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KRJD",
			"lat": "38.97010040283203",
			"lng": "-75.86630249023438"
		},
		"New Castle Henry Co. Municipal Airport": {
			"id": "11068",
			"name": "New Castle Henry Co. Municipal Airport",
			"city": "New Castle",
			"country": "United States",
			"IATA": "UWL",
			"ICAO": "KUWL",
			"lat": "39.87590027",
			"lng": "-85.32649994"
		},
		"Scott City Municipal Airport": {
			"id": "11069",
			"name": "Scott City Municipal Airport",
			"city": "Scott City",
			"country": "United States",
			"IATA": "TQK",
			"ICAO": "KTQK",
			"lat": "38.474300384521484",
			"lng": "-100.88500213623047"
		},
		"Brewster Field": {
			"id": "11070",
			"name": "Brewster Field",
			"city": "Holdredge",
			"country": "United States",
			"IATA": "HDE",
			"ICAO": "KHDE",
			"lat": "40.452099",
			"lng": "-99.336502"
		},
		"Pratt Regional Airport": {
			"id": "11071",
			"name": "Pratt Regional Airport",
			"city": "Pratt",
			"country": "United States",
			"IATA": "PTT",
			"ICAO": "KPTT",
			"lat": "37.70159912",
			"lng": "-98.74690247"
		},
		"Wahoo Municipal Airport": {
			"id": "11073",
			"name": "Wahoo Municipal Airport",
			"city": "Wahoo",
			"country": "United States",
			"IATA": "AHQ",
			"ICAO": "KAHQ",
			"lat": "41.2412986755",
			"lng": "-96.59400177"
		},
		"Jim Kelly Field": {
			"id": "11074",
			"name": "Jim Kelly Field",
			"city": "Lexington",
			"country": "United States",
			"IATA": "LXN",
			"ICAO": "KLXN",
			"lat": "40.791000366199995",
			"lng": "-99.7772979736"
		},
		"Sublette Municipal Airport": {
			"id": "11075",
			"name": "Sublette Municipal Airport",
			"city": "Sublette",
			"country": "United States",
			"IATA": "19S",
			"ICAO": "K19S",
			"lat": "37.49140167",
			"lng": "-100.8300018"
		},
		"Council Bluffs Municipal Airport": {
			"id": "11076",
			"name": "Council Bluffs Municipal Airport",
			"city": "Council Bluffs",
			"country": "United States",
			"IATA": "CBF",
			"ICAO": "KCBF",
			"lat": "41.2592010498",
			"lng": "-95.760597229"
		},
		"Kokomo Municipal Airport": {
			"id": "11077",
			"name": "Kokomo Municipal Airport",
			"city": "Kokomo",
			"country": "United States",
			"IATA": "OKK",
			"ICAO": "KOKK",
			"lat": "40.528198242188",
			"lng": "-86.05899810791"
		},
		"Neodesha Municipal Airport": {
			"id": "11078",
			"name": "Neodesha Municipal Airport",
			"city": "Neodesha",
			"country": "United States",
			"IATA": "2K7",
			"ICAO": "K2K7",
			"lat": "37.43539810180664",
			"lng": "-95.64610290527344"
		},
		"King Ranch Airport": {
			"id": "11079",
			"name": "King Ranch Airport",
			"city": "Sutton",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "AK59",
			"lat": "61.79560089111328",
			"lng": "-148.35499572753906"
		},
		"Elkhart Morton County Airport": {
			"id": "11080",
			"name": "Elkhart Morton County Airport",
			"city": "Elkhart",
			"country": "United States",
			"IATA": "EHA",
			"ICAO": "KEHA",
			"lat": "37.000702",
			"lng": "-101.879997"
		},
		"Front Range Airport": {
			"id": "11081",
			"name": "Front Range Airport",
			"city": "Denver",
			"country": "United States",
			"IATA": "FTG",
			"ICAO": "KFTG",
			"lat": "39.785301208496094",
			"lng": "-104.54299926757812"
		},
		"Galesburg Municipal Airport": {
			"id": "11082",
			"name": "Galesburg Municipal Airport",
			"city": "Galesburg",
			"country": "United States",
			"IATA": "GBG",
			"ICAO": "KGBG",
			"lat": "40.937999725299996",
			"lng": "-90.431098938"
		},
		"Guymon Municipal Airport": {
			"id": "11084",
			"name": "Guymon Municipal Airport",
			"city": "Guymon",
			"country": "United States",
			"IATA": "GUY",
			"ICAO": "KGUY",
			"lat": "36.6851005554",
			"lng": "-101.508003235"
		},
		"Meade Municipal Airport": {
			"id": "11086",
			"name": "Meade Municipal Airport",
			"city": "Meade",
			"country": "United States",
			"IATA": "MEJ",
			"ICAO": "KMEJ",
			"lat": "37.27690124511719",
			"lng": "-100.35600280761719"
		},
		"Turkey Mountain Estates Airport": {
			"id": "11087",
			"name": "Turkey Mountain Estates Airport",
			"city": "Shell Knob",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "MO00",
			"lat": "36.59170150756836",
			"lng": "-93.66690063476562"
		},
		"Ulysses Airport": {
			"id": "11088",
			"name": "Ulysses Airport",
			"city": "Ulysses",
			"country": "United States",
			"IATA": "ULS",
			"ICAO": "KULS",
			"lat": "37.60400009",
			"lng": "-101.3740005"
		},
		"Flagler Aerial Spraying Inc Airport": {
			"id": "11089",
			"name": "Flagler Aerial Spraying Inc Airport",
			"city": "Flagler",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "CO00",
			"lat": "39.279998779296875",
			"lng": "-103.06700134277344"
		},
		"Independence Municipal Airport": {
			"id": "11090",
			"name": "Independence Municipal Airport",
			"city": "Independence",
			"country": "United States",
			"IATA": "IDP",
			"ICAO": "KIDP",
			"lat": "37.1584014893",
			"lng": "-95.77839660640001"
		},
		"Augusta Municipal Airport": {
			"id": "11091",
			"name": "Augusta Municipal Airport",
			"city": "Augusta",
			"country": "United States",
			"IATA": "3AU",
			"ICAO": "K3AU",
			"lat": "37.671600341796875",
			"lng": "-97.0779037475586"
		},
		"Larned Pawnee County Airport": {
			"id": "11092",
			"name": "Larned Pawnee County Airport",
			"city": "Larned",
			"country": "United States",
			"IATA": "LQR",
			"ICAO": "KLQR",
			"lat": "38.20859909",
			"lng": "-99.08599854"
		},
		"Lampasas Airport": {
			"id": "11093",
			"name": "Lampasas Airport",
			"city": "Lampasas",
			"country": "United States",
			"IATA": "LZZ",
			"ICAO": "KLZZ",
			"lat": "31.106199264526367",
			"lng": "-98.1958999633789"
		},
		"Bay City Municipal Airport": {
			"id": "11094",
			"name": "Bay City Municipal Airport",
			"city": "Bay City",
			"country": "United States",
			"IATA": "BYY",
			"ICAO": "KBYY",
			"lat": "28.9733009338",
			"lng": "-95.8635025024"
		},
		"Cox Field": {
			"id": "11095",
			"name": "Cox Field",
			"city": "Paris",
			"country": "United States",
			"IATA": "PRX",
			"ICAO": "KPRX",
			"lat": "33.636600494385",
			"lng": "-95.450798034668"
		},
		"Coffeyville Municipal Airport": {
			"id": "11096",
			"name": "Coffeyville Municipal Airport",
			"city": "Coffeyville",
			"country": "United States",
			"IATA": "CFV",
			"ICAO": "KCFV",
			"lat": "37.09400177",
			"lng": "-95.5718994141"
		},
		"The Farm Airport": {
			"id": "11097",
			"name": "The Farm Airport",
			"city": "Summit",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "24SC",
			"lat": "33.93579864501953",
			"lng": "-81.42970275878906"
		},
		"Greeley–Weld County Airport": {
			"id": "11098",
			"name": "Greeley–Weld County Airport",
			"city": "Greeley",
			"country": "United States",
			"IATA": "GXY",
			"ICAO": "KGXY",
			"lat": "40.4374008179",
			"lng": "-104.633003235"
		},
		"General Dewitt Spain Airport": {
			"id": "11099",
			"name": "General Dewitt Spain Airport",
			"city": "Memphis",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KM01",
			"lat": "35.20069885",
			"lng": "-90.05400085"
		},
		"Oryol Yuzhny Airport": {
			"id": "11100",
			"name": "Oryol Yuzhny Airport",
			"city": "Oakley",
			"country": "United States",
			"IATA": "OEL",
			"ICAO": "UUOR",
			"lat": "52.934700012200004",
			"lng": "36.0022010803"
		},
		"Fremont Municipal Airport": {
			"id": "11101",
			"name": "Fremont Municipal Airport",
			"city": "Fremont",
			"country": "United States",
			"IATA": "FET",
			"ICAO": "KFET",
			"lat": "41.44910049",
			"lng": "-96.52020264"
		},
		"La Grande/Union County Airport": {
			"id": "11102",
			"name": "La Grande/Union County Airport",
			"city": "La Grande",
			"country": "United States",
			"IATA": "LGD",
			"ICAO": "KLGD",
			"lat": "45.2901992798",
			"lng": "-118.007003784"
		},
		"Pocono Mountains Municipal Airport": {
			"id": "11110",
			"name": "Pocono Mountains Municipal Airport",
			"city": "Mount Pocono",
			"country": "United States",
			"IATA": "MPO",
			"ICAO": "KMPO",
			"lat": "41.13750076",
			"lng": "-75.37889862"
		},
		"Quakertown Airport": {
			"id": "11111",
			"name": "Quakertown Airport",
			"city": "Quakertown",
			"country": "United States",
			"IATA": "UKT",
			"ICAO": "KUKT",
			"lat": "40.435199737549",
			"lng": "-75.381896972656"
		},
		"Banning Municipal Airport": {
			"id": "11131",
			"name": "Banning Municipal Airport",
			"city": "Banning",
			"country": "United States",
			"IATA": "BNG",
			"ICAO": "KBNG",
			"lat": "33.9230995178",
			"lng": "-116.850997925"
		},
		"Karl Stefan Memorial Airport": {
			"id": "11134",
			"name": "Karl Stefan Memorial Airport",
			"city": "Norfolk  Nebraska",
			"country": "United States",
			"IATA": "OFK",
			"ICAO": "KOFK",
			"lat": "41.985500335693",
			"lng": "-97.435096740723"
		},
		"Peter O Knight Airport": {
			"id": "11153",
			"name": "Peter O Knight Airport",
			"city": "Tampa",
			"country": "United States",
			"IATA": "TPF",
			"ICAO": "KTPF",
			"lat": "27.915599822998",
			"lng": "-82.44930267334"
		},
		"Montauk Airport": {
			"id": "11243",
			"name": "Montauk Airport",
			"city": "Montauk",
			"country": "United States",
			"IATA": "MTP",
			"ICAO": "KMTP",
			"lat": "41.076499938964844",
			"lng": "-71.9207992553711"
		},
		"Porter County Municipal Airport": {
			"id": "11255",
			"name": "Porter County Municipal Airport",
			"city": "Valparaiso IN",
			"country": "United States",
			"IATA": "VPZ",
			"ICAO": "KVPZ",
			"lat": "41.45399857",
			"lng": "-87.00710297"
		},
		"Mason County Airport": {
			"id": "11299",
			"name": "Mason County Airport",
			"city": "Ludington",
			"country": "United States",
			"IATA": "LDM",
			"ICAO": "KLDM",
			"lat": "43.96250153",
			"lng": "-86.40789795"
		},
		"Reid-Hillview Airport of Santa Clara County": {
			"id": "11312",
			"name": "Reid-Hillview Airport of Santa Clara County",
			"city": "San Jose",
			"country": "United States",
			"IATA": "RHV",
			"ICAO": "KRHV",
			"lat": "37.332901001",
			"lng": "-121.819000244"
		},
		"Camarillo Airport": {
			"id": "11438",
			"name": "Camarillo Airport",
			"city": "Camarillo - CA",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KCMA",
			"lat": "34.21369934082031",
			"lng": "-119.09400177001953"
		},
		"Watsonville Municipal Airport": {
			"id": "11638",
			"name": "Watsonville Municipal Airport",
			"city": "Watsonville",
			"country": "United States",
			"IATA": "WVI",
			"ICAO": "KWVI",
			"lat": "36.9356994629",
			"lng": "-121.790000916"
		},
		"Williamsburg Jamestown Airport": {
			"id": "11649",
			"name": "Williamsburg Jamestown Airport",
			"city": "Williamsburg",
			"country": "United States",
			"IATA": "JGG",
			"ICAO": "KJGG",
			"lat": "37.239200592041016",
			"lng": "-76.71610260009766"
		},
		"Union County Airport": {
			"id": "11742",
			"name": "Union County Airport",
			"city": "Marysville",
			"country": "United States",
			"IATA": "MRT",
			"ICAO": "KMRT",
			"lat": "40.224700927734375",
			"lng": "-83.35160064697266"
		},
		"St Louis Regional Airport": {
			"id": "11814",
			"name": "St Louis Regional Airport",
			"city": "Alton/St Louis",
			"country": "United States",
			"IATA": "ALN",
			"ICAO": "KALN",
			"lat": "38.89030075069999",
			"lng": "-90.0459976196"
		},
		"Chandler Field": {
			"id": "11815",
			"name": "Chandler Field",
			"city": "Alexandria",
			"country": "United States",
			"IATA": "AXN",
			"ICAO": "KAXN",
			"lat": "45.8662986755",
			"lng": "-95.39469909670001"
		},
		"Columbus Municipal Airport": {
			"id": "11847",
			"name": "Columbus Municipal Airport",
			"city": "Columbus",
			"country": "United States",
			"IATA": "OLU",
			"ICAO": "KOLU",
			"lat": "41.44800186",
			"lng": "-97.34259796"
		},
		"Curtis Field": {
			"id": "11817",
			"name": "Curtis Field",
			"city": "Brady",
			"country": "United States",
			"IATA": "BBD",
			"ICAO": "KBBD",
			"lat": "31.1793003082",
			"lng": "-99.3238983154"
		},
		"Eastern Sierra Regional Airport": {
			"id": "11818",
			"name": "Eastern Sierra Regional Airport",
			"city": "Bishop",
			"country": "United States",
			"IATA": "BIH",
			"ICAO": "KBIH",
			"lat": "37.3731002808",
			"lng": "-118.363998413"
		},
		"Baker City Municipal Airport": {
			"id": "11819",
			"name": "Baker City Municipal Airport",
			"city": "Baker City",
			"country": "United States",
			"IATA": "BKE",
			"ICAO": "KBKE",
			"lat": "44.837299346900004",
			"lng": "-117.808998108"
		},
		"Miley Memorial Field": {
			"id": "11820",
			"name": "Miley Memorial Field",
			"city": "Big Piney",
			"country": "United States",
			"IATA": "BPI",
			"ICAO": "KBPI",
			"lat": "42.58509827",
			"lng": "-110.1110001"
		},
		"Ozark Regional Airport": {
			"id": "11821",
			"name": "Ozark Regional Airport",
			"city": "Mountain Home",
			"country": "United States",
			"IATA": "WMH",
			"ICAO": "KBPK",
			"lat": "36.3689002991",
			"lng": "-92.47049713130001"
		},
		"W K Kellogg Airport": {
			"id": "11822",
			"name": "W K Kellogg Airport",
			"city": "Battle Creek",
			"country": "United States",
			"IATA": "BTL",
			"ICAO": "KBTL",
			"lat": "42.307300567599995",
			"lng": "-85.2515029907"
		},
		"Burley Municipal Airport": {
			"id": "11823",
			"name": "Burley Municipal Airport",
			"city": "Burley",
			"country": "United States",
			"IATA": "BYI",
			"ICAO": "KBYI",
			"lat": "42.542598724399994",
			"lng": "-113.772003174"
		},
		"Northeast Iowa Regional Airport": {
			"id": "11824",
			"name": "Northeast Iowa Regional Airport",
			"city": "Charles City",
			"country": "United States",
			"IATA": "CCY",
			"ICAO": "KCCY",
			"lat": "43.0726013184",
			"lng": "-92.6108016968"
		},
		"Chanute Martin Johnson Airport": {
			"id": "11825",
			"name": "Chanute Martin Johnson Airport",
			"city": "Chanute",
			"country": "United States",
			"IATA": "CNU",
			"ICAO": "KCNU",
			"lat": "37.668800354",
			"lng": "-95.4850997925"
		},
		"Jacksonville Executive at Craig Airport": {
			"id": "11826",
			"name": "Jacksonville Executive at Craig Airport",
			"city": "Jacksonville",
			"country": "United States",
			"IATA": "CRG",
			"ICAO": "KCRG",
			"lat": "30.3362998962",
			"lng": "-81.51439666750001"
		},
		"Crossville Memorial Whitson Field": {
			"id": "11827",
			"name": "Crossville Memorial Whitson Field",
			"city": "Crossville",
			"country": "United States",
			"IATA": "CSV",
			"ICAO": "KCSV",
			"lat": "35.9513015747",
			"lng": "-85.08499908450001"
		},
		"Davison Army Air Field": {
			"id": "11828",
			"name": "Davison Army Air Field",
			"city": "Fort Belvoir",
			"country": "United States",
			"IATA": "DAA",
			"ICAO": "KDAA",
			"lat": "38.715000152600005",
			"lng": "-77.1809997559"
		},
		"Barstow Daggett Airport": {
			"id": "11829",
			"name": "Barstow Daggett Airport",
			"city": "Daggett",
			"country": "United States",
			"IATA": "DAG",
			"ICAO": "KDAG",
			"lat": "34.85369873",
			"lng": "-116.7870026"
		},
		"Deming Municipal Airport": {
			"id": "11830",
			"name": "Deming Municipal Airport",
			"city": "Deming",
			"country": "United States",
			"IATA": "DMN",
			"ICAO": "KDMN",
			"lat": "32.262298584",
			"lng": "-107.721000671"
		},
		"Desert Rock Airport": {
			"id": "11831",
			"name": "Desert Rock Airport",
			"city": "Mercury",
			"country": "United States",
			"IATA": "DRA",
			"ICAO": "KDRA",
			"lat": "36.6194",
			"lng": "-116.032997"
		},
		"Needles Airport": {
			"id": "11832",
			"name": "Needles Airport",
			"city": "Needles",
			"country": "United States",
			"IATA": "EED",
			"ICAO": "KEED",
			"lat": "34.7663002014",
			"lng": "-114.623001099"
		},
		"Duke Field": {
			"id": "11833",
			"name": "Duke Field",
			"city": "Crestview",
			"country": "United States",
			"IATA": "EGI",
			"ICAO": "KEGI",
			"lat": "30.65040016",
			"lng": "-86.52290344"
		},
		"Murray Field": {
			"id": "11834",
			"name": "Murray Field",
			"city": "Eureka",
			"country": "United States",
			"IATA": "EKA",
			"ICAO": "KEKA",
			"lat": "40.803398132299996",
			"lng": "-124.112998962"
		},
		"San Marcos Municipal Airport": {
			"id": "11835",
			"name": "San Marcos Municipal Airport",
			"city": "San Marcos",
			"country": "United States",
			"IATA": "HYI",
			"ICAO": "KHYI",
			"lat": "29.8927001953125",
			"lng": "-97.86299896240234"
		},
		"Sawyer County Airport": {
			"id": "11836",
			"name": "Sawyer County Airport",
			"city": "Hayward",
			"country": "United States",
			"IATA": "HYR",
			"ICAO": "KHYR",
			"lat": "46.025199890100005",
			"lng": "-91.44429779050002"
		},
		"Kimble County Airport": {
			"id": "11837",
			"name": "Kimble County Airport",
			"city": "Junction",
			"country": "United States",
			"IATA": "JCT",
			"ICAO": "KJCT",
			"lat": "30.5112991333",
			"lng": "-99.7634963989"
		},
		"Monticello Municipal Ellis Field": {
			"id": "11838",
			"name": "Monticello Municipal Ellis Field",
			"city": "Monticello",
			"country": "United States",
			"IATA": "LLQ",
			"ICAO": "KLLQ",
			"lat": "33.6385994",
			"lng": "-91.75099945"
		},
		"Derby Field": {
			"id": "11839",
			"name": "Derby Field",
			"city": "Lovelock",
			"country": "United States",
			"IATA": "LOL",
			"ICAO": "KLOL",
			"lat": "40.0663986206",
			"lng": "-118.565002441"
		},
		"Mobridge Municipal Airport": {
			"id": "11840",
			"name": "Mobridge Municipal Airport",
			"city": "Mobridge",
			"country": "United States",
			"IATA": "MBG",
			"ICAO": "KMBG",
			"lat": "45.54650116",
			"lng": "-100.4079971"
		},
		"Mc Comb/Pike County Airport/John E Lewis Field": {
			"id": "11841",
			"name": "Mc Comb/Pike County Airport/John E Lewis Field",
			"city": "Mc Comb",
			"country": "United States",
			"IATA": "MCB",
			"ICAO": "KMCB",
			"lat": "31.17849922",
			"lng": "-90.47190094"
		},
		"Southern Illinois Airport": {
			"id": "11842",
			"name": "Southern Illinois Airport",
			"city": "Carbondale/Murphysboro",
			"country": "United States",
			"IATA": "MDH",
			"ICAO": "KMDH",
			"lat": "37.778099060058594",
			"lng": "-89.25199890136719"
		},
		"Mc Entire Joint National Guard Base": {
			"id": "11843",
			"name": "Mc Entire Joint National Guard Base",
			"city": "Eastover",
			"country": "United States",
			"IATA": "MMT",
			"ICAO": "KMMT",
			"lat": "33.92079926",
			"lng": "-80.80130005"
		},
		"Brunswick Executive Airport": {
			"id": "11844",
			"name": "Brunswick Executive Airport",
			"city": "Brunswick",
			"country": "United States",
			"IATA": "NHZ",
			"ICAO": "KNHZ",
			"lat": "43.89220047",
			"lng": "-69.93859863"
		},
		"Naval Station Mayport (Admiral David L. Mcdonald Field)": {
			"id": "11845",
			"name": "Naval Station Mayport (Admiral David L. Mcdonald Field)",
			"city": "Mayport",
			"country": "United States",
			"IATA": "NRB",
			"ICAO": "KNRB",
			"lat": "30.39109993",
			"lng": "-81.42469788"
		},
		"Orangeburg Municipal Airport": {
			"id": "11846",
			"name": "Orangeburg Municipal Airport",
			"city": "Orangeburg",
			"country": "United States",
			"IATA": "OGB",
			"ICAO": "KOGB",
			"lat": "33.456798553467",
			"lng": "-80.859497070312"
		},
		"Ottumwa Regional Airport": {
			"id": "11848",
			"name": "Ottumwa Regional Airport",
			"city": "Ottumwa",
			"country": "United States",
			"IATA": "OTM",
			"ICAO": "KOTM",
			"lat": "41.10660172",
			"lng": "-92.44789886"
		},
		"Cairns AAF (Fort Rucker) Air Field": {
			"id": "11849",
			"name": "Cairns AAF (Fort Rucker) Air Field",
			"city": "Fort Rucker/Ozark",
			"country": "United States",
			"IATA": "OZR",
			"ICAO": "KOZR",
			"lat": "31.27569962",
			"lng": "-85.71340179"
		},
		"Ralph Wenz Field": {
			"id": "11850",
			"name": "Ralph Wenz Field",
			"city": "Pinedale",
			"country": "United States",
			"IATA": "PWY",
			"ICAO": "KPNA",
			"lat": "42.79550171",
			"lng": "-109.8069992"
		},
		"Dutchess County Airport": {
			"id": "11851",
			"name": "Dutchess County Airport",
			"city": "Poughkeepsie",
			"country": "United States",
			"IATA": "POU",
			"ICAO": "KPOU",
			"lat": "41.6265983581543",
			"lng": "-73.88420104980469"
		},
		"New Richmond Regional Airport": {
			"id": "11852",
			"name": "New Richmond Regional Airport",
			"city": "New Richmond",
			"country": "United States",
			"IATA": "RNH",
			"ICAO": "KRNH",
			"lat": "45.14830017",
			"lng": "-92.5381012"
		},
		"Russell Municipal Airport": {
			"id": "11853",
			"name": "Russell Municipal Airport",
			"city": "Russell",
			"country": "United States",
			"IATA": "RSL",
			"ICAO": "KRSL",
			"lat": "38.872100830078",
			"lng": "-98.811798095703"
		},
		"Redwood Falls Municipal Airport": {
			"id": "11854",
			"name": "Redwood Falls Municipal Airport",
			"city": "Redwood Falls",
			"country": "United States",
			"IATA": "RWF",
			"ICAO": "KRWF",
			"lat": "44.54719925",
			"lng": "-95.08229828"
		},
		"Salinas Municipal Airport": {
			"id": "11855",
			"name": "Salinas Municipal Airport",
			"city": "Salinas",
			"country": "United States",
			"IATA": "SNS",
			"ICAO": "KSNS",
			"lat": "36.662799835205",
			"lng": "-121.60600280762"
		},
		"Sonora Municipal Airport": {
			"id": "11856",
			"name": "Sonora Municipal Airport",
			"city": "Sonora",
			"country": "United States",
			"IATA": "SOA",
			"ICAO": "KSOA",
			"lat": "30.585699081421",
			"lng": "-100.6490020752"
		},
		"Saline County Regional Airport": {
			"id": "11857",
			"name": "Saline County Regional Airport",
			"city": "Benton",
			"country": "United States",
			"IATA": "SUZ",
			"ICAO": "KSUZ",
			"lat": "34.59059906",
			"lng": "-92.47940063"
		},
		"Tonopah Airport": {
			"id": "11858",
			"name": "Tonopah Airport",
			"city": "Tonopah",
			"country": "United States",
			"IATA": "TPH",
			"ICAO": "KTPH",
			"lat": "38.06019974",
			"lng": "-117.086998"
		},
		"Aurora State Airport": {
			"id": "11859",
			"name": "Aurora State Airport",
			"city": "Aurora",
			"country": "United States",
			"IATA": "UAO",
			"ICAO": "KUAO",
			"lat": "45.247100830078125",
			"lng": "-122.7699966430664"
		},
		"Ukiah Municipal Airport": {
			"id": "11860",
			"name": "Ukiah Municipal Airport",
			"city": "Ukiah",
			"country": "United States",
			"IATA": "UKI",
			"ICAO": "KUKI",
			"lat": "39.125999450684",
			"lng": "-123.20099639893"
		},
		"University Oxford Airport": {
			"id": "11861",
			"name": "University Oxford Airport",
			"city": "Oxford",
			"country": "United States",
			"IATA": "UOX",
			"ICAO": "KUOX",
			"lat": "34.384300231934",
			"lng": "-89.536796569824"
		},
		"Huntsville Regional Airport": {
			"id": "11862",
			"name": "Huntsville Regional Airport",
			"city": "Huntsville",
			"country": "United States",
			"IATA": "HTV",
			"ICAO": "KUTS",
			"lat": "30.7469005585",
			"lng": "-95.5871963501"
		},
		"Miller Field": {
			"id": "11863",
			"name": "Miller Field",
			"city": "Valentine",
			"country": "United States",
			"IATA": "VTN",
			"ICAO": "KVTN",
			"lat": "42.85779953",
			"lng": "-100.5479965"
		},
		"Winnemucca Municipal Airport": {
			"id": "11864",
			"name": "Winnemucca Municipal Airport",
			"city": "Winnemucca",
			"country": "United States",
			"IATA": "WMC",
			"ICAO": "KWMC",
			"lat": "40.8965988159",
			"lng": "-117.805999756"
		},
		"West Woodward Airport": {
			"id": "11865",
			"name": "West Woodward Airport",
			"city": "Woodward",
			"country": "United States",
			"IATA": "WWR",
			"ICAO": "KWWR",
			"lat": "36.438",
			"lng": "-99.5226667"
		},
		"Cape Canaveral AFS Skid Strip": {
			"id": "11866",
			"name": "Cape Canaveral AFS Skid Strip",
			"city": "Cocoa Beach",
			"country": "United States",
			"IATA": "XMR",
			"ICAO": "KXMR",
			"lat": "28.4675998688",
			"lng": "-80.56659698490002"
		},
		"Homey (Area 51) Airport": {
			"id": "11867",
			"name": "Homey (Area 51) Airport",
			"city": "Groom Lake",
			"country": "United States",
			"IATA": "\\N",
			"ICAO": "KXTA",
			"lat": "37.23500061035156",
			"lng": "-115.81099700927734"
		},
		"Zanesville Municipal Airport": {
			"id": "11868",
			"name": "Zanesville Municipal Airport",
			"city": "Zanesville",
			"country": "United States",
			"IATA": "ZZV",
			"ICAO": "KZZV",
			"lat": "39.9444007874",
			"lng": "-81.89209747310001"
		},
		"Nenana Municipal Airport": {
			"id": "11918",
			"name": "Nenana Municipal Airport",
			"city": "Nenana",
			"country": "United States",
			"IATA": "ENN",
			"ICAO": "PANN",
			"lat": "64.54730224609375",
			"lng": "-149.07400512695312"
		},
		"Wasilla Airport": {
			"id": "11919",
			"name": "Wasilla Airport",
			"city": "Wasilla",
			"country": "United States",
			"IATA": "WWA",
			"ICAO": "PAWS",
			"lat": "61.5717010498",
			"lng": "-149.539993286"
		}
	};

/***/ }
/******/ ]);