
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQSection {
  id: string;
  title: string;
  icon?: string;
  items: FAQItem[];
}

interface FAQEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const FAQEditor = ({ content, onChange }: FAQEditorProps) => {
  const [sections, setSections] = useState<FAQSection[]>(() => {
    // Parse existing FAQ content or start with default structure
    return [
      {
        id: 'general',
        title: '🏡 General',
        items: [
          { id: '1', question: 'Where are the properties located?', answer: 'Our properties are conveniently located near local attractions and amenities.' }
        ]
      }
    ];
  });

  const addSection = () => {
    const newSection: FAQSection = {
      id: Date.now().toString(),
      title: 'New Section',
      items: []
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (sectionId: string, updates: Partial<FAQSection>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const addFAQItem = (sectionId: string) => {
    const newItem: FAQItem = {
      id: Date.now().toString(),
      question: 'New Question',
      answer: 'Answer goes here...'
    };
    
    setSections(sections.map(section =>
      section.id === sectionId 
        ? { ...section, items: [...section.items, newItem] }
        : section
    ));
  };

  const updateFAQItem = (sectionId: string, itemId: string, updates: Partial<FAQItem>) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            )
          }
        : section
    ));
  };

  const deleteFAQItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, items: section.items.filter(item => item.id !== itemId) }
        : section
    ));
  };

  const generateHTML = () => {
    const html = `
      <div class="space-y-8">
        ${sections.map(section => `
          <div>
            <h2 class="text-2xl font-semibold mb-4 text-foreground">${section.title}</h2>
            <div class="space-y-4">
              ${section.items.map(item => `
                <div class="border rounded-lg p-4">
                  <h3 class="font-semibold mb-2">${item.question}</h3>
                  <p>${item.answer}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    onChange(html);
  };

  React.useEffect(() => {
    generateHTML();
  }, [sections]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">FAQ Structure Editor</h3>
        <Button onClick={addSection} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <Input
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSection(section.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item) => (
              <div key={item.id} className="border rounded p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Question"
                    value={item.question}
                    onChange={(e) => updateFAQItem(section.id, item.id, { question: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFAQItem(section.id, item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Answer"
                  value={item.answer}
                  onChange={(e) => updateFAQItem(section.id, item.id, { answer: e.target.value })}
                  rows={3}
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFAQItem(section.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FAQEditor;
