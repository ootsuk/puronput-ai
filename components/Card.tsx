
import React from 'react';

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-dark-card p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-brand-purple/20 hover:-translate-y-2 border border-transparent hover:border-brand-purple"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="text-brand-purple text-3xl">{icon}</div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default Card;
