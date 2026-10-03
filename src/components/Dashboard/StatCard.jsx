import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, onClick }) => {
  return (
    <div 
      className="dashboard-card cursor-pointer hover:scale-[1.02] transition-transform duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="dashboard-label">{title}</p>
          <p className="dashboard-stat">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color.replace('bg', 'bg-opacity-10')}`}>
          <Icon className={`${color.replace('bg', 'text')} text-xl`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;