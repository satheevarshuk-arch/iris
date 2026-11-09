import React, { useState } from 'react';
import {
  FolderGit2,
  Search,
  Plus,
  Star,
  FileText,
  BookOpen,
  Trash2,
  Eye,
  Download,
  Filter,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LibraryResource } from '../../types';

export const DigitalLibrary: React.FC = () => {
  const { library, addLibraryItem, deleteLibraryItem, toggleFavoriteLibraryItem, profile } =
    useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<LibraryResource | null>(null);

  // New resource form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<LibraryResource['category']>('Notes');
  const [newSubject, setNewSubject] = useState(profile.favoriteSubject || 'Physics');
  const [newDescription, setNewDescription] = useState('');
  const [newContent, setNewContent] = useState('');

  const categories = ['All', 'Textbooks', 'Notes', 'PDFs', 'Worksheets', 'Formulas', 'Sample Papers'];

  const filteredItems = library.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesFav = !showFavoritesOnly || item.isFavorite;
    return matchesSearch && matchesCategory && matchesFav;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addLibraryItem({
      title: newTitle.trim(),
      category: newCategory,
      subject: newSubject,
      description: newDescription.trim() || 'Student uploaded study material',
      content: newContent.trim() || undefined,
      isFavorite: false,
    });

    setNewTitle('');
    setNewDescription('');
    setNewContent('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Personal Knowledge Vault
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Digital Student Library</h1>
          <p className="text-xs text-slate-400">
            Organized textbooks, formula books, worksheets, sample papers, and saved academic guides.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border-indigo-900/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources, textbooks, formulas..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs glass-input text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'glass-input text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              showFavoritesOnly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'glass-input text-slate-400 hover:text-white'
            }`}
          >
            <Star size={13} className={showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''} />
            <span>Starred</span>
          </button>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="glass-card p-5 rounded-2xl flex flex-col justify-between border-indigo-900/30 group hover:border-cyan-400/40 relative"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-950/80 text-cyan-300 border border-indigo-500/20">
                  {item.category}
                </span>

                <button
                  onClick={() => toggleFavoriteLibraryItem(item.id)}
                  className="text-slate-500 hover:text-amber-400 transition-colors p-1"
                >
                  <Star
                    size={15}
                    className={item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                  />
                </button>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-2">
                {item.title}
              </h3>

              <div className="text-[11px] text-indigo-300 font-medium mt-1">
                {item.subject}
              </div>

              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-indigo-900/20 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Added: {item.dateAdded}</span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="p-1.5 rounded-lg glass-input text-slate-300 hover:text-cyan-300 transition-colors"
                  title="Preview Material"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => deleteLibraryItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove from Library"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full glass-panel p-10 rounded-2xl text-center text-slate-400 text-xs">
            No library resources matched your criteria. Add one with the "Add Resource" button!
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-panel-glow rounded-2xl p-6 border border-cyan-500/40 text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white mb-3">Add Library Resource</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Reaction Mechanisms or Sample Paper 2026"
                  className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl glass-input text-slate-200 focus:outline-none"
                  >
                    <option value="Textbooks">Textbooks</option>
                    <option value="Notes">Notes</option>
                    <option value="PDFs">PDFs</option>
                    <option value="Worksheets">Worksheets</option>
                    <option value="Formulas">Formulas</option>
                    <option value="Sample Papers">Sample Papers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Chemistry"
                    className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief synopsis or reference notes"
                  className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Content / Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste text notes or equations here..."
                  className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold transition-all cursor-pointer shadow-md"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-400/40 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-950 text-cyan-300 border border-indigo-500/20">
                {previewItem.category} • {previewItem.subject}
              </span>
              <h2 className="text-xl font-bold text-white mt-1.5">{previewItem.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{previewItem.description}</p>
            </div>

            {previewItem.content ? (
              <div className="p-4 rounded-2xl bg-black/40 border border-indigo-900/30 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                {previewItem.content}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-900/30 text-center text-xs text-slate-400">
                Standard digital textbook reference document cataloged for your curriculum.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
