const Map = (function() {
  let map;

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
      title: location.name,
      map: map,
      animation: google.maps.Animation.DROP
    });

    var infowindow = new google.maps.InfoWindow({
      content: location.name
    });

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
    let dist = google.maps.geometry.spherical.computeDistanceBetween(startPos, endPos);
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
      debugger
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

module.exports = Map;
