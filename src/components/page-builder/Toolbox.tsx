
import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { Type, Square, Button as ButtonIcon, Minus, Heading1 } from 'lucide-react';

export const Toolbox = () => {
  const { connectors } = useEditor();

  return (
    <div className="w-64 bg-gray-100 p-4 border-r">
      <h3 className="text-lg font-semibold mb-4">Components</h3>
      <div className="space-y-2">
        <Button
          ref={(ref) => connectors.create(ref, <Element is="div" canvas />)}
          variant="outline"
          className="w-full justify-start"
        >
          <Square className="h-4 w-4 mr-2" />
          Container
        </Button>
        
        <Button
          ref={(ref) => connectors.create(ref, 
            <Element 
              is="h2" 
              text="Your Heading" 
              level={2}
              color="#000000"
              textAlign="left"
            />
          )}
          variant="outline"
          className="w-full justify-start"
        >
          <Heading1 className="h-4 w-4 mr-2" />
          Heading
        </Button>
        
        <Button
          ref={(ref) => connectors.create(ref, 
            <Element 
              is="p" 
              text="Your text content goes here. Click to edit this text." 
              fontSize={16}
              textAlign="left"
              color="#000000"
            />
          )}
          variant="outline"
          className="w-full justify-start"
        >
          <Type className="h-4 w-4 mr-2" />
          Text
        </Button>
        
        <Button
          ref={(ref) => connectors.create(ref, 
            <Element 
              is="button" 
              text="Click me"
              backgroundColor="#3b82f6"
              color="#ffffff"
              padding={12}
            />
          )}
          variant="outline"
          className="w-full justify-start"
        >
          <ButtonIcon className="h-4 w-4 mr-2" />
          Button
        </Button>
        
        <Button
          ref={(ref) => connectors.create(ref, 
            <Element 
              is="div" 
              title="Card Title"
              content="Card content goes here..."
              backgroundColor="#ffffff"
              padding={20}
            />
          )}
          variant="outline"
          className="w-full justify-start"
        >
          <Square className="h-4 w-4 mr-2" />
          Card
        </Button>
        
        <Button
          ref={(ref) => connectors.create(ref, 
            <Element 
              is="hr" 
              color="#e2e8f0"
              thickness={1}
              margin={20}
            />
          )}
          variant="outline"
          className="w-full justify-start"
        >
          <Minus className="h-4 w-4 mr-2" />
          Divider
        </Button>
      </div>
    </div>
  );
};
