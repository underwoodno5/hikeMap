import React, { useState } from "react";
import "./LandingPage.scss";
import logo from "../images/logo.svg";
import { useOutletContext } from "react-router";

export default function LandingPage() {
	const childNavigate = useOutletContext<Function>();

	const [animateClass, setAnimateClass] = useState({
		slideDown: "",
		slideUp: "",
	});
	const leaveLanding = () => {
		setAnimateClass({
			slideDown: "slide-it-down",
			slideUp: "slide-it-up",
		});
	};

	return (
		<div className="landing-container">
			<div
				className={`top-box ${animateClass.slideUp}`}
				onAnimationEnd={() => childNavigate("traillist")}
			>
				<h1>Intranet application for data collection</h1>
				<div className="diffuse-container">
					<div className="diffuse-bubble"></div>
				</div>
			</div>
			<div className={`bottom-box ${animateClass.slideDown}`}>
				<div className="logo">
					<div className="logo-bubble pulse" onClick={leaveLanding}>
						<img src={logo} alt="SVG" />
					</div>
				</div>
			</div>
		</div>
	);
}
