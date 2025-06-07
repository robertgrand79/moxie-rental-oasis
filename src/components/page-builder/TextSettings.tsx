
import React from 'react';
import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const TextSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Text</Label>
        <Input
          id="text"
          value={props.text}
          onChange={(e) => setProp((props) => props.text = e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="fontSize">Font Size</Label>
        <Input
          id="fontSize"
          type="number"
          value={props.fontSize}
          onChange={(e) => setProp((props) => props.fontSize = parseInt(e.target.value))}
        />
      </div>
      
      <div>
        <Label htmlFor="textAlign">Text Align</Label>
        <Select value={props.textAlign} onValueChange={(value) => setProp((props) => props.textAlign = value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          type="color"
          value={props.color}
          onChange={(e) => setProp((props) => props.color = e.target.value)}
        />
      </div>
    </div>
  );
};
