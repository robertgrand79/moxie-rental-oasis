
import React from 'react';
import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

export const CardSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={props.title}
          onChange={(e) => setProp((props: any) => props.title = e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={props.content}
          onChange={(e) => setProp((props: any) => props.content = e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="backgroundColor">Background Color</Label>
        <Input
          id="backgroundColor"
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
        />
      </div>

      <div>
        <Label>Padding: {props.padding}px</Label>
        <Slider
          value={[props.padding]}
          onValueChange={(value) => setProp((props: any) => props.padding = value[0])}
          max={50}
          min={0}
          step={5}
        />
      </div>
    </div>
  );
};
