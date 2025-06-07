
import React from 'react';
import { useNode } from '@craftjs/core';
import { Button as UIButton } from '@/components/ui/button';

interface BuilderButtonProps {
  text: string;
  backgroundColor: string;
  textColor: string;
  href: string;
}

export const BuilderButton = ({ text, backgroundColor, textColor, href }: BuilderButtonProps) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <UIButton
      ref={(ref) => connect(drag(ref))}
      style={{
        backgroundColor,
        color: textColor,
        margin: '5px 0'
      }}
      onClick={() => href && window.open(href, '_blank')}
    >
      {text}
    </UIButton>
  );
};

BuilderButton.craft = {
  props: {
    text: 'Click me',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    href: ''
  },
  related: {
    settings: () => import('./ButtonSettings').then(comp => comp.ButtonSettings)
  }
};
