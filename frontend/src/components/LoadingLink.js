import React from 'react';
import { Link } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

const LoadingLink = ({ to, children, className, onClick }) => {
  const { setIsPageLoading } = useLoading();
  
  const handleClick = (e) => {
    setIsPageLoading(true);
    if (onClick) onClick(e);
  };
  
  return (
    <Link to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default LoadingLink;