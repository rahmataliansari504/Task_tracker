/* eslint-disable react/prop-types */
import React, { useId } from "react";

const Input = React.forwardRef(function Input(
  { label, type = "text", className = "", ...props },
  ref
) {
  const id = useId();
  return (
    <div className="w-full mb-4">
      {label && (
        <label 
          className="block text-sm font-medium text-gray-700 mb-1.5" 
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <input
        type={type}
        className={`w-full px-4 py-2.5 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg 
        focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
        transition-all duration-200 ease-in-out outline-none placeholder-gray-400 ${className}`}
        ref={ref}
        {...props}
        id={id}
      />
    </div>
  );
});

export default Input;