import React, { useState } from "react";
import { useLocation } from "react-router";
import Map from "../components/Map";
import MicroTrailList from "../components/MicroTrailList";
import CustomMapCreation from "../components/CustomMapCreation";
import "./MapPage.scss";
import { Trail, Me, AppData } from "../types/interface";

export default function MapPage(props: {
	trails: Trail[];
	throwError: Function;
	user: Me | null;
	appData: AppData;
}) {
	const { trails, user } = props;
	const { state } = useLocation();

	//--This data is either taken from the state sent by clicking on a trail in Full Trail List or from
	let initialTrail =
		state?.displayedTrails?.[state.clickedIndex] || props.trails[0];
	let clickedIndex = state.clickedIndex || 0;
	let displayedTrails = state.displayedTrails || trails;

	const [mapPositions, setmapPositions] = useState<{
		centre: [number, number];
		markerPosition: [number, number];
		trailPath: [number, number][];
	}>({
		centre: [initialTrail.startLat, initialTrail.startLong],
		markerPosition: [initialTrail.startLat, initialTrail.startLong],
		trailPath: initialTrail.trailPath,
	});

	const [modeObj, setModeObj] = useState<{ clear: boolean; custom: boolean }>({
		clear: false,
		custom: false,
	});
	const [hideSideBar, setHideSideBar] = useState(false);

	const moveMap = (x: number, y: number, z: [number, number][]) => {
		setmapPositions({
			centre: [x, y],
			markerPosition: [x, y],
			trailPath: z,
		});
	};

	//--This function is called from the microtraillist, the map watches for this boolean change
	//which triggers the effect that clears the pin array, removing the current trail path.
	const clearMap = () => {
		setModeObj({ clear: !modeObj.clear, custom: modeObj.custom });
	};
	const swapSideBar = () => {
		setModeObj({ clear: modeObj.clear, custom: !modeObj.custom });
	};

	const expandMap = (x: boolean) => {
		setHideSideBar(!hideSideBar);
	};
	return (
		<div className={`map-page-container`}>
			<Map
				centre={mapPositions.centre}
				markerPosition={mapPositions.markerPosition}
				trailPath={mapPositions.trailPath}
				clear={modeObj.clear}
				clearMap={clearMap}
				expandMap={(x: boolean) => expandMap(x)}
			/>
			<div className={`side-bar-container ${hideSideBar && "hide"}`}>
				{modeObj.custom && (
					<CustomMapCreation
						clearMap={clearMap}
						throwError={props.throwError}
						swapSideBar={swapSideBar}
					/>
				)}
				{!modeObj.custom && (
					<MicroTrailList
						trails={displayedTrails}
						clickedTrail={clickedIndex}
						moveMap={moveMap}
						admin={user?.admin || false}
						user={user}
						swapSideBar={swapSideBar}
						appData={props.appData}
					/>
				)}
			</div>
		</div>
	);
}
