import { divIcon, LatLngBounds } from "leaflet";
import React, { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Trail } from "../types/interface";
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
	clear: boolean;
	clearMap: Function;
	expandMap: Function;
	shrinkTopBar: Function;
	customize: boolean;
	trailObject: Trail;
}

export default function Map(props: MapProps) {
	const mapAPI = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	const { clear, clearMap, customize, trailObject } = props;
	const [fullScreen, setFullScreen] = useState<boolean>(false);
	const [location, setLocation] = useState<[number, number] | null>(null);

	const [mapPositions, setMapPositions] = useState<{
		centre: [number, number];
		trailPath: [number, number][];
	}>({
		centre: trailObject.trailPath[0],
		trailPath: trailObject.trailPath,
	});
	let pinDragArray: [number, number][] = [];

	//-- We have to use state for a number of things tied to the map. Leaflet doesn't like to re-draw certain elements on
	// unless the state of the props SPECIFIC to that element change. e.g - if we just used trailPath as our prop for our polygon
	// line directly, it wouldn't redraw on trailPath change, even if we forced a map redraw with a general state change.
	// The prop used in the polyline itself needs a state change to redraw that element. Trust me I tried it.
	const [tentArray, setTentArray] = useState<[number, number][]>(
		trailObject.tentPoints || []
	);
	const [waterArray, setWaterArray] = useState<[number, number][]>(
		trailObject.waterPoints || []
	);
	const [popupPosition, setPopupPosition] = useState<[number, number] | null>(
		null
	);

	const [pinArray, setPinArray] = useState<[number, number][]>(
		trailObject.trailPath
	);

	if (pinArray) {
		var array = pinArray;
		var bounds = {
			latSmall: array[0][0],
			latLarge: array[0][0],
			lngSmall: array[0][1],
			lngLarge: array[0][1],
		};

		array.forEach((x) => {
			if (bounds.latSmall > x[0]) {
				bounds.latSmall = x[0];
			}
			if (bounds.latLarge < x[0]) {
				bounds.latLarge = x[0];
			}
			if (bounds.lngSmall > x[1]) {
				bounds.lngSmall = x[1];
			}
			if (bounds.lngLarge < x[1]) {
				bounds.lngLarge = x[1];
			}
		});
	}

	//-- Reset the popup to null when we change back and forth between customizing
	if (customize === false && popupPosition !== null) {
		setPopupPosition(null);
	}

	//-- This lets our data jump state when new props come from trailList or microTrailList and checks our gelocation.

	useEffect(() => {
		setPinArray(trailObject.trailPath);
		setTentArray(trailObject.tentPoints || []);
		setWaterArray(trailObject.waterPoints || []);
		setMapPositions({
			centre: trailObject.trailPath[0],
			trailPath: trailObject.trailPath,
		});
	}, [trailObject]);

	// -- This finds our expand div icon and turns it into a Leaflet DOM event. This lets us stop the click from propagating to the map
	// and triggering map interaction. If you want to add extra logic it has to be called in useEffect because otherwise extra
	// eventlisteners would be created every time the map re-rendered (which is a lot).
	var customControlList = document.getElementsByClassName("custom-control");

	if (customControlList[0]) {
		for (let i = 0; i < customControlList.length; i++) {
			var c = customControlList[i] as HTMLElement;

			L.DomEvent.disableClickPropagation(c);
		}
	}

	//- Here we change the state that allows our map to resize on re-render, then we swap state the state in the map
	// so it won't resize after each re-render. Seperate functions for mobile/desktop.
	const handleZoom = (e: any) => {
		props.expandMap();
		setFullScreen(!fullScreen);
	};

	const handleMobileZoom = () => {
		setFullScreen(!fullScreen);
	};

	//-- Getting location is pretty straightforward. For mobile we get the intial static position and jump the map view there,
	// then use *watchposition* to track it and move the icon.
	const handleLocation = async (e: any) => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition((x) => {
				setMapPositions({
					...mapPositions,
					centre: [x.coords.latitude, x.coords.longitude],
				});
				setLocation([x.coords.latitude, x.coords.longitude]);
				console.log(x);
			});
		} else {
			throw new Error("Geolocation not allowed in settings or in browser");
		}
	};
	const handleMobileLocation = async () => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition((x) => {
				setMapPositions({
					...mapPositions,
					centre: [x.coords.latitude, x.coords.longitude],
				});
			});
			navigator.geolocation.watchPosition((x) => {
				setLocation([x.coords.latitude, x.coords.longitude]);
			});
		} else {
			throw new Error("Geolocation not allowed in settings or in browser");
		}
	};

	//-- Everytime the map arrays are modified we want to calculate the new distance of the path and
	// save them to localstorage. Then we can use that data when we make our API call to save the trail in the db.

	const saveToLocalStorage = () => {
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
				trailID: trailObject._id,
			})
		);
	};

	const ThisMap = () => {
		//----- Map controls!
		//--So what we're doing here is panning to the centre position whenvever the map is rendered;
		// this allows us to change the centre state (taken from the parent prop) and jump around. Then we have a click
		// event that takes the current position and adds it to the list of pins (pinArray). This array is also used
		// to create the points of our line. We have a mouseup event that sets the centre to wherever the user moves
		// so on re-renders it doesn't jump back to the previous state.
		const map = useMapEvents({
			click: (e) => {
				if (customize)
					setPinArray((current) => [...current, [e.latlng.lat, e.latlng.lng]]);
			},
			dragend: (e) => {
				let newCentre: [number, number] = [
					map.getCenter().lat,
					map.getCenter().lng,
				];
				if (
					newCentre[0] !== mapPositions.centre[0] &&
					newCentre[1] !== mapPositions.centre[1]
				) {
					setMapPositions({ ...mapPositions, centre: newCentre });
				}
			},
			contextmenu: (e) => {
				if (customize) setPopupPosition([e.latlng.lat, e.latlng.lng]);
			},
			keydown: (e) => {
				if (e.originalEvent.code === "Escape") {
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

		// var x: any = null;

		// map.eachLayer(function (layer) {
		// 	if (layer instanceof L.TileLayer) {
		// 		x = layer;
		// 	}
		// });
		// if (x && x._tiles) {
		// 	var z = x._tiles;
		// 	var y = Object.keys(x._tiles);
		// 	console.log(y.length);
		// 	y.forEach((key) => {
		// 		console.log(z[key].el.currentSrc);
		// 	});
		// }
		// console.log(map.getZoom() + "zoom");

		map.panTo(mapPositions.centre);
		saveToLocalStorage();
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

		if (waterArray != null && popupPosition) {
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
	const locationIcon = divIcon({
		html: renderToStaticMarkup(
			<>
				<i className="las la-crosshairs map-icon crosshairs" />
				<div className="black">{location?.[0] || "nolocation"}</div>
			</>
		),
	});

	return (
		<div className={`map-container-box ${fullScreen ? "shift-map" : "small"}`}>
			<MapContainer
				style={{ height: "100%", width: "100%" }}
				center={mapPositions.centre}
				zoom={20}
				scrollWheelZoom={true}
			>
				<ThisMap />
				<div className="leaflet-top leaflet-right">
					<div
						className="leaflet-control leaflet-bar custom-control desktop"
						onClick={(e) => handleZoom(e)}
					>
						<i className="las la-expand"></i>
					</div>
					<div
						className="leaflet-control leaflet-bar custom-control mobile"
						onClick={() => handleMobileZoom()}
					>
						<i className="las la-expand"></i>
					</div>
					<div
						className="leaflet-control leaflet-bar custom-control desktop"
						onClick={(e) => handleLocation(e)}
					>
						<i className="las la-crosshairs"></i>
					</div>
					<div
						className="leaflet-control leaflet-bar custom-control mobile"
						onClick={() => handleMobileLocation()}
					>
						<i className="las la-crosshairs"></i>
					</div>
				</div>
				<TileLayer url={mapAPI} />

				{location && (
					<Marker
						position={location}
						icon={locationIcon}
						draggable={true}
						bubblingMouseEvents={false}
						eventHandlers={{
							click: (e) => {},
						}}
					></Marker>
				)}

				{customize && popupPosition && (
					<Popup
						position={popupPosition}
						interactive={false}
						eventHandlers={{
							remove: () => {
								setPopupPosition(null);
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
					eventHandlers={{
						click: (e) => {
							console.log(e);
						},
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

				{customize &&
					pinArray.map((marker, i) => {
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
