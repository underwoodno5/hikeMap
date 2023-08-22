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

	const clickTrail = (trailObject: Trail, i: number) => {
		console.log("click trail");
		if (i === isExpanded && displayedTrails.displayed === true) {
			setIsExpanded(-1);
		} else {
			setIsExpanded(i);
		}
		setDisplayedTrails({ ...displayedTrails, displayed: true });
		moveMap(trailObject);
	};

	const sideBarClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		swapSideBar();
	};
	const shareTrail = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const headerClick = (x: any) => {
		setDisplayedTrails({ trails: x, displayed: false });
	};

	return (
		<>
			<div className="list-tab">
				{!user && (
					<h5
						className={`header ${
							displayedTrails.trails === allTrails ? "selected" : null
						}`}
						onClick={() => headerClick(allTrails)}
					>
						Trail List
					</h5>
				)}
				{user && (
					<>
						<h5
							className={`header ${
								displayedTrails.trails === userTrails ? "selected" : null
							}`}
							onClick={() => headerClick(userTrails)}
						>
							Saved Trails
						</h5>
						<h5
							className={`header ${
								displayedTrails.trails === userCustomTrails ? "selected" : null
							}`}
							onClick={() => headerClick(userCustomTrails)}
						>
							Your Custom Trails
						</h5>
					</>
				)}
			</div>
			<ul>
				{displayedTrails.trails.map((trailObject, i) => {
					return (
						<li
							ref={i === isExpanded ? scrollRef : null}
							key={i}
							onClick={(e) => clickTrail(trailObject, i)}
							className={i === isExpanded && user ? "expand" : ""}
						>
							<h5>{trailObject.name}</h5>
							{isExpanded === i &&
								displayedTrails.displayed === true &&
								user && (
									<div className="trail-list-expansion">
										{user && (
											<>
												<button onClick={(e) => sideBarClick(e)}>
													Edit Trail
												</button>
												<button onClick={(e) => shareTrail(e)}>
													<i className="las la-share-square"></i>
												</button>
											</>
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
