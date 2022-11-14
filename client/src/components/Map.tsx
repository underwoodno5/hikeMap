import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

interface MapBoundary {
	center: [number, number];
}

export default function Map(props: MapBoundary) {
	const mapAPI = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	const [lat, setLat] = useState(10);
	console.log("render");

	useEffect(() => {
		setLat(47.5443);
	}, []);

	return (
		<MapContainer
			style={{ height: "500px", width: "50%" }}
			center={[47.5443, -52.9136]}
			zoom={50}
			scrollWheelZoom={false}
		>
			<TileLayer url={mapAPI} />
			<Marker position={props.center}>
				<Popup>A pretty CSS3 popup. Easily customizable.</Popup>
			</Marker>
		</MapContainer>
	);
}
