import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import TrailList from "./components/TrailList";
import LandingPage from "./pages/LandingPage";
import Layout from "./pages/Layout";

import { Trails } from "./api/TrailsApi";
import { User } from "./api/UserApi";

import "./_mixins.scss";
import "./App.scss";
import "./_variables.scss";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";

interface Me {
	_id: number;
	name: string;
	admin: boolean;
}

interface Trail {
	_id: number;
	name: string;
	startLat: number;
	startLong: number;
	trailPath: [number, number][];
	createdby?: number;
}

interface AppData {
	user: Me | null;
	allTrails: Trail[] | null;
	userTrails?: Trail[];
}

function App() {
	const [appData, setAppData] = useState<AppData>({
		user: null,
		allTrails: null,
	});
	// const [slide, setSlide] = useState("");
	// const mobile = window.matchMedia("(pointer: coarse)").matches;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		//-- When loading the page (if connected to the internet) we want to grab the Userdata and Trails data from the server
		//-- the api will store the info in localstorage

		const fetchData = async () => {
			const response = await Promise.all([User.me(), Trails.getAll()]);
			setAppData({
				user: response[0].data.me || null,
				allTrails: response[1] || null,
			});
			setLoading(false);
		};
		fetchData().catch((err) => errorFunction(err.error[0].message));
	}, []);

	// const click = () => {
	// 	setSlide("slide-out");
	// };

	//-- This global errorfunction gets passed as a prop to any object that will throw errors, place error text in function.
	const errorFunction = (x: string) => {
		console.log("error");
		setError(x);
	};

	const LoadingCheck = () => {
		if (loading) {
			return null;
		} else {
			return (
				<Routes>
					<Route
						path="/"
						element={<Layout error={error} errorFunction={errorFunction} />}
					>
						<Route path="/" element={<LandingPage />} />
						{appData.allTrails && (
							<Route
								path="traillist"
								element={
									<TrailList
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
								appData.user ? (
									<Navigate to="/" />
								) : (
									<LoginPage errorFunction={errorFunction} />
								)
							}
						/>
						{appData.allTrails && (
							<Route
								path="map"
								element={
									<MapPage
										trails={appData.allTrails}
										user={appData.user || null}
										throwError={errorFunction}
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
