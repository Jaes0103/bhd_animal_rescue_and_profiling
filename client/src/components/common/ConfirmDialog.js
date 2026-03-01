import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaQuestionCircle } from 'react-icons/fa';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  icon: CustomIcon
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const icons = {
    danger: FaExclamationTriangle,
    success: FaCheckCircle,
    info: FaInfoCircle,
    warning: FaQuestionCircle
  };

  const Icon = CustomIcon || icons[variant] || FaQuestionCircle;

  const variantButtons = {
    danger: 'danger',
    success: 'success',
    info: 'primary',
    warning: 'warning'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEsc={!loading}
      showCloseButton={!loading}
    >
      <div className={`confirm-dialog confirm-dialog-${variant}`}>
        <div className="confirm-icon">
          <Icon />
        </div>

        <h3 className="confirm-title">{title}</h3>

        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variantButtons[variant]}
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
