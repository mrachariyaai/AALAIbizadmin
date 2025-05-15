
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <rect width="40" height="40" rx="8" fill="#1EAEDB" />
        <path 
          d="M13 12H27C28.1 12 29 12.9 29 14V26C29 27.1 28.1 28 27 28H13C11.9 28 11 27.1 11 26V14C11 12.9 11.9 12 13 12Z" 
          stroke="white" 
          strokeWidth="2" 
          fill="transparent"
        />
        <path 
          d="M20 16V24M16 20H24" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
      <span className="font-bold text-xl text-aalai-darkGray">AAL<span className="text-aalai-blue">AI</span></span>
    </div>
  );
};
