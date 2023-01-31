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
}) {
	const scrollRef = useRef<HTMLLIElement>(null);
	const { trails, moveMap, admin, swapSideBar, clickedTrail } = props;
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
			console.log("fast");
			scrollRef.current.scrollIntoView();
		}
	}, [isExpanded]);

	const clickTrail = (
		startLat: number,
		startLong: number,
		trailPath: [number, number][],
		i: number
	) => {
		console.log("click trail");
		moveMap(startLat, startLong, trailPath);
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
				<h3 onClick={() => trailClick(allTrails)}>Trail List</h3>
				{user && (
					<>
						<h3 onClick={() => trailClick(userTrails)}>User List</h3>
						<h3 onClick={() => trailClick(userCustomTrails)}>Custom List</h3>
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
									i
								)
							}
						>
							<h4>{trailObject.name}</h4>
							{isExpanded === i &&
								displayedTrails.displayed === true &&
								user && (
									<div className="trail-list-expansion">
										{admin && (
											<button onClick={(e) => sideBarClick(e)}>
												Create custom trail
											</button>
										)}
										{trailObject.createdby && (
											<button>customTrailButton</button>
										)}
									</div>
								)}
						</li>
					);
				})}
			</ul>
		</>
	);
}
