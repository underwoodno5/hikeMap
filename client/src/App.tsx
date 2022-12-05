import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Form from "./components/Form";
import TopBar from "./components/TopBar";
import TrailList from "./components/TrailList";
import LandingPage from "./pages/LandingPage";
import Layout from "./pages/Layout";
import Map from "./components/Map";

import { Trails } from "./api/TrailsApi";
import { User } from "./api/UserApi";

import "./_mixins.scss";
import "./App.scss";
import "./_variables.scss";
import LoginPage from "./pages/LoginPage";
import { userInfo } from "os";
import MapPage from "./pages/MapPage";
interface Me {
	_id: number;
	name: string;
	trailList: Trail[];
}

interface Trail {
	_id: number;
	name: string;
	startLat: number;
	startLong: number;
	trailPath: [number, number][];
}

interface AppData {
	user: Me | null;
	allTrails: Trail[] | null;
}

function App() {
	const [appData, setAppData] = useState<AppData>({
		user: null,
		allTrails: null,
	});
	const [slide, setSlide] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const myTrails: Trail[] = JSON.parse(localStorage.getItem("myTrailList")!);
	const mobile = window.matchMedia("(pointer: coarse)").matches;

	useEffect(() => {
		//Grab user data accordingly
		const fetchUser = async () => {
			const data = await User.me();
			const fetchedAllTrails = await Trails.getAll();
			setAppData({
				user: data.me,
				allTrails: fetchedAllTrails,
			});
			console.log(fetchedAllTrails);
			setLoading(false);
		};
		fetchUser().catch((err) => console.log(err));
	}, []);

	const click = () => {
		setSlide("slide-out");
	};

	//Global errorfunction. Pass this as a prop to any object that will throw errors, place error text in function.
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
										myTrails={myTrails}
										throwError={errorFunction}
									/>
								}
							/>
						)}
						<Route
							path="login"
							element={
								appData.user ? (
									<LoginPage errorFunction={errorFunction} />
								) : (
									<Navigate to="/" />
								)
							}
						/>
						{appData.allTrails && (
							<Route
								path="map"
								element={<MapPage trails={appData.allTrails} />}
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
