
import React from 'react';

interface HeaderProps {
    onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
    return (
        <header className="bg-dark-surface p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
            <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={onLogoClick}
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-purple">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 className="text-2xl font-bold text-white">Prompt Artisan</h1>
                <span className="text-sm text-dark-accent font-mono self-end">匠</span>
            </div>
            {/* User Icon Placeholder */}
            <div className="w-8 h-8 bg-dark-accent rounded-full flex items-center justify-center text-white font-bold">
                U
            </div>
        </header>
    );
};

export default Header;