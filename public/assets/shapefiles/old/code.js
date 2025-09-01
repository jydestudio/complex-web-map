const fs = require("fs");

// Read the GeoJSON file
fs.readFile("cleaned_data.geojson", "utf8", (err, data) => {
    if (err) {
        console.error("Error reading the GeoJSON file:", err);
        return;
    }

    // Parse the GeoJSON data
    const geoJsonData = JSON.parse(data);

    if (!geoJsonData.features || geoJsonData.features.length === 0) {
        console.error("No features found in the GeoJSON data.");
        return;
    }

    // Extract the 'uniform-name' fiel
    //d from each feature
    const uniformNames = geoJsonData.features.map(feature => feature.properties['uniform name']);

    // Create a new JSON object to store the uniform names
    const outputData = { uniformNames };

    // Write the uniform names to a new JSON file
    fs.writeFile("uniform-names.json", JSON.stringify(outputData, null, 2), "utf8", (err) => {
        if (err) {
            console.error("Error writing to JSON file:", err);
        } else {
            console.log("Uniform names saved to 'uniform names.json'.");
        }
    });
});
