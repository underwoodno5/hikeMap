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
	const { trails, myTrails, throwError } = props;

	const navigate = useNavigate();

	const [displayedTrails, setDisplayedTrails] = useState(trails);

	//--Start with an initial array to handle our checked/unchecked boxes and add false (unchecked) for each box.
	//Then we can handle the checked state using setChecked

	const initialArray = trails.map((i) => {
		return false;
	});

	const [checked, setChecked] = useState(initialArray);
	const matchArray: string[] = [];

	const handleChange = (event: any) => {
		const trailIndex = event.target.value;
		console.log(trailIndex);

		setChecked(
			checked.map((c, i) => {
				if (i === trailIndex) {
					return !c;
				} else {
					return c;
				}
			})
		);
	};

	const addTrailToList = async (e: any) => {
		//--We filter through the trails to find which ones are checked
		//add pass them to the trail IDS to the API to save in the users trailList
		const selectedTrails = trails.filter((element, i) => {
			return checked[i] === true;
		});

		const res = await Trails.addToTrailList(selectedTrails);
		if (res.errors) {
			throwError(res.errors[0].message);
		}
		const holdingArray = checked.map((c, i) => {
			return false;
		});
		setChecked(holdingArray);
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
		setDisplayedTrails(x);
	};

	trailMatch();

	return (
		<div className="trail-list-container">
			<div className="list-tab">
				<h3 onClick={() => trailClick(allTrails)}>Trail List</h3>
				{props.me && (
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
							className={matchArray[i]}
							key={i}
							onClick={() =>
								navigate("/map", {
									state: { clickedIndex: i, displayedTrails: displayedTrails },
								})
							}
						>
							<h4>{trailObject.name}</h4>
							<h4>{`Distance: ${
								Math.round(trailObject.distance / 10) / 100
							}km`}</h4>
							<h4>{`${trailObject.startLong}`}</h4>
							<input
								type="checkbox"
								id="vehicle1"
								name={trailObject.name}
								value={i}
								onChange={handleChange}
								onClick={(e) => {
									e.stopPropagation();
								}}
								checked={checked[i]}
							/>
						</li>
						// </Link>
					);
				})}
			</ul>
			<button className="light" onClick={addTrailToList}>
				Add to my trails
			</button>
		</div>
	);
}
