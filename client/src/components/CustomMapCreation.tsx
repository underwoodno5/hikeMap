import React, { useState } from "react";
import Modal from "./Modal";
import Form from "./Form";
import { Trails } from "../api/TrailsApi";
import { Trail, Me } from "../types/interface";

import "./CustomMapCreation.scss";
import { userInfo } from "os";

interface CustomMapCreationgProps {
	clearMap: Function;
	throwError: Function;
	swapSideBar: Function;
	mobileHide: Function;
	trailObject: Trail;
	user: Me | null;
}

export default function CustomMapCreation(props: CustomMapCreationgProps) {
	const { swapSideBar, throwError, mobileHide, trailObject, user } = props;
	const [showModal, setShowModal] = useState(false);
	const [showAdminModal, setShowAdminModal] = useState(false);
	console.log(trailObject);

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
	const adminSavePath = async (username: string, password: string) => {
		let storedPoints = localStorage.getItem("customMapPath");
		let parsedPoints = JSON.parse(storedPoints || "{}");
		const res = await Trails.updateTrail(
			JSON.stringify(parsedPoints.pinArray),
			trailObject.name,
			JSON.stringify(parsedPoints.waterArray),
			JSON.stringify(parsedPoints.tentArray),
			parsedPoints.distance,
			parsedPoints.trailID,
			username,
			password
		);
		// modalStateSwap();
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
			{user?.admin && (
				<Modal
					showModal={showAdminModal}
					closeFunction={() => setShowAdminModal(!showAdminModal)}
				>
					<Form
						listItems={["Username", "Password"]}
						title={"Update Site Trail"}
						submitText={["Update"]}
						submitFunction={adminSavePath}
						throwError={props.throwError}
					/>
				</Modal>
			)}
			<div className="custom-map-wrap">
				<button onClick={() => sideBarClick()} className="back">
					<i className="las la-angle-left back"></i>
				</button>
				<div className="list-tab">
					<h5 className={"header"}>Editing {trailObject.name}</h5>
				</div>
				<button onClick={modalStateSwap}>Save as custom map</button>
				{trailObject.createdby && (
					<button onClick={() => savePath()}>Update Map</button>
				)}
				{user?.admin && (
					<button onClick={() => setShowAdminModal(!showAdminModal)}>
						Update Site Map (admin only)
					</button>
				)}
				<button onClick={() => mobileHide()} className="mobile">
					Edit Map
				</button>
			</div>
		</>
	);
}
