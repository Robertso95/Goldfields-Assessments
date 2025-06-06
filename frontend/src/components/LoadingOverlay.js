import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useLoading } from '../context/LoadingContext';

const LoadingOverlay = () => {
  const { isPageLoading } = useLoading();

  if (!isPageLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(3px)',
      transition: 'opacity 0.3s'
    }}>
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: 48, color: '#326c6f' }} spin />}
        tip={<div style={{ marginTop: 12, color: '#326c6f', fontSize: '16px', fontWeight: 500 }}>Loading...</div>}
      />
    </div>
  );
};

export default LoadingOverlay;