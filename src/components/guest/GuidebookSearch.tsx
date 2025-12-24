import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchResult {
  section: string;
  title: string;
  content: string;
  tab: string;
}

interface GuidebookSearchProps {
  content: any;
  onNavigate: (tab: string) => void;
}

const GuidebookSearch = ({ content, onNavigate }: GuidebookSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const searchableContent = useMemo(() => {
    const items: SearchResult[] = [];

    if (content.welcome_message) {
      items.push({ section: 'Welcome', title: 'Welcome Message', content: content.welcome_message, tab: 'welcome' });
    }
    if (content.check_in_instructions) {
      items.push({ section: 'Welcome', title: 'Check-in Instructions', content: content.check_in_instructions, tab: 'welcome' });
    }
    if (content.check_out_instructions) {
      items.push({ section: 'Welcome', title: 'Check-out Instructions', content: content.check_out_instructions, tab: 'welcome' });
    }
    if (content.wifi?.network) {
      items.push({ section: 'Amenities', title: 'WiFi Network', content: `Network: ${content.wifi.network}`, tab: 'amenities' });
    }
    if (content.door_code) {
      items.push({ section: 'Welcome', title: 'Door Code', content: `Door code: ${content.door_code}`, tab: 'welcome' });
    }
    content.house_rules?.forEach((rule: string) => {
      items.push({ section: 'Welcome', title: 'House Rule', content: rule, tab: 'welcome' });
    });
    content.amenities?.forEach((amenity: string) => {
      items.push({ section: 'Amenities', title: 'Amenity', content: amenity, tab: 'amenities' });
    });
    content.appliance_guides?.forEach((guide: any) => {
      items.push({ section: 'Appliances', title: guide.name, content: guide.instructions, tab: 'appliances' });
    });
    content.local_recommendations?.restaurants?.forEach((r: any) => {
      items.push({ section: 'Local Guide', title: r.name, content: `${r.type} - ${r.description}`, tab: 'local' });
    });
    content.local_recommendations?.activities?.forEach((a: any) => {
      items.push({ section: 'Local Guide', title: a.name, content: `${a.type} - ${a.description}`, tab: 'local' });
    });
    content.emergency_contacts?.forEach((c: any) => {
      items.push({ section: 'Contact', title: c.name, content: `${c.role} - ${c.phone}`, tab: 'contact' });
    });

    return items;
  }, [content]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return searchableContent.filter(
      item => 
        item.title.toLowerCase().includes(query) || 
        item.content.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, searchableContent]);

  const handleResultClick = (result: SearchResult) => {
    onNavigate(result.tab);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search guidebook..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && searchResults.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 shadow-lg">
          <CardContent className="p-2">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {result.section}
                  </span>
                  <span className="font-medium text-sm">{result.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {result.content}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {isOpen && searchQuery && searchResults.length === 0 && (
        <Card className="absolute z-50 w-full mt-2 shadow-lg">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            No results found for "{searchQuery}"
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GuidebookSearch;
