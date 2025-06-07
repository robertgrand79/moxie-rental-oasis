
import React from 'react';
import { useNode } from '@craftjs/core';

interface ContainerProps {
  background: string;
  padding: number;
  children?: React.ReactNode;
}

export const Container = ({ background, padding, children }: ContainerProps) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        background,
        padding: `${padding}px`,
        minHeight: '50px',
        border: '1px dashed #ccc',
        margin: '5px 0'
      }}
    >
      {children}
    </div>
  );
};

Container.craft = {
  props: {
    background: '#ffffff',
    padding: 20
  },
  related: {
    settings: () => import('./ContainerSettings').then(comp => comp.ContainerSettings)
  }
};
