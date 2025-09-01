window.addEventListener("load", () => {
    window.scrollTo(0, 1);
});

const searchBox = document.getElementById("search-input");
let marker;
let rotationId;
const routeToggle = document.getElementById("routing-toggle2");
let start = [3.375453, 7.120179];
let end = [3.369892, 7.120197];
let routeType = "foot";
const API_KEY = "5e1e7f2a-37ea-47a5-a38c-9a17897305b8";
const OPEN_WEATHER_API = "4a8602e18c19a44f872095208acbc7f3";
const satelliteStyle = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const streetsBasemap = 'https://api.maptiler.com/maps/streets/style.json?key=mSmxvGAu571uVjVJweAl'
let satelliteLayerAdded = false;
const osmStyle = {
version: 8,
sources: {
    'osm-tiles': {
        type: 'raster',
        tiles: ['https://cartodb-basemaps-a.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap Contributors'
    }
    },
    layers: [
        {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles'
        }
    ]
};







function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[onclick="switchTab('${tabId}')"]`).classList.add('active');
}




const map = new maplibregl.Map({
    container: 'map',
    style: osmStyle, // Use the new OSM raster style
    center: [3.369845301, 7.120289751],
    zoom: 12,
    pitch: 50, // Set pitch to 0 for a top-down, 2D view
    bearing: -10, // Set bearing to 0 for a standard North-up view
    antialias: true,
    attributionControl: false,
    maxZoom: 24
});
map.addControl(new maplibregl.NavigationControl());


map.addControl(new maplibregl.AttributionControl({
    compact: false,
    customAttribution: `

    `

}));



// Function to add satellite imagery as a layer
function addSatelliteLayer() {
    if (!satelliteLayerAdded) {
        map.addSource('satellite', {
            type: 'raster',
            tiles: [
                satelliteStyle
            ],
            tileSize: 256
        });

        map.addLayer({
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite',
            paint: {
                'raster-opacity': 1 // Adjust opacity if needed
            },
            // before: 'building-layer' 
        });
        // map.moveLayer('satellite-layer', '3d-buildings')
        // map.moveLayer('satellite-layer', 'route-layer');
        satelliteLayerAdded = true;
    }
}

// Function to remove satellite imagery
function removeSatelliteLayer() {
    if (satelliteLayerAdded) {
        map.removeLayer('satellite-layer');
        map.removeSource('satellite');
        satelliteLayerAdded = false;
    }
}

document.getElementById("sat-toggle").addEventListener("change", e=>{
    if (e.target.checked){
        addSatelliteLayer();
    } else {
        removeSatelliteLayer();
    }
})


const locationButton = document.createElement('button');
locationButton.classList = 'location-button';
locationButton.innerHTML = '<i class="fas fa-location"></i>';


// Create label element
const switchLabel = document.createElement('label');
switchLabel.classList.add('switch', "dimension-switch");
const inputCheckbox = document.createElement('input');
inputCheckbox.id = 'dim-switch';
inputCheckbox.type = 'checkbox';
inputCheckbox.checked = true; // Set to checked
const sliderSpan = document.createElement('span');
sliderSpan.classList.add('slider', "slider-dim");

switchLabel.appendChild(inputCheckbox);
switchLabel.appendChild(sliderSpan);
document.body.appendChild(switchLabel);
map.getContainer().appendChild(switchLabel);


document.getElementById("dim-switch").addEventListener("change", (element)=>{
    let blinkingMarker = document.querySelector(".blinking-marker");
    let innermarker = document.querySelector(".inner-marker");
    if (inputCheckbox.checked){
        map.setPitch(60);
        // map.setBearing(30);
        map.setLayoutProperty('3d-buildings', 'visibility', 'visible');
        // blinkingMarker.style.width = "35px";
        // innermarker.style.width = "25px";
    } else {
        map.setPitch(0);
        // map.setBearing(0);
        map.setLayoutProperty('3d-buildings', 'visibility', 'none');
        // blinkingMarker.style.width = "20px";
        // innermarker.style.width = "15px";
    }
})


function getWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API}&units=metric`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const temperature = data.main.temp;
            const description = data.weather[0].description;

            // Return the data wrapped in an object
            return { temperature, description };
        })
        .catch(error => {
            console.log('Error fetching weather data:', error);
            throw error; // Re-throw the error to be caught in the caller
        });
}

