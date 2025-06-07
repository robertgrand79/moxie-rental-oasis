
import React from 'react';
import { useEditor } from '@craftjs/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const SettingsPanel = () => {
  const { selected, actions, related } = useEditor((state, query) => {
    const currentlySelectedNodeId = query.getEvent('selected').first();
    const selectedNode = currentlySelectedNodeId && state.nodes[currentlySelectedNodeId];
    
    return {
      selected: selectedNode,
      related: selectedNode && state.nodes[selectedNode.id].related
    };
  });

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            {selected ? 'Configure the selected component' : 'Select a component to edit its properties'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selected && related.settings && React.createElement(related.settings)}
          {!selected && (
            <p className="text-sm text-gray-500">Click on a component in the editor to see its settings here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
