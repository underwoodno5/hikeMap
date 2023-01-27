import React from "react";
import "./DropdownMenu.scss";

export default function Menu(props: { transition: Function }) {
	return (
		<div className="dropdown-menu-container">
			<i className="las la-bars"></i>
			<menu>
				<li>
					<button className="light" onClick={() => props.transition("about")}>
						About
					</button>
				</li>
				<li>
					<button
						className="light"
						onClick={() => props.transition("traillist")}
					>
						Full Trail List
					</button>
				</li>
				<li>
					<button className="light" onClick={() => props.transition("login")}>
						Account
					</button>
				</li>
				<li>
					<button
						className="light"
						onClick={() => props.transition("traillist")}
					>
						Map
					</button>
				</li>
			</menu>
		</div>
	);
}
