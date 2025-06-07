
import React from 'react';
import { useNode } from '@craftjs/core';

interface TextProps {
  text: string;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right';
  color: string;
}

export const Text = ({ text, fontSize, textAlign, color }: TextProps) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        fontSize: `${fontSize}px`,
        textAlign,
        color,
        margin: '5px 0',
        cursor: 'pointer'
      }}
    >
      {text}
    </div>
  );
};

Text.craft = {
  props: {
    text: 'Hello World',
    fontSize: 16,
    textAlign: 'left',
    color: '#000000'
  },
  related: {
    settings: () => import('./TextSettings').then(comp => comp.TextSettings)
  }
};