let temp = '30';
let descrip;
const weatherButton = document.createElement('button');
weatherButton.classList = 'weather-button';

getWeatherByCoordinates(3.369892, 7.120197)
    .then(({ temperature, description }) => {
        temp = temperature;
        descrip = description;
        
        if (description.includes("cloud")){
            weatherButton.innerHTML = '<i class="fas fa-cloud"></i>';
        } 
        if (description.includes("rain")){
            weatherButton.innerHTML = '<i class="fas fa-cloud-showers-heavy"></i>';
        }
        if (description.includes("clear")){
            weatherButton.innerHTML = '<i class="fas fa-sun"></i>';
        }

        weatherWidget.innerHTML = `
            <div>
                <h3>${temp}°C</h3>
                <span>${weatherButton.innerHTML} ${descrip}</span>
            </div>
        `
    })
    .catch(error => {
        console.log('Error occurred:', error);
    });


const weatherWidget = document.createElement('div');
weatherWidget.classList = 'weather-widget';

map.getContainer().appendChild(weatherWidget);
weatherButton.addEventListener('click', () => {
    if (weatherWidget.classList.contains("active")){
        weatherWidget.classList.remove("active");

        getWeatherByCoordinates(3.369892, 7.120197)

            .then(({ temperature, description }) => {
                temp = temperature;
                descrip = description;
                
                weatherWidget.innerHTML = `
                    <div>
                        <h3>${temp}°C</h3>
                        <span>${weatherButton.innerHTML} ${descrip}</span>
                    </div>
                `

                if (description.includes("cloud")){
                    weatherButton.innerHTML = '<i class="fas fa-cloud"></i>';
                } 
                if (description.includes("rain")){
                    weatherButton.innerHTML = '<i class="fas fa-cloud-showers-heavy"></i>';
                }
                if (description.includes("clear")){
                    weatherButton.innerHTML = '<i class="fas fa-sun"></i>';
                }
            })
            .catch(error => {
                console.log('Error occurred:', error);
            });


    } else {
        weatherWidget.classList.add("active");
    }
})


// map.getContainer().appendChild();
map.getContainer().appendChild(weatherButton);
map.getContainer().appendChild(locationButton);



let layerNames = [];

function removeAllLayers(allLayerNames) {
    allLayerNames.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
            console.log(map.getLayer(layerId))
        }
    });

    layerNames = [];
}





document.querySelector(".fa-home").addEventListener("click", function (){
    map.flyTo({
        center: [3.369845301, 7.120289751],
        zoom: 19,
        pitch: 60,
    });

    map.once("moveend", ()=>{
        removeAllLayers(layerNames);
        addBuildingExtrusion();

    })
    if (pop){
        pop.remove()
    }


})

locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Create the blinking circle marker and add it to the map
        const marker = new maplibregl.Marker({ element: createBlinkingCircle() })
        .setLngLat([longitude, latitude])
        .addTo(map);

        start = [longitude, latitude];
        addRouteToMap();
        // Optionally, zoom in to the user's location
        map.flyTo({
            center: [longitude, latitude],
            zoom: 19
        });

    }, function(error) {
        alert('Error: ' + error.message);
    });
    } else {
    alert('Geolocation is not supported by this browser.');
    }

    // Function to create the blinking circle
    function createBlinkingCircle() {
        const div = document.createElement('div');
        div.className = 'blinking-marker'; // Add the blinking marker class
        const innerDiv = document.createElement('div');
        innerDiv.className = 'inner-marker';
        div.appendChild(innerDiv);
        return div;
    }

});





