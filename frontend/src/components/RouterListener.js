import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

const RouterListener = () => {
  const location = useLocation();
  const { setIsPageLoading } = useLoading();

  useEffect(() => {
    // Give a small delay to allow page to render
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 120);
    
    return () => clearTimeout(timer);
  }, [location, setIsPageLoading]);

  return null;
};

export default RouterListener;