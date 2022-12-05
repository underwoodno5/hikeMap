import React from "react";
import { Link } from "react-router-dom";
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
					<Link to="/">
						<button className="light">here's a button</button>
					</Link>
				</li>
				<li>
					<Link to="traillist">
						<button className="light">here's a button</button>
					</Link>
				</li>
				<li>
					<Link to="login">
						<button className="light">here's a button</button>
					</Link>
				</li>
			</menu>
		</div>
	);
}