function toSentenceCase(str) {
    if (!str) return "";
    str = str.trim();
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


let totalRotation = 0; // Tracks the total rotation angle
const degreesToRotate = 310; // 360 degrees * 2

function rotateMap() {
    // Check if the total rotation has exceeded the target
    if (totalRotation >= degreesToRotate) {
        cancelAnimationFrame(rotationId);
        return; // Stop the function execution
    }

    // Amount to rotate in this frame
    const rotationIncrement = 5;

    // Rotate the map by a small increment
    map.rotateTo(map.getBearing() + rotationIncrement, { duration: 0.1 });

    // Update the total rotation. Use Math.abs to handle negative bearings.
    totalRotation += Math.abs(rotationIncrement);

    // Continue the animation loop
    rotationId = requestAnimationFrame(rotateMap);
}


function addBuildingExtrusion() {
    // Array to store all layer names

    fetch('assets/shapefiles/floor_plan.json')
        .then(response => response.json())
        .then(data => {
            if (!map.getSource('ground_floor')) {
                map.addSource('ground_floor', {
                    'type': 'geojson',
                    'data': data
                });
            }

            if (!map.getLayer('ground_floor_layer')) {
                map.addLayer({
                    'id': 'ground_floor_layer',
                    'type': 'fill-extrusion',
                    'source': 'ground_floor',
                    'paint': {
                        'fill-extrusion-color': ['get', 'color'],
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-opacity': 0.5
                    }
                });
                layerNames.push("ground_floor_layer");
            }

            map.flyTo({
                center: [3.369845301, 7.120289751],
                zoom: 19,
                pitch: 60,
            });
        })
        .catch(error => console.error('Error loading GeoJSON:', error));

    fetch('assets/shapefiles/doors_lower.json')
        .then(response => response.json())
        .then(data => {
            if (!map.getSource('ground_doors')) {
                map.addSource('ground_doors', {
                    'type': 'geojson',
                    'data': data
                });
            }
        });

    fetch('assets/shapefiles/doors_upper.json')
        .then(response => response.json())
        .then(data => {
            if (!map.getSource('top_doors')) {
                map.addSource('top_doors', {
                    'type': 'geojson',
                    'data': data
                });
            }
        });

    fetch('assets/shapefiles/upper_flow copy.json')
        .then(response => response.json())
        .then(data => {
            if (!map.getSource('seperator')) {
                map.addSource('seperator', {
                    'type': 'geojson',
                    'data': data
                });
            }

            if (!map.getLayer('seperator')) {
                map.addLayer({
                    'id': 'seperator',
                    'type': 'fill-extrusion',
                    'source': 'seperator',
                    'paint': {
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-base': ['get', 'baseheight'],
                        'fill-extrusion-opacity': 0.5
                    }
                });
                layerNames.push("seperator");
            }
        });

    fetch('assets/shapefiles/upper_flow.json')
        .then(response => response.json())
        .then(data => {
            if (!map.getSource('top_floor')) {
                map.addSource('top_floor', {
                    'type': 'geojson',
                    'data': data
                });
            }

            if (!map.getLayer('top_floor_layer')) {
                map.addLayer({
                    'id': 'top_floor_layer',
                    'type': 'fill-extrusion',
                    'source': 'top_floor',
                    'paint': {
                        'fill-extrusion-color': ['get', 'color'],
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-base': ['get', 'baseheight'],
                        'fill-extrusion-opacity': 0.7
                    }
                });
                layerNames.push("top_floor_layer");
            }

            map.on('click', 'building-extrusion-layer2', (e) => {
                if (e.features.length > 0) {
                    const uniqueId = e.features[0].properties.color;
                    map.setFilter('building-highlight-layer2', [
                        '==', ['get', 'color'], uniqueId
                    ]);
                }
            });
        })
        .catch(error => console.error('Error loading GeoJSON:', error));

    return layerNames;
}




map.on('load', () => {

    const div = document.querySelector('.maplibregl-ctrl-attrib-inner');
    // Loop through all child nodes and remove any text node with only text
    div.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '|') {
        div.removeChild(node);
    }
    });

    addBuildingExtrusion();


});



map.once('moveend', () => {
    // Call your custom function here
    // rotateMap();



});



document.querySelectorAll(".dropdown-btn").forEach(button => {
    button.addEventListener("click", function () {
        this.parentElement.classList.toggle("active");
    });
});

