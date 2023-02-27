import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router";

import TopBar from "../components/TopBar";
import ErrorMsg from "../components/ErrorMsg";
import { Trail, Me } from "../types/interface";

import "./Layout.scss";

interface LayoutProps {
	error?: String;
	errorFunction: Function;
	topBar: boolean;
	user: Me | null;
}

export default function Layout(props: LayoutProps) {
	const { error, errorFunction } = props;
	const [pageAnimation, setPageAnimation] = useState("");
	const [pageTransition, setPageTransition] = useState(false);
	const [pageDisplay, setPageDisplay] = useState("");

	const navigate = useNavigate();

	//-- This is our navigation animation function. From the menu buttons we fire off transition with the intended page url,
	// which triggers our animation css. On the animations end the redirect occurs passing us to the
	// page display url. pageTransition is the check to make sure the function doesn't run multiple times.

	const transition = (x: string) => {
		setPageTransition(true);
		setPageAnimation("fade-main-out");
		setPageDisplay(x);
	};

	const childNavigation = async (
		page: string,
		clickedIndex?: number,
		displayedTrails?: Trail[]
	) => {
		navigate(page, {
			state: {
				navigated: true,
				clickedIndex: clickedIndex,
				displayedTrails: displayedTrails,
			},
		});
		setPageAnimation("slide-page-up");
	};

	const redirect = async () => {
		if (pageTransition) {
			setPageTransition(false);
			//-- This state allows us to check if the page has been navigated (if we need to)
			navigate(pageDisplay, { state: { navigated: true } });
			setPageAnimation("slide-page-up");
		}
	};
	return (
		<div className="App">
			<TopBar transition={transition} topBar={props.topBar} user={props.user} />
			{error && (
				<ErrorMsg errorText={error} closeFunction={() => errorFunction("")} />
			)}

			<div
				className={`main-container ${pageAnimation}`}
				onAnimationEnd={redirect}
			>
				<Outlet
					context={(
						page: string,
						clickedIndex?: number,
						displayedTrails?: Trail[]
					) => childNavigation(page, clickedIndex, displayedTrails)}
				/>
			</div>
		</div>
	);
}
