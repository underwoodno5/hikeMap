import React, { useContext, useEffect, useState } from "react";
import "./LandingPage.scss";
import { Outlet, useNavigate, useOutletContext } from "react-router";

import "./LandingPage.scss";

const iconList = ["mobile", "scene", "desktop"];

export default function LandingPage() {
	const [index, setIndex] = useState(0);
	const [animate, setAnimate] = useState(true);
	const childNavigate = useOutletContext<Function>();

	const swapIcon = () => {
		if (animate === false) {
			return;
		}
		let newIndex = index + 1;
		setTimeout(() => {
			if (newIndex === 3) {
				setIndex(0);
			} else {
				setIndex(newIndex);
			}
		}, 5000);
	};

	return (
		<div className="landing-container new">
			<div className="landing-page-info">
				<h2>A simple map</h2>
				<h4>On desktop, mobile, and offline.</h4>
			</div>
			<div className="landing-animation-container">
				<div className={`frame frame-${iconList[index]}`}>
					{iconList[index] === "mobile" ? (
						<>
							<div className="map-container map-fade-in">
								<i className="las la-map-marker map-fade-in"></i>
								<svg
									width="100%"
									height="100%"
									xmlns="http://www.w3.org/2000/svg"
									preserveAspectRatio="none"
									className="map-fade-in"
								>
									<path
										d="M 0,0 C 59.868756,78.85387 99.789596,30.283895 138.66049,30.104515 c 80.46172,-0.37133 90.87185,137.794285 140.7729,129.699295 40.35037,-6.54568 49.90105,-80.94994 86.53937,-78.86548 33.24073,1.89117 22.2547,70.77048 73.14399,70.77048 39.92084,0 58.65264,-56.66496 99.80211,-56.66496 49.90105,0 69.86147,80.94995 99.8021,48.56997"
										fill="none"
										stroke="black"
										strokeWidth="1"
									/>
								</svg>
							</div>
						</>
					) : null}
					{iconList[index] === "desktop" ? (
						<>
							<div className="map-container map-fade-in">
								<div className="grey-container">
									<div className="grey-box"></div>
									<div className="grey-box"></div>
									<div className="grey-box"></div>
									<div className="grey-box"></div>
									<div className="grey-box"></div>
									<div className="grey-box"></div>
									<div className="grey-box"></div>
									<div className="grey-box"></div>
									<div className="grey-box"></div>
								</div>
							</div>
						</>
					) : null}
					{iconList[index] === "scene" ? (
						<>
							<i className={`las la-hiking icon-fade-in`}></i>
							<i className={`las la-mountain icon-fade-in`}></i>
							<i className={`las la-tree one icon-drop`}></i>
							<i className={`las la-tree two icon-drop`}></i>
							<i className={`las la-tree three icon-drop`}></i>

							<i className={`las la-wifi icon-fade-in`}></i>
						</>
					) : null}

					<svg
						width="100%"
						height="100%"
						xmlns="http://www.w3.org/2000/svg"
						preserveAspectRatio="none"
					>
						<rect width="100%" height="100%" rx="15" fill="black" />
						<rect
							x=".5%"
							y="2.5%"
							width="99%"
							height="95.5%"
							rx="15"
							fill="white"
						/>
					</svg>
				</div>
				<div
					className={`base base-${iconList[index]}`}
					onAnimationEnd={() => swapIcon()}
				></div>
				<div className={`stand stand-${iconList[index]}`}>
					<svg
						width="100%"
						height="100%"
						xmlns="http://www.w3.org/2000/svg"
						preserveAspectRatio="none"
					>
						<rect width="100%" height="100%" fill="black" />
					</svg>
				</div>
			</div>
			<div className="landing-page-info">
				<h4>Create, save, and share custom maps with markers.</h4>
				<div>
					<i
						className="las la-arrow-alt-circle-right"
						onClick={() => childNavigate("traillist")}
					></i>
				</div>
			</div>
		</div>
	);
}
