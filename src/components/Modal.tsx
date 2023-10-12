import { ReactNode } from "react";

type ModalProps = {
	children: ReactNode;
	isOpen: boolean;
	onClose: () => void;
};

export function Modal({ children, isOpen, onClose }: ModalProps) {
	if (!isOpen) return null;

	return (
		<div className="modal">
			<div className="overlay" onClick={onClose} />
			<div className="modal-body">{children}</div>
		</div>
	);
}
