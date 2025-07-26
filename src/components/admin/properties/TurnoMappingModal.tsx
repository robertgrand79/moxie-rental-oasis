import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, User, Link2, CheckCircle } from 'lucide-react';
import { Property } from '@/types/property';
import { TurnoProperty } from '@/types/turno';
import { useTurnoProperties } from '@/hooks/useTurnoProperties';

interface TurnoMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  turnoProperties: TurnoProperty[];
}

const TurnoMappingModal = ({ 
  isOpen, 
  onClose, 
  property, 
  turnoProperties 
}: TurnoMappingModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurnoProperty, setSelectedTurnoProperty] = useState<TurnoProperty | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { createMapping, mappings } = useTurnoProperties();

  const filteredTurnoProperties = useMemo(() => {
    if (!searchTerm) return turnoProperties;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return turnoProperties.filter(tp => 
      tp.name.toLowerCase().includes(lowercaseSearch) ||
      tp.address?.toLowerCase().includes(lowercaseSearch) ||
      tp.city?.toLowerCase().includes(lowercaseSearch)
    );
  }, [turnoProperties, searchTerm]);

  const suggestedMappings = useMemo(() => {
    if (!property) return [];
    
    const propertyName = property.title.toLowerCase();
    const propertyLocation = property.location.toLowerCase();
    
    return turnoProperties
      .map(tp => {
        let score = 0;
        const turnoName = tp.name.toLowerCase();
        const turnoAddress = `${tp.address || ''} ${tp.city || ''}`.toLowerCase();
        
        // Name similarity
        if (turnoName.includes(propertyName) || propertyName.includes(turnoName)) {
          score += 3;
        }
        
        // Location similarity
        if (turnoAddress.includes(propertyLocation) || propertyLocation.includes(turnoAddress)) {
          score += 2;
        }
        
        // Exact matches
        if (turnoName === propertyName) score += 5;
        if (turnoAddress === propertyLocation) score += 3;
        
        return { property: tp, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.property);
  }, [property, turnoProperties]);

  const isPropertyMapped = (turnoPropertyId: string) => {
    return mappings.some(m => m.turno_property_id === turnoPropertyId && m.is_active);
  };

  const handleCreateMapping = async () => {
    if (!property || !selectedTurnoProperty) return;
    
    try {
      setIsCreating(true);
      await createMapping(property.id, selectedTurnoProperty.id);
      onClose();
    } catch (error) {
      console.error('Error creating mapping:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedTurnoProperty(null);
    onClose();
  };

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Map Property to Turno
          </DialogTitle>
          <DialogDescription>
            Connect "{property.title}" to a Turno property for automatic sync
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Your Property</h3>
              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium">{property.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </div>
                <div className="mt-2 text-sm">
                  {property.bedrooms} bed • {property.bathrooms} bath • {property.max_guests} guests
                </div>
              </div>
            </div>

            {/* Suggested Mappings */}
            {suggestedMappings.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-green-600">✨ Suggested Matches</h4>
                <div className="space-y-2">
                  {suggestedMappings.map(tp => (
                    <div
                      key={tp.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTurnoProperty?.id === tp.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      } ${isPropertyMapped(tp.id) ? 'opacity-50' : ''}`}
                      onClick={() => !isPropertyMapped(tp.id) && setSelectedTurnoProperty(tp)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-sm">{tp.name}</h5>
                            {isPropertyMapped(tp.id) && (
                              <Badge variant="secondary" className="text-xs">Already Mapped</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {tp.address}, {tp.city}
                          </div>
                          {tp.cleaner && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <User className="h-3 w-3" />
                              {tp.cleaner.name}
                            </div>
                          )}
                        </div>
                        {selectedTurnoProperty?.id === tp.id && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Turno Properties */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Turno Properties</h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Turno properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Properties List */}
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {filteredTurnoProperties.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {turnoProperties.length === 0 
                        ? 'No Turno properties found. Please sync first.' 
                        : 'No properties match your search.'}
                    </div>
                  ) : (
                    filteredTurnoProperties.map(tp => (
                      <div
                        key={tp.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTurnoProperty?.id === tp.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        } ${isPropertyMapped(tp.id) ? 'opacity-50' : ''}`}
                        onClick={() => !isPropertyMapped(tp.id) && setSelectedTurnoProperty(tp)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm">{tp.name}</h5>
                              {isPropertyMapped(tp.id) && (
                                <Badge variant="secondary" className="text-xs">Mapped</Badge>
                              )}
                            </div>
                            {tp.address && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3" />
                                {tp.address}, {tp.city}
                              </div>
                            )}
                            {tp.cleaner && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <User className="h-3 w-3" />
                                {tp.cleaner.name}
                              </div>
                            )}
                          </div>
                          {selectedTurnoProperty?.id === tp.id && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Selected Property Details */}
        {selectedTurnoProperty && (
          <div className="mt-6 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Selected Mapping</h4>
            <div className="flex items-center justify-between text-sm">
              <span>{property.title}</span>
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                <span>maps to</span>
                <Link2 className="h-4 w-4" />
              </div>
              <span>{selectedTurnoProperty.name}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateMapping}
            disabled={!selectedTurnoProperty || isCreating || isPropertyMapped(selectedTurnoProperty?.id || '')}
          >
            {isCreating ? 'Creating...' : 'Create Mapping'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TurnoMappingModal;