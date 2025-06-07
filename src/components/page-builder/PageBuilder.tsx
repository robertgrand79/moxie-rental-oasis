
import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import { Text } from './Text';
import { BuilderButton } from './Button';
import { Container } from './Container';

interface PageBuilderProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export const PageBuilder = ({ initialContent, onContentChange }: PageBuilderProps) => {
  return (
    <div className="h-full flex">
      <Editor
        resolver={{
          Text,
          BuilderButton,
          Container
        }}
        onRender={({ render }) => {
          if (onContentChange) {
            onContentChange(render);
          }
        }}
      >
        <Toolbox />
        
        <div className="flex-1 bg-gray-50 p-4 overflow-auto">
          <div className="bg-white min-h-96 rounded-lg shadow-sm">
            <Frame data={initialContent}>
              <Element is={Container} canvas>
                <Text text="Start building your page by dragging components from the left panel" />
              </Element>
            </Frame>
          </div>
        </div>
        
        <SettingsPanel />
      </Editor>
    </div>
  );
};
