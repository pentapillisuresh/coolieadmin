import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;