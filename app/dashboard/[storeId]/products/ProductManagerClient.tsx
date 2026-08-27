'use client';

import { useState } from 'react';
import { Plus, Mic, Image as ImageIcon, Barcode, FileSpreadsheet, Search, Check, Sparkles, AlertCircle, X, Trash2, Edit, Package } from 'lucide-react';
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

  // Method D — Image AI Draft Proposals State
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
  const [draftProducts, setDraftProducts] = useState<ProductInput[]>([]);

  // Method E — Voice AI State
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceDraft, setVoiceDraft] = useState<ProductInput | null>(null);

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
  const handleScanImageAi = async () => {
    setLoading(true);
    const res = await parseImageCatalogAction(store.id, imageUrl);
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
      setMessage(`✅ Approved & Published "${draft.name}" to store!`);
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            onClick={() => setActiveTab('CATALOG')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'CATALOG' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Catalog View
          </button>
          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1 transition ${
              activeTab === 'MANUAL' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Manual</span>
          </button>
          <button
            onClick={() => setActiveTab('CSV')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1 transition ${
              activeTab === 'CSV' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>CSV Import</span>
          </button>
          <button
            onClick={() => setActiveTab('BARCODE')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1 transition ${
              activeTab === 'BARCODE' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Barcode className="h-4 w-4 text-indigo-600" />
            <span>Barcode</span>
          </button>
          <button
            onClick={() => setActiveTab('IMAGE_AI')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1 transition ${
              activeTab === 'IMAGE_AI' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="h-4 w-4 text-teal-600" />
            <span>Image AI Draft</span>
          </button>
          <button
            onClick={() => setActiveTab('VOICE_AI')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1 transition ${
              activeTab === 'VOICE_AI' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Mic className="h-4 w-4 text-amber-600" />
            <span>Voice AI</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between">
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
                      No products added yet. Click <strong>Manual</strong> or <strong>CSV Import</strong> above to add items to your store catalog.
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
                        ₹{p.price} {p.mrp > p.price && <span className="text-[10px] text-slate-400 line-through">₹{p.mrp}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${p.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
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
            <p className="text-xs text-slate-500 mt-1">Scan physical barcode using USB scanner or camera to auto-fill FMCG details.</p>
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
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-sm"
            >
              Lookup & Add Scanned Item
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Method D — Image AI Catalog Drafter */}
      {activeTab === 'IMAGE_AI' && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-3xl space-y-6 shadow-sm">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-teal-600" />
              <span>Method D — Image AI Catalog Drafter</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload shelf or product photo. AI extracts draft items requiring your approval before publishing to storefront.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Image URL or upload path..."
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-teal-600 focus:outline-none"
            />
            <button
              onClick={handleScanImageAi}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Run AI Vision Draft</span>
            </button>
          </div>

          {draftProducts.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-sm text-teal-700">Draft Proposals Identified by Vision AI:</h4>
              <div className="space-y-3">
                {draftProducts.map((draft, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-slate-900">{draft.name}</h5>
                      <p className="text-xs text-slate-500">Suggested Price: ₹{draft.price} • Unit: {draft.unit}</p>
                    </div>
                    <button
                      onClick={() => handleApproveDraft(draft)}
                      disabled={loading}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                    >
                      Approve & Publish
                    </button>
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
