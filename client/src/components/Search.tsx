import React, { useState } from "react";
import "./Search.scss";
import { Link } from "react-router-dom";

interface Trails {
	name: String;
}
export default function Search() {
	const [sortedArray, setSortedArray] = useState<object[]>([]);

	//-- For the search function we take the list of trails from localstorage and begin the sorting that list based on
	//-- the first input from searchTerm and store the sorted list in sortedArray. For each subsequent letter entered
	//-- in searchTerm, we use the already sorted array to further sort.

	const handleInput = async (event: any) => {
		const localList = localStorage.getItem("myTrailList");
		const searchTerm = event.target.value.toLowerCase();

		if (searchTerm === "") {
			setSortedArray([]);
			return;
		}

		if (sortedArray && sortedArray[0]) {
			setSortedArray((current) =>
				[...current].sort(function (x: any, y: any) {
					return x.name.slice(0, searchTerm.length).toLowerCase() === searchTerm
						? -1
						: y.name.slice(0, searchTerm.length).toLowerCase() === searchTerm
						? 1
						: 0;
				})
			);
		} else if (localList && localList.length > 0) {
			let myList = await JSON.parse(localList || "{}");

			const sort = await myList.sort(function (x: any, y: any) {
				return x.name.slice(0, searchTerm.length).toLowerCase() === searchTerm
					? -1
					: y.name.slice(0, searchTerm.length).toLowerCase() === searchTerm
					? 1
					: 0;
			});
			setSortedArray(sort);
		}
	};

	return (
		<div className={"search-bar-container"}>
			<input
				type="text"
				className="search-bar"
				placeholder="Search.."
				onChange={handleInput}
			></input>
			{sortedArray && (
				<ul className={"search-results"}>
					{sortedArray.map((item: any, i) => {
						return (
							<Link
								to="/map"
								state={{ clickedIndex: i, trails: sortedArray }}
								key={i}
							>
								<li key={i}>{item.name}</li>
							</Link>
						);
					})}
				</ul>
			)}
		</div>
	);
}
