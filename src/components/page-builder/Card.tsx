
import React from 'react';
import { useNode } from '@craftjs/core';

interface CardProps {
  title: string;
  content: string;
  backgroundColor: string;
  padding: number;
  children?: React.ReactNode;
}

export const Card = ({ title, content, backgroundColor, padding, children }: CardProps) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        backgroundColor,
        padding: `${padding}px`,
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        margin: '10px 0',
        cursor: 'pointer'
      }}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
      )}
      {content && (
        <p className="text-gray-600">{content}</p>
      )}
      {children}
    </div>
  );
};

Card.craft = {
  props: {
    title: 'Card Title',
    content: 'Card content goes here...',
    backgroundColor: '#ffffff',
    padding: 20
  },
  related: {
    settings: () => import('./CardSettings').then(comp => comp.CardSettings)
  }
};
