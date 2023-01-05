import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router";
import "./MicroTrailList.scss";
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
}) {
	const [isExpanded, setIsExpanded] = useState(-1);
	const { state } = useLocation();
	const scrollRef = useRef<HTMLLIElement>(null);
	const { trails, listFunction, admin, swapSideBar } = props;

	let scrolledItem = 0;

	if (state) {
		scrolledItem = state.clickedIndex;
	}

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

	return (
		<ul>
			{trails.map((trailObject, i) => {
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
						{isExpanded === i && (
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
	);
}
