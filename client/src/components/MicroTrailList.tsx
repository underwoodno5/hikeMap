import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router";
import "./MicroTrailList.scss";

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

export default function MicroTrailList(props: {
	trails: {
		_id: number;
		name: string;
		startLat: number;
		startLong: number;
		trailPath: [number, number][];
		createdby?: number;
	}[];
	listFunction: Function;
	admin: boolean;
	swapSideBar: Function;
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
	const [isExpanded, setIsExpanded] = useState(-1);
	const { state } = useLocation();
	const scrollRef = useRef<HTMLLIElement>(null);
	const { trails, listFunction, admin, swapSideBar } = props;
	const { allTrails, userTrails, userCustomTrails, user } = props.appData;
	let scrolledItem = 0;
	let selectedTrails = trails;

	//-- If we're coming from the /traillist page we use the states set in our navigate at the start.
	if (state) {
		scrolledItem = state.clickedIndex;
		selectedTrails = state.displayedTrails;
	}

	const [displayedTrails, setDisplayedTrails] = useState(selectedTrails);

	useEffect(() => {
		if (scrollRef.current != null && state) {
			scrollRef.current.scrollIntoView();
			setIsExpanded(scrolledItem);
			listFunction(
				trails[scrolledItem].startLat,
				trails[scrolledItem].startLong,
				trails[scrolledItem].trailPath
			);
		}
	}, []);
	const clickTrail = (
		startLat: number,
		startLong: number,
		trailPath: [number, number][],
		i: number
	) => {
		console.log("click trail");
		listFunction(startLat, startLong, trailPath);
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
		setDisplayedTrails(x);
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
				{displayedTrails.map((trailObject, i) => {
					return (
						<li
							ref={i === scrolledItem ? scrollRef : null}
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
							{isExpanded === i && user && (
								<div className="trail-list-expansion">
									{admin && (
										<button onClick={(e) => sideBarClick(e)}>
											Create custom trail
										</button>
									)}
									{trailObject.createdby && <button>customTrailButton</button>}
								</div>
							)}
						</li>
					);
				})}
			</ul>
		</>
	);
}
