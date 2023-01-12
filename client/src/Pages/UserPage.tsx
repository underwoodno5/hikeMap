import React from "react";
import "./UserPage.scss";
import { User } from "../api/UserApi";

export default function UserPage(props: {
	me: { _id: number; name: string; admin: boolean };
}) {
	const { me } = props;

	return (
		<div className={"user-page-container"}>
			<div className={"user-block"}>
				<h3>{me.name}</h3>
				<button onClick={() => User.logout()}>logout</button>
			</div>
			<div className={"user-block"}></div>
			<div className={"user-block"}></div>
		</div>
	);
}
