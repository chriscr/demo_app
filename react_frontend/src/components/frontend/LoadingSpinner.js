import React from 'react';

const LoadingSpinner = ({ paddingClass, sizeClass }) => {
  const spinnerPaddingClass = paddingClass === 'none' || '' || null ? 'center-everything' : 'center-everything '+paddingClass;
  const spinnerSizeClass = sizeClass === 'none' || '' || null ? 'loading' : 'loading '+sizeClass;
  
  return (
  <div className={spinnerPaddingClass}>
      <span className={spinnerSizeClass}></span>
  </div>
  );
}

export default LoadingSpinner;