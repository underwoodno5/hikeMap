import { useState } from "react";
import ErrorMsg from "./ErrorMsg";

interface FormList {
	listItems: Array<string>;
	title: String;
	submitText: readonly string[];
	submitFunction: Function;
	throwError: Function;
}

export default function Form(props: FormList) {
	//We take the listItems array from props, create input for each,
	//and store inputs from those in formInfo

	let { listItems, title, submitText } = props;
	const valueObj: { [k: string]: any } = {};

	const [formInfo, setFormInfo] = useState({ ...valueObj });

	const handleFormSubmit = async (event: any) => {
		//we breakdown the inputs on submit and send them into the submitfunction from props
		event.preventDefault();
		let values = Object.values(formInfo);
		const res = await props.submitFunction(...values);
		console.log(res);
		if (res.errors) {
			console.log("error throw");
			props.throwError(res.errors[0].message);
		}
	};

	const handleInputChange = (event: any) => {
		setFormInfo({ ...formInfo, [event.target.name]: event.target.value });
	};

	return (
		<form onSubmit={handleFormSubmit}>
			<h1>{title}</h1>
			{listItems.map((item, i) => {
				return (
					<input
						key={i}
						type="text"
						name={item}
						placeholder={item}
						value={formInfo.item}
						onChange={handleInputChange}
					/>
				);
			})}
			<input type="submit" value={submitText} />
		</form>
	);
}
