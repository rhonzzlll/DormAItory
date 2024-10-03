import React from 'react';

const Form = ({ children, onSubmit, className = '', ...props }) => {
    return (
        <form
            onSubmit={onSubmit}
            className={`p-4 bg-white shadow-md rounded ${className}`}
            {...props}
        >
            {children}
        </form>
    );
};

export default Form;
