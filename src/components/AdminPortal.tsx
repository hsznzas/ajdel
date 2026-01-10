import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getMenuItems, 
  saveMenuItem, 
  updateMenuItem, 
  // uploadMenuImage - DISABLED: Firebase Storage billing blocker
  type FirestoreMenuItem 
} from '../firebase';
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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

  // Create new item template
  const createNewItem = (): FirestoreMenuItem => ({
    id: `item_${Date.now()}`,
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#023550] via-[#012842] to-[#011e35]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#012842]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/images/BrandLogoGif.gif" 
              alt="AJDEL" 
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h1 className="text-[#F2BF97] font-bold text-lg">AJDEL Admin</h1>
              <p className="text-white/40 text-xs">Menu Management</p>
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
                  ? 'bg-[#F2BF97] text-[#012842]'
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
                    className="px-6 py-3 bg-[#F2BF97] text-[#012842] font-bold rounded-xl"
                  >
                    Add Your First Item
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {menuItems.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F2BF97]/20 flex-shrink-0">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.nameEn} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-[#F2BF97] text-xs font-bold px-1 text-center">${item.nameEn.slice(0,15)}</div>`;
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold truncate">{item.nameEn}</h3>
                          {item.isNew && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">New</span>
                          )}
                          {item.isBestSeller && (
                            <span className="px-2 py-0.5 bg-[#F2BF97]/20 text-[#F2BF97] text-xs rounded-full">Best Seller</span>
                          )}
                        </div>
                        <p className="text-white/40 text-sm truncate">{item.nameAr}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[#F2BF97] font-bold">{item.deliveryPrice} SAR</span>
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
                                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
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
    </div>
  );
};

// Item Editor Component - UPDATED: Using URL input instead of file upload
interface ItemEditorProps {
  item: FirestoreMenuItem;
  onChange: (item: FirestoreMenuItem) => void;
  onSave: (item: FirestoreMenuItem) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onCancel: () => void;
}

const ItemEditor: React.FC<ItemEditorProps> = ({
  item,
  onChange,
  onSave,
  saveStatus,
  onCancel,
}) => {
  const [imageError, setImageError] = useState(false);

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
        {/* Left Column - Image Preview & URL Input */}
        <div>
          {/* Image Preview */}
          <div className="relative aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-white/5 overflow-hidden mb-4">
            {item.imageUrl && !imageError ? (
              <img 
                src={item.imageUrl} 
                alt={item.nameEn} 
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#F2BF97]/10">
                <span className="text-6xl mb-4">🍰</span>
                <span className="text-white/40 text-sm">
                  {imageError ? 'Image failed to load' : 'No image set'}
                </span>
              </div>
            )}
          </div>

          {/* Image URL Input - TEMPORARY REPLACEMENT FOR STORAGE UPLOAD */}
          <div className="mb-6">
            <label className="block text-white/60 text-sm mb-2">
              🔗 Image Link (URL)
              <span className="text-white/30 text-xs ml-2">
                (Imgur, Google Drive, etc.)
              </span>
            </label>
            <input
              type="url"
              value={item.imageUrl}
              onChange={(e) => updateField('imageUrl', e.target.value)}
              placeholder="https://i.imgur.com/example.jpg"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2BF97]/50"
            />
            <p className="text-white/30 text-xs mt-2">
              💡 Tip: Use Imgur or direct Google Drive links for free hosting
            </p>
          </div>

          {/* Tags & Availability */}
          <div className="space-y-4">
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
                  <option key={cat.id} value={cat.id} className="bg-[#012842]">
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
              className="flex-1 py-3 bg-[#F2BF97] text-[#012842] font-bold rounded-xl hover:bg-[#ECDAD2] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
