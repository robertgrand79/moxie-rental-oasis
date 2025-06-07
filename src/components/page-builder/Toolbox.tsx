
import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { Text, Type, Square, MousePointer } from 'lucide-react';
import { Text as TextComponent } from './Text';
import { BuilderButton } from './Button';
import { Container } from './Container';

export const Toolbox = () => {
  const { connectors } = useEditor();

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">Components</h3>
      <div className="space-y-2">
        <Button
          ref={(ref) => connectors.create(ref, <TextComponent text="Add some text" />)}
          variant="outline"
          className="w-full justify-start"
        >
          <Type className="h-4 w-4 mr-2" />
          Text
        </Button>
        
        <Button
          ref={(ref) => connectors.create(ref, <BuilderButton text="Button" />)}
          variant="outline"
          className="w-full justify-start"
        >
          <MousePointer className="h-4 w-4 mr-2" />
          Button
        </Button>
        
        <Button
          ref={(ref) => connectors.create(ref, 
            <Element is={Container} canvas>
              <TextComponent text="Drop components here" />
            </Element>
          )}
          variant="outline"
          className="w-full justify-start"
        >
          <Square className="h-4 w-4 mr-2" />
          Container
        </Button>
      </div>
    </div>
  );
};
