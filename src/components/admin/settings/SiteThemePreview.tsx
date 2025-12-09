import React from 'react';
import { 
  Home, 
  MapPin, 
  Star, 
  Mail, 
  Phone, 
  ArrowRight, 
  User,
  Calendar,
  MessageCircle
} from 'lucide-react';

const SiteThemePreview = () => {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background shadow-lg">
      {/* Mini Header */}
      <div className="bg-background border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <Home className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Site Name</span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-nav-foreground hover:text-nav-hover cursor-pointer transition-colors">Home</span>
          <span className="text-nav-foreground hover:text-nav-hover cursor-pointer transition-colors">Properties</span>
          <span className="text-nav-foreground hover:text-nav-hover cursor-pointer transition-colors">About</span>
        </div>
      </div>

      {/* Mini Hero Section */}
      <div className="bg-gradient-to-br from-hero-gradient-from to-hero-gradient-to px-4 py-8 text-center">
        <h3 className="text-lg font-bold text-hero-text mb-2">Hero Title</h3>
        <p className="text-xs text-hero-text-muted mb-4">Your hero description appears here</p>
        <button className="bg-accent text-accent-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-accent/90 transition-colors">
          Book Now <ArrowRight className="inline h-3 w-3 ml-1" />
        </button>
      </div>

      {/* Mini Cards Section */}
      <div className="p-4 bg-muted">
        <div className="grid grid-cols-2 gap-2">
          {/* Card 1 */}
          <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full h-12 bg-gradient-to-br from-gradient-from to-gradient-to rounded-md mb-2"></div>
            <h4 className="text-xs font-semibold text-card-foreground">Property Card</h4>
            <p className="text-[10px] text-muted-foreground">Description text</p>
            <div className="flex items-center mt-1">
              <Star className="h-3 w-3 text-accent mr-1" />
              <span className="text-[10px] text-muted-foreground">4.9</span>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full h-12 bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to rounded-md mb-2"></div>
            <h4 className="text-xs font-semibold text-card-foreground">Property Card</h4>
            <p className="text-[10px] text-muted-foreground">Description text</p>
            <div className="flex items-center mt-1">
              <Star className="h-3 w-3 text-accent mr-1" />
              <span className="text-[10px] text-muted-foreground">5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Button Samples */}
      <div className="px-4 py-3 bg-background border-t border-border">
        <p className="text-[10px] text-muted-foreground mb-2 font-medium">Button Styles:</p>
        <div className="flex flex-wrap gap-2">
          <button className="bg-primary text-primary-foreground px-2 py-1 rounded text-[10px] font-medium hover:bg-primary/90 transition-colors">
            Primary
          </button>
          <button className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-[10px] font-medium hover:bg-secondary/80 transition-colors">
            Secondary
          </button>
          <button className="bg-accent text-accent-foreground px-2 py-1 rounded text-[10px] font-medium hover:bg-accent/90 transition-colors">
            Accent
          </button>
          <button className="border border-input bg-background text-foreground px-2 py-1 rounded text-[10px] font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            Outline
          </button>
        </div>
      </div>

      {/* Form Sample */}
      <div className="px-4 py-3 bg-muted border-t border-border">
        <p className="text-[10px] text-muted-foreground mb-2 font-medium">Form Elements:</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Text input..." 
            className="flex-1 px-2 py-1 text-[10px] bg-background border border-input rounded focus:ring-2 focus:ring-ring focus:border-input transition-all"
          />
          <button className="bg-primary text-primary-foreground px-2 py-1 rounded text-[10px]">
            Submit
          </button>
        </div>
      </div>

      {/* Badge/Tag Samples */}
      <div className="px-4 py-3 bg-background border-t border-border">
        <p className="text-[10px] text-muted-foreground mb-2 font-medium">Tags & Badges:</p>
        <div className="flex flex-wrap gap-1">
          <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-[9px] font-medium">Featured</span>
          <span className="bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full text-[9px] font-medium">New</span>
          <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-[9px] font-medium">Popular</span>
          <span className="border border-border text-foreground px-1.5 py-0.5 rounded-full text-[9px] font-medium">Outline</span>
        </div>
      </div>

      {/* Icon Samples */}
      <div className="px-4 py-3 bg-muted border-t border-border">
        <p className="text-[10px] text-muted-foreground mb-2 font-medium">Icons:</p>
        <div className="flex gap-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-accent" />
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 text-accent" />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="px-4 py-3 bg-background border-t border-border">
        <p className="text-[10px] text-muted-foreground mb-2 font-medium">Links:</p>
        <div className="flex gap-3">
          <a href="#" className="text-primary hover:underline text-[10px] transition-colors">Primary Link</a>
          <a href="#" className="text-accent-foreground underline text-[10px]">Underlined</a>
          <a href="#" className="text-muted-foreground hover:text-foreground text-[10px] transition-colors">Muted Link</a>
        </div>
      </div>

      {/* Mini Footer */}
      <div className="bg-footer text-footer-foreground px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-3 w-3 text-footer-muted" />
            <span className="text-[10px] text-footer-muted">contact@example.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-3 w-3 text-footer-muted" />
            <span className="text-[10px] text-footer-muted">(555) 123-4567</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-footer-border text-center">
          <span className="text-[9px] text-footer-muted">© 2024 Your Site. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default SiteThemePreview;
