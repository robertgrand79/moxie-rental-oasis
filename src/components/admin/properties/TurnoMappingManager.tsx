import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Link2, Plus, Settings, Trash2, ExternalLink } from 'lucide-react';
import { Property } from '@/types/property';
import { useTurnoProperties } from '@/hooks/useTurnoProperties';
import TurnoMappingModal from './TurnoMappingModal';
import LoadingState from '@/components/ui/loading-state';

interface TurnoMappingManagerProps {
  properties: Property[];
}

const TurnoMappingManager = ({ properties }: TurnoMappingManagerProps) => {
  const {
    turnoProperties,
    mappings,
    loading,
    syncing,
    fetchTurnoProperties,
    deleteMapping,
    updateMappingStatus,
  } = useTurnoProperties();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);

  const handleCreateMapping = (property: Property) => {
    setSelectedProperty(property);
    setShowMappingModal(true);
  };

  const getMappingForProperty = (propertyId: string) => {
    return mappings.find(m => m.property_id === propertyId);
  };

  const getUnmappedProperties = () => {
    return properties.filter(property => !getMappingForProperty(property.id));
  };

  const getMappedProperties = () => {
    return properties.filter(property => getMappingForProperty(property.id));
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (confirm('Are you sure you want to delete this mapping? This will stop syncing with Turno.')) {
      await deleteMapping(mappingId);
    }
  };

  const handleToggleMappingStatus = async (mappingId: string, currentStatus: boolean) => {
    await updateMappingStatus(mappingId, !currentStatus);
  };

  if (loading) {
    return <LoadingState variant="card" message="Loading Turno mappings..." />;
  }

  const mappedCount = getMappedProperties().length;
  const unmappedCount = getUnmappedProperties().length;
  const totalTurnoProperties = turnoProperties.length;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Turno Property Mapping
              </CardTitle>
              <CardDescription>
                Connect your properties with Turno to sync maintenance issues and reports
              </CardDescription>
            </div>
            <Button
              onClick={fetchTurnoProperties}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Properties
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{mappedCount}</div>
              <div className="text-sm text-muted-foreground">Mapped Properties</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/5 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{unmappedCount}</div>
              <div className="text-sm text-muted-foreground">Unmapped Properties</div>
            </div>
            <div className="text-center p-4 bg-blue-500/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalTurnoProperties}</div>
              <div className="text-sm text-muted-foreground">Turno Properties</div>
            </div>
            <div className="text-center p-4 bg-green-500/5 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {mappedCount > 0 ? Math.round((mappedCount / properties.length) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Mapping Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapped Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mapped Properties ({mappedCount})</CardTitle>
          <CardDescription>
            Properties connected to Turno for automatic sync
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mappedCount === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No properties mapped yet. Start by mapping your first property below.
            </div>
          ) : (
            <div className="space-y-3">
              {getMappedProperties().map(property => {
                const mapping = getMappingForProperty(property.id);
                if (!mapping) return null;

                return (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{property.title}</h4>
                          <p className="text-sm text-muted-foreground">{property.location}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{mapping.property_name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={mapping.is_active ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {mapping.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Updated: {new Date(mapping.updated_at).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleMappingStatus(mapping.id, mapping.is_active)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMapping(mapping.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unmapped Properties */}
      {unmappedCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unmapped Properties ({unmappedCount})</CardTitle>
            <CardDescription>
              Properties that need to be connected to Turno
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUnmappedProperties().map(property => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{property.title}</h4>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCreateMapping(property)}
                    disabled={turnoProperties.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Map to Turno
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mapping Modal */}
      <TurnoMappingModal
        isOpen={showMappingModal}
        onClose={() => {
          setShowMappingModal(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
        turnoProperties={turnoProperties}
      />
    </div>
  );
};

export default TurnoMappingManager;