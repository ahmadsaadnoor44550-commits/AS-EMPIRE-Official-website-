import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Upload, 
  Trash2, 
  Plus, 
  Package, 
  AlertCircle,
  Camera,
  Loader2 
} from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: (productData: Omit<Product, 'id'>) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
}) => {
  const { settings, addBusinessCategory } = useStore();
  const availableCategories = settings.categories || ['Mobile LCDs', 'Mobile LEDs', 'OLED Screens', 'Mobile Accessories'];

  const [name, setName] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'Mobile LCDs');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [isAvailable, setIsAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setCategory(productToEdit.category || availableCategories[0] || 'Mobile LCDs');
      setPrice(productToEdit.price || '');
      setDiscountPrice(productToEdit.discountPrice ?? '');
      setStock(productToEdit.stock ?? 10);
      setIsAvailable(productToEdit.isAvailable ?? true);
      setFeatured(productToEdit.featured ?? false);
      setDescription(productToEdit.description || '');
      setImages(productToEdit.images || []);
      setSpecifications(productToEdit.specifications || {});
    } else {
      setName('');
      setCategory(availableCategories[0] || 'Mobile LCDs');
      setPrice('');
      setDiscountPrice('');
      setStock(15);
      setIsAvailable(true);
      setFeatured(false);
      setDescription('');
      setImages([]);
      setSpecifications({});
    }
    setErrorMsg(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // High-performance image compressor for mobile phones and cameras
  const processFileToCompressedDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Create Object URL to avoid massive base64 memory overhead on mobile browsers
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          // 800px provides crisp, razor-sharp detail on mobile screens while staying ~60KB
          const maxDim = 800;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Canvas context unavailable'));
            return;
          }

          // Ensure solid white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // 0.78 quality provides crystal clarity for mobile screens and fits safely in Firestore
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };

      img.src = objectUrl;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImages(true);
    setErrorMsg(null);
    try {
      const fileList = Array.from(files);
      const processedList: string[] = [];
      for (const file of fileList) {
        const compressed = await processFileToCompressedDataUrl(file);
        processedList.push(compressed);
      }
      setImages((prev) => [...prev, ...processedList]);
    } catch (err) {
      console.error('Failed to process mobile image:', err);
      setErrorMsg('Could not process photo from your mobile device. Please try another image.');
    } finally {
      setIsProcessingImages(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpecification = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    setSpecifications((prev) => ({
      ...prev,
      [specKey.trim()]: specValue.trim(),
    }));
    setSpecKey('');
    setSpecValue('');
  };

  const handleRemoveSpecification = (key: string) => {
    setSpecifications((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setErrorMsg('Please enter a valid price in PKR.');
      return;
    }

    let finalCategory = category;
    if (category === 'Add Custom Category' && customCategory.trim()) {
      finalCategory = customCategory.trim();
      addBusinessCategory(finalCategory);
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        category: finalCategory || 'Mobile LCDs',
        price: Number(price),
        discountPrice: discountPrice !== '' ? Number(discountPrice) : undefined,
        stock: stock !== '' ? Number(stock) : 0,
        isAvailable,
        featured,
        description: description.trim(),
        images,
        specifications,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product in database.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl z-10 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-empire text-lg sm:text-xl font-bold text-slate-900">
                {productToEdit ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-500">
                Saves permanently to your Cloud Firestore database
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samsung A32 OLED Display Panel with Frame"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 text-xs sm:text-sm"
            />
          </div>

          {/* Category & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-700">Business Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 text-xs"
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="Add Custom Category">+ Add New Category</option>
              </select>

              {category === 'Add Custom Category' && (
                <input
                  type="text"
                  placeholder="Type new category name..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 text-xs"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Stock Units *</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="10"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 text-xs"
              />
            </div>
          </div>

          {/* Pricing in PKR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Regular Price in Pakistani Rupees (PKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="3500"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Discounted Price (Optional in PKR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  min="0"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2999"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Status Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-0"
              />
              <span className="font-semibold text-slate-800">Available for Customer Orders</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-0"
              />
              <span className="font-semibold text-slate-800">Highlight as Featured Product</span>
            </label>
          </div>

          {/* Multiple Pictures Upload */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 block">
              Product Pictures ({images.length} added)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Mobile Camera Direct Snap */}
              <label className="p-3.5 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                <Camera className="w-5 h-5 text-amber-700" />
                <span className="font-bold text-amber-900 text-xs">Take Photo (Camera)</span>
                <span className="text-[10px] text-amber-700">Mobile rear camera</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleFileUpload} 
                  disabled={isProcessingImages}
                  className="hidden" 
                />
              </label>

              {/* Upload from Gallery / Device */}
              <label className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                <Upload className="w-5 h-5 text-slate-500" />
                <span className="font-semibold text-slate-700 text-xs">Choose from Gallery</span>
                <span className="text-[10px] text-slate-400">Multiple files supported</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  disabled={isProcessingImages}
                  className="hidden" 
                />
              </label>

              {/* Paste URL */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-1.5">
                <span className="font-semibold text-slate-700 text-xs">Or Web Image URL</span>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 min-w-0 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Image processing loading bar */}
            {isProcessingImages && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2 text-amber-900 text-xs font-semibold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>Compressing & optimizing photo for fast mobile display...</span>
              </div>
            )}

            {/* Images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 p-1 flex items-center justify-center group">
                    <img src={img} alt="" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-white text-slate-500 hover:text-rose-600 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Product Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter details like compatible phone models, original display grade, warranty, etc."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* Specifications */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-semibold text-slate-700 block">
              Specifications (e.g. Model, Technology, Frame, Warranty)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Spec Name (e.g. Technology)"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-600"
              />
              <input
                type="text"
                placeholder="Value (e.g. AMOLED 90Hz)"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-600"
              />
              <button
                type="button"
                onClick={handleAddSpecification}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                Add Spec
              </button>
            </div>

            {Object.entries(specifications).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(specifications).map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-800"
                  >
                    <strong>{k}:</strong> {v}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecification(k)}
                      className="text-slate-400 hover:text-rose-600 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
