import e from "express";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trails } from "../api/TrailsApi";
import "./TrailList.scss";

interface TrailListProps {
	trails: Array<Trail>;
	me: Me | null;
	myTrails?: Trail[];
	throwError: Function;
}

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
}

export default function TrailList(props: TrailListProps) {
	const { trails, me, myTrails, throwError } = props;

	//Start with an initial array to handle our checked/unchecked boxes and add false (unchecked) for each box.
	//Then we can handle the checked state using setChecked

	const initialArray = trails.map((i) => {
		return false;
	});

	const [checked, setChecked] = useState(initialArray);
	const matchArray: string[] = [];

	const handleChange = (event: any) => {
		//handle checking/unchecking boxes
		const trailIndex = event.target.value;
		const holdingArray = checked.map((c, i) => {
			if (i == trailIndex) {
				return !c;
			} else {
				return c;
			}
		});
		setChecked(holdingArray);
	};

	const addTrailToList = async (e: any) => {
		//We filter through the trails to find which ones are checked
		//add pass them to the trail IDS to the API to save in the users trailList
		const selectedTrails = trails.filter((element, i) => {
			return checked[i] == true;
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

	trailMatch();

	return (
		<div className="trail-list-container">
			<h3>Trail List</h3>
			<ul>
				{trails.map((trailObject, i) => {
					return (
						<Link to="/map" state={{ clickedIndex: i }} key={i}>
							<li className={matchArray[i]}>
								<h4>{trailObject.name}</h4>
								<h4>{`${trailObject.startLat}`}</h4>
								<h4>{`${trailObject.startLong}`}</h4>
								<input
									type="checkbox"
									id="vehicle1"
									name={trailObject.name}
									value={i}
									onChange={handleChange}
									checked={checked[i]}
								/>
							</li>
						</Link>
					);
				})}
			</ul>
			<button className="light" onClick={addTrailToList}>
				Add to my trails
			</button>
		</div>
	);
}
