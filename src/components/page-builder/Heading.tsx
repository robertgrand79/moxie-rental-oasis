
import React from 'react';
import { useNode } from '@craftjs/core';

interface HeadingProps {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export const Heading = ({ text, level, color, textAlign }: HeadingProps) => {
  const { connectors: { connect, drag } } = useNode();
  
  const sizeClasses = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-medium',
    6: 'text-base font-medium'
  };

  const commonProps = {
    ref: (ref: HTMLElement | null) => connect(drag(ref)),
    style: {
      color,
      textAlign,
      margin: '10px 0',
      cursor: 'pointer'
    },
    className: sizeClasses[level]
  };
  
  // Render the appropriate heading level
  switch (level) {
    case 1:
      return <h1 {...commonProps}>{text}</h1>;
    case 2:
      return <h2 {...commonProps}>{text}</h2>;
    case 3:
      return <h3 {...commonProps}>{text}</h3>;
    case 4:
      return <h4 {...commonProps}>{text}</h4>;
    case 5:
      return <h5 {...commonProps}>{text}</h5>;
    case 6:
      return <h6 {...commonProps}>{text}</h6>;
    default:
      return <h2 {...commonProps}>{text}</h2>;
  }
};

Heading.craft = {
  props: {
    text: 'Heading Text',
    level: 2,
    color: '#000000',
    textAlign: 'left'
  },
  related: {
    settings: () => import('./HeadingSettings').then(comp => comp.HeadingSettings)
  }
};
