import React from "react";
import "./ErrorMsg.scss";
import "../_mixins.scss";

interface ErrorMsg {
	errorText: String;
	closeFunction?: Function;
}

export default function ErrorMsg(props: ErrorMsg) {
	const handleClick = () => {
		if (props.closeFunction) {
			props.closeFunction();
		}
	};
	return (
		<div className="error-box slide-up">
			<h3>{props.errorText}</h3>
			{props.closeFunction && (
				<button className="light close" onClick={handleClick}>
					X
				</button>
			)}
		</div>
	);
}
