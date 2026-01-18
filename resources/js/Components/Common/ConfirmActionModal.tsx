import React from "react";
import { Modal } from "react-bootstrap";

interface ConfirmActionModalProps {
  show?: boolean;
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  confirmText?: string;
  confirmButtonClass?: string;
  onConfirm?: () => void;
  onClose?: () => void;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  show,
  title,
  message,
  icon = "ri-alert-line",
  iconColor = "text-warning",
  confirmText = "Confirm",
  confirmButtonClass = "btn btn-warning",
  onConfirm,
  onClose,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered={true}>
      <Modal.Body className="py-3 px-5">
        <div className="mt-2 text-center">
          <i className={`${icon} display-5 ${iconColor}`}></i>

          <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
            <h4>{title}</h4>
            <p className="text-muted mx-4 mb-0">
              {message}
            </p>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          <button
            type="button"
            className="btn w-sm btn-light material-shadow-none"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className={`btn w-sm ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  ) as unknown as JSX.Element;
};

export default ConfirmActionModal;
