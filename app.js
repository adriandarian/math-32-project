import React from "react";
import { render } from "react-dom";
import { StaticMap } from "react-map-gl";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import DeckGL from "@deck.gl/react";
import DATA_JSON from "./covid-by-county.json";

// Source data CSV
const DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv"; // eslint-disable-line

const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0,
});

const pointLight1 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({
    ambientLight,
    pointLight1,
    pointLight2,
});

const material = {
    ambient: 0.64,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [51, 51, 51],
};

const INITIAL_VIEW_STATE = {
    longitude: -104.958261,
    latitude: 35.461324,
    zoom: 5,
    minZoom: 1,
    maxZoom: 15,
    pitch: 40.5,
    bearing: 27,
};

const MAP_STYLE =
    "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

export const colorRange = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78],
];

function getTooltip({ object }) {
    if (!object) {
        return null;
    }

    const lat = object.position[1];
    const lng = object.position[0];
    const point = object.points[0];

    return `\
    State: ${point.state}
    County: ${point.county}
    Population: ${point.population}
    Cases: ${point.casesByWeek[46]}
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ""}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ""}`;
}

/* eslint-disable react/no-deprecated */
export default function App({
    data,
    mapStyle = MAP_STYLE,
    radius = 1000,
    upperPercentile = 100,
    coverage = 1,
}) {
    const layers = [
        new HexagonLayer({
            id: "heatmap",
            colorRange,
            coverage,
            data,
            elevationRange: [0, 100000],
            elevationScale: 50,
            getElevationValue: d => d[0].casesByWeek[46] * 1000,
            extruded: true,
            getPosition: (d) => [Number(d.longitude), Number(d.latitude)],
            pickable: true,
            radius: 12000,
            upperPercentile,
            material,

            transitions: {
                elevationScale: 10000,
            },
        }),
    ];

    return (
        <DeckGL
            layers={layers}
            effects={[lightingEffect]}
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            getTooltip={getTooltip}
        >
            <StaticMap
                reuseMaps
                mapStyle={mapStyle}
                preventStyleDiffing={true}
            />
        </DeckGL>
    );
}

export function renderToDOM(container) {
    render(<App data={DATA_JSON} />, container);

    // require("d3-request").csv(DATA_URL, (error, response) => {
    //     if (!error) {
    //         const data = response.map((d) => [Number(d.lng), Number(d.lat)]);
    //         render(<App data={data} />, container);
    //     }
    // });
}
