import React, { useState } from "react";
import "./TopBar.scss";
import Menu from "./DropdownMenu";
import logo from "../images/logo.svg";
import { Me } from "../types/interface";

export default function TopBar(props: {
	transition: Function;
	topBar: boolean;
	user: Me | null;
}) {
	//-- Just a boolean selector so we can set the z-index of the menu to 10 when it's clicked on mobile. It needs to be at
	// 1 when not clicked so that it doesn't obscure the full-screen map.
	const [clicked, setClicked] = useState(false);
	return (
		<div className={`topBar-wrapper ${clicked && "full-menu"}`}>
			<div className="topBar-box">
				<img src={logo} alt="SVG as an image" />
			</div>
			<div className="topBar-box"></div>
			<div className="topBar-box">
				<Menu
					transition={props.transition}
					setClicked={setClicked}
					user={props.user}
				/>
			</div>
		</div>
	);
}
