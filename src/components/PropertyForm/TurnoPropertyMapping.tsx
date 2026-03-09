import React, { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTurnoProperties } from '@/hooks/useTurnoProperties';
import { Loader2, Wrench, RefreshCw, CheckCircle2, XCircle, ArrowRightLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TurnoPropertyMappingProps {
  property: Property;
}

const TurnoPropertyMapping = ({ property }: TurnoPropertyMappingProps) => {
  const { 
    turnoProperties, 
    mappings, 
    loading, 
    syncing,
    fetchTurnoProperties,
    createMapping,
    deleteMapping,
    updateMappingStatus,
  } = useTurnoProperties();

  const [selectedTurnoProperty, setSelectedTurnoProperty] = useState<string>('');

  // Find existing mapping for this property
  const existingMapping = mappings.find(m => m.property_id === property.id);

  useEffect(() => {
    if (existingMapping) {
      setSelectedTurnoProperty(existingMapping.turno_property_id);
    }
  }, [existingMapping]);

  const handleCreateMapping = async () => {
    if (!selectedTurnoProperty) return;
    try {
      await createMapping(property.id, selectedTurnoProperty);
    } catch (error) {
      console.error('Failed to create mapping:', error);
    }
  };

  const handleDeleteMapping = async () => {
    if (!existingMapping) return;
    try {
      await deleteMapping(existingMapping.id);
      setSelectedTurnoProperty('');
    } catch (error) {
      console.error('Failed to delete mapping:', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!existingMapping) return;
    try {
      await updateMappingStatus(existingMapping.id, !existingMapping.is_active);
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading Turno integration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Turno Maintenance Integration
              </CardTitle>
              <CardDescription>
                Map this property to a Turno property for maintenance issue syncing
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTurnoProperties}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Turno Properties
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {existingMapping ? (
            <>
              {/* Mapping status banner */}
              <div className={`rounded-lg border p-4 ${existingMapping.is_active ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {existingMapping.is_active ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className="font-semibold text-sm">
                      {existingMapping.is_active ? 'Mapped & Active' : 'Mapped — Inactive'}
                    </span>
                  </div>
                  <Badge variant={existingMapping.is_active ? 'default' : 'secondary'}>
                    {existingMapping.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Mapping detail cards */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  {/* StayMoxie property */}
                  <div className="rounded-md border bg-white p-3 space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">StayMoxie Property</p>
                    <p className="font-medium text-sm leading-tight">{property.title}</p>
                    <p className="text-xs text-muted-foreground">{property.location}</p>
                  </div>

                  {/* Arrow connector */}
                  <div className="hidden sm:flex items-center justify-center">
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Turno property */}
                  <div className="rounded-md border bg-white p-3 space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Turno Property</p>
                    <p className="font-medium text-sm leading-tight">{existingMapping.property_name}</p>
                    <p className="text-xs text-muted-foreground">ID: {existingMapping.turno_property_id}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleToggleStatus}
                  className="flex-1"
                >
                  {existingMapping.is_active ? 'Deactivate' : 'Activate'} Mapping
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteMapping}
                >
                  Remove Mapping
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Turno Property</label>
                <Select
                  value={selectedTurnoProperty}
                  onValueChange={setSelectedTurnoProperty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a Turno property to map..." />
                  </SelectTrigger>
                  <SelectContent>
                    {turnoProperties
                      .filter(tp => !mappings.some(m => m.turno_property_id === tp.id && m.property_id && m.is_active))
                      .map((turnoProperty) => (
                        <SelectItem key={turnoProperty.id} value={String(turnoProperty.id)}>
                          {turnoProperty.name || turnoProperty.alias || turnoProperty.title || `Property ${turnoProperty.id}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreateMapping}
                disabled={!selectedTurnoProperty}
                className="w-full"
              >
                Create Mapping
              </Button>
            </>
          )}

          {turnoProperties.length === 0 && (
            <Alert>
              <AlertDescription>
                No Turno properties found. Click "Refresh Turno Properties" to fetch the latest list.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TurnoPropertyMapping;
