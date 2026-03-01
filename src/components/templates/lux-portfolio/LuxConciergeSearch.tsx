import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

const LuxConciergeSearch: React.FC = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set('search', destination.trim());
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative z-30 -mt-12 mb-8">
      <div className="max-w-4xl mx-auto px-6">
        <form
          onSubmit={handleSearch}
          className="backdrop-blur-xl bg-background/70 border border-primary/10 rounded-full px-3 py-2 flex items-center gap-1 shadow-lg shadow-black/5"
        >
          {/* Destination */}
          <div className="flex items-center gap-2.5 px-5 py-3 flex-1 min-w-0">
            <MapPin className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground/50 w-full tracking-wide"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-primary/10" />

          {/* Dates placeholder */}
          <div className="hidden md:flex items-center gap-2.5 px-5 py-3">
            <Calendar className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground/50 tracking-wide whitespace-nowrap">
              Dates
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-primary/10" />

          {/* Guests placeholder */}
          <div className="hidden md:flex items-center gap-2.5 px-5 py-3">
            <Users className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground/50 tracking-wide whitespace-nowrap">
              Guests
            </span>
          </div>

          {/* Discover button */}
          <button
            type="submit"
            className="flex items-center gap-2 bg-foreground text-background rounded-full px-6 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Discover</span>
          </button>
        </form>
      </div>
    </section>
  );
};

export default LuxConciergeSearch;
