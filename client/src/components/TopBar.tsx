import React from "react";
import "./TopBar.scss";
export default function TopBar() {
	return (
		<div className="topBar-wrapper">
			<div className="topBar-box">
				<i className="las la-hiking"></i>
				<i className="las la-campground"></i>
			</div>
			<div className="topBar-box"></div>
			<div className="topBar-box">
				<i className="las la-bars"></i>
			</div>
		</div>
	);
}
