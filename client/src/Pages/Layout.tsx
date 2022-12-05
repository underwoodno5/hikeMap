import React from "react";
import { Outlet } from "react-router";

import TopBar from "../components/TopBar";
import ErrorMsg from "../components/ErrorMsg";

interface LayoutProps {
	error?: String;
	errorFunction: Function;
}

export default function Layout(props: LayoutProps) {
	const { error, errorFunction } = props;
	return (
		<div className="App">
			<TopBar />
			{error && (
				<ErrorMsg errorText={error} closeFunction={() => errorFunction("")} />
			)}

			<div className={`main-container`}>
				<Outlet />
			</div>
		</div>
	);
}
