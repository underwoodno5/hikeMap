import React, { useRef, useEffect, useState } from "react";
import "./DropdownMenu.scss";
import { Me } from "../types/interface";

function useOutsideAlerter(ref: any, setShowMenu: any, setClicked: any) {
	useEffect(() => {
		function handleClickOutside(event: any) {
			if (ref.current && !ref.current.contains(event.target)) {
				setShowMenu(false);
			}
		}
		document.addEventListener("mouseup", handleClickOutside);
		return () => {
			document.removeEventListener("mouseup", handleClickOutside);
		};
	}, [ref]);
}

export default function Menu(props: {
	transition: Function;
	setClicked: Function;
	user: Me | null;
}) {
	const wrapperRef = useRef(null);
	const [showMenu, setShowMenu] = useState<boolean>(false);
	const swapMenu = () => {
		if (showMenu === false) {
			props.setClicked(true);
		}
		setShowMenu(!showMenu);
	};
	useOutsideAlerter(wrapperRef, setShowMenu, props.setClicked);
	return (
		<div
			className={`dropdown-menu-container ${showMenu ? "show" : "hide"}`}
			ref={wrapperRef}
			onClick={() => swapMenu()}
		>
			<i className="las la-bars"></i>
			<menu onTransitionEnd={() => props.setClicked(showMenu)}>
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
						{props.user ? "Account" : "Login"}
					</button>
				</li>
				<li>
					<button className="light" onClick={() => props.transition("map")}>
						Map
					</button>
				</li>
			</menu>
		</div>
	);
}
