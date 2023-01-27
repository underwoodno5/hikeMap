import React, { useState } from "react";
import { useLocation } from "react-router";
import Map from "../components/Map";
import MicroTrailList from "../components/MicroTrailList";
import CustomMapCreation from "../components/CustomMapCreation";
import "./MapPage.scss";

interface Me {
	_id: number;
	name: string;
}

interface Trail {
	_id: number;
	name: string;
	startLat: number;
	startLong: number;
	trailPath: [number, number][];
	distance: number;
}

export default function MapPage(props: {
	trails: {
		_id: number;
		name: string;
		startLat: number;
		startLong: number;
		trailPath: [number, number][];
		createdby?: number;
	}[];
	throwError: Function;
	user: {
		_id: number;
		name: string;
		admin: boolean;
	} | null;
	appData: {
		user: Me | null;
		allTrails: Trail[] | null;
		userTrails: Trail[] | null;
		userCustomTrails: Trail[] | null;
	};
}) {
	const { trails, user } = props;
	const { state } = useLocation();

	const [mapPositions, setmapPositions] = useState<{
		centre: [number, number];
		markerPosition: [number, number];
		trailPath: [number, number][];
	}>({
		centre: [props.trails[0].startLat, props.trails[0].startLong],
		markerPosition: [props.trails[0].startLat, props.trails[0].startLong],
		trailPath: props.trails[0].trailPath,
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
		console.log("click");
		setModeObj({ clear: modeObj.clear, custom: !modeObj.custom });
	};

	const expandMap = (x: boolean) => {
		setHideSideBar(!hideSideBar);
	};

	console.log(state);

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
						trails={state ? state.displayedTrails : trails}
						listFunction={moveMap}
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
