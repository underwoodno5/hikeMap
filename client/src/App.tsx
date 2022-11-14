import React from "react";

import Form from "./components/Form";
import TopBar from "./components/TopBar";
// import Map from "./components/Map";
import { User } from "./api/UserApi";
import "./App.scss";
import "./variables.scss";

function login(x: Array<any>) {
	User.login(...x);
}

function App() {
	return (
		<div className="App">
			<TopBar />
			<Form
				listItems={["Name", "Password"]}
				title={"Login"}
				submitText={["submit"]}
				submitFunction={login}
			/>
		</div>
	);
}

export default App;
