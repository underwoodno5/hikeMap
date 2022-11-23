import React from "react";
import "./DropdownMenu.scss";

export default function Menu() {
	let showMenu = false;
	const menuClick = () => {
		if (showMenu) {
		}
	};
	return (
		<div className="dropdown-menu-container">
			<i className="las la-bars"></i>
			<menu>
				<li>
					<button className="light">here's a button</button>
				</li>
				<li>
					<button className="light">here's a button</button>
				</li>
				<li>
					<button className="light">here's a button</button>
				</li>
			</menu>
		</div>
	);
}
