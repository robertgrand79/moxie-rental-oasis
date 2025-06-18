
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
  
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const styles = {
    color,
    textAlign,
    margin: '10px 0',
    cursor: 'pointer'
  };

  const sizeClasses = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-medium',
    6: 'text-base font-medium'
  };
  
  return (
    <HeadingTag
      ref={(ref) => connect(drag(ref))}
      style={styles}
      className={sizeClasses[level]}
    >
      {text}
    </HeadingTag>
  );
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
