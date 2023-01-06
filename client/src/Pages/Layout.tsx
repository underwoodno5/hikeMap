import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";

import TopBar from "../components/TopBar";
import ErrorMsg from "../components/ErrorMsg";

interface LayoutProps {
	error?: String;
	errorFunction: Function;
}

export default function Layout(props: LayoutProps) {
	const { error, errorFunction } = props;
	const location = useLocation();
	const [pageAnimation, setPageAnimation] = useState("");
	const [pageTransition, setPageTransition] = useState(false);
	const [pageDisplay, setPageDisplay] = useState("");
	const navigate = useNavigate();

	//-- This is our navigation animation function. From the menu buttons we fire off transition with the intended page url,
	// which triggers our animation css. On the animations end the redirect occurs passing us to the
	// page display url. pageTransition is the check to make sure the function doesn't run multiple times.

	const transition = (x: string) => {
		setPageTransition(true);
		setPageAnimation("slide-out");
		setPageDisplay(x);
	};

	const redirect = async () => {
		if (pageTransition) {
			setPageTransition(false);
			navigate(pageDisplay);
			setPageAnimation("slide-up");
		}
	};
	return (
		<div className="App">
			<TopBar transition={transition} />
			{error && (
				<ErrorMsg errorText={error} closeFunction={() => errorFunction("")} />
			)}

			<div
				className={`main-container ${pageAnimation}`}
				onAnimationEnd={redirect}
			>
				<Outlet />
			</div>
		</div>
	);
}
