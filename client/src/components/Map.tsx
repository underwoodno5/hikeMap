import {
	divIcon,
	latLng,
	LatLngBounds,
	LeafletMouseEvent,
	marker,
	polyline,
} from "leaflet";
import React, { useEffect, useState, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
// import * as L from "leaflet";

import {
	MapContainer,
	TileLayer,
	Marker,
	useMap,
	useMapEvents,
	Polyline,
} from "react-leaflet";

import "./Map.scss";

interface MapProps {
	centre: [number, number];
	markerPosition: [number, number];
	trailPath: [number, number][];
}

export default function Map(props: MapProps) {
	const mapAPI = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	const { markerPosition, trailPath, centre } = props;
	const [mapPositions, setMapPositions] = useState<{
		centre: [number, number];
		markerPosition: [number, number];
		trailPath: [number, number][];
	}>({
		centre: centre,
		markerPosition: markerPosition,
		trailPath: trailPath,
	});
	let pinDragArray: [number, number][] = [];

	useEffect(() => {
		setMapPositions({
			centre: props.centre,
			markerPosition: markerPosition,
			trailPath: trailPath,
		});
	}, [props.centre, props.trailPath]);

	const p = 10;
	const [pinArray, setPinArray] = useState<[number, number][]>(trailPath);

	const ref = useRef();

	const ThisMap = () => {
		//----- Map controls!
		// So what we're doing here is panning to the centre position whenvever the map is rendered
		// this allows us to change the centre state from the parent prop and jump around. Then we have a click
		// event that takes the current position and adds it to the list of pins (pinArray). This array is also used
		// to create the points of our line. We have a mouseup event that sets the centre to wherever the user moves
		// so on re-renders it doesn't jump back to the previous state.

		const map = useMap();

		map.panTo(mapPositions.centre);

		const mapClick = useMapEvents({
			click: (e) => {
				setPinArray((current) => [...current, [e.latlng.lat, e.latlng.lng]]);
			},
			dragend: (e) => {
				let newCentre: [number, number] = [
					map.getCenter().lat,
					map.getCenter().lng,
				];
				if (newCentre[0] !== centre[0] && newCentre[1] !== centre[1]) {
					setMapPositions({
						centre: newCentre,
						markerPosition: markerPosition,
						trailPath: trailPath,
					});
				}
			},
		});
		return null;
	};

	// Using leaflets div markup to use font icons as map pins
	const pinMarkup = renderToStaticMarkup(
		<i className="las la-map-pin map-icon" />
	);

	const customMarkerIcon = divIcon({
		html: pinMarkup,
	});

	return (
		<div className="map-container-box">
			<MapContainer
				style={{ height: "80vh", width: "100%" }}
				center={centre}
				zoom={20}
				scrollWheelZoom={false}
			>
				<ThisMap />

				<TileLayer url={mapAPI} />
				<Polyline
					pathOptions={{
						color: "pink",
						opacity: 1,
						bubblingMouseEvents: false,
					}}
					bubblingMouseEvents={false}
					positions={pinArray}
				></Polyline>

				{pinArray.map((marker, i) => {
					return (
						<Marker
							position={marker}
							icon={customMarkerIcon}
							key={i}
							draggable={true}
							eventHandlers={{
								// This is a big handler....
								// *keydown space* a pin first finds the index of that pin from it's lat and long (from the click event)
								//  that is used to create a boundary for the line, which is used to find the centre point (using leaflet methods)
								//  then we insert the new pin into the array after the index at the found centre
								// *keydown delete* deletes the pin from the pinArray
								// *dragstart* adds the latlng of the dragged pin to a holding array
								// **dragend* when the pin has finished dragging it finds the original pin (using the holding latlng) in the
								//  pinArray and replaces it with the new latlng, moving the line.
								keydown: (e) => {
									if (e.originalEvent.code === "Backspace") {
										setPinArray((current) =>
											current.filter((latlong) => latlong !== marker)
										);
									}
									if (e.originalEvent.code === "Space") {
										const pinIndex = pinArray.findIndex((y) => {
											if (
												y[0] === e.sourceTarget._latlng.lat &&
												y[1] === e.sourceTarget._latlng.lng
											) {
												return true;
											} else {
												return false;
											}
										});

										let lineBounds = new LatLngBounds([
											pinArray[pinIndex],
											pinArray[pinIndex + 1],
										]);
										let lineCenter = lineBounds.getCenter();
										const insert: [number, number] = [
											lineCenter.lat,
											lineCenter.lng,
										];
										let holdingArray = pinArray;
										holdingArray.splice(pinIndex + 1, 0, insert);
										setPinArray(holdingArray);
										setMapPositions({
											centre: mapPositions.centre,
											markerPosition: mapPositions.markerPosition,
											trailPath: mapPositions.trailPath,
										});
									}
								},
								click: (e) => {},

								dragstart: (e) => {
									pinDragArray = [];
									pinDragArray.push([
										e.target._latlng.lat,
										e.target._latlng.lng,
									]);
								},
								dragend: (e) => {
									pinDragArray.push([
										e.target._latlng.lat,
										e.target._latlng.lng,
									]);

									const newArray = pinArray.map((item) => {
										if (
											item[0] == pinDragArray[0][0] &&
											item[1] &&
											pinDragArray[0][1]
										) {
											return pinDragArray[1];
										} else {
											return item;
										}
									});
									setPinArray(newArray);
								},
							}}
						></Marker>
					);
				})}
			</MapContainer>
		</div>
	);
}
