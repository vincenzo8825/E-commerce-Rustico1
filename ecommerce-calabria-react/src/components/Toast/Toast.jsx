import React, { useState, useEffect } from 'react';
import './Toast.scss';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  return (
    <div className={`toast toast--${type} ${isClosing ? 'toast--closing' : ''}`}>
      <div className="toast__content">
        <div className="toast__icon">
          {getIcon()}
        </div>
        <div className="toast__message">
          {message}
        </div>
        <button className="toast__close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};

// Context per gestire i toast
import { createContext, useContext, useReducer } from 'react';

const ToastContext = createContext();

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, { ...action.payload, id: Date.now() }];
    case 'REMOVE_TOAST':
      return state.filter(toast => toast.id !== action.payload);
    default:
      return state;
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (message, type = 'success', duration = 3000) => {
    dispatch({
      type: 'ADD_TOAST',
      payload: { message, type, duration }
    });
  };

  const removeToast = (id) => {
    dispatch({
      type: 'REMOVE_TOAST',
      payload: id
    });
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve essere usato all\'interno di un ToastProvider');
  }
  return context;
};

export default Toast; 