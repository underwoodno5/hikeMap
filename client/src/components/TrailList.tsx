import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trails } from "../api/TrailsApi";
import { Trail, Me, AppData } from "../types/interface";
import "./TrailList.scss";

interface TrailListProps {
	trails: Array<Trail>;
	me: Me | null;
	myTrails?: Trail[];
	throwError: Function;
	appData: AppData;
}

export default function TrailList(props: TrailListProps) {
	const { allTrails, userTrails, userCustomTrails } = props.appData;
	const { trails, myTrails, throwError, me } = props;

	const navigate = useNavigate();

	const [displayedTrails, setDisplayedTrails] = useState(trails);

	const matchArray: string[] = [];
	const [checked, setChecked] = useState<boolean[]>(
		trails.map(() => {
			return false;
		})
	);

	//-- We store our checked items in the checked array and then send those corresponding items through API when the user clicks
	// the trailist button, where they are saved to the users db.

	const handleChange = (e: any) => {
		console.log("change");
		const trailIndex = parseInt(e.target.value);
		setChecked(
			checked.map((c, i) => {
				if (trailIndex === i) {
					return !c;
				} else {
					return c;
				}
			})
		);

		// setChecked([...checked, trailIndex]);
	};

	const addTrailToList = async (e: any) => {
		const selectedTrails = trails.filter((element, i) => {
			return checked[i] == true;
		});
		const res = await Trails.addToTrailList(selectedTrails);
		if (res.errors) {
			throwError(res.errors[0].message);
		}
	};

	const trailMatch = () => {
		//check the users locally stored list of trails (taken from the DB) to find which need a unique colour in the css
		if (myTrails) {
			trails.forEach((element, i) => {
				if (myTrails.some((item) => item.name === element.name)) {
					matchArray.push("match");
				} else {
					matchArray.push("null");
				}
			});
		}
	};

	const trailClick = (x: any) => {
		console.log(x);
		setDisplayedTrails(x);
	};

	trailMatch();

	return (
		<div className="trail-list-container halftone">
			<div className="inner-border">
				<div className="list-tab">
					<h3
						className={`header trail-header ${
							displayedTrails === allTrails ? "selected" : null
						}`}
						onClick={() => trailClick(allTrails)}
					>
						Trail List
					</h3>
					{props.me && (
						<>
							<h3
								className={`header trail-header ${
									displayedTrails === userTrails ? "selected" : null
								}`}
								onClick={() => trailClick(userTrails)}
							>
								User List
							</h3>
							<h3
								className={`header trail-header ${
									displayedTrails === userCustomTrails ? "selected" : null
								}`}
								onClick={() => trailClick(userCustomTrails)}
							>
								Custom List
							</h3>
						</>
					)}
				</div>
				<ul>
					{displayedTrails.map((trailObject, i) => {
						return (
							<li
								className={matchArray[i]}
								key={i}
								onClick={() =>
									navigate("/map", {
										state: {
											clickedIndex: i,
											displayedTrails: displayedTrails,
										},
									})
								}
							>
								<h5>{trailObject.name}</h5>
								<h5>{`Distance: ${
									Math.round(trailObject.distance / 10) / 100
								}km`}</h5>
								<h5>{`${trailObject.startLong}`}</h5>
								{me && (
									<input
										type="checkbox"
										id="trail"
										name={trailObject.name}
										value={i}
										onChange={(e) => handleChange(e)}
										onClick={(e) => {
											e.stopPropagation();
										}}
										checked={checked[i]}
									/>
								)}
							</li>
						);
					})}
				</ul>
				{/* {me && (
				<button className="light" onClick={addTrailToList}>
					Add to my trails
				</button>
			)} */}
			</div>
		</div>
	);
}
