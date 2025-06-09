
import { usePropertyFetch } from './usePropertyFetch';
import { usePropertyOperations } from './usePropertyOperations';
import { usePropertyDeletion } from './usePropertyDeletion';

export const useProperties = () => {
  const { properties, setProperties, loading, refetch } = usePropertyFetch();
  const { addProperty: addPropertyOperation, editProperty: editPropertyOperation } = usePropertyOperations();
  const { deletingProperties, deleteProperty: deletePropertyOperation } = usePropertyDeletion();

  const addProperty = async (propertyData: any) => {
    const result = await addPropertyOperation(propertyData);
    if (result) {
      setProperties(prev => [result, ...prev]);
    }
    return result;
  };

  const editProperty = async (propertyId: string, propertyData: any) => {
    const result = await editPropertyOperation(propertyId, propertyData);
    if (result) {
      setProperties(prev => prev.map(property => 
        property.id === propertyId ? result : property
      ));
    }
    return result;
  };

  const deleteProperty = async (propertyId: string) => {
    await deletePropertyOperation(propertyId, properties, setProperties);
  };

  return {
    properties,
    loading,
    deletingProperties,
    addProperty,
    editProperty,
    deleteProperty,
    refetch
  };
};
