
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createAcknowledgementToken, generateAcknowledgementUrl, isWorkOrderAcknowledged } from '@/utils/workOrderAcknowledgement';

export const useWorkOrderAcknowledgement = () => {
  const { toast } = useToast();
  const [generatingTokens, setGeneratingTokens] = useState<Set<string>>(new Set());
  const [acknowledgementStatus, setAcknowledgementStatus] = useState<Record<string, boolean>>({});

  const generateAcknowledgementLink = async (workOrderId: string): Promise<string | null> => {
    if (generatingTokens.has(workOrderId)) return null;

    setGeneratingTokens(prev => new Set([...prev, workOrderId]));

    try {
      const token = await createAcknowledgementToken(workOrderId);
      
      if (!token) {
        toast({
          title: 'Error',
          description: 'Failed to generate acknowledgement link',
          variant: 'destructive',
        });
        return null;
      }

      const url = generateAcknowledgementUrl(token.token);
      
      toast({
        title: 'Success',
        description: 'Acknowledgement link generated successfully',
      });

      return url;
    } catch (error) {
      console.error('Error generating acknowledgement link:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate acknowledgement link',
        variant: 'destructive',
      });
      return null;
    } finally {
      setGeneratingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(workOrderId);
        return newSet;
      });
    }
  };

  const checkAcknowledgementStatus = async (workOrderId: string): Promise<boolean> => {
    try {
      const isAcknowledged = await isWorkOrderAcknowledged(workOrderId);
      setAcknowledgementStatus(prev => ({
        ...prev,
        [workOrderId]: isAcknowledged
      }));
      return isAcknowledged;
    } catch (error) {
      console.error('Error checking acknowledgement status:', error);
      return false;
    }
  };

  const isGeneratingToken = (workOrderId: string): boolean => {
    return generatingTokens.has(workOrderId);
  };

  const getAcknowledgementStatus = (workOrderId: string): boolean | undefined => {
    return acknowledgementStatus[workOrderId];
  };

  return {
    generateAcknowledgementLink,
    checkAcknowledgementStatus,
    isGeneratingToken,
    getAcknowledgementStatus,
  };
};
