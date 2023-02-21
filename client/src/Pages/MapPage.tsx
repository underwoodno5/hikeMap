import React, { useState } from "react";
import { useLocation } from "react-router";
import Map from "../components/Map";
import MicroTrailList from "../components/MicroTrailList";
import CustomMapCreation from "../components/CustomMapCreation";
import "./MapPage.scss";
import { Trail, Me, AppData } from "../types/interface";
import { User } from "../api/UserApi";

export default function MapPage(props: {
	trails: Trail[];
	throwError: Function;
	user: Me | null;
	appData: AppData;
	shrinkTopBar: Function;
}) {
	const { trails, user, shrinkTopBar } = props;
	const { state } = useLocation();

	//--This data is either taken from the state sent by clicking on a trail in Full Trail List or from the
	//first entry in the list of trails taken from the db
	let initialTrail =
		state?.displayedTrails?.[state.clickedIndex] || props.trails[0];
	let clickedIndex = state?.clickedIndex || 0;
	let displayedTrails = state?.displayedTrails || trails;

	const [mapPositions, setmapPositions] = useState<{
		centre: [number, number];
		markerPosition: [number, number];
		trailPath: [number, number][];
		waterPoints: [number, number][];
		tentPoints: [number, number][];
	}>({
		centre: [initialTrail.startLat, initialTrail.startLong],
		markerPosition: [initialTrail.startLat, initialTrail.startLong],
		trailPath: initialTrail.trailPath,
		waterPoints: initialTrail.waterPoints || null,
		tentPoints: initialTrail.tentPoints || null,
	});

	const [modeObj, setModeObj] = useState<{ clear: boolean; custom: boolean }>({
		clear: false,
		custom: false,
	});
	const [hideSideBar, setHideSideBar] = useState(false);
	const [mobileHide, setMobileHide] = useState(false);

	const moveMap = (
		x: number,
		y: number,
		z: [number, number][],
		a: [number, number][],
		b: [number, number][]
	) => {
		setmapPositions({
			centre: [x, y],
			markerPosition: [x, y],
			trailPath: z,
			waterPoints: a,
			tentPoints: b,
		});
		if (hideSideBar === true) {
			setHideSideBar(false);
		}
	};

	//--This function is called from the microtraillist, the map watches for this boolean change
	//which triggers the effect that clears the pin array, removing the current trail path.
	const clearMap = () => {
		setModeObj({ clear: !modeObj.clear, custom: modeObj.custom });
	};
	const swapSideBar = () => {
		setModeObj({ clear: modeObj.clear, custom: !modeObj.custom });
	};

	const expandMap = () => {
		setHideSideBar(!hideSideBar);
	};

	const expandMapMobile = () => {
		setMobileHide(!mobileHide);
	};
	return (
		<div className={`map-page-container`}>
			<i
				className={`las la-chevron-circle-${
					mobileHide ? "right" : "left"
				} side-bar-select`}
				onClick={() => expandMapMobile()}
			></i>
			<Map
				centre={mapPositions.centre}
				markerPosition={mapPositions.markerPosition}
				trailPath={mapPositions.trailPath}
				clear={modeObj.clear}
				clearMap={clearMap}
				expandMap={(x: boolean) => expandMap()}
				waterArray={mapPositions.waterPoints}
				tentArray={mapPositions.tentPoints}
				shrinkTopBar={() => shrinkTopBar()}
				customize={modeObj.custom}
			/>
			<div
				className={`side-bar-container ${hideSideBar && "hide"}  ${
					mobileHide && "mobile-hide"
				}`}
			>
				{modeObj.custom && (
					<CustomMapCreation
						clearMap={clearMap}
						throwError={props.throwError}
						swapSideBar={swapSideBar}
						mobileHide={() => expandMapMobile()}
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
						mobileHide={() => expandMapMobile()}
					/>
				)}
			</div>
		</div>
	);
}
