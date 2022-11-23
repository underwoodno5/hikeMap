import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Form from "./components/Form";
import TopBar from "./components/TopBar";
import TrailList from "./components/TrailList";
import LandingPage from "./Pages/LandingPage";

import { Trails } from "./api/TrailsApi";
import { User } from "./api/UserApi";

import "./_mixins.scss";
import "./App.scss";
import "./_variables.scss";
interface Me {
	_id: number;
	name: string;
	trailList: Trail[];
}

interface Trail {
	_id: number;
	name: string;
	startLat: string;
	startLong: string;
}

function App() {
	const [slide, setSlide] = useState("");
	const [user, setUser] = useState<Me>();
	const [allTrails, setAllTrails] = useState<Trail[]>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const myTrails: Trail[] = JSON.parse(localStorage.getItem("myTrailList")!);
	const mobile = window.matchMedia("(pointer: coarse)").matches;

	useEffect(() => {
		//Grab user data accordingly
		const fetchUser = async () => {
			const data = await User.me();
			const fetchedAllTrails = await Trails.getAll();
			setUser(data.me);
			setAllTrails(fetchedAllTrails);
			setLoading(false);
		};
		fetchUser().catch((err) => console.log(err));
	}, []);

	const click = () => {
		setSlide("slide-out");
	};

	//Global errorfunction. Pass this as a prop to any object that will throw errors, place error text in function.
	const errorFunction = (x: string) => {
		setError(x);
	};
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<TopBar />} />
				{/* <div className="App">
					<TopBar />
					<div className={`main-container ${slide}`}>
						{error && (
					<ErrorMsg errorText={error} closeFunction={() => errorFunction("")} />
				)}
				{allTrails && !loading && (
					<TrailList trails={allTrails} me={user} myTrails={myTrails} />
				)}

						<Form
					listItems={["Name", "Login"]}
					title={"hello"}
					submitText={["Login"]}
					submitFunction={User.login}
					throwError={errorFunction}
				/>
						<LandingPage />
					</div>
					{!loading && <button onClick={click}></button>}
					{user && <button onClick={User.logout}>Logout</button>}
				</div> */}
			</Routes>
		</BrowserRouter>
	);
}

export default App;
