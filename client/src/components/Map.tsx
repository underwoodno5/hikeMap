import { divIcon, LatLngBounds } from "leaflet";
import React, { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as L from "leaflet";

import {
	MapContainer,
	TileLayer,
	Marker,
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
	expandMap: Function;
}

export default function Map(props: MapProps) {
	const mapAPI = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	const { markerPosition, trailPath, centre, clear, clearMap } = props;
	const [fullScreen, setFullScreen] = useState(false);
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
		if (clear === true) {
			setPinArray([]);
			clearMap();
			localStorage.setItem("customMapPath", JSON.stringify(""));
		}
	}, [clear, clearMap]);

	const [pinArray, setPinArray] = useState<[number, number][]>(trailPath);

	useEffect(() => {
		setPinArray(trailPath);
		setMapPositions({
			centre: centre,
			markerPosition: markerPosition,
			trailPath: trailPath,
		});
	}, [centre, trailPath, markerPosition]);

	// useEffect(() => {
	// 	var expandContainer = document.getElementsByClassName("expand")[0];
	// 	var c = expandContainer as HTMLElement;

	// 	if (expandContainer) {
	// 		L.DomEvent.disableClickPropagation(c);
	// 	}
	// });

	var expandContainer = document.getElementsByClassName("expand")[0];

	useEffect(() => {
		// -- This finds our expand div icon and turns it into a Leaflet DOM event. This lets us stop the click from propagating to the map
		// and triggering map interaction. It's called in useEffect because otherwise extra eventlisteners would be created every time the map
		// re-rendered (which is a lot).
		if (expandContainer) {
			var c = expandContainer as HTMLElement;

			L.DomEvent.disableClickPropagation(c);
		}
	}, [expandContainer]);

	//- Here we change the state that allows our map to resize on re-render, then we swap state the state in the map
	// so it won't resize after each re-render.
	const handleZoom = (e: any) => {
		props.expandMap();
		setFullScreen(!fullScreen);
	};

	useEffect(() => {
		const distanceFunction = () => {
			let distance = 0;

			pinArray.forEach((latlng, i) => {
				if (i === pinArray.length - 1) {
					return;
				} else {
					let startPoint = L.latLng(latlng);
					let endPoint = L.latLng(pinArray[i + 1]);
					let sectionDistance = startPoint.distanceTo(endPoint);
					distance = distance + sectionDistance;
				}
			});
			return distance;
		};

		localStorage.setItem(
			"customMapPath",
			JSON.stringify({
				pinArray: pinArray,
				tentArray: tentArray,
				waterArray: waterArray,
				distance: distanceFunction(),
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
		const map = useMapEvents({
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
			contextmenu: (e) => {
				setPopupPosition([e.latlng.lat, e.latlng.lng]);
			},
			keydown: (e) => {
				if (e.originalEvent.code === "Escape") {
					console.log(e);
					if (fullScreen === true) {
						setFullScreen(false);
						props.expandMap();
						setTimeout(() => {
							map.invalidateSize();
						}, 700);
					}
				}
			},
		});

		//--Our expand function has a little hack in it. Resising the container window doesn't cause a re-draw of the map, so we need to use
		// *invalidateSize()* to have the map re-evaluate the container. It needs to wait until the container size has changed, hence the
		//delay.
		if (fullScreen) {
			setTimeout(() => {
				map.invalidateSize();
			}, 400);
		}

		map.panTo(mapPositions.centre);

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
		console.log(e);

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
		<div className={`map-container-box ${fullScreen && "shift-map"}`}>
			<MapContainer
				style={{ height: "100%", width: "100%" }}
				center={centre}
				zoom={20}
				scrollWheelZoom={true}
			>
				<ThisMap />
				<div className="leaflet-top leaflet-right">
					<div
						className="leaflet-control leaflet-bar expand"
						onClick={(e) => handleZoom(e)}
					>
						<i className="las la-expand"></i>
					</div>
				</div>
				<TileLayer url={mapAPI} />

				{popupPosition && (
					<Popup position={popupPosition} interactive={false}>
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
							bubblingMouseEvents={false}
							eventHandlers={{
								click: (e) => {},
								keydown: (e) => {
									if (e.originalEvent.code === "Backspace") {
										if (tentArray) {
											setTentArray((current) =>
												current.filter((latlong) => latlong !== marker)
											);
										}
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
											item[0] === pinDragArray[0][0] &&
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
