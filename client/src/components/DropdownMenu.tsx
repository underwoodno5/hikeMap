import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DropdownMenu.scss";

export default function Menu(props: { transition: Function }) {
	let showMenu = false;

	const menuClick = () => {};
	return (
		<div className="dropdown-menu-container">
			<i className="las la-bars"></i>
			<menu>
				<li>
					<button className="light" onClick={() => props.transition("/")}>
						here's a button
					</button>
				</li>
				<li>
					<button
						className="light"
						onClick={() => props.transition("traillist")}
					>
						here's a button
					</button>
				</li>
				<li>
					<button className="light" onClick={() => props.transition("login")}>
						here's a button
					</button>
				</li>
			</menu>
		</div>
	);
}
