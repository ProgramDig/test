console.log(L)
L.Routing.control({
    waypoints: [
        L.latLng(50.42769316098106, 30.53938160775555),
        L.latLng(50.440503091056684, 30.595825474189596)
    ],
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim()
}).addTo(map);