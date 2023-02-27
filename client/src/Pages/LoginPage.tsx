import React, { useState } from "react";
import Form from "../components/Form";
import { User } from "../api/UserApi";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Me } from "../types/interface";

interface LoginPage {
	errorFunction: Function;
	user: Me | null;
}

export default function LoginPage(props: LoginPage) {
	const navigate = useNavigate();
	const [loginCheck, setLoginCheck] = useState(true);

	useEffect(() => {
		if (props.user) {
			navigate("/account");
		}
		if (loginCheck) {
			setLoginCheck(false);
		}
	}, [props.user, loginCheck]);

	return (
		<>
			{loginCheck ? null : (
				<Form
					listItems={["Name", "Login"]}
					title={"Login"}
					submitText={["Login"]}
					submitFunction={User.login}
					throwError={props.errorFunction}
				/>
			)}
		</>
	);
}
