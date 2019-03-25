// Map Initialization
$(document).ready(splash);

var map = L.map("mapId", {zoomControl: false}).setView([40,12], 5);
var zoomControl = L.control.zoom({
    position:'topright'

}).addTo(map);
var layer = L.esri.basemapLayer("Topographic").addTo(map);

var floodToggle = false;
var reliefToggle = false;
var slumToggle = false;

// Slum Zone Layer
var slumData = L.esri.featureLayer({
    url: "https://services.arcgis.com/8df8p0NlLFEShl0r/ArcGIS/rest/services/Pop_Slum_Pop_Zones_Final/FeatureServer/0",
    style: function(feature) {
        var pop = feature.properties.Population;
        if (pop > 1750) {
            return {color: "#9d3540", weight: 2, fillOpacity: .2}
        }
        else if (pop > 1200) {
            return {color: "#d9794c", weight: 2, fillOpacity: .2}
        }
        else if (pop > 375) {
            return {color: "#dc9e5c", weight: 2, fillOpacity: .2}
        }
        else {
            return {color: "#f9e6a9", weight: 2, fillOpacity: .2}
        }
    }

});

// Pop ups
slumData.bindPopup(function(evt){
   return L.Util.template('<h3>{Slum_Name}</h3><hr /><p>Slum Population: {Population}<br>Zonal Population: {Populati_1}</p>', evt.feature.properties);
});

// Flood Layer
var floodData = L.geoJSON(chennaiFlood);


// Relief Layer
/*$(document).ready(function placeReliefCenters() {
    var queryString = "http://magic.csr.utexas.edu/SEES2017/abhi/chennaiRelief.json";
    $.getJSON(queryString, function (data) {
        $.each(data, function (k, v) {
            if (k == "features") {
                $.each(v, function (key, value) {
                    var newMarker;
                    var point = new L.Point(value.geometry.x, value.geometry.y);
                    var convertedPoint = testPointWebMercator(point);
                    newMarker = new L.Marker(convertedPoint, {
                        color: '#000',
                        fillColor: "#ffffff",
                        fillOpacity: 0.45,
                        weight: 0.7,
                        riseOnHover: true
                    }).bindPopup("<p><span style='font-weight:bold'>Location: </span>" + value.attributes._Locations +
                        "<br/><span style='font-weight:bold'>Lat/Lng: </span>" + parseFloat(convertedPoint.lat.toFixed(6)) + ", " + parseFloat(convertedPoint.lng.toFixed(6)) +
                        "<br/><span style='font-weight:bold'>Number of People: </span>" + value.attributes.No_of_persons + " </p>");
                    //markerArray.push(newMarker);
                    map.addLayer(newMarker);

                });
            }
        });

    });
    function testPointWebMercator(pointIn) {
        return L.Projection.SphericalMercator.unproject(pointIn);
    }
});*/

var markerArray = [];

function makeReliefCenters() {
    var queryString = "http://magic.csr.utexas.edu/SEES2017/abhi/chennaiRelief.json";
    $.getJSON(queryString, function (data) {
        $.each(data, function (k, v) {
            if (k == "features") {
                $.each(v, function (key, value) {
                    var newMarker;
                    var point = new L.Point(value.geometry.x, value.geometry.y);
                    var convertedPoint = testPointWebMercator(point);
                    newMarker = new L.Marker(convertedPoint, {
                        color: '#000',
                        fillColor: "#ffffff",
                        fillOpacity: 0.45,
                        weight: 0.7,
                        riseOnHover: true
                    }).bindPopup("<p><span style='font-weight:bold'>Location: </span>" + value.attributes._Locations +
                        "<br/><span style='font-weight:bold'>Lat/Lng: </span>" + parseFloat(convertedPoint.lat.toFixed(6)) + ", " + parseFloat(convertedPoint.lng.toFixed(6)) +
                        "<br/><span style='font-weight:bold'>Number of People: </span>" + value.attributes.No_of_persons + " </p>");
                    markerArray.push(newMarker);
                    //map.addLayer(newMarker);

                });
            }
        });

    });
    function testPointWebMercator(pointIn) {
        return L.Projection.SphericalMercator.unproject(pointIn);
    }
}
$(document).ready(function () {
    makeReliefCenters();
    for (var k = 0; k < markerArray.length; k++) {
        map.addLayer(markerArray[k]);
    }
});

// Markers and Symbology
var circleIndic = L.circle(
    [13.0827, 80.2707], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);

