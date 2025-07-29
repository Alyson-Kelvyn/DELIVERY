import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);

      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Tempo da animação de saída
  };

  if (!isVisible && !isAnimating) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800 shadow-green-100";
      case "error":
        return "bg-red-50 border-red-200 text-red-800 shadow-red-100";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 shadow-yellow-100";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800 shadow-gray-100";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm transition-all duration-300 ${
          isVisible && isAnimating
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        } ${getStyles()}`}
      >
        {getIcon()}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
