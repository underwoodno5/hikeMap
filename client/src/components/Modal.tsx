import React from "react";
import "./Modal.scss";

interface ModalProps {
	children: React.ReactNode;
	showModal: boolean;
	closeFunction: Function;
}

export default function (props: ModalProps) {
	return (
		<>
			{props.showModal && (
				<div className="modal-container">
					<div className="modal slide-up-fade-in">
						<button className="close" onClick={() => props.closeFunction()}>
							<i className="las la-times-circle"></i>
						</button>
						{props.children}
					</div>
				</div>
			)}
		</>
	);
}
