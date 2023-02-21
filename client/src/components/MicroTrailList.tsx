import React, { useState, useRef, useEffect } from "react";
import "./MicroTrailList.scss";
import { Trail, Me, AppData } from "../types/interface";

export default function MicroTrailList(props: {
	trails: Trail[];
	moveMap: Function;
	admin: boolean;
	swapSideBar: Function;
	user: Me | null;
	appData: AppData;
	clickedTrail: number;
	mobileHide: Function;
}) {
	const scrollRef = useRef<HTMLLIElement>(null);
	const { trails, moveMap, admin, swapSideBar, clickedTrail, mobileHide } =
		props;
	const { allTrails, userTrails, userCustomTrails, user } = props.appData;
	let selectedTrails = trails;
	const [isExpanded, setIsExpanded] = useState(clickedTrail);

	const [displayedTrails, setDisplayedTrails] = useState({
		trails: selectedTrails,
		displayed: true,
	});

	useEffect(() => {
		//-- this keeps it from scrolling if the page is loaded without selecting a
		if (scrollRef.current && isExpanded !== 0) {
			scrollRef.current.scrollIntoView();
		}
	}, [isExpanded]);

	const clickTrail = (
		startLat: number,
		startLong: number,
		trailPath: [number, number][],
		i: number,
		waterPoints?: [number, number][],
		tentPoints?: [number, number][]
	) => {
		setDisplayedTrails({ ...displayedTrails, displayed: true });
		moveMap(startLat, startLong, trailPath, waterPoints, tentPoints);
		if (i === isExpanded) {
			setIsExpanded(-1);
		} else {
			setIsExpanded(i);
		}
	};

	const sideBarClick = (e: React.MouseEvent) => {
		e.bubbles = false;
		swapSideBar();
	};

	const trailClick = (x: any) => {
		setDisplayedTrails({ trails: x, displayed: false });
	};

	return (
		<>
			<div className="list-tab">
				<h4 onClick={() => trailClick(allTrails)}>Trail List</h4>
				{user && (
					<>
						<h4 onClick={() => trailClick(userTrails)}>User List</h4>
						<h4 onClick={() => trailClick(userCustomTrails)}>Custom List</h4>
					</>
				)}
			</div>
			<ul>
				{displayedTrails.trails.map((trailObject, i) => {
					return (
						<li
							ref={i === isExpanded ? scrollRef : null}
							key={i}
							onClick={(e) =>
								clickTrail(
									trailObject.startLat,
									trailObject.startLong,
									trailObject.trailPath,
									i,
									trailObject.waterPoints,
									trailObject.tentPoints
								)
							}
						>
							<h5>{trailObject.name}</h5>
							{isExpanded === i &&
								displayedTrails.displayed === true &&
								user && (
									<div className="trail-list-expansion">
										{user && (
											<button onClick={(e) => sideBarClick(e)}>
												Create custom trail
											</button>
										)}
										<button className="mobile" onClick={() => mobileHide()}>
											View Map
										</button>
									</div>
								)}
						</li>
					);
				})}
			</ul>
		</>
	);
}
