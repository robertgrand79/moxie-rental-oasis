import React, { useState } from 'react';
import { 
  Wifi, Key, Clock, Car, Shield, Phone, 
  ChevronRight, Home, AlertTriangle, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { tvStyles } from '@/components/tv/TVLayout';
import TVFocusableButton from '@/components/tv/TVFocusableButton';
import { useGuidebook, GuidebookContent } from '@/hooks/useGuidebookManagement';
import { Loader2 } from 'lucide-react';

interface TVPropertyInfoProps {
  propertyId?: string;
}

type InfoSection = 'overview' | 'wifi' | 'rules' | 'amenities' | 'emergency' | 'appliances';

/**
 * TVPropertyInfo - Display property information from guidebook
 * 
 * Features:
 * - WiFi credentials with large readable text
 * - Door code display
 * - Check-in/out times and instructions
 * - House rules
 * - Amenities grid
 * - Emergency contacts
 */
const TVPropertyInfo: React.FC<TVPropertyInfoProps> = ({ propertyId }) => {
  const { data: guidebook, isLoading } = useGuidebook(propertyId);
  const [activeSection, setActiveSection] = useState<InfoSection>('overview');
  
  const content: GuidebookContent = guidebook?.content || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className={cn(tvStyles.iconLarge, "animate-spin text-primary")} />
      </div>
    );
  }

  if (!guidebook) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <BookOpen className={cn(tvStyles.iconLarge, "mb-4")} />
        <p className={tvStyles.heading3}>No guidebook available</p>
        <p className={tvStyles.body}>Property information will appear here when configured.</p>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'wifi', label: 'WiFi & Access', icon: Wifi },
    { id: 'rules', label: 'House Rules', icon: Shield },
    { id: 'amenities', label: 'Amenities', icon: ChevronRight },
    { id: 'emergency', label: 'Emergency', icon: Phone },
    { id: 'appliances', label: 'Appliances', icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <h2 className={tvStyles.heading2}>House Information</h2>
      
      {/* Section Tabs */}
      <div className="flex gap-4 flex-wrap">
        {sections.map(({ id, label, icon: Icon }) => (
          <TVFocusableButton
            key={id}
            variant={activeSection === id ? "default" : "outline"}
            onClick={() => setActiveSection(id as InfoSection)}
            className="gap-3"
          >
            <Icon className="h-6 w-6" />
            {label}
          </TVFocusableButton>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-card border border-border rounded-2xl p-8 min-h-[400px]">
        {activeSection === 'overview' && (
          <OverviewSection content={content} />
        )}
        {activeSection === 'wifi' && (
          <WifiSection content={content} />
        )}
        {activeSection === 'rules' && (
          <RulesSection content={content} />
        )}
        {activeSection === 'amenities' && (
          <AmenitiesSection content={content} />
        )}
        {activeSection === 'emergency' && (
          <EmergencySection content={content} />
        )}
        {activeSection === 'appliances' && (
          <AppliancesSection content={content} />
        )}
      </div>
    </div>
  );
};

// Overview Section
const OverviewSection: React.FC<{ content: GuidebookContent }> = ({ content }) => (
  <div className="space-y-8">
    {content.welcome_message && (
      <div>
        <h3 className={cn(tvStyles.heading3, "mb-4")}>Welcome</h3>
        <p className={tvStyles.body}>{content.welcome_message}</p>
      </div>
    )}
    
    <div className="grid grid-cols-2 gap-6">
      <InfoCard
        icon={Clock}
        title="Check-in"
        value={content.check_in_time || '3:00 PM'}
        description={content.check_in_instructions}
      />
      <InfoCard
        icon={Clock}
        title="Check-out"
        value={content.check_out_time || '11:00 AM'}
        description={content.check_out_instructions}
      />
      <InfoCard
        icon={Key}
        title="Door Code"
        value={content.door_code || 'See instructions'}
      />
      <InfoCard
        icon={Car}
        title="Parking"
        value={content.parking_instructions || 'Free parking available'}
      />
    </div>
  </div>
);

// WiFi Section
const WifiSection: React.FC<{ content: GuidebookContent }> = ({ content }) => (
  <div className="space-y-8">
    <h3 className={cn(tvStyles.heading3, "mb-4")}>WiFi & Access</h3>
    
    {content.wifi ? (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-muted rounded-xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <Wifi className={tvStyles.iconMedium + " text-primary"} />
            <span className={tvStyles.bodySmall}>Network Name</span>
          </div>
          <p className={cn(tvStyles.heading2, "font-mono")}>{content.wifi.network}</p>
        </div>
        
        <div className="bg-muted rounded-xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <Key className={tvStyles.iconMedium + " text-primary"} />
            <span className={tvStyles.bodySmall}>Password</span>
          </div>
          <p className={cn(tvStyles.heading2, "font-mono")}>{content.wifi.password}</p>
        </div>
      </div>
    ) : (
      <p className={tvStyles.body}>WiFi information not available.</p>
    )}
    
    {content.door_code && (
      <div className="bg-muted rounded-xl p-8 mt-6">
        <div className="flex items-center gap-4 mb-4">
          <Key className={tvStyles.iconMedium + " text-primary"} />
          <span className={tvStyles.bodySmall}>Door Code</span>
        </div>
        <p className={cn(tvStyles.heading2, "font-mono")}>{content.door_code}</p>
      </div>
    )}
  </div>
);

// House Rules Section
const RulesSection: React.FC<{ content: GuidebookContent }> = ({ content }) => (
  <div className="space-y-6">
    <h3 className={cn(tvStyles.heading3, "mb-4")}>House Rules</h3>
    
    {content.house_rules && content.house_rules.length > 0 ? (
      <ul className="space-y-4">
        {content.house_rules.map((rule, index) => (
          <li 
            key={index}
            className={cn(
              "flex items-start gap-4 bg-muted rounded-xl p-6",
              tvStyles.body
            )}
          >
            <Shield className="h-8 w-8 text-primary shrink-0 mt-1" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className={tvStyles.body}>No house rules specified.</p>
    )}
  </div>
);

// Amenities Section
const AmenitiesSection: React.FC<{ content: GuidebookContent }> = ({ content }) => (
  <div className="space-y-6">
    <h3 className={cn(tvStyles.heading3, "mb-4")}>Amenities</h3>
    
    {content.amenities && content.amenities.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {content.amenities.map((amenity, index) => (
          <div 
            key={index}
            className="bg-muted rounded-xl p-6 text-center"
          >
            <p className={tvStyles.body}>{amenity}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className={tvStyles.body}>No amenities listed.</p>
    )}
  </div>
);

// Emergency Section
const EmergencySection: React.FC<{ content: GuidebookContent }> = ({ content }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 mb-4">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h3 className={tvStyles.heading3}>Emergency Contacts</h3>
    </div>
    
    {content.emergency_contacts && content.emergency_contacts.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.emergency_contacts.map((contact, index) => (
          <div 
            key={index}
            className="bg-muted rounded-xl p-6"
          >
            <p className={cn(tvStyles.heading3, "mb-2")}>{contact.name}</p>
            <p className={cn(tvStyles.bodySmall, "text-muted-foreground mb-2")}>{contact.role}</p>
            <p className={cn(tvStyles.body, "font-mono text-primary")}>{contact.phone}</p>
            {contact.available && (
              <p className={cn(tvStyles.caption, "mt-2")}>{contact.available}</p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-muted rounded-xl p-6">
        <p className={tvStyles.body}>For emergencies, dial 911</p>
      </div>
    )}
  </div>
);

// Appliances Section
const AppliancesSection: React.FC<{ content: GuidebookContent }> = ({ content }) => (
  <div className="space-y-6">
    <h3 className={cn(tvStyles.heading3, "mb-4")}>Appliance Guides</h3>
    
    {content.appliance_guides && content.appliance_guides.length > 0 ? (
      <div className="space-y-4">
        {content.appliance_guides.map((guide, index) => (
          <div 
            key={index}
            className="bg-muted rounded-xl p-6"
            tabIndex={0}
          >
            <h4 className={cn(tvStyles.heading3, "mb-3")}>{guide.name}</h4>
            <p className={tvStyles.body}>{guide.instructions}</p>
            {guide.tips && (
              <p className={cn(tvStyles.caption, "mt-3")}>💡 {guide.tips}</p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className={tvStyles.body}>No appliance guides available.</p>
    )}
  </div>
);

// Info Card Component
const InfoCard: React.FC<{ 
  icon: React.ElementType; 
  title: string; 
  value: string; 
  description?: string;
}> = ({ icon: Icon, title, value, description }) => (
  <div className="bg-muted rounded-xl p-6" tabIndex={0}>
    <div className="flex items-center gap-4 mb-3">
      <Icon className="h-8 w-8 text-primary" />
      <span className={tvStyles.bodySmall}>{title}</span>
    </div>
    <p className={cn(tvStyles.heading3, "font-semibold")}>{value}</p>
    {description && (
      <p className={cn(tvStyles.caption, "mt-2")}>{description}</p>
    )}
  </div>
);

export default TVPropertyInfo;
