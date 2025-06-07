
import React from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import { Text } from './Text';
import { BuilderButton } from './Button';
import { Container } from './Container';

interface PageBuilderProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

const ContentUpdater = ({ onContentChange }: { onContentChange?: (content: string) => void }) => {
  const { query } = useEditor();
  
  React.useEffect(() => {
    if (onContentChange) {
      const serializedState = query.serialize();
      onContentChange(serializedState);
    }
  });

  return null;
};

export const PageBuilder = ({ initialContent, onContentChange }: PageBuilderProps) => {
  return (
    <div className="h-full flex">
      <Editor
        resolver={{
          Text,
          BuilderButton,
          Container
        }}
      >
        <ContentUpdater onContentChange={onContentChange} />
        <Toolbox />
        
        <div className="flex-1 bg-gray-50 p-4 overflow-auto">
          <div className="bg-white min-h-96 rounded-lg shadow-sm">
            <Frame data={initialContent}>
              <Element is={Container} canvas background="#ffffff" padding={20}>
                <Text text="Start building your page by dragging components from the left panel" fontSize={16} textAlign="left" color="#000000" />
              </Element>
            </Frame>
          </div>
        </div>
        
        <SettingsPanel />
      </Editor>
    </div>
  );
};
