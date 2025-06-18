
import React from 'react';
import { useNode } from '@craftjs/core';

interface DividerProps {
  color: string;
  thickness: number;
  margin: number;
}

export const Divider = ({ color, thickness, margin }: DividerProps) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <hr
      ref={(ref) => connect(drag(ref))}
      style={{
        borderColor: color,
        borderWidth: `${thickness}px 0 0 0`,
        margin: `${margin}px 0`,
        cursor: 'pointer'
      }}
    />
  );
};

Divider.craft = {
  props: {
    color: '#e2e8f0',
    thickness: 1,
    margin: 20
  },
  related: {
    settings: () => import('./DividerSettings').then(comp => comp.DividerSettings)
  }
};
