
import { usePropertyFetch } from './usePropertyFetch';
import { usePropertyOperations } from './usePropertyOperations';
import { usePropertyDeletion } from './usePropertyDeletion';

export const useProperties = () => {
  const { properties, setProperties, loading, error, refetch } = usePropertyFetch();
  const { addProperty: addPropertyOperation, editProperty: editPropertyOperation } = usePropertyOperations();
  const { deletingProperties, deleteProperty: deletePropertyOperation } = usePropertyDeletion();

  // Ensure properties is always an array
  const safeProperties = Array.isArray(properties) ? properties : [];

  const addProperty = async (propertyData: any) => {
    const result = await addPropertyOperation(propertyData);
    if (result) {
      setProperties(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [result, ...safePrev];
      });
    }
    return result;
  };

  const editProperty = async (propertyId: string, propertyData: any) => {
    const result = await editPropertyOperation(propertyId, propertyData);
    if (result) {
      setProperties(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map(property => 
          property.id === propertyId ? result : property
        );
      });
    }
    return result;
  };

  const deleteProperty = async (propertyId: string) => {
    await deletePropertyOperation(propertyId, safeProperties, setProperties);
  };

  return {
    properties: safeProperties,
    loading,
    error,
    deletingProperties,
    addProperty,
    editProperty,
    deleteProperty,
    refetch
  };
};
