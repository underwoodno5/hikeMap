import { divIcon, LatLngBounds, popup } from "leaflet";
import React, { useEffect, useState, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as L from "leaflet";

import {
	MapContainer,
	TileLayer,
	Marker,
	useMap,
	useMapEvents,
	Polyline,
	Popup,
} from "react-leaflet";

import "./Map.scss";

interface MapProps {
	centre: [number, number];
	markerPosition: [number, number];
	trailPath: [number, number][];
	clear: boolean;
	clearMap: Function;
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
	const [tentArray, setTentArray] = useState<[number, number][]>([]);
	const [waterArray, setWaterArray] = useState<[number, number][]>([]);
	const [popupPosition, setPopupPosition] = useState<[number, number] | null>(
		null
	);

	useEffect(() => {
		//-- When a user selects a custom map this will clear the polyline;
		if (props.clear === true) {
			setPinArray([]);
			props.clearMap();
			localStorage.setItem("customMapPath", JSON.stringify(""));
		}
	}, [props.clear]);

	const p = 10;
	const [pinArray, setPinArray] = useState<[number, number][]>(trailPath);

	const ref = useRef();

	useEffect(() => {
		setPinArray(props.trailPath);
		setMapPositions({
			centre: props.centre,
			markerPosition: markerPosition,
			trailPath: trailPath,
		});
	}, [props.centre, props.trailPath]);

	useEffect(() => {
		localStorage.setItem(
			"customMapPath",
			JSON.stringify({
				pinArray: pinArray,
				tentArray: tentArray,
				waterArray: waterArray,
			})
		);
	}, [pinArray, tentArray, waterArray]);

	const ThisMap = () => {
		//----- Map controls!
		//--So what we're doing here is panning to the centre position whenvever the map is rendered;
		// this allows us to change the centre state (taken from the parent prop) and jump around. Then we have a click
		// event that takes the current position and adds it to the list of pins (pinArray). This array is also used
		// to create the points of our line. We have a mouseup event that sets the centre to wherever the user moves
		// so on re-renders it doesn't jump back to the previous state.

		const map = useMap();

		map.panTo(mapPositions.centre);

		const mapClick = useMapEvents({
			click: (e) => {
				setPinArray((current) => [...current, [e.latlng.lat, e.latlng.lng]]);
				localStorage.setItem("customMapPath", JSON.stringify(pinArray));
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
			contextmenu: (e) => {
				setPopupPosition([e.latlng.lat, e.latlng.lng]);
			},
		});
		return null;
	};

	//-- These add custom Tent/Water markers,prevent the button click from passing to the map, and ensure the popup closes.
	const addTent = async (e: any) => {
		e.stopPropagation();
		if (tentArray && popupPosition) {
			setTentArray([...tentArray, popupPosition]);
		} else if (popupPosition) {
			setTentArray([popupPosition]);
		}
		setPopupPosition(null);
	};
	const addWater = async (e: any) => {
		e.stopPropagation();

		if (waterArray && popupPosition) {
			setWaterArray((current) => [...current, popupPosition]);
		} else if (popupPosition) {
			setWaterArray([popupPosition]);
		}
		setPopupPosition(null);
	};

	//--Using leaflets div markup to use font icons as map pins
	const pinIcon = divIcon({
		html: renderToStaticMarkup(<i className="las la-map-pin map-icon" />),
	});
	const tentIcon = divIcon({
		html: renderToStaticMarkup(
			<i className="las la-campground map-icon tent" />
		),
	});
	const waterIcon = divIcon({
		html: renderToStaticMarkup(<i className="las la-tint map-icon water" />),
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

				{popupPosition && (
					<Popup
						position={popupPosition}
						interactive={false}
						eventHandlers={{
							click: (e) => {
								console.log("popup");
							},
						}}
					>
						<button onClick={(e) => addTent(e)}>Add tent marker</button>
						<button onClick={(e) => addWater(e)}>Add water marker</button>
					</Popup>
				)}
				<Polyline
					pathOptions={{
						color: "pink",
						opacity: 1,
						bubblingMouseEvents: false,
					}}
					bubblingMouseEvents={false}
					positions={pinArray}
				></Polyline>

				{tentArray?.map((marker, i) => {
					return (
						<Marker
							position={marker}
							icon={tentIcon}
							key={i}
							draggable={true}
							eventHandlers={{
								keydown: (e) => {
									if (e.originalEvent.code === "Backspace") {
										if (tentArray) {
											setTentArray((current) =>
												current.filter((latlong) => latlong !== marker)
											);
										}
										localStorage.setItem(
											"customMapPath",
											JSON.stringify({
												pinArray: pinArray,
												tentArray: tentArray,
												waterArray: waterArray,
											})
										);
									}
								},
							}}
						></Marker>
					);
				})}
				{waterArray?.map((marker, i) => {
					return (
						<Marker
							position={marker}
							icon={waterIcon}
							key={i}
							draggable={true}
							bubblingMouseEvents={false}
							eventHandlers={{
								click: (e) => {},
								keydown: (e) => {
									if (e.originalEvent.code === "Backspace") {
										if (waterArray) {
											setWaterArray((current) =>
												current.filter((latlong) => latlong !== marker)
											);
										}
										localStorage.setItem(
											"customMapPath",
											JSON.stringify({
												pinArray: pinArray,
												tentArray: tentArray,
												waterArray: waterArray,
											})
										);
									}
								},
							}}
						></Marker>
					);
				})}

				{pinArray.map((marker, i) => {
					return (
						<Marker
							position={marker}
							icon={pinIcon}
							key={i}
							draggable={true}
							eventHandlers={{
								//---This is a big handler---\\
								//-- We'll break it down in parts:
								//--*keydown space* first we find the index of the selected pin from it's lat and long (from the click event);
								//that is used to create a boundary line which is then used to find the centre point (using leaflet methods);
								//then we create a new pin with the centre point lat/long and insert into the array after the index of the selected pin
								//--*keydown backspace* deletes the pin from the pinArray
								//--*dragstart* adds the latlng of the dragged pin to a holding array
								//--*dragend* when the pin has finished dragging it finds the original pin (using the holding latlng) in the
								//pinArray and replaces it with the new latlng, moving the line.
								keydown: (e) => {
									if (e.originalEvent.code === "Backspace") {
										setPinArray((current) =>
											current.filter((latlong) => latlong !== marker)
										);
										localStorage.setItem(
											"customMapPath",
											JSON.stringify({
												pinArray: pinArray,
												tentArray: tentArray,
												waterArray: waterArray,
											})
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
										localStorage.setItem(
											"customMapPath",
											JSON.stringify({
												pinArray: pinArray,
												tentArray: tentArray,
												waterArray: waterArray,
											})
										);
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
									localStorage.setItem(
										"customMapPath",
										JSON.stringify({
											pinArray: pinArray,
											tentArray: tentArray,
											waterArray: waterArray,
										})
									);
								},
							}}
						></Marker>
					);
				})}
			</MapContainer>
		</div>
	);
}