// Input to fly to coordinates
function inputCoords() {
    var latLong = prompt("Please Enter the Coordinates of Your Destination \n" + "(Ex: 42.920, -87.999)").split(",");
    map.flyTo(latLong, 11);
    map.removeLayer(circleIndic);
    circleIndic= L.circle(latLong,{
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);

}

// Change basemaps
function setBasemap(basemap) {
    if (layer) {
        map.removeLayer(layer);
    }

    layer = L.esri.basemapLayer(basemap);

    map.addLayer(layer);

    if (layerLabels) {
        map.removeLayer(layerLabels);
    }

    if (basemap === 'ShadedRelief'
        || basemap === 'Oceans'
        || basemap === 'Gray'
        || basemap === 'DarkGray'
        || basemap === 'Imagery'
        || basemap === 'Terrain'
    ) {
        layerLabels = L.esri.basemapLayer(basemap + 'Labels');
        map.addLayer(layerLabels);
    }
}
function changeBasemap(basemaps){
    var basemap = basemaps.value;
    setBasemap(basemap);
}

// Redraw a layer
function redraw(layer) {
    map.removeLayer(layer);
    map.addLayer(layer);
}

// Query for shelters
function queryForShelters(condition) {
    var query = L.esri.query({
        url: "https://services.arcgis.com/8df8p0NlLFEShl0r/ArcGIS/rest/services/Pop_Slum_Pop_Zones_Final/FeatureServer/0"
    });
    query.where(condition);
    query.run(function (error, latLngBounds, response) {
        queryLayer = L.geoJson(latLngBounds, {
            pointToLayer: function (feature, latlng) {
                return L.Marker(latlng, geojsonMarkerOptions);
            }
        });
    });
}
var selectedSlum;
// Relief Centers within the slum

//$("#slum").on('click', function()  {
//    querySlum()});

function querySlum(FID) {
    var slumFID = FID;
    //var slumFID = document.getElementById("slum").value;
    console.log(slumFID);
    getSlum(slumFID);}

function getSlum (slumFID) {

    if (selectedSlum !== undefined){
        selectedSlum.clearLayers();
    }

    var query = L.esri.query({
        url: "https://services.arcgis.com/8df8p0NlLFEShl0r/ArcGIS/rest/services/Pop_Slum_Pop_Zones_Final/FeatureServer/0"
    });
    query.where("FID='"+slumFID+"'");
    query.run(function(error, featureCollection, response){
        selectedSlum = L.geoJson(featureCollection);
        console.log(selectedSlum);
        map.addLayer(selectedSlum);
        map.removeLayer(circleIndic);
        circleIndic= L.circle([zoneLat[slumFID-1], zoneLng[slumFID-1]],{
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(map);
        map.flyTo([zoneLat[slumFID-1], zoneLng[slumFID-1]], 14);
        });

        map.addLayer(selectedSlum);
        slumFlood(selectedSlum);
}

/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "350px";

}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";

}

// Layer Toggles
$("#slumSwitch").on("click", function () {
    if (slumToggle === false) {
        slumData.addTo(map);
        redraw(circleIndic);
        slumToggle = true;
        createDroughtLegend();
        console.log(1);
    }
    else {
        map.removeLayer(slumData);
        slumToggle = false;
        console.log(1);
    }
});

$("#floodSwitch").on("click", function () {
    if (floodToggle === false) {
        map.addLayer(floodData);
        redraw(circleIndic);
        floodToggle = true;
        console.log(1);
    }
    else {
        map.removeLayer(floodData);
        floodToggle = false;
        console.log(1);
    }
});

$("#reliefSwitch").on("click", function () {
    if (reliefToggle === false) {
        makeReliefCenters();
        for(var k=0; k<markerArray.length; k++) {
            map.addLayer(markerArray[k]);
        }
        redraw(circleIndic);
        reliefToggle = true;
        console.log(1);
    }
    else {
        for(var k=0; k<markerArray.length; k++) {
            map.removeLayer(markerArray[k]);
        }
        redraw(circleIndic);
        reliefToggle = false;
        console.log(1);
    }
});

function createPopLegend() {
    console.log(7);
    var legend = document.getElementById("popLegend");
    var i;
    var colors = ["#9d3540", "#d9794c", "#dc9e5c", "#f9e6a9"];
    var grades = ["Slum Pop. > 1,544", "Slum Pop. > 790", "Slum Pop. > 374", "Slum Pop. > 302"];
    for(i in grades){
        legend.innerHTML += "<div class='colorBox' style='background-color: " + colors[i] + ";'></div>"+"&nbsp;"+grades[i];
        if(grades[i]!==grades[grades.length - 1]){
            legend.innerHTML += "<br>";
        }
    }
}

createPopLegend();

/*function slumFlood (selectedSlum) {
    queryCenter.within(selectedSlum);
    queryCenter.run(function(error, featureCollection, response){
       var slumMarkerLayer = L.geoJson(featureCollection);
       console.log(featureCollection.features);
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
        layer.addTo(map);
        map.addLayer(slumMarkerLayer);
    });

}*/

function splash(){
    $("#splash").prepend("<h2 style='color: #ffffff;text-align: center; box-shadow: black;'>CHENNAI UNDERWATER</h2><hr /></h2><p style='text-align: center; color: #ffffff;'>The South Indian Floods of 2015 caused devastation like few other flood events in history. In total, over 500 people were killed and nearly 2 million displaced, with damages and losses totalling nearly 3 billion US Dollars. The brunt of the losses came at the expense of those in abject poverty in the infamous slums of Chennai. This map attempts to create a venue for which first responders have the ability to visualize the inundation levels in specific slums to be more effective in their rescue operations.\n</p><br><br>");
    map.flyTo([27.525023, 77.174860], 5);
}


function clearHTML(id){
    var element = $("#"+id);
    $(".popup").remove();
    element.remove();
    map.flyTo([13.08,80.123], 12);
}

function setSlumOpacity(){
    slumData.setStyle({fillOpacity: document.getElementById("slumOpacity").value/100.0});
}

