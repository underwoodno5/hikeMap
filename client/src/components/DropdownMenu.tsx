import React from "react";
import "./DropdownMenu.scss";

export default function Menu(props: { transition: Function }) {
	return (
		<div className="dropdown-menu-container">
			<i className="las la-bars"></i>
			<menu>
				<li>
					<button className="light" onClick={() => props.transition("about")}>
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
