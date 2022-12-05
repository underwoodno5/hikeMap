import React, { useState } from "react";
import Map from "../components/Map";
import MicroTrailList from "../components/MicroTrailList";
import "./MapPage.scss";

export default function MapPage(props: {
	trails: {
		_id: number;
		name: string;
		startLat: number;
		startLong: number;
		trailPath: [number, number][];
	}[];
}) {
	const { trails } = props;
	const [mapPositions, setmapPositions] = useState<{
		centre: [number, number];
		markerPosition: [number, number];
		trailPath: [number, number][];
	}>({
		centre: [props.trails[0].startLat, props.trails[0].startLong],
		markerPosition: [props.trails[0].startLat, props.trails[0].startLong],
		trailPath: props.trails[0].trailPath,
	});

	const moveMap = (x: number, y: number, z: [number, number][]) => {
		setmapPositions({
			centre: [x, y],
			markerPosition: [x, y],
			trailPath: z,
		});
	};

	return (
		<div className={"map-page-container"}>
			<Map
				centre={mapPositions.centre}
				markerPosition={mapPositions.markerPosition}
				trailPath={mapPositions.trailPath}
			/>
			<MicroTrailList trails={trails} listFunction={moveMap} />
		</div>
	);
}
