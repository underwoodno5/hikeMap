import React from "react";
import "./MicroTrailList.scss";
export default function MicroTrailList(props: {
	trails: {
		_id: number;
		name: string;
		startLat: Number;
		startLong: Number;
		trailPath: [number, number][];
	}[];
	listFunction: Function;
}) {
	const { trails, listFunction } = props;
	return (
		<div className="micro-trail-container">
			<ul>
				{trails.map((trailObject, i) => {
					return (
						<li
							key={i}
							onClick={() =>
								listFunction(
									trailObject.startLat,
									trailObject.startLong,
									trailObject.trailPath
								)
							}
						>
							<h4>{trailObject.name}</h4>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
