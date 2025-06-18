
import React from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import { Text } from './Text';
import { BuilderButton } from './Button';
import { Container } from './Container';
import { Heading } from './Heading';
import { Card } from './Card';
import { Divider } from './Divider';

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

const isValidCraftJSData = (content: string): boolean => {
  if (!content) return false;
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' && parsed.ROOT;
  } catch {
    return false;
  }
};

export const PageBuilder = ({ initialContent, onContentChange }: PageBuilderProps) => {
  // Check if initialContent is valid CraftJS data
  const craftJSData = initialContent && isValidCraftJSData(initialContent) ? initialContent : undefined;
  
  return (
    <div className="h-full flex">
      <Editor
        resolver={{
          Text,
          BuilderButton,
          Container,
          Heading,
          Card,
          Divider
        }}
      >
        <ContentUpdater onContentChange={onContentChange} />
        <Toolbox />
        
        <div className="flex-1 bg-gray-50 p-4 overflow-auto">
          <div className="bg-white min-h-96 rounded-lg shadow-sm p-4">
            <Frame data={craftJSData}>
              {craftJSData ? (
                <Element is={Container} canvas background="#ffffff" padding={20} />
              ) : (
                <Element is={Container} canvas background="#ffffff" padding={20}>
                  <Element is={Heading} text="Welcome to Your Page" level={1} color="#000000" textAlign="center" />
                  <Element is={Text} text="Start building your page by dragging components from the left panel. You can edit text by clicking on it, and customize components using the settings panel on the right." fontSize={16} textAlign="left" color="#666666" />
                  <Element is={Divider} color="#e2e8f0" thickness={1} margin={20} />
                  <Element is={Card} title="Sample Card" content="This is a sample card component. You can customize its appearance and content." backgroundColor="#f8fafc" padding={20} />
                </Element>
              )}
            </Frame>
          </div>
        </div>
        
        <SettingsPanel />
      </Editor>
    </div>
  );
};
