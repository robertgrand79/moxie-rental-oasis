import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, X, Loader2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { AIInput } from '@/components/ui/ai-input';
import { AITextarea } from '@/components/ui/ai-textarea';
import ReactQuillEditor from '@/components/ReactQuillEditor';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

interface AboutPageSettingsProps {
  localData: {
    aboutTitle: string;
    aboutDescription: string;
    aboutImageUrl: string;
    founderNames: string;
    missionStatement: string;
    missionDescription: string;
    aboutHeroSubtitle: string;
    aboutFeatureCards: string;
    aboutFounderQuote: string;
    aboutTagline: string;
    aboutTags: string;
    aboutMissionCards: string;
    aboutValuesCards: string;
    aboutExcellenceTitle: string;
    aboutExcellenceDescription: string;
    aboutAuthenticityTitle: string;
    aboutAuthenticityDescription: string;
    aboutClosingQuote: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const parseCards = (jsonString: string): FeatureCard[] => {
  try {
    return JSON.parse(jsonString) || [];
  } catch {
    return [];
  }
};

const AboutPageSettings: React.FC<AboutPageSettingsProps> = ({
  localData,
  onInputChange,
  onSave,
  saving,
}) => {
  const [uploading, setUploading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true,
    intro: true,
    mission: false,
    values: false,
    excellence: false,
    closing: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { organization } = useCurrentOrganization();

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !organization?.id) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organization.id}/about-team-photo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
      onInputChange('aboutImageUrl', urlWithCacheBust);
      toast.success('Team photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onInputChange('aboutImageUrl', '');
  };

  const updateCard = (field: string, index: number, key: keyof FeatureCard, value: string) => {
    const cards = parseCards(localData[field as keyof typeof localData] as string);
    if (cards[index]) {
      cards[index][key] = value;
      onInputChange(field, JSON.stringify(cards));
    }
  };

  const renderCardEditor = (field: string, title: string, cardCount: number) => {
    const cards = parseCards(localData[field as keyof typeof localData] as string);
    
    return (
      <div className="space-y-4">
        <Label className="text-base font-medium">{title}</Label>
        <div className="grid gap-4">
          {cards.slice(0, cardCount).map((card, index) => (
            <div key={index} className="p-4 border rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Card {index + 1}</span>
                <span className="text-xs">(Icon: {card.icon})</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${field}-${index}-title`}>Title</Label>
                <Input
                  id={`${field}-${index}-title`}
                  value={card.title}
                  onChange={(e) => updateCard(field, index, 'title', e.target.value)}
                  placeholder="Card title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${field}-${index}-desc`}>Description</Label>
                <Textarea
                  id={`${field}-${index}-desc`}
                  value={card.description}
                  onChange={(e) => updateCard(field, index, 'description', e.target.value)}
                  placeholder="Card description"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Collapsible open={openSections.hero} onOpenChange={() => toggleSection('hero')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Page Header</CardTitle>
                  <CardDescription>Hero section title and subtitle</CardDescription>
                </div>
                {openSections.hero ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <AIInput
                label="Page Title"
                id="aboutTitle"
                value={localData.aboutTitle}
                onChange={(e) => onInputChange('aboutTitle', e.target.value)}
                onValueChange={(value) => onInputChange('aboutTitle', value)}
                placeholder="About Us (leave empty to use 'About [Site Name]')"
                aiPrompt="Generate a compelling page title for an About Us page of a vacation rental company. It should be warm, inviting, and set the tone for the company story."
                aiTooltip="Generate title with AI"
              />
              <AITextarea
                label="Hero Subtitle"
                id="aboutHeroSubtitle"
                value={localData.aboutHeroSubtitle}
                onChange={(e) => onInputChange('aboutHeroSubtitle', e.target.value)}
                onValueChange={(value) => onInputChange('aboutHeroSubtitle', value)}
                placeholder="We're passionate about creating unforgettable vacation experiences..."
                rows={3}
                aiPrompt="Write an engaging hero subtitle for a vacation rental company's About page. It should be 2-3 sentences that capture the company's passion and commitment to guest experiences."
                aiTooltip="Generate subtitle with AI"
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Introduction Section */}
      <Collapsible open={openSections.intro} onOpenChange={() => toggleSection('intro')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>About Us Section</CardTitle>
                  <CardDescription>Team intro, photo, feature cards, and quote</CardDescription>
                </div>
                {openSections.intro ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="aboutDescription">Introduction</Label>
                <ReactQuillEditor
                  content={localData.aboutDescription}
                  onChange={(value) => onInputChange('aboutDescription', value)}
                  placeholder="Tell visitors about your company... Use multiple paragraphs, bold, lists, etc."
                />
                <p className="text-sm text-muted-foreground">
                  Rich text supported: paragraphs, bold, italic, lists, links
                </p>
              </div>

              {/* Team Photo Upload */}
              <div className="space-y-2">
                <Label>Team Photo</Label>
                <div className="flex items-start gap-4">
                  {localData.aboutImageUrl ? (
                    <div className="relative">
                      <img
                        src={localData.aboutImageUrl}
                        alt="Team photo"
                        className="w-48 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="w-48 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Upload photo</span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {localData.aboutImageUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                      Change Photo
                    </Button>
                  )}
                </div>
              </div>

              {/* Feature Cards */}
              {renderCardEditor('aboutFeatureCards', 'Feature Highlight Cards (4 cards)', 4)}

              {/* Founder Quote */}
              <AIInput
                label="Founder/Team Names"
                id="founderNames"
                value={localData.founderNames}
                onChange={(e) => onInputChange('founderNames', e.target.value)}
                onValueChange={(value) => onInputChange('founderNames', value)}
                placeholder="John & Jane Doe"
                enableAI={false}
              />
              <AITextarea
                label="Founder Quote"
                id="aboutFounderQuote"
                value={localData.aboutFounderQuote}
                onChange={(e) => onInputChange('aboutFounderQuote', e.target.value)}
                onValueChange={(value) => onInputChange('aboutFounderQuote', value)}
                placeholder="We believe in creating spaces where families can come together..."
                rows={3}
                aiPrompt="Write an authentic, heartfelt quote from a vacation rental company founder about their passion for hospitality and creating memorable guest experiences. 2-3 sentences."
                aiTooltip="Generate quote with AI"
              />

              {/* Tagline and Tags */}
              <AIInput
                label="Tagline"
                id="aboutTagline"
                value={localData.aboutTagline}
                onChange={(e) => onInputChange('aboutTagline', e.target.value)}
                onValueChange={(value) => onInputChange('aboutTagline', value)}
                placeholder="Your local ambassadors to exceptional vacation experiences"
                aiPrompt="Create a memorable tagline for a vacation rental company's About page. It should convey trust, local expertise, and commitment to quality. Under 10 words."
                aiTooltip="Generate tagline with AI"
              />
              <div className="space-y-2">
                <Label htmlFor="aboutTags">Tags (comma-separated)</Label>
                <Input
                  id="aboutTags"
                  value={localData.aboutTags}
                  onChange={(e) => onInputChange('aboutTags', e.target.value)}
                  placeholder="Local,Trusted,Quality,Family"
                />
                <p className="text-sm text-muted-foreground">These appear as badge pills below the tagline</p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Mission Section */}
      <Collapsible open={openSections.mission} onOpenChange={() => toggleSection('mission')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mission Section</CardTitle>
                  <CardDescription>Mission statement and specialty cards</CardDescription>
                </div>
                {openSections.mission ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <AITextarea
                label="Mission Statement"
                id="missionStatement"
                value={localData.missionStatement}
                onChange={(e) => onInputChange('missionStatement', e.target.value)}
                onValueChange={(value) => onInputChange('missionStatement', value)}
                placeholder="Our mission is to..."
                rows={3}
                aiPrompt="Write a compelling mission statement for a vacation rental company. Focus on guest experience, quality accommodations, and creating memorable stays. 2-3 sentences."
                aiTooltip="Generate mission statement with AI"
              />
              <AITextarea
                label="Additional Details"
                id="missionDescription"
                value={localData.missionDescription}
                onChange={(e) => onInputChange('missionDescription', e.target.value)}
                onValueChange={(value) => onInputChange('missionDescription', value)}
                placeholder="Expand on your mission..."
                rows={4}
                aiPrompt="Expand on a vacation rental company's mission with additional details about their approach, values, and commitment to guests. 3-4 sentences."
                aiTooltip="Generate details with AI"
              />
              {renderCardEditor('aboutMissionCards', 'Specialty Cards (2 cards)', 2)}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Values Section */}
      <Collapsible open={openSections.values} onOpenChange={() => toggleSection('values')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Our Values</CardTitle>
                  <CardDescription>Customize your 4 value cards</CardDescription>
                </div>
                {openSections.values ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {renderCardEditor('aboutValuesCards', 'Value Cards (4 cards)', 4)}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* What Sets Us Apart */}
      <Collapsible open={openSections.excellence} onOpenChange={() => toggleSection('excellence')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>What Sets Us Apart</CardTitle>
                  <CardDescription>Excellence and Authenticity cards</CardDescription>
                </div>
                {openSections.excellence ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                <Label className="text-base font-medium">Excellence Card</Label>
                <AIInput
                  label="Title"
                  id="aboutExcellenceTitle"
                  value={localData.aboutExcellenceTitle}
                  onChange={(e) => onInputChange('aboutExcellenceTitle', e.target.value)}
                  onValueChange={(value) => onInputChange('aboutExcellenceTitle', value)}
                  placeholder="Excellence"
                  enableAI={false}
                />
                <AITextarea
                  label="Description"
                  id="aboutExcellenceDescription"
                  value={localData.aboutExcellenceDescription}
                  onChange={(e) => onInputChange('aboutExcellenceDescription', e.target.value)}
                  onValueChange={(value) => onInputChange('aboutExcellenceDescription', value)}
                  placeholder="We strive for excellence..."
                  rows={3}
                  aiPrompt="Write a compelling description for a vacation rental company's 'Excellence' value card. Explain their commitment to high standards and quality guest experiences. 2-3 sentences."
                  aiTooltip="Generate description with AI"
                />
              </div>

              <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                <Label className="text-base font-medium">Authenticity Card</Label>
                <AIInput
                  label="Title"
                  id="aboutAuthenticityTitle"
                  value={localData.aboutAuthenticityTitle}
                  onChange={(e) => onInputChange('aboutAuthenticityTitle', e.target.value)}
                  onValueChange={(value) => onInputChange('aboutAuthenticityTitle', value)}
                  placeholder="Authenticity"
                  enableAI={false}
                />
                <AITextarea
                  label="Description"
                  id="aboutAuthenticityDescription"
                  value={localData.aboutAuthenticityDescription}
                  onChange={(e) => onInputChange('aboutAuthenticityDescription', e.target.value)}
                  onValueChange={(value) => onInputChange('aboutAuthenticityDescription', value)}
                  placeholder="We believe in showcasing the true essence..."
                  rows={3}
                  aiPrompt="Write a compelling description for a vacation rental company's 'Authenticity' value card. Explain how they provide genuine, local experiences for guests. 2-3 sentences."
                  aiTooltip="Generate description with AI"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Closing Quote */}
      <Collapsible open={openSections.closing} onOpenChange={() => toggleSection('closing')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Closing Quote</CardTitle>
                  <CardDescription>The final quote at the bottom of the page</CardDescription>
                </div>
                {openSections.closing ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <AITextarea
                label="Closing Quote"
                id="aboutClosingQuote"
                value={localData.aboutClosingQuote}
                onChange={(e) => onInputChange('aboutClosingQuote', e.target.value)}
                onValueChange={(value) => onInputChange('aboutClosingQuote', value)}
                placeholder="Immerse yourself in the wonders of the area..."
                rows={3}
                aiPrompt="Write an inspiring closing quote for a vacation rental company's About page. It should invite guests to explore the area and book their stay. 2-3 sentences."
                aiTooltip="Generate closing quote with AI"
              />
              <p className="text-sm text-muted-foreground">
                This quote appears at the bottom of the "What Sets Us Apart" section
              </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save About Page Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AboutPageSettings;
