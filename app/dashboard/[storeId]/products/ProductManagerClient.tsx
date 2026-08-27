'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Mic, Image as ImageIcon, Barcode, FileSpreadsheet, Search, Check, Sparkles, AlertCircle, X, Trash2, Edit3, Package, Camera, Upload, RefreshCw, Video, VideoOff, FileUp, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import { createProductAction, bulkImportProductsAction, parseVoiceProductAction, parseImageCatalogAction, ProductInput } from '@/app/actions/products';

interface ProductManagerClientProps {
  store: any;
}

export default function ProductManagerClient({ store }: ProductManagerClientProps) {
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'MANUAL' | 'CSV' | 'BARCODE' | 'IMAGE_AI' | 'VOICE_AI'>('CATALOG');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Method A — Manual Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(store.categories[0]?.id || '');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('10');
  const [unit, setUnit] = useState('piece');
  const [sku, setSku] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [description, setDescription] = useState('');

  // Method B — CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedCsvData, setParsedCsvData] = useState<ProductInput[]>([]);

  // Method C — Barcode State
  const [scannedBarcode, setScannedBarcode] = useState('');

  // Method D — Image AI State (Upload vs Camera)
  const [imageInputMode, setImageInputMode] = useState<'UPLOAD' | 'CAMERA' | 'URL'>('UPLOAD');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [draftProducts, setDraftProducts] = useState<ProductInput[]>([]);

  // Camera stream refs & states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Method E — Voice AI State
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceDraft, setVoiceDraft] = useState<ProductInput | null>(null);

  // Cleanup camera stream when tab changes or unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload an image file from your device gallery.');
      setIsCameraActive(false);
    }
  };

  // Attach stream to video element when videoRef becomes ready
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewImage(dataUrl);
      setImageUrl(dataUrl);
      stopCamera();
      // Auto run AI vision scan on captured photo
      handleScanImageAi(dataUrl);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreviewImage(dataUrl);
        setImageUrl(dataUrl);
        // Auto run AI vision scan on uploaded photo
        handleScanImageAi(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter products
  const filteredProducts = store.products.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle Manual Product Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Product Name and Price are required.');
      return;
    }
    setLoading(true);
    const res = await createProductAction(store.id, {
      name,
      categoryId: categoryId || undefined,
      price: parseFloat(price),
      mrp: mrp ? parseFloat(mrp) : parseFloat(price),
      stock: parseInt(stock || '0'),
      unit,
      sku: sku || undefined,
      barcode: barcodeInput || undefined,
      description
    });
    setLoading(false);

    if (res.success) {
      setMessage('✅ Product created successfully!');
      setName('');
      setPrice('');
      setMrp('');
      setActiveTab('CATALOG');
    } else {
      alert(res.error || 'Failed to create product.');
    }
  };

  // Method B — CSV Parsing
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const items: ProductInput[] = results.data.map((row: any) => ({
            name: row.name || row.Name || row['Product Name'] || 'CSV Item',
            price: parseFloat(row.price || row.Price || row['Selling Price'] || '100'),
            mrp: parseFloat(row.mrp || row.MRP || row.price || '100'),
            stock: parseInt(row.stock || row.Stock || row.Quantity || '10'),
            unit: row.unit || row.Unit || 'piece',
            sku: row.sku || row.SKU || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
            description: row.description || row.Description || ''
          }));
          setParsedCsvData(items);
        }
      });
    }
  };

  const handleBulkCsvImport = async () => {
    if (parsedCsvData.length === 0) return;
    setLoading(true);
    const res = await bulkImportProductsAction(store.id, parsedCsvData);
    setLoading(false);

    if (res.success) {
      setMessage(`✅ Imported ${res.createdCount} products from CSV!`);
      setParsedCsvData([]);
      setActiveTab('CATALOG');
    } else {
      alert(res.error || 'Failed to import CSV.');
    }
  };

  // Method D — Image AI Draft Analysis
  const handleScanImageAi = async (overrideImg?: string) => {
    const targetImg = overrideImg || imageUrl;
    if (!targetImg) {
      alert('Please select an image file or take a camera snapshot first.');
      return;
    }
    setLoading(true);
    const res = await parseImageCatalogAction(store.id, targetImg);
    setLoading(false);
    if (res.success && res.draftProducts) {
      setDraftProducts(res.draftProducts);
    }
  };

  const handleApproveDraft = async (draft: ProductInput) => {
    setLoading(true);
    const res = await createProductAction(store.id, draft);
    setLoading(false);
    if (res.success) {
      setDraftProducts(prev => prev.filter(p => p.name !== draft.name));
      setMessage(`✅ Approved & Published "${draft.name}" to store catalog!`);
    } else {
      alert(res.error || 'Failed to approve item.');
    }
  };

  const handleApproveAllDrafts = async () => {
    if (draftProducts.length === 0) return;
    setLoading(true);
    const res = await bulkImportProductsAction(store.id, draftProducts);
    setLoading(false);
    if (res.success) {
      setMessage(`✅ Approved and published all ${res.createdCount} draft products to store catalog!`);
      setDraftProducts([]);
      setActiveTab('CATALOG');
    }
  };

  // Method E — Speech Recognition & Voice Parse
  const startVoiceListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported in this browser. Please type voice text manually below.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      setIsListening(false);
      handleParseVoiceCommand(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  };

  const handleParseVoiceCommand = async (textToParse: string) => {
    if (!textToParse) return;
    setLoading(true);
    const res = await parseVoiceProductAction(store.id, textToParse);
    setLoading(false);
    if (res.success && res.draftProduct) {
      setVoiceDraft(res.draftProduct);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Top Header & AI Import Method Selector Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" />
            <span>Product Catalog & 5 AI Import Tools</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total Items: <strong className="text-emerald-600 font-bold">{store.products.length}</strong>. Choose any method below to add items.
          </p>
        </div>

        {/* 5 Import Method Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => { stopCamera(); setActiveTab('CATALOG'); }}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'CATALOG' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Catalog View
          </button>
          <button
            onClick={() => { stopCamera(); setActiveTab('MANUAL'); }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1 transition ${
              activeTab === 'MANUAL' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Manual</span>
          </button>
          <button
            onClick={() => { stopCamera(); setActiveTab('CSV'); }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1 transition ${
              activeTab === 'CSV' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>CSV Import</span>
          </button>
          <button
            onClick={() => { stopCamera(); setActiveTab('BARCODE'); }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1 transition ${
              activeTab === 'BARCODE' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Barcode className="h-4 w-4 text-indigo-600" />
            <span>Barcode</span>
          </button>
          <button
            onClick={() => { setActiveTab('IMAGE_AI'); }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1 transition ${
              activeTab === 'IMAGE_AI' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="h-4 w-4 text-teal-600" />
            <span>Image AI Draft</span>
          </button>
          <button
            onClick={() => { stopCamera(); setActiveTab('VOICE_AI'); }}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1 transition ${
              activeTab === 'VOICE_AI' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Mic className="h-4 w-4 text-amber-600" />
            <span>Voice AI</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* TAB 1: Catalog Table */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none shadow-xs"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Price / MRP</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Unit</th>
                  <th className="py-3.5 px-4">SKU / Barcode</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-semibold">
                      No products added yet. Click <strong>Manual</strong>, <strong>CSV Import</strong>, or <strong>Image AI Draft</strong> above to add items to your store catalog.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'} alt="" className="h-9 w-9 rounded-lg object-cover border border-slate-200" />
                        <div>
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[10px] text-slate-500">{p.category?.name || 'General'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{p.price} {p.mrp > p.price && <span className="text-[10px] text-slate-400 line-through ml-1">₹{p.mrp}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${p.stock <= 5 ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.unit || 'piece'}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{p.sku || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          In Stock
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Method A — Manual Form */}
      {activeTab === 'MANUAL' && (
        <form onSubmit={handleManualSubmit} className="p-8 rounded-3xl bg-white border border-slate-200 max-w-2xl space-y-4 shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-900 mb-4">Method A — Manual Product Builder</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Amul Gold Full Cream Milk 1L"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                placeholder="145"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">MRP (₹)</label>
              <input
                type="number"
                placeholder="165"
                value={mrp}
                onChange={e => setMrp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-emerald-600 focus:outline-none"
              >
                <option value="piece">piece</option>
                <option value="packet">packet</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="litre">litre</option>
                <option value="ml">ml</option>
                <option value="box">box</option>
                <option value="service">service</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Save & Publish Product'}
          </button>
        </form>
      )}

      {/* TAB 3: Method B — CSV Upload */}
      {activeTab === 'CSV' && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-2xl space-y-6 shadow-sm">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
              <span>Method B — Excel / CSV Bulk Parser</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Upload CSV file containing columns: Name, Price, MRP, Stock, Unit, SKU.</p>
          </div>

          <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50 hover:border-emerald-600 transition">
            <input type="file" accept=".csv" onChange={handleCsvFileChange} className="hidden" id="csv-file-input" />
            <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
              <FileSpreadsheet className="h-10 w-10 text-emerald-600 mx-auto" />
              <span className="font-bold text-sm text-slate-900 block">Click to select CSV File</span>
              <span className="text-xs text-slate-500">Auto detects columns and maps attributes</span>
            </label>
          </div>

          {parsedCsvData.length > 0 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-emerald-700">Detected {parsedCsvData.length} valid products in CSV:</span>
              <div className="max-h-48 overflow-y-auto bg-slate-50 rounded-xl p-3 divide-y divide-slate-200 text-xs border border-slate-200">
                {parsedCsvData.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-slate-500">₹{item.price} • Stock: {item.stock}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleBulkCsvImport}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition shadow-md"
              >
                {loading ? 'Importing...' : `Confirm Import ${parsedCsvData.length} Products`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Method C — Barcode Scanner */}
      {activeTab === 'BARCODE' && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-2xl space-y-6 shadow-sm text-center">
          <div>
            <Barcode className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
            <h3 className="text-xl font-extrabold text-slate-900">Method C — Barcode Scanner & Lookup</h3>
            <p className="text-xs text-slate-500 mt-1">Scan physical barcode using USB scanner or device camera to auto-fill FMCG details.</p>
          </div>

          <div className="max-w-md mx-auto space-y-3">
            <input
              type="text"
              placeholder="Scan or enter 13-digit EAN Barcode..."
              value={scannedBarcode}
              onChange={e => setScannedBarcode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center text-sm focus:border-indigo-600 focus:outline-none"
            />

            <button
              onClick={() => {
                setName('Scanned FMCG Item ' + scannedBarcode.slice(-4));
                setPrice('99');
                setBarcodeInput(scannedBarcode);
                setActiveTab('MANUAL');
              }}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-xs"
            >
              Lookup & Add Scanned Item
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Method D — Image AI Catalog Drafter with File Upload & Live Camera Scan */}
      {activeTab === 'IMAGE_AI' && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-3xl space-y-6 shadow-sm">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-teal-600" />
              <span>Method D — Image AI Catalog Drafter</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload product/shelf photo or use live camera scanner. AI extracts items requiring your approval before publishing.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 w-fit text-xs font-bold">
            <button
              onClick={() => { stopCamera(); setImageInputMode('UPLOAD'); }}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
                imageInputMode === 'UPLOAD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="h-4 w-4 text-emerald-600" />
              <span>Upload Image File</span>
            </button>

            <button
              onClick={() => { setImageInputMode('CAMERA'); startCamera(); }}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
                imageInputMode === 'CAMERA' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="h-4 w-4 text-teal-600" />
              <span>Live Camera Scanner</span>
            </button>

            <button
              onClick={() => { stopCamera(); setImageInputMode('URL'); }}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
                imageInputMode === 'URL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileUp className="h-4 w-4 text-indigo-600" />
              <span>Image URL</span>
            </button>
          </div>

          {/* Option 1: File Upload Zone */}
          {imageInputMode === 'UPLOAD' && (
            <div className="space-y-4">
              <div className="p-8 border-2 border-dashed border-teal-300 rounded-3xl text-center bg-teal-50/50 hover:bg-teal-50 transition relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  id="product-image-upload"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto font-bold">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    Click or Drag & Drop Product / Shelf Photo Here
                  </span>
                  <span className="text-xs text-slate-500 block">
                    Supports JPG, PNG, WEBP from your computer or phone gallery
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Option 2: Live Camera Viewfinder */}
          {imageInputMode === 'CAMERA' && (
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-between">
                  <span>{cameraError}</span>
                  <button
                    onClick={startCamera}
                    className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold flex items-center gap-1 hover:bg-amber-700"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Try Again
                  </button>
                </div>
              ) : (
                <div className="relative rounded-3xl overflow-hidden border-2 border-teal-500 bg-slate-900 shadow-lg text-center">
                  {isCameraActive ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 sm:h-80 object-cover rounded-3xl"
                      />
                      {/* Targeting Reticle Frame */}
                      <div className="absolute inset-0 border-2 border-dashed border-teal-400/80 rounded-3xl pointer-events-none flex items-center justify-center">
                        <span className="bg-slate-900/80 text-teal-300 text-[11px] font-mono px-3 py-1 rounded-full border border-teal-500/50">
                          Align Product or Menu Shelf in Frame
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                        <button
                          onClick={captureCameraPhoto}
                          disabled={loading}
                          className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-xl ring-4 ring-teal-500/30"
                        >
                          <Camera className="h-5 w-5" />
                          <span>📸 Take Photo & Extract Details</span>
                        </button>
                        <button
                          onClick={stopCamera}
                          className="p-3 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 transition"
                          title="Close Camera"
                        >
                          <VideoOff className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-4">
                      <Camera className="h-12 w-12 text-teal-400 mx-auto" />
                      <div>
                        <h4 className="font-extrabold text-sm text-white">Device Camera Viewfinder Ready</h4>
                        <p className="text-xs text-slate-400 mt-1">Point your camera at a shelf, product package, or physical menu card.</p>
                      </div>
                      <button
                        onClick={startCamera}
                        className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition flex items-center gap-2 mx-auto shadow-md"
                      >
                        <Video className="h-4 w-4" />
                        <span>Start Camera Stream</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Option 3: Image URL Input */}
          {imageInputMode === 'URL' && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Paste Image URL..."
                value={imageUrl}
                onChange={e => {
                  setImageUrl(e.target.value);
                  setPreviewImage(e.target.value);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-teal-600 focus:outline-none"
              />
              <button
                onClick={() => handleScanImageAi()}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="h-4 w-4" />
                <span>Run AI Vision Draft</span>
              </button>
            </div>
          )}

          {/* Uploaded / Captured Image Preview Box */}
          {previewImage && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={previewImage} alt="Scanned product preview" className="h-16 w-16 rounded-xl object-cover border border-slate-300 shadow-xs" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Image Loaded & Processing</span>
                  <span className="text-[11px] text-teal-700 font-semibold">AI Vision Parsing Active</span>
                </div>
              </div>

              <button
                onClick={() => handleScanImageAi(previewImage)}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="h-4 w-4" />
                <span>{loading ? 'Analyzing Vision AI...' : 'Re-run Vision Scan'}</span>
              </button>
            </div>
          )}

          {/* Draft Proposals Identified by Vision AI */}
          {draftProducts.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-teal-700 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Identified Product Proposals ({draftProducts.length})</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Review and adjust extracted details before adding to store catalog.</p>
                </div>

                <button
                  onClick={handleApproveAllDrafts}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approve All ({draftProducts.length})</span>
                </button>
              </div>

              <div className="space-y-3">
                {draftProducts.map((draft, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-teal-500 transition">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={draft.name}
                          onChange={e => {
                            const updated = [...draftProducts];
                            updated[idx].name = e.target.value;
                            setDraftProducts(updated);
                          }}
                          className="font-bold text-sm text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 focus:outline-none"
                        />
                        {draft.isVeg && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Veg
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                        <label className="flex items-center gap-1">
                          <span>Price: ₹</span>
                          <input
                            type="number"
                            value={draft.price}
                            onChange={e => {
                              const updated = [...draftProducts];
                              updated[idx].price = Number(e.target.value);
                              setDraftProducts(updated);
                            }}
                            className="w-16 px-1 py-0.5 rounded bg-slate-50 border border-slate-200 font-bold text-slate-900"
                          />
                        </label>

                        <label className="flex items-center gap-1">
                          <span>Stock:</span>
                          <input
                            type="number"
                            value={draft.stock}
                            onChange={e => {
                              const updated = [...draftProducts];
                              updated[idx].stock = Number(e.target.value);
                              setDraftProducts(updated);
                            }}
                            className="w-16 px-1 py-0.5 rounded bg-slate-50 border border-slate-200 font-bold text-slate-900"
                          />
                        </label>

                        <span className="text-[11px] text-slate-400">Unit: {draft.unit || 'piece'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveDraft(draft)}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve & Publish</span>
                      </button>

                      <button
                        onClick={() => setDraftProducts(prev => prev.filter((_, i) => i !== idx))}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                        title="Remove Proposal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Method E — Voice AI Speech-to-Product */}
      {activeTab === 'VOICE_AI' && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-2xl space-y-6 shadow-sm text-center">
          <div>
            <Mic className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <h3 className="text-xl font-extrabold text-slate-900">Method E — Voice AI Speech-to-Product</h3>
            <p className="text-xs text-slate-500 mt-1">
              Speak or type natural Indian merchant commands e.g. <em className="text-amber-700 font-semibold">"Add Amul Gold milk 1 litre, selling price 70, stock 20"</em>
            </p>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <button
              onClick={startVoiceListening}
              className={`w-full py-4 rounded-2xl font-extrabold text-sm transition flex items-center justify-center gap-2 ${
                isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
              }`}
            >
              <Mic className="h-5 w-5" />
              <span>{isListening ? 'Listening to speech...' : 'Click to Speak Voice Command'}</span>
            </button>

            <textarea
              rows={2}
              placeholder="Or type voice text manually here..."
              value={voiceText}
              onChange={e => setVoiceText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-600 focus:outline-none"
            />

            <button
              onClick={() => handleParseVoiceCommand(voiceText)}
              disabled={loading || !voiceText}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition shadow-sm"
            >
              Parse Voice Command with AI
            </button>
          </div>

          {voiceDraft && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-amber-200 text-left space-y-3">
              <span className="text-xs font-bold text-amber-800 block">AI Voice Parsed Result:</span>
              <div className="text-xs text-slate-800 space-y-1">
                <p>• Name: <strong>{voiceDraft.name}</strong></p>
                <p>• Price: <strong>₹{voiceDraft.price}</strong></p>
                <p>• Unit: <strong>{voiceDraft.unit}</strong></p>
                <p>• Stock: <strong>{voiceDraft.stock}</strong></p>
              </div>

              <button
                onClick={() => handleApproveDraft(voiceDraft)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
              >
                Approve & Publish to Catalog
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
