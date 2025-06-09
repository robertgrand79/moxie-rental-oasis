
import { Settings, Palette, BarChart3, Wand2, Code, FileText, Mail } from 'lucide-react';

export const tabs = [
  { id: 'basic', label: 'Basic Setup', icon: Settings, description: 'Essential site information' },
  { id: 'content', label: 'Content & Media', icon: FileText, description: 'Manage your content' },
  { id: 'design', label: 'Design & Branding', icon: Palette, description: 'Visual customization' },
  { id: 'seo', label: 'SEO & Analytics', icon: BarChart3, description: 'Optimization & tracking' },
  { id: 'email', label: 'Email Services', icon: Mail, description: 'Newsletter & email configuration' },
  { id: 'ai', label: 'AI Tools', icon: Wand2, description: 'AI-powered features' },
  { id: 'advanced', label: 'Advanced', icon: Code, description: 'Custom code & scripts' }
];
