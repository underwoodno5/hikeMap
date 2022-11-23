import React, { useState } from "react";
import "./LandingPage.scss";
import logo from "../images/logo.svg";

export default function LandingPage() {
	const [animateClass, setAnimateClass] = useState({
		slideDown: "",
		slideUp: "",
	});
	const leaveLanding = () => {
		setAnimateClass({
			slideDown: "slide-down",
			slideUp: "slide-up",
		});
	};
	return (
		<div className="landing-container">
			<div className={`top-box ${animateClass.slideUp}`}>
				<h1>We made a decent hiking app!</h1>
				<div className="diffuse-container">
					<div className="diffuse-bubble"></div>
				</div>
			</div>
			<div className={`bottom-box ${animateClass.slideDown}`}>
				<div className="logo">
					<div className="logo-bubble pulse" onClick={leaveLanding}>
						<img src={logo} alt="SVG as an image" />
					</div>
				</div>
			</div>
		</div>
	);
}
