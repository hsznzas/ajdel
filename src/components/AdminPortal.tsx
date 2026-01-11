import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getMenuItems, 
  saveMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  updateSortOrders,
  uploadMenuImage,
  deleteMenuImage,
  convertToDirectImageUrl,
  type FirestoreMenuItem 
} from '../supabase';
import type { AggregatorId, MenuCategory } from '../../types';

// Aggregator info
const AGGREGATORS: { id: AggregatorId; name: string; logo: string }[] = [
  { id: 'jahez', name: 'Jahez', logo: '/images/LINK_Jahez.png' },
  { id: 'hungerstation', name: 'HungerStation', logo: '/images/LINK_HungerStation.png' },
  { id: 'keeta', name: 'Keeta', logo: '/images/LINK_Keeta.png' },
  { id: 'ninja', name: 'Ninja', logo: '/images/LINK_Ninja.png' },
];

const CATEGORIES: { id: MenuCategory; label: string }[] = [
  { id: 'cake', label: 'Cakes & Pastries' },
  { id: 'drink', label: 'Drinks' },
  { id: 'box', label: 'Boxes' },
  { id: 'other', label: 'Other' },
];

interface AdminPortalProps {
  onLogout: () => void;
}

type TabType = 'items' | 'analytics' | 'add';

const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout }) => {
  const [menuItems, setMenuItems] = useState<FirestoreMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [editingItem, setEditingItem] = useState<FirestoreMenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [itemToDelete, setItemToDelete] = useState<FirestoreMenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Drag and drop sorting state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [savingSort, setSavingSort] = useState(false);

  // Fetch menu items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    const items = await getMenuItems();
    setMenuItems(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle image upload via drag and drop - NOW USING SUPABASE STORAGE!
  const handleImageUpload = async (file: File, itemId: string) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadMenuImage(file, itemId);
      
      // Update the editing item with the new image URL
      if (editingItem?.id === itemId) {
        setEditingItem(prev => prev ? { ...prev, imageUrl } : null);
      }
      
      // If item already exists in database, update it
      const existingItem = menuItems.find(item => item.id === itemId);
      if (existingItem) {
        await updateMenuItem(itemId, { imageUrl });
        setMenuItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, imageUrl } : item
          )
        );
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    }
    setUploading(false);
  };

  // Handle save item
  const handleSaveItem = async (item: FirestoreMenuItem) => {
    setSaveStatus('saving');
    try {
      await saveMenuItem(item);
      await fetchItems();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      setEditingItem(null);
      setActiveTab('items');
    } catch (error) {
      setSaveStatus('error');
      console.error('Save failed:', error);
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async (item: FirestoreMenuItem) => {
    try {
      await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      setMenuItems(prev => 
        prev.map(i => 
          i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i
        )
      );
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    setDeleting(true);
    try {
      // Delete image from storage if exists
      if (itemToDelete.imageUrl && itemToDelete.imageUrl.includes('supabase')) {
        await deleteMenuImage(itemToDelete.imageUrl);
      }
      
      // Delete item from database
      await deleteMenuItem(itemToDelete.id);
      
      // Update local state
      setMenuItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete item. Please try again.');
    }
    setDeleting(false);
  };

  // Handle drag and drop sorting
  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (draggedItem !== itemId) {
      setDragOverItem(itemId);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (targetItemId: string) => {
    if (!draggedItem || draggedItem === targetItemId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Reorder the items
    const draggedIndex = menuItems.findIndex(item => item.id === draggedItem);
    const targetIndex = menuItems.findIndex(item => item.id === targetItemId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...menuItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    
    // Update sort orders
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sortOrder: index
    }));
    
    setMenuItems(updatedItems);
    setDraggedItem(null);
    setDragOverItem(null);

    // Save to database
    setSavingSort(true);
    try {
      await updateSortOrders(updatedItems.map(item => ({ id: item.id, sortOrder: item.sortOrder })));
    } catch (error) {
      console.error('Failed to save sort order:', error);
      // Refetch on error
      await fetchItems();
    }
    setSavingSort(false);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Create new item template
  const createNewItem = (): FirestoreMenuItem => ({
    id: crypto.randomUUID(),
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'cake',
    basePrice: 0,
    deliveryPrice: 0,
    imageUrl: '',
    isAvailable: true,
    isNew: false,
    isBestSeller: false,
    isStoreExclusive: false,
    isPreRequestOnly: false,
    availableOn: ['jahez', 'hungerstation', 'keeta', 'ninja'],
    viewCount: 0,
    sortOrder: menuItems.length, // Add at the end
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f405f] via-[#0b253c] to-[#07192d]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0b253c]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/images/BrandLogoGif.gif" 
              alt="AJDEL" 
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h1 className="text-[#F2BF97] font-bold text-lg">AJDEL Admin</h1>
              <p className="text-white/40 text-xs">Menu Management • Supabase</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              View Store →
            </a>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/20 text-sm transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-2 pb-4">
          {[
            { id: 'items' as TabType, label: 'Menu Items', icon: '🍰' },
            { id: 'add' as TabType, label: 'Add New', icon: '➕' },
            { id: 'analytics' as TabType, label: 'Analytics', icon: '📊' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'add') {
                  setEditingItem(createNewItem());
                }
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#F2BF97] text-[#0b253c]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Items Tab */}
          {activeTab === 'items' && (
            <motion.div
              key="items"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {loading ? (
                <div className="text-center py-20">
                  <div className="w-8 h-8 border-2 border-[#F2BF97] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white/40">Loading menu items...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-white/40 mb-4">No menu items yet</p>
                  <button
                    onClick={() => {
                      setActiveTab('add');
                      setEditingItem(createNewItem());
                    }}
                    className="px-6 py-3 bg-[#F2BF97] text-[#0b253c] font-bold rounded-xl"
                  >
                    Add Your First Item
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Sorting indicator */}
                  {savingSort && (
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                      <div className="w-4 h-4 border-2 border-[#F2BF97] border-t-transparent rounded-full animate-spin" />
                      Saving order...
                    </div>
                  )}
                  
                  <p className="text-white/40 text-xs mb-4">💡 Drag items to reorder them</p>
                  
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDrop(item.id)}
                      onDragEnd={handleDragEnd}
                      className={`
                        bg-white/5 backdrop-blur-xl border rounded-2xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing
                        transition-all duration-200
                        ${draggedItem === item.id ? 'opacity-50 border-[#F2BF97]' : 'border-white/10'}
                        ${dragOverItem === item.id ? 'border-[#F2BF97] bg-[#F2BF97]/10' : ''}
                      `}
                    >
                      {/* Drag Handle */}
                      <div className="flex flex-col gap-0.5 text-white/30 flex-shrink-0">
                        <span className="text-xs font-bold text-white/50">#{index + 1}</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
                        </svg>
                      </div>
                      
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F2BF97]/20 flex-shrink-0">
                        {item.imageUrl ? (
                          <img 
                            src={convertToDirectImageUrl(item.imageUrl)} 
                            alt={item.nameEn} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#F2BF97] text-xs font-bold px-1 text-center">
                            {item.nameEn.slice(0, 15)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-white font-bold truncate">{item.nameEn}</h3>
                          {item.isNew && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">New</span>
                          )}
                          {item.isBestSeller && (
                            <span className="px-2 py-0.5 bg-[#F2BF97]/20 text-[#F2BF97] text-xs rounded-full">Best Seller</span>
                          )}
                          {item.isStoreExclusive && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">Exclusive</span>
                          )}
                          {item.isPreRequestOnly && (
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">Pre-order</span>
                          )}
                        </div>
                        <p className="text-white/40 text-sm truncate">{item.nameAr}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[#F2BF97] font-bold">{item.basePrice} SAR</span>
                          <span className="text-white/30 text-sm">Views: {item.viewCount}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Availability Toggle */}
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`w-12 h-6 rounded-full transition-all relative ${
                            item.isAvailable ? 'bg-green-500' : 'bg-white/20'
                          }`}
                        >
                          <div 
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                              item.isAvailable ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setActiveTab('add');
                          }}
                          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        >
                          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Add/Edit Tab */}
          {activeTab === 'add' && editingItem && (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ItemEditor
                item={editingItem}
                onChange={setEditingItem}
                onSave={handleSaveItem}
                onImageUpload={handleImageUpload}
                uploading={uploading}
                saveStatus={saveStatus}
                onCancel={() => {
                  setEditingItem(null);
                  setActiveTab('items');
                }}
              />
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-white font-bold">Click Analytics</h2>
                  <p className="text-white/40 text-sm">View counts per menu item</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Item</th>
                        <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Category</th>
                        <th className="px-4 py-3 text-right text-white/60 text-sm font-medium">Views</th>
                        <th className="px-4 py-3 text-right text-white/60 text-sm font-medium">Price</th>
                        <th className="px-4 py-3 text-center text-white/60 text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems
                        .sort((a, b) => b.viewCount - a.viewCount)
                        .map(item => (
                          <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F2BF97]/20">
                                  {item.imageUrl ? (
                                    <img 
                                      src={convertToDirectImageUrl(item.imageUrl)} 
                                      alt="" 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#F2BF97] text-xs font-bold">
                                      {item.nameEn.slice(0, 3)}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{item.nameEn}</p>
                                  <p className="text-white/40 text-xs">{item.nameAr}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-white/10 rounded-md text-white/60 text-xs capitalize">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-[#F2BF97] font-bold">{item.viewCount}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-white">{item.deliveryPrice} SAR</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-md text-xs ${
                                item.isAvailable 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {item.isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {menuItems.length === 0 && (
                  <div className="p-8 text-center text-white/40">
                    No data to display
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !deleting && setItemToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0b253c] border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            >
              {/* Warning Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="text-white text-lg font-bold text-center mb-2">Delete Item?</h3>
              <p className="text-white/60 text-sm text-center mb-6">
                Are you sure you want to delete <span className="text-[#F2BF97] font-medium">"{itemToDelete.nameEn}"</span>? This action cannot be undone.
              </p>

              {/* Item Preview */}
              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F2BF97]/20 flex-shrink-0">
                  {itemToDelete.imageUrl ? (
                    <img 
                      src={convertToDirectImageUrl(itemToDelete.imageUrl)} 
                      alt="" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#F2BF97] text-xs font-bold">
                      {itemToDelete.nameEn.slice(0, 3)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{itemToDelete.nameEn}</p>
                  <p className="text-white/40 text-xs truncate">{itemToDelete.nameAr}</p>
                </div>
                <span className="text-[#F2BF97] text-sm font-bold">{itemToDelete.deliveryPrice} SAR</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-500 rounded-xl text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Item Editor Component - WITH DRAG & DROP IMAGE UPLOAD (SUPABASE STORAGE)
interface ItemEditorProps {
  item: FirestoreMenuItem;
  onChange: (item: FirestoreMenuItem) => void;
  onSave: (item: FirestoreMenuItem) => void;
  onImageUpload: (file: File, itemId: string) => void;
  uploading: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onCancel: () => void;
}

const ItemEditor: React.FC<ItemEditorProps> = ({
  item,
  onChange,
  onSave,
  onImageUpload,
  uploading,
  saveStatus,
  onCancel,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onImageUpload(file, item.id);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file, item.id);
    }
  };

  const updateField = <K extends keyof FirestoreMenuItem>(
    field: K,
    value: FirestoreMenuItem[K]
  ) => {
    onChange({ ...item, [field]: value });
    if (field === 'imageUrl') setImageError(false);
  };

  const toggleAggregator = (aggregatorId: AggregatorId) => {
    const newAvailableOn = item.availableOn.includes(aggregatorId)
      ? item.availableOn.filter(id => id !== aggregatorId)
      : [...item.availableOn, aggregatorId];
    updateField('availableOn', newAvailableOn);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">
          {item.createdAt === item.updatedAt ? 'Add New Item' : 'Edit Item'}
        </h2>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="text-green-400 text-sm">✓ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-400 text-sm">Failed to save</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image Upload */}
        <div>
          {/* Drag & Drop Image Zone - SUPABASE STORAGE */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
              dragOver 
                ? 'border-[#F2BF97] bg-[#F2BF97]/10' 
                : 'border-white/20 bg-white/5'
            }`}
          >
            {item.imageUrl && !imageError ? (
              <>
                <img 
                  src={convertToDirectImageUrl(item.imageUrl)} 
                  alt={item.nameEn} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer px-4 py-2 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30 transition-colors">
                    Change Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileSelect}
                      className="hidden" 
                    />
                  </label>
                </div>
              </>
            ) : (
              <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                {uploading ? (
                  <>
                    <div className="w-10 h-10 border-3 border-[#F2BF97] border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-[#F2BF97] text-sm font-medium">Uploading to Supabase...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-14 h-14 text-white/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white/60 text-sm mb-1 font-medium">Drag & drop image here</span>
                    <span className="text-white/30 text-xs">or click to browse</span>
                    <span className="text-[#F2BF97]/60 text-xs mt-2">📦 Powered by Supabase Storage</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileSelect}
                      className="hidden" 
                    />
                  </>
                )}
              </label>
            )}
          </div>

          {/* OR: Manual URL Input */}
          <div className="mt-4">
            <label className="block text-white/40 text-xs mb-2">
              Or paste an external image URL:
            </label>
            <input
              type="url"
              value={item.imageUrl}
              onChange={(e) => updateField('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#F2BF97]/50"
            />
          </div>

          {/* Tags & Availability */}
          <div className="mt-6 space-y-4">
            <h3 className="text-white/60 text-sm font-medium">Tags & Status</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'isAvailable', label: 'Available' },
                { key: 'isNew', label: 'New' },
                { key: 'isBestSeller', label: 'Best Seller' },
                { key: 'isStoreExclusive', label: 'Store Exclusive' },
                { key: 'isPreRequestOnly', label: 'Pre-request Only' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => updateField(key as keyof FirestoreMenuItem, !item[key as keyof FirestoreMenuItem])}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    item[key as keyof FirestoreMenuItem]
                      ? 'bg-[#F2BF97]/20 border-[#F2BF97]/40 text-[#F2BF97]'
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Available On Aggregators */}
          <div className="mt-6 space-y-4">
            <h3 className="text-white/60 text-sm font-medium">Available On</h3>
            <div className="grid grid-cols-2 gap-3">
              {AGGREGATORS.map(agg => (
                <button
                  key={agg.id}
                  onClick={() => toggleAggregator(agg.id)}
                  className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                    item.availableOn.includes(agg.id)
                      ? 'bg-white/10 border-white/30'
                      : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <img src={agg.logo} alt={agg.name} className="w-6 h-6 rounded" />
                  <span className="text-white text-sm">{agg.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="space-y-6">
          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Name (English)</label>
              <input
                type="text"
                value={item.nameEn}
                onChange={(e) => updateField('nameEn', e.target.value)}
                placeholder="San Sebastian"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2BF97]/50"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Name (Arabic)</label>
              <input
                type="text"
                value={item.nameAr}
                onChange={(e) => updateField('nameAr', e.target.value)}
                placeholder="سان سيباستيان"
                dir="rtl"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2BF97]/50"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-white/60 text-sm mb-2">Description (English)</label>
            <textarea
              value={item.descriptionEn}
              onChange={(e) => updateField('descriptionEn', e.target.value)}
              placeholder="A luxurious Basque-style cheesecake with a caramelized top..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2BF97]/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Description (Arabic)</label>
            <textarea
              value={item.descriptionAr}
              onChange={(e) => updateField('descriptionAr', e.target.value)}
              placeholder="تشيز كيك باسك فاخر بطبقة كراميل..."
              rows={3}
              dir="rtl"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2BF97]/50 resize-none"
            />
          </div>

          {/* Category & Prices */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Category</label>
              <select
                value={item.category}
                onChange={(e) => updateField('category', e.target.value as MenuCategory)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F2BF97]/50"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#0b253c]">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Base Price (SAR)</label>
              <input
                type="number"
                value={item.basePrice}
                onChange={(e) => updateField('basePrice', Number(e.target.value))}
                placeholder="25"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2BF97]/50"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Delivery Price (SAR)</label>
              <input
                type="number"
                value={item.deliveryPrice}
                onChange={(e) => updateField('deliveryPrice', Number(e.target.value))}
                placeholder="29"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2BF97]/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(item)}
              disabled={saveStatus === 'saving' || !item.nameEn}
              className="flex-1 py-3 bg-[#F2BF97] text-[#0b253c] font-bold rounded-xl hover:bg-[#ECDAD2] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
