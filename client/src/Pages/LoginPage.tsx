import React from "react";
import Form from "../components/Form";
import { User } from "../api/UserApi";

export default function LoginPage({
	errorFunction,
}: {
	errorFunction: Function;
}) {
	return (
		<>
			<Form
				listItems={["Name", "Login"]}
				title={"Login"}
				submitText={["Login"]}
				submitFunction={User.login}
				throwError={errorFunction}
			/>
		</>
	);
}
