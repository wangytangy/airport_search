const API_KEY = "AIzaSyBj2czDtrlCW9CGb_JucuQqabbRRVWCjKE";
let map;

function initMap() {
  let usa = new google.maps.LatLng(37.09024, -95.712891);

  map = new google.maps.Map(document.getElementById('map'), {
    center: usa,
    zoom: 4
  });

  let request = {
    location: usa,
    radius: '50000',
    type: 'airport'
  }

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, placeAirports);
}

function placeAirports(results, status) {
  console.log(results);
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(place);
    }
  }
}

function createMarker(place) {
  let placeLatLng = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng()};

  let marker = new google.maps.Marker({
   position: placeLatLng,
   map: map,
   title: 'Airport!',
 });
}
