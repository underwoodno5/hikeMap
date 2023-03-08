import React, { useEffect } from "react";
import "./AccountPage.scss";
import { User } from "../api/UserApi";
import { Me } from "../types/interface";
import { useNavigate } from "react-router-dom";

export default function UserPage(props: { me: Me | null }) {
	const { me } = props;
	const navigate = useNavigate();

	useEffect(() => {
		if (!me) {
			navigate("/login");
		}
	}, [me]);

	return (
		<div className={"user-page-container"}>
			<div className={"user-block"}>
				<div className={"user-row"}></div>
				<h3>{me?.name}</h3>
				<button onClick={() => User.logout()}>logout</button>
			</div>
		</div>
	);
}
