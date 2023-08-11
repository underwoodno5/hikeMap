import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TrailList from "./components/TrailList";
// import LandingPage from "./pages/LandingPage";
import Layout from "./pages/Layout";
import AccountPage from "./pages/AccountPage";
import About from "./pages/About";
import { Trails } from "./api/TrailsApi";
import { User } from "./api/UserApi";
import NewLanding from "./pages/NewLandingPage";

import { AppData } from "./types/interface";

import "./_mixins.scss";
import "./App.scss";
import "./_variables.scss";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";

function App() {
	//-- This is our hack for mobile fullscreen, lets us take into account the browser bars and whatnot.
	const getWindowHeight = () => {
		let vh = window.innerHeight;
		document.documentElement.style.setProperty("--vh", `${vh}px`);
	};
	getWindowHeight();

	window.addEventListener("resize", () => {
		getWindowHeight();
	});

	const [appData, setAppData] = useState<AppData>({
		user: null,
		allTrails: null,
		userTrails: null,
		userCustomTrails: null,
	});

	const [loading, setLoading] = useState(true);
	const [topBar, setTopBar] = useState(true);
	const [error, setError] = useState("");
	const online = navigator.onLine;

	//-- When loading the page (if connected to the internet) we want to grab the Userdata and Trails data from the server
	//-- the api will store the info in localstorage

	const fetchData = async () => {
		//--Initial api call passes possible new access token to future, concurrent api calls.
		const me = await User.me();
		let newAccessToken = me.accessToken || null;

		const trails = await Promise.all([
			Trails.getAll(newAccessToken),
			User.getUserTrails(newAccessToken),
		]);

		setAppData({
			user: me.me,
			allTrails: trails[0],
			userTrails: null,
			userCustomTrails: null,
		});

		setLoading(false);
	};

	if (online && loading && appData.allTrails === null) {
		fetchData().catch((err) => console.log(err));
	}

	//-- This global errorfunction gets passed as a prop to any object that will throw errors, place error text in function.
	const errorFunction = (x: string) => {
		console.log("error");
		setError(x);
	};

	//-- Use this to animate removal of the topbar in case you need fullscreen for anything.
	const shrinkTopBar = () => {
		console.log("shrink");
		setTopBar(!topBar);
	};

	const LoadingCheck = () => {
		if (loading) {
			return null;
		} else {
			return (
				<Routes>
					<Route
						path="/"
						element={
							<Layout
								error={error}
								errorFunction={errorFunction}
								topBar={topBar}
								user={appData.user}
							/>
						}
					>
						<Route path="/" element={<NewLanding />} />
						{appData.allTrails && (
							<Route
								path="traillist"
								element={
									<TrailList
										appData={appData}
										trails={appData.allTrails}
										me={appData.user}
										throwError={errorFunction}
									/>
								}
							/>
						)}

						<Route
							path="login"
							element={
								<LoginPage user={appData.user} errorFunction={errorFunction} />
							}
						/>
						<Route path="account" element={<AccountPage me={appData.user} />} />
						<Route path="about" element={<About />} />
						<Route path="newlanding" element={<NewLanding />} />

						{appData.allTrails && (
							<Route
								path="map"
								element={
									<MapPage
										trails={appData.allTrails}
										user={appData.user || null}
										throwError={errorFunction}
										appData={appData}
										shrinkTopBar={() => shrinkTopBar()}
									/>
								}
							/>
						)}
					</Route>
				</Routes>
			);
		}
	};
	return (
		<BrowserRouter>
			<LoadingCheck />
		</BrowserRouter>
	);
}

export default App;
