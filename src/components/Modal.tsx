import { ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
	children: ReactNode;
	isOpen: boolean;
	onClose: () => void;
};

export function Modal({ children, isOpen, onClose }: ModalProps) {
	if (!isOpen) return null;

	return createPortal(
		<div className="modal">
			<div className="overlay" onClick={onClose} />
			<div className="modal-body">{children}</div>
		</div>,
		document.querySelector("#modal-container") as HTMLElement
	);
}