document.querySelectorAll(".dropdown-btn2").forEach(button => {
    button.addEventListener("click", function () {
        this.parentElement.classList.toggle("active");
    });
});

document.querySelectorAll(".dropdown-content").forEach(content =>{
    content.addEventListener("click", function(){
        let btn = document.querySelector(".dropdown-btn");
        routeType = this.textContent.trim().toLowerCase();
        btn.innerHTML = `<span>${this.innerHTML} </span><span class="down-arrow"><span>`;
        btn.parentElement.classList.toggle("active");
        addRouteToMap();
    })
})


document.querySelectorAll(".dropdown-content2").forEach(content =>{
    content.addEventListener("click", function(){
        let btn = document.querySelector(".dropdown-btn2");
        routeType = this.textContent.trim().toLowerCase();
        btn.innerHTML = `<span>${this.innerHTML} </span><span class="down-arrow"><span>`;
        btn.parentElement.classList.toggle("active");
        addRouteToMap();
    })
})


const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
geojsonData = {};
let pop;


function addFilteredData(feature){
    console.log(feature);

    removeAllLayers(layerNames);
    
    
    if (feature.properties.baseheight == 9){
        map.addLayer({
            'id': 'ground_floor_layer',
            'type': 'fill-extrusion',
            'source': 'ground_floor',
            'paint': {
                // 'fill-extrusion-color': ['get', 'color'], // Get color from GeoJSON property
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'baseheight'], // This line adds the base height
                'fill-extrusion-opacity': 0.5 // 70% transparency
            }
        });
        layerNames.push("ground_floor_layer")

        map.setPaintProperty('ground_floor_layer', 'fill-extrusion-opacity', 0.2);


        map.addLayer({
            'id': 'top_doors_layer',
            'type': 'line',
            'source': 'top_doors',
            'paint': {
                'line-color': '#FF4C4C', // The specified black color
                'line-width': 6, // The specified line width
                'line-opacity': 1 // Full opacity (100%)
            }
        });
        layerNames.push("top_doors_layer");



        map.addLayer({
            'id': 'seperator',
            'type': 'fill-extrusion',
            'source': 'seperator',
            'paint': {
                // 'fill-extrusion-color': ['get', 'color'], // Get color from GeoJSON property
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'baseheight'], // This line adds the base height
                'fill-extrusion-opacity': 0.5 // 70% transparency
            }
        });
        layerNames.push("seperator");


        map.addLayer({
            'id': 'top_floor_plan',
            'type': 'line',
            'source': 'top_floor',
            'paint': {
                'line-color': '#1a1a1a', // The specified black color
                'line-width': 5, // The specified line width
                'line-opacity': 0.7 // Full opacity (100%)
            }
        });
        layerNames.push("top_floor_plan");



        map.addLayer({
            'id': 'highlighted_office',
            'type': 'fill-extrusion',
            'source': 'top_floor',
            'paint': {
                'fill-extrusion-color': '#00FFFF',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'baseheight'], // This line adds the base height
                'fill-extrusion-opacity': 1
            },
            'filter': ['==', 'color', feature.properties.color]
        });
        layerNames.push("highlighted_office");

    } else {
        map.addLayer({
            'id': 'ground_floor_plan',
            'type': 'line',
            'source': 'ground_floor',
            'paint': {
                'line-color': '#1a1a1a', // The specified black color
                'line-width': 5, // The specified line width
                'line-opacity': 0.7 // Full opacity (100%)
            }
        });
        layerNames.push("ground_floor_plan");


        map.addLayer({
            'id': 'ground_doors_layer',
            'type': 'line',
            'source': 'ground_doors',
            'paint': {
                'line-color': '#FF4C4C', // The specified black color
                'line-width': 6, // The specified line width
                'line-opacity': 1 // Full opacity (100%)
            }
        });
        layerNames.push("ground_doors_layer");

        map.addLayer({
            'id': 'highlighted_office',
            'type': 'fill-extrusion',
            'source': 'ground_floor',
            'paint': {
                'fill-extrusion-color': '#00FFFF',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'baseheight'], // This line adds the base height
                'fill-extrusion-opacity': 1
            },
            'filter': ['==', 'color', feature.properties.color]
        });
        layerNames.push("highlighted_office");
    }


    coord = feature.geometry.coordinates[0][0];
    latitude = coord[1];
    longitude = coord[0];

    const currentBearing = map.getBearing();
    const newBearing = currentBearing + 90;

    // 3. Fly to the new bearing
    map.flyTo({
        center: [longitude, latitude],
        bearing: currentBearing, // Pass the new calculated bearing here
        zoom: 18,
        speed: 1.2,
        curve: 1,
        essential: true
    });

    map.once('moveend', () => {
        map.flyTo({
            center: [longitude, latitude],
            bearing: newBearing, // Pass the new calculated bearing here
            zoom: 19,
            speed: 0.3,
            curve: 1,
            essential: true
        });
    });

    // Create the popup with your content

    addRouteToMap()
    
    if (pop) {
        pop.remove();
    }

    if (feature.properties.baseheight == 9){
        pop = new maplibregl.Popup({ closeOnClick: true, closeButton: false, offset: [40, -300], anchor: 'left',})
        .setLngLat([longitude, latitude])
        .setHTML(`
            <div class="popup" style="font-size: 12px;">
                <img style="width: 100%; height: 100px; border-radius: 8px 8px 0 0;" src="${feature.properties.img}">
                <h5>${feature.properties["name"]}</h5>
                <p>The office is located at the top floor, please use the stairway to get upstairs.</p>
            </div>`) // Tooltip content
        .addTo(map)
    } else {
        pop = new maplibregl.Popup({ closeOnClick: true, closeButton: false, offset: [40, -80], anchor: 'left', })
        .setLngLat([longitude, latitude])
        .setHTML(`
            <div class="popup" style="font-size: 12px;">
                <img style="width: 100%; height: 100px; border-radius: 8px 8px 0 0;" src="${feature.properties.img}">
                <h5>${feature.properties["name"]}</h5>
                <p>The office is located on the ground floor, there is no need to use the stairway.</p>
            </div>`) // Tooltip content
        .addTo(map)
    }


}


