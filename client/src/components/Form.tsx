import { useState } from "react";

interface FormList {
	listItems: Array<string>;
	title: String;
	submitText: readonly string[];
	submitFunction: Function;
	throwError: Function;
}

export default function Form(props: FormList) {
	//--We take the listItems array from props, create input for each,
	//  and store inputs from those in formInfo

	let { listItems, title, submitText } = props;
	const valueObj: { [k: string]: any } = {};

	const [formInfo, setFormInfo] = useState({ ...valueObj });

	const handleFormSubmit = async (event: any) => {
		//--We breakdown the inputs on submit and send them into the submitfunction from props
		event.preventDefault();
		let values = Object.values(formInfo);
		const res = await props.submitFunction(...values);
		if (res?.errors) {
			props.throwError(res.errors[0].message);
		} else {
			window.location.reload();
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
