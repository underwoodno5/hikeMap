import React, { useState } from "react";
import Modal from "./Modal";
import Form from "./Form";
import { Trails } from "../api/TrailsApi";
import { Trail } from "../types/interface";

import "./CustomMapCreation.scss";

interface CustomMapCreationgProps {
	clearMap: Function;
	throwError: Function;
	swapSideBar: Function;
	mobileHide: Function;
	trailObject: Trail;
}

export default function CustomMapCreation(props: CustomMapCreationgProps) {
	const { swapSideBar, throwError, mobileHide, trailObject } = props;
	const [showModal, setShowModal] = useState(false);

	//-- When we save the path we take all the data from localstorage, we have to stringify the arrays otherwise we lose the *[]* and graphql
	//won't be able to parse the request.

	const savePath = async (name?: string) => {
		let storedPoints = localStorage.getItem("customMapPath");
		let parsedPoints = JSON.parse(storedPoints || "{}");

		const res = await Trails.addCustomUserTrail(
			JSON.stringify(parsedPoints.pinArray),
			name,
			JSON.stringify(parsedPoints.waterArray),
			JSON.stringify(parsedPoints.tentArray),
			parsedPoints.distance,
			parsedPoints.trailID
		);
		// modalStateSwap();
		return res;
	};
	const modalStateSwap = () => {
		setShowModal(!showModal);
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
				<h4>Editing {trailObject.name}</h4>

				<button onClick={modalStateSwap}>Click here to save custom map</button>
				<button onClick={() => savePath()}>Update Map</button>
				<button onClick={() => mobileHide()} className="mobile">
					Edit Map
				</button>
			</div>
		</>
	);
}
