
import { useState, useMemo } from 'react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { LifestyleGalleryFormData } from './LifestyleGalleryFormFields';

export const useLifestyleEditorState = (galleryItems: LifestyleGalleryItem[]) => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingItem, setEditingItem] = useState<LifestyleGalleryItem | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState<LifestyleGalleryFormData>({
    title: '',
    description: '',
    image_url: '',
    category: '',
    location: '',
    activity_type: '',
    display_order: 0,
    is_featured: false,
    is_active: true,
    status: 'draft',
    created_by: ''
  });

  // Filter items based on status
  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return galleryItems;
    return galleryItems.filter(item => item.status === statusFilter);
  }, [galleryItems, statusFilter]);

  // Calculate item counts for filter badges
  const itemCounts = useMemo(() => ({
    all: galleryItems.length,
    draft: galleryItems.filter(item => item.status === 'draft').length,
    published: galleryItems.filter(item => item.status === 'published').length,
  }), [galleryItems]);

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      category: '',
      location: '',
      activity_type: '',
      display_order: 0,
      is_featured: false,
      is_active: true,
      status: 'draft',
      created_by: ''
    });
  };

  return {
    activeTab,
    setActiveTab,
    editingItem,
    setEditingItem,
    statusFilter,
    setStatusFilter,
    formData,
    setFormData,
    filteredItems,
    itemCounts,
    resetForm
  };
};
