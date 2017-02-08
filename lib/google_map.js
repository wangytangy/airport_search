const Map = (function() {

  const API_KEY = "AIzaSyBj2czDtrlCW9CGb_JucuQqabbRRVWCjKE";
  let map;
  let markers = [];

  function createMap() {
    let usa = new google.maps.LatLng(37.09024, -95.712891);

    map = new google.maps.Map(document.getElementById('map'), {
      center: usa,
      zoom: 4
    });
  }

  function setMarkers(location) {
    let latLng = new google.maps.LatLng(parseInt(location.lat), parseInt(location.lng));

    let marker = new google.maps.Marker({
      position: latLng,
      title: 'Airport!'
    });
    markers.push(marker);
    marker.setMap(map);
  }

  function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null)
    }
    markers = [];
  }


  return {
    createMap: createMap,
    setMarkers: setMarkers,
    clearMarkers: clearMarkers
  }

})();

module.exports = Map;
