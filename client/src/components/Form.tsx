import { useState } from "react";

interface FormList {
	listItems: Array<string>;
	title: String;
	submitText: readonly string[];
	submitFunction: Function;
}

export default function Form(props: FormList) {
	let { listItems, title, submitText } = props;
	const valueObj: { [k: string]: any } = {};

	listItems.forEach((item, i) => {
		valueObj[item] = "";
	});

	const [formInfo, setFormInfo] = useState({ ...valueObj });

	const handleSubmit = (event: any) => {
		event.preventDefault();
		let values = Object.values(formInfo);
		props.submitFunction(values);
	};

	const handleChange = (event: any) => {
		setFormInfo({ ...formInfo, [event.target.name]: event.target.value });
	};

	return (
		<form onSubmit={handleSubmit}>
			<h1>{title}</h1>
			{listItems.map((item, i) => {
				return (
					<input
						key={i}
						type="text"
						name={item}
						placeholder={item}
						value={formInfo.item}
						onChange={handleChange}
					/>
				);
			})}
			<input type="submit" value={submitText} />
		</form>
	);
}
