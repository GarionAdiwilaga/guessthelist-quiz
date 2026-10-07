import React, { useState, useEffect, useRef } from 'react';
import { QuizCategory, QuizItem, QuizDatabase } from '../../types/quiz';
import {
  X,
  Upload,
  Download,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  AlertCircle,
  RotateCcw,
  FileText,
  Edit3,
  Database
} from 'lucide-react';

interface DataEditorModalProps {
  isOpen: boolean;
  categories: QuizCategory[];
  onClose: () => void;
  onSaveCategories: (updatedCategories: QuizCategory[]) => void;
  onUpdateDatabank: (updatedDatabase: QuizDatabase) => void;
}

export const DataEditorModal: React.FC<DataEditorModalProps> = ({
  isOpen,
  categories: initialCategories,
  onClose,
  onSaveCategories,
  onUpdateDatabank
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [categories, setCategories] = useState<QuizCategory[]>(initialCategories);
  const [selectedCatId, setSelectedCatId] = useState<number>(
    initialCategories[0]?.id || 1
  );

  // JSON Tab state
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccess, setJsonSuccess] = useState<string | null>(null);

  // Status feedback
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when opened or props update
  useEffect(() => {
    if (isOpen) {
      setCategories(JSON.parse(JSON.stringify(initialCategories)));
      if (initialCategories.length > 0 && !initialCategories.some((c) => c.id === selectedCatId)) {
        setSelectedCatId(initialCategories[0].id);
      }
      const fullDb: QuizDatabase = {
        quizType: 'top10_list',
        title: 'Family Wibu 100 - Databank',
        language: 'id',
        categories: initialCategories
      };
      setJsonText(JSON.stringify(fullDb, null, 2));
      setJsonError(null);
      setJsonSuccess(null);
      setSaveStatus(null);
    }
  }, [isOpen, initialCategories]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCategory =
    categories.find((c) => c.id === selectedCatId) || categories[0];

  // Visual Tab Handlers
  const handleUpdateCategoryField = (
    field: keyof Omit<QuizCategory, 'id' | 'items'>,
    value: string
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === selectedCatId) {
          return { ...cat, [field]: value };
        }
        return cat;
      })
    );
  };

  const handleUpdateItemField = (
    itemId: number,
    field: keyof QuizItem,
    value: any
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === selectedCatId) {
          const updatedItems = cat.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, [field]: value };
            }
            return item;
          });
          return { ...cat, items: updatedItems };
        }
        return cat;
      })
    );
  };

  const handleAddCategory = () => {
    const nextId =
      categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const newCat: QuizCategory = {
      id: nextId,
      category: 'Kategori Baru',
      emoji: '✨',
      clue: 'Deskripsi petunjuk kategori',
      answerType: 'Karakter',
      items: Array.from({ length: 10 }, (_, i) => ({
        id: nextId * 100 + i + 1,
        rank: i + 1,
        answer: `Jawaban #${i + 1}`,
        anime: 'Anime Populer',
        aliases: [],
        reason: 'Alasan atau petunjuk untuk slot ini'
      }))
    };
    setCategories((prev) => [...prev, newCat]);
    setSelectedCatId(nextId);
  };

  const handleDeleteCategory = (catId: number) => {
    if (categories.length <= 1) {
      alert('Minimal harus memiliki 1 kategori dalam kuis!');
      return;
    }
    if (confirm('Yakin ingin menghapus kategori ini beserta seluruh jawabannya?')) {
      const remaining = categories.filter((c) => c.id !== catId);
      setCategories(remaining);
      if (selectedCatId === catId) {
        setSelectedCatId(remaining[0].id);
      }
    }
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;
    const copy = [...categories];
    const [removed] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, removed);
    setCategories(copy);
  };

  const handleAddItem = () => {
    if (!currentCategory) return;
    const nextRank = currentCategory.items.length + 1;
    const nextItemId =
      currentCategory.items.reduce((max, it) => Math.max(max, it.id), 0) + 1;
    const newItem: QuizItem = {
      id: nextItemId,
      rank: nextRank,
      answer: `Jawaban #${nextRank}`,
      anime: '',
      aliases: [],
      reason: ''
    };
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === selectedCatId) {
          return { ...cat, items: [...cat.items, newItem] };
        }
        return cat;
      })
    );
  };

  const handleDeleteItem = (itemId: number) => {
    if (!currentCategory) return;
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === selectedCatId) {
          const filtered = cat.items.filter((it) => it.id !== itemId);
          // Re-rank items consecutively
          const reRanked = filtered.map((it, idx) => ({ ...it, rank: idx + 1 }));
          return { ...cat, items: reRanked };
        }
        return cat;
      })
    );
  };

  const handleSaveVisual = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      onSaveCategories(categories);
      // Also post to REST endpoint for persistence guarantee
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories })
      });
      if (!res.ok) throw new Error('Gagal menyimpan ke server');
      setSaveStatus('Kategori berhasil disimpan dan disinkronkan ke seluruh layar!');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // JSON Tab Handlers
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError('Format JSON tidak valid: ' + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.categories || !Array.isArray(parsed.categories)) {
          setJsonError('File JSON tidak valid: Properti "categories" array tidak ditemukan.');
          return;
        }
        setJsonText(JSON.stringify(parsed, null, 2));
        setJsonError(null);
        setJsonSuccess(`File "${file.name}" berhasil dimuat! Klik "Terapkan & Simpan" untuk memperbarui.`);
      } catch (err: any) {
        setJsonError('Gagal membaca file JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportJson = () => {
    try {
      const fullDb: QuizDatabase = {
        quizType: 'top10_list',
        title: 'Family Wibu 100 - Databank',
        language: 'id',
        categories: categories
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullDb, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'anime-family-databank.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert('Gagal mengekspor: ' + err.message);
    }
  };

  const handleApplyJson = async () => {
    setIsSaving(true);
    setJsonError(null);
    setJsonSuccess(null);
    try {
      const parsed = JSON.parse(jsonText);
      let newCats: QuizCategory[] = [];
      let fullDb: QuizDatabase;

      if (Array.isArray(parsed)) {
        newCats = parsed;
        fullDb = { categories: newCats };
      } else if (parsed.categories && Array.isArray(parsed.categories)) {
        newCats = parsed.categories;
        fullDb = parsed;
      } else {
        throw new Error('JSON harus memiliki array "categories"');
      }

      if (newCats.length === 0) {
        throw new Error('Array categories tidak boleh kosong');
      }

      // Basic structure validation
      for (let i = 0; i < newCats.length; i++) {
        const cat = newCats[i];
        if (!cat.category) throw new Error(`Kategori #${i + 1} tidak memiliki nama "category"`);
        if (!Array.isArray(cat.items)) throw new Error(`Kategori "${cat.category}" tidak memiliki array "items"`);
      }

      onUpdateDatabank(fullDb);

      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullDb)
      });
      if (!res.ok) throw new Error('Server menolak databank');

      setCategories(newCats);
      setSelectedCatId(newCats[0].id);
      setJsonSuccess('Databank JSON berhasil divalidasi dan disimpan ke server!');
      setTimeout(() => setJsonSuccess(null), 4000);
    } catch (err: any) {
      setJsonError('Gagal menerapkan JSON: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = async () => {
    if (!confirm('Apakah Anda yakin ingin me-reset seluruh databank ke default bawaan? Data custom akan ditimpa.')) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/database/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Gagal reset dari server');
      const data = await res.json();
      if (data.database?.categories) {
        setCategories(data.database.categories);
        setSelectedCatId(data.database.categories[0].id);
        setJsonText(JSON.stringify(data.database, null, 2));
        onUpdateDatabank(data.database);
        setJsonSuccess('Databank berhasil di-reset ke data bawaan!');
        setTimeout(() => setJsonSuccess(null), 4000);
      }
    } catch (err: any) {
      alert('Error saat me-reset: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div
        className="relative w-full max-w-6xl h-[90vh] flex flex-col rounded-2xl bg-[#0B0F2B] border-2 border-[#00F0FF]/50 shadow-[0_0_40px_rgba(0,240,255,0.25)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-editor-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#101642] border-b border-[#1E265C] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF] flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="data-editor-title"
                className="text-base sm:text-lg font-black text-white tracking-wider uppercase font-['Outfit',sans-serif]"
              >
                BANK DATA & EDITOR SOAL
              </h2>
              <p className="text-xs text-gray-400">
                Kelola kategori kuis, modifikasi daftar 10 jawaban, atau impor/ekspor file JSON.
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-[#070A1E] p-1 rounded-xl border border-[#232F6E]">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-[#00F0FF] text-[#0A0D26] shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor Visual</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('json');
                const fullDb: QuizDatabase = {
                  quizType: 'top10_list',
                  title: 'Family Wibu 100 - Databank',
                  language: 'id',
                  categories: categories
                };
                setJsonText(JSON.stringify(fullDb, null, 2));
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-[#FF2E93] text-white shadow-[0_0_10px_rgba(255,46,147,0.5)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>JSON Databank</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer ml-3"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {activeTab === 'visual' ? (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Sidebar: Categories List */}
            <div className="w-full md:w-72 bg-[#080C24] border-b md:border-b-0 md:border-r border-[#1E265C] flex flex-col shrink-0">
              <div className="p-3 border-b border-[#1E265C] flex items-center justify-between">
                <span className="text-xs font-black text-gray-300 uppercase tracking-wider">
                  Kategori ({categories.length})
                </span>
                <button
                  onClick={handleAddCategory}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/60 text-xs font-bold text-[#00F0FF] transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      selectedCatId === cat.id
                        ? 'bg-[#151D4D] border-[#00F0FF] text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'bg-[#0E1438] border-transparent text-gray-400 hover:bg-[#121A45] hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate min-w-0 pr-1">
                      <span className="text-sm shrink-0">{cat.emoji || '📁'}</span>
                      <span className="font-bold truncate">{cat.category}</span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveCategory(idx, 'up');
                        }}
                        disabled={idx === 0}
                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Geser ke Atas"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveCategory(idx, 'down');
                        }}
                        disabled={idx === categories.length - 1}
                        className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Geser ke Bawah"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-200 cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Selected Category & Items Editor */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#0A0E2A] overflow-y-auto p-4 sm:p-6 space-y-6">
              {currentCategory ? (
                <>
                  {/* Category Metadata Fields */}
                  <div className="p-4 rounded-2xl bg-[#0F1640] border border-[#232F6E] space-y-4">
                    <h3 className="text-xs font-black text-[#00F0FF] uppercase tracking-wider">
                      Informasi Kategori
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                          Emoji
                        </label>
                        <input
                          type="text"
                          value={currentCategory.emoji || ''}
                          onChange={(e) => handleUpdateCategoryField('emoji', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#080C22] border border-[#2B3980] text-center text-lg text-white focus:outline-none focus:border-[#00F0FF]"
                          placeholder="🎯"
                        />
                      </div>
                      <div className="sm:col-span-7">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                          Judul Kategori / Tema
                        </label>
                        <input
                          type="text"
                          value={currentCategory.category}
                          onChange={(e) => handleUpdateCategoryField('category', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#080C22] border border-[#2B3980] text-sm font-bold text-white focus:outline-none focus:border-[#00F0FF]"
                          placeholder="Contoh: Karakter Anime Berambut Putih"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                          Tipe Jawaban
                        </label>
                        <input
                          type="text"
                          value={currentCategory.answerType || ''}
                          onChange={(e) => handleUpdateCategoryField('answerType', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#080C22] border border-[#2B3980] text-sm text-white focus:outline-none focus:border-[#00F0FF]"
                          placeholder="Karakter / Judul"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                        Subtitle / Clue Penjelasan Tema
                      </label>
                      <input
                        type="text"
                        value={currentCategory.clue || ''}
                        onChange={(e) => handleUpdateCategoryField('clue', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#080C22] border border-[#2B3980] text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                        placeholder="Deskripsi tema yang tampil saat tombol subtitle dinyalakan..."
                      />
                    </div>
                  </div>

                  {/* 10 Items Editor List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-[#FFD600] uppercase tracking-wider">
                        Daftar Jawaban ({currentCategory.items.length} Slot)
                      </h3>
                      <button
                        onClick={handleAddItem}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#FFD600]/15 hover:bg-[#FFD600]/25 border border-[#FFD600]/60 text-xs font-bold text-[#FFD600] transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Slot Jawaban</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {currentCategory.items.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-[#0F1640] border border-[#232F6E] space-y-2.5 transition hover:border-[#384999]"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-[#1A2355]">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-lg bg-[#FFD600]/20 border border-[#FFD600] text-[#FFD600] flex items-center justify-center text-xs font-black">
                                #{item.rank || index + 1}
                              </span>
                              <span className="text-xs font-bold text-gray-300">
                                Slot Jawaban {index + 1}
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer"
                              title="Hapus Jawaban"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                            <div className="sm:col-span-5">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                                Jawaban Utama
                              </label>
                              <input
                                type="text"
                                value={item.answer}
                                onChange={(e) => handleUpdateItemField(item.id, 'answer', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#080C22] border border-[#2B3980] text-xs font-bold text-white focus:outline-none focus:border-[#00F0FF]"
                                placeholder="Nama jawaban..."
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                                Anime Asal
                              </label>
                              <input
                                type="text"
                                value={item.anime || ''}
                                onChange={(e) => handleUpdateItemField(item.id, 'anime', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#080C22] border border-[#2B3980] text-xs text-white focus:outline-none focus:border-[#FF2E93]"
                                placeholder="Judul anime..."
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                                Alias / Variasi (Pisahkan Koma)
                              </label>
                              <input
                                type="text"
                                value={item.aliases?.join(', ') || ''}
                                onChange={(e) =>
                                  handleUpdateItemField(
                                    item.id,
                                    'aliases',
                                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#080C22] border border-[#2B3980] text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                                placeholder="Alias1, Alias2..."
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-[#FFD600] uppercase mb-0.5">
                              Petunjuk / Alasan (Tampil di "Roll Clue" Popup)
                            </label>
                            <input
                              type="text"
                              value={item.reason || ''}
                              onChange={(e) => handleUpdateItemField(item.id, 'reason', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#080C22] border border-[#2B3980] text-xs text-yellow-100 focus:outline-none focus:border-[#FFD600]"
                              placeholder="Deskripsi petunjuk misterius yang tidak membocorkan nama..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Pilih kategori dari daftar di sebelah kiri atau tambahkan kategori baru.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* JSON Tab */
          <div className="flex-1 flex flex-col min-h-0 bg-[#070A1E] p-4 sm:p-6 space-y-4 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#232F6E] hover:bg-[#2C3B87] text-white text-xs font-bold transition cursor-pointer"
                  title="Unggah file .json dari komputer"
                >
                  <Upload className="w-4 h-4 text-[#00F0FF]" />
                  <span>Impor File JSON</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#232F6E] hover:bg-[#2C3B87] text-white text-xs font-bold transition cursor-pointer"
                  title="Unduh databank saat ini sebagai file .json"
                >
                  <Download className="w-4 h-4 text-[#FFD600]" />
                  <span>Ekspor File JSON</span>
                </button>

                <button
                  onClick={handleFormatJson}
                  className="px-3 py-2 rounded-xl bg-[#182150] hover:bg-[#202C6E] text-gray-300 text-xs font-bold transition cursor-pointer"
                  title="Rapikan indentasi JSON"
                >
                  Rapikan Format (Prettify)
                </button>
              </div>

              <button
                onClick={handleResetDefault}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/50 text-red-400 text-xs font-bold transition cursor-pointer ml-auto"
                title="Kembalikan ke data bawaan anime-family-database-ranked-top10.json"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Default Bawaan</span>
              </button>
            </div>

            {/* Validation Feedback Banners */}
            {jsonError && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/60 flex items-start space-x-2 text-red-200 text-xs shrink-0">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="font-semibold">{jsonError}</span>
              </div>
            )}
            {jsonSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/60 flex items-center space-x-2 text-emerald-200 text-xs shrink-0">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{jsonSuccess}</span>
              </div>
            )}

            {/* Monospace JSON Code Area */}
            <div className="flex-1 min-h-0 relative rounded-xl border border-[#1E265C] overflow-hidden bg-[#040614]">
              <textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setJsonError(null);
                  setJsonSuccess(null);
                }}
                className="w-full h-full p-4 font-mono text-xs text-[#00F0FF] bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-[#00F0FF] leading-relaxed selection:bg-[#FF2E93]/40"
                placeholder='Paste atau edit databank JSON di sini...'
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#0D1236] border-t border-[#1E265C] shrink-0">
          <div className="text-xs">
            {saveStatus && (
              <span
                className={`font-bold flex items-center space-x-1.5 ${
                  saveStatus.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {saveStatus.startsWith('Error') ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{saveStatus}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 transition cursor-pointer"
            >
              Tutup
            </button>

            {activeTab === 'visual' ? (
              <button
                onClick={handleSaveVisual}
                disabled={isSaving}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#0A0D26] font-black text-xs sm:text-sm tracking-wide shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Kategori ke Server'}</span>
              </button>
            ) : (
              <button
                onClick={handleApplyJson}
                disabled={isSaving}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF2E93] to-[#D6005D] text-white font-black text-xs sm:text-sm tracking-wide shadow-[0_0_15px_rgba(255,46,147,0.4)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Memproses...' : 'Terapkan & Simpan JSON Databank'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