const resultsList = document.querySelector('.search-list');

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();

    fetch('assets/shapefiles/floor_plan.json')
        .then(response => response.json())
        .then(data => {
            const geojsonData = data; // Assign the fetched data

            const filteredData = geojsonData.features.filter(feature => 
                feature.properties["name"] &&
                feature.properties["name"].toLowerCase().includes(searchTerm)
            );
            
            resultsList.innerHTML = '';
            filteredData.forEach(feature => {
                const listItem = document.createElement('li');
                listItem.innerHTML = feature.properties['name'] + " <i style='padding-left: 5px;' class='fas fa-caret-down'></i>";
                listItem.addEventListener('click', () => {
                    searchBox.value = "";
                    searchBox.placeholder = feature.properties['name'].replace(/\s+/g, ' ').trim();

                    addFilteredData(feature);
                    

                    });
                    resultsList.appendChild(listItem);
                })

            if (filteredData.length === 0) {
                const listItem = document.createElement('li');
                // listItem.textContent = "No record found!";
                listItem.addEventListener('click', () => {
        
                });
                resultsList.appendChild(listItem);
            } else {
                searchResults.style.display = 'block';
            }

            // geojsonData = {};
        });


        fetch('assets/shapefiles/upper_flow.json')
        .then(response => response.json())
        .then(data => {
            const geojsonData = data; // Assign the fetched data

            const filteredData = geojsonData.features.filter(feature => 
                feature.properties["name"] &&
                feature.properties["name"].toLowerCase().includes(searchTerm)
            );
            
            filteredData.forEach(feature => {
                const listItem = document.createElement('li');
                listItem.innerHTML = feature.properties['name'] + " <i style='padding-left: 5px;' class='fas fa-caret-up'></i>";
                listItem.addEventListener('click', () => {
                    searchBox.value = "";
                    searchBox.placeholder = feature.properties['name'].replace(/\s+/g, ' ').trim();

                    addFilteredData(feature);
                    

                    });
                    resultsList.appendChild(listItem);
                })

            if (filteredData.length === 0) {
                const listItem = document.createElement('li');
                listItem.textContent = "No record found!";
                listItem.addEventListener('click', () => {
        
                });
                resultsList.appendChild(listItem);
            } else {
                searchResults.style.display = 'block';
            }

            // geojsonData = {};
        });
    

    searchResults.appendChild(resultsList);
    searchResults.style.display = 'block';
    searchResults.style.height = "150px";
});


