import React, { useState } from "react";
import Modal from "./Modal";
import Form from "./Form";
import { Trails } from "../api/TrailsApi";

import "./CustomMapCreation.scss";

interface CustomMapCreationgProps {
	clearMap: Function;
	throwError: Function;
	swapSideBar: Function;
}

export default function CustomMapCreation(props: CustomMapCreationgProps) {
	const { swapSideBar, throwError } = props;
	const [showModal, setShowModal] = useState(false);

	const savePath = async (name: string) => {
		const mapPath = localStorage.getItem("customMapPath");
		const res = await Trails.addCustomUserTrail(mapPath, name);
		console.log(res);
		return res;
		// modalStateSwap();
	};
	const modalStateSwap = () => {
		// setShowModal(!showModal);
		// console.log(showModal);
		console.log(localStorage.getItem("customMapPath"));
	};

	const sideBarClick = () => {
		swapSideBar();
	};

	return (
		<>
			<Modal showModal={showModal} closeFunction={modalStateSwap}>
				<Form
					listItems={["Trail Name"]}
					title={"Save Trail"}
					submitText={["Save"]}
					submitFunction={savePath}
					throwError={props.throwError}
				/>
			</Modal>
			<div className="custom-map-wrap">
				<button onClick={() => sideBarClick()} className="back">
					<i className="las la-angle-left back"></i>
				</button>
				<h3>Custom Map Creation</h3>
				<button onClick={modalStateSwap}>Click here to save custom map</button>
			</div>
		</>
	);
}
