import { toast as reactToastify } from 'react-toastify';

// Standardized toast notification helpers with consistent styling
const toast = {
  success: (message, options = {}) => {
    reactToastify.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  error: (message, options = {}) => {
    reactToastify.error(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  warning: (message, options = {}) => {
    reactToastify.warning(message, {
      position: 'top-right',
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  info: (message, options = {}) => {
    reactToastify.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  promise: (promise, messages, options = {}) => {
    return reactToastify.promise(
      promise,
      {
        pending: messages.pending || 'Processing...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong'
      },
      {
        position: 'top-right',
        ...options
      }
    );
  }
};

export default toast;