document.addEventListener('click', function(event) {
if (!searchBox.contains(event.target)) {
    searchResults.style.display = "none";
    searchResults.style.height = "0px";
    resultsList.innerHTML = '';
}
});


async function fetchBuildingLevelRoute(officeName) {
    // Return the promise chain so `await` can wait for it
    return fetch('assets/shapefiles/routeDownFloor.json')
        .then(response => response.json())
        .then(data => {
            const geojsonData = data;

            // This comparison should also be case-insensitive to ensure a match
            const filteredData = geojsonData.features.filter(feature =>
                feature.properties["route"] &&
                feature.properties["route"].toLowerCase() == officeName.toLowerCase()
            );

            if (filteredData.length > 0) {
                // Return the coordinates from the first matching feature
                return filteredData[0].geometry.coordinates;
            } else {
                return []; // Return an empty array if no match is found
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing building route:', error);
            return []; // Return an empty array on error
        });
}



async function fetchRoute(start, end) {
    const url = `https://graphhopper.com/api/1/route?point=${start[1]},${start[0]}&point=${end[1]},${end[0]}&profile=${routeType}&locale=en&points_encoded=false&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.paths && data.paths.length > 0) {

            const routeCoordinates = data.paths[0].points.coordinates; // Extract coordinates
            const routeTime = data.paths[0].time; // Travel time in milliseconds
            const routeTimeInMinutes = routeTime / 1000 / 60; // Convert to minutes

            return { routeCoordinates, routeTimeInMinutes };
        } else {
            console.error("No valid path found.");
            return { routeCoordinates: [], routeTimeInMinutes: 0 };
        }
    } catch (error) {
        console.error("Error fetching route:", error);
        return { routeCoordinates: [], routeTimeInMinutes: 0 };
    }
}

addRouteToMap();


async function addRouteToMap() {
    let { routeCoordinates, routeTimeInMinutes } = await fetchRoute(start, end);
    const buildingLevelCoordinates = await fetchBuildingLevelRoute(searchBox.placeholder);


    if (buildingLevelCoordinates.length > 0) {
        routeCoordinates = [...routeCoordinates, ...buildingLevelCoordinates];
    }


    if (routeCoordinates.length === 0) {
        alert("Failed to fetch route!");
        return;
    }

    if (map.getSource("route")) {
        map.removeLayer("route-layer");
        map.removeSource("route");
    }

    // Add Source & Layer to MapLibre
    map.addSource("route", {
        type: "geojson",
        data: {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: routeCoordinates
            }
        }
    });


    map.addLayer({
        id: "route-layer",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#FF4C4C", "line-width": 5 }
    });

    const minutes = Math.floor(routeTimeInMinutes); // Get whole minutes
    const seconds = Math.round((routeTimeInMinutes - minutes) * 60);

    let iconType;
    if (routeType == "car"){
        iconType = "car"
    } else {
        iconType = "walking";
    }


    let totalMinutes = minutes;
    let displayTime = '';

    if (totalMinutes > 59) {
        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        displayTime = `<i style="color: #1a1a1a; font-weight: bold; padding: 0 3px;" class='fa fa-${iconType}'></i> 
                        <i style='color: #1a1a1a; padding: 0 3px;' class='fa fa-clock'></i><b>${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min ${seconds} secs</b>`;
    } else {
        displayTime = `<i style="color: #1a1a1a; font-weight: bold; padding: 0 3px;" class='fa fa-${iconType}'></i> 
                    <i style='color: #1a1a1a; padding: 0 3px;' class='fa fa-clock'></i><b>${minutes} min ${seconds} secs</b>`;
    }

    showInfoBox(displayTime, 500);

}


let currentInfoBox = null; // Track the current info box
let infoBox;

function showInfoBox(message, delayTime) {
    // If there's an existing info box and it's set to stay permanently, remove it immediately
    if (currentInfoBox) {
        if (currentInfoBox.permanent) {
            currentInfoBox.remove();
            currentInfoBox = null;
        } else {
            // If it's a temporary message, wait for it to disappear before showing a new one
            setTimeout(() => {
                showInfoBox(message, delayTime);
            }, 1000);
            return;
        }
    }

    // Create the info box element
    infoBox = document.createElement('div');
    infoBox.classList.add('info-box');
    infoBox.innerHTML = message;

    // Append to the map container
    document.getElementById('map').appendChild(infoBox);

    // Set visibility
    setTimeout(() => {
        infoBox.style.visibility = 'visible';
    }, 100);

    // Track the active info box
    currentInfoBox = infoBox;
    currentInfoBox.permanent = delayTime <= 1000; // Mark as permanent if delayTime is short

    // If delayTime > 1000, remove after delayTime
    if (delayTime > 1000) {
        setTimeout(() => {
            infoBox.style.opacity = 0;
            infoBox.style.visibility = 'hidden';
            setTimeout(() => {
                infoBox.remove();
                currentInfoBox = null; // Reset tracker
            }, 500);
        }, delayTime);
    }
}



routeToggle.addEventListener("change", function(){
if(this.checked){

    if (start[0] === 5.139696264302756 && start[1] === 7.306759163466381) {
        message = "<i style='color: #E63946; padding-right: 5px;' class='fa-solid fa-circle-exclamation'></i>Your location is not set. Routing starts from the School Gate. Click the location button at the bottom right to update."
        showInfoBox(message, 3000);
    }
    addRouteToMap();
} else {
    infoBox.remove();
    currentInfoBox = null;
    if (map.getLayer("route-layer")) {
        map.removeLayer("route-layer"); // Remove the line layer
    }

    if (map.getSource("route")) {
        map.removeSource("route"); // Remove the data source
    }

}
})



async function sendMessage() {
const userMessage = document.getElementById('user-input').value;
const messageContainer = document.querySelector('.chats');

try {
    const userMsg = document.querySelector('.ai-msg');
    userMsg.remove();
} catch (error) {
    console.log(error)
}


document.getElementById('user-input').value = '';

try {
    const response = await fetch(`/ask-ai?message=${encodeURIComponent(userMessage)}`);
    const data = await response.json();

    try {document.querySelector('.ai-msg').remove();} catch (error) {console.log(error)}
    const aiMsg = document.createElement("div");
    aiMsg.classList.add("messages", "ai-msg");
    aiMsg.innerHTML = `${data.friendlyIntro} <br>${data.reply}`;
    messageContainer.appendChild(aiMsg);

    const scrollableDiv = document.querySelector(".chat-container");
    scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    
    
    fetch('assets/shapefiles/floor_plan.json')
        .then(response => response.json())
        .then(geoData => {
            const geojsonData = geoData; // Assign the fetched data
            searchTerm = data.reply.toLowerCase().trim();
            const filteredData = geojsonData.features.find(feature => 
                feature.properties["name"] &&
                feature.properties["name"].toLowerCase().includes(searchTerm)
            );

            if (!filteredData){
                 fetch('assets/shapefiles/upper_flow.json')
                    .then(response => response.json())
                    .then(geoDataUpper => {
                        const geojsonDataUpper = geoDataUpper; // Assign the fetched data
                        searchTerm = data.reply.toLowerCase().trim();
                        const filteredDataUpper = geojsonDataUpper.features.find(feature => 
                            feature.properties["name"] &&
                            feature.properties["name"].toLowerCase().includes(searchTerm)
                        );
                        searchBox.placeholder = searchTerm;
                        addRouteToMap();
                        addFilteredData(filteredDataUpper);
                    });

            } else {
                searchBox.placeholder = searchTerm;
                addRouteToMap();
                addFilteredData(filteredData);
            }


        });

} catch (error) {
    console.log(error)
    // message_container.innerHTML += `<div id="ai-response">Radius too large to process</div>`;
}
}
