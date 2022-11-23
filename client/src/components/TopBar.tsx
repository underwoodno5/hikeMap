import React from "react";
import "./TopBar.scss";
import Menu from "./DropdownMenu";
import logo from "../images/logo.svg";

export default function TopBar() {
	return (
		<div className="topBar-wrapper">
			<div className="topBar-box">
				<img src={logo} alt="SVG as an image" />
			</div>
			<div className="topBar-box"></div>
			<div className="topBar-box">
				<Menu />
			</div>
		</div>
	);
}
