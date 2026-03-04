import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Download, Sparkles, Loader2, Moon, Mountain, 
  Box, Stars, Ghost, X, Info, ShieldCheck, Monitor, Smartphone, 
  ArrowRight, Zap, Heart, Bookmark, Share2, Copy, Check 
} from 'lucide-react';

const CATEGORIES = [
  { name: "Curated", query: "4k wallpaper aesthetic", icon: <Sparkles size={18} /> },
  { name: "Landscape", query: "8k nature cinematic", icon: <Mountain size={18} /> },
  { name: "Abstract", query: "3d minimal render white", icon: <Box size={18} /> },
  { name: "Amoled", query: "pure black amoled wallpaper", icon: <Moon size={18} /> },
  { name: "Saved", query: "SAVED_ITEMS", icon: <Bookmark size={18} /> }
];

const App = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Curated");
  const [searchQuery, setSearchQuery] = useState("");
  const [orientation, setOrientation] = useState("landscape");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [view, setView] = useState('gallery');
  const [copiedId, setCopiedId] = useState(null);
  const [savedWallpapers, setSavedWallpapers] = useState(() => {
    const localData = localStorage.getItem('wallux_saved');
    return localData ? JSON.parse(localData) : [];
  });

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem('wallux_saved', JSON.stringify(savedWallpapers));
  }, [savedWallpapers]);

  // --- Functions ---
  const toggleSave = (e, img) => {
    e.stopPropagation();
    const isSaved = savedWallpapers.find(item => item.id === img.id);
    if (isSaved) {
      setSavedWallpapers(prev => prev.filter(item => item.id !== img.id));
    } else {
      setSavedWallpapers(prev => [img, ...prev]);
    }
  };

  const copyToClipboard = (e, url, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadImage = async (url, id) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Wallux-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const fetchWallpapers = useCallback(async (isNewSearch = false) => {
    if (activeCategory === "Saved") {
      setWallpapers(savedWallpapers);
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const query = searchQuery || CATEGORIES.find(c => c.name === activeCategory).query;
      const targetPage = isNewSearch ? 1 : page;
      const response = await fetch(`/api/pexels?query=${encodeURIComponent(query)}&page=${targetPage}&orientation=${orientation}`);
      const data = await response.json();
      if (data.photos) {
        const formatted = data.photos.map(p => ({
          id: p.id, url: p.src.large2x, hd: p.src.original, photographer: p.photographer
        }));
        setWallpapers(prev => isNewSearch ? formatted : [...prev, ...formatted]);
        setPage(targetPage + 1);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [activeCategory, searchQuery, page, loading, orientation, savedWallpapers]);

  useEffect(() => { fetchWallpapers(true); }, [activeCategory, orientation]);

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row relative z-10">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-85 p-8 lg:h-screen lg:sticky lg:top-0 border-r border-white/5 bg-black/40 backdrop-blur-3xl">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
               <Zap className="text-black fill-black" size={24} />
            </div>
            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Wallux</h1>
          </div>
          
          <div className="space-y-8">
            <div className="relative group">
              <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-1">
                <Search className="text-zinc-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  className="w-full bg-transparent border-none py-4 px-3 text-sm text-white outline-none placeholder:text-zinc-700" 
                  placeholder="Search assets..." 
                  onKeyDown={(e) => e.key === 'Enter' && fetchWallpapers(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <nav className="space-y-2">
              {CATEGORIES.map((c) => (
                <button key={c.name} onClick={() => { setActiveCategory(c.name); setView('gallery'); }} 
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${activeCategory === c.name && view === 'gallery' ? 'bg-white text-black font-bold' : 'hover:bg-white/5 opacity-60'}`}>
                  <span className="flex items-center gap-4 text-[10px] tracking-widest uppercase">{c.icon} {c.name}</span>
                  {c.name === "Saved" && savedWallpapers.length > 0 && <span className="text-[10px] bg-cyan-500 text-black px-2 py-0.5 rounded-full">{savedWallpapers.length}</span>}
                </button>
              ))}
            </nav>

            <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
              <button onClick={() => setView('about')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest"><Info size={18}/> About</button>
              <button onClick={() => setView('privacy')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-widest"><ShieldCheck size={18}/> Legal</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-16">
          {view === 'gallery' ? (
            <>
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
                <div>
                  <h2 className="text-7xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85] italic mb-6">
                    {activeCategory === "Saved" ? "COLLECTION" : "PREMIUM"} <br/><span className="text-zinc-800 outline-text">VISUALS.</span>
                  </h2>
                </div>
                
                <div className="flex bg-zinc-900/50 p-1.5 rounded-[2rem] border border-white/5">
                  <button onClick={() => setOrientation('landscape')} className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black tracking-widest transition-all ${orientation === 'landscape' ? 'bg-white text-black shadow-xl' : 'text-zinc-500'}`}>DESKTOP</button>
                  <button onClick={() => setOrientation('portrait')} className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black tracking-widest transition-all ${orientation === 'portrait' ? 'bg-white text-black shadow-xl' : 'text-zinc-500'}`}>MOBILE</button>
                </div>
              </header>

              <div className={`grid gap-12 ${orientation === 'landscape' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {wallpapers.map((img, i) => (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={`${img.id}-${i}`} className="group relative">
                    <div 
                      className={`relative rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer ${orientation === 'landscape' ? 'aspect-[16/10]' : 'aspect-[9/16]'}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                      
                      {/* Floating Actions */}
                      <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <button onClick={(e) => toggleSave(e, img)} className={`p-4 rounded-full backdrop-blur-3xl border border-white/10 ${savedWallpapers.find(s => s.id === img.id) ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-black/40 text-white hover:bg-white hover:text-black'}`}>
                          <Heart size={18} fill={savedWallpapers.find(s => s.id === img.id) ? "currentColor" : "none"} />
                        </button>
                        <button onClick={(e) => copyToClipboard(e, img.hd, img.id)} className="p-4 rounded-full bg-black/40 backdrop-blur-3xl text-white border border-white/10 hover:bg-white hover:text-black transition-all relative">
                          {copiedId === img.id ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); downloadImage(img.hd, img.id); }} className="p-4 rounded-full bg-black/40 backdrop-blur-3xl text-white border border-white/10 hover:bg-white hover:text-black transition-all">
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {activeCategory !== "Saved" && (
                <div className="mt-32 flex justify-center pb-20">
                  <button onClick={() => fetchWallpapers(false)} className="px-20 py-6 border border-white/10 rounded-full text-[10px] font-black tracking-[0.5em] hover:bg-white hover:text-black transition-all uppercase">
                    {loading ? <Loader2 className="animate-spin" /> : "Discover More"}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Legal/About View */
             <div className="max-w-3xl py-12">
                <h2 className="text-4xl font-black text-white mb-10 italic uppercase border-b border-white/10 pb-6">{view}</h2>
                <div className="text-zinc-500 text-sm leading-relaxed space-y-8">
                  <p>Wallux Pro delivers uncompromised visual assets. All images are subject to the Pexels Open License.</p>
                  <p>We respect your privacy. No personal data is harvested during your session. Google AdSense integration ensures our servers stay operational.</p>
                </div>
                <button onClick={() => setView('gallery')} className="mt-16 text-white border-b-2 border-white pb-2 font-black text-[10px] tracking-widest uppercase">Back to Visuals</button>
             </div>
          )}
        </main>
      </div>

      {/* Modal View */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8" onClick={() => setSelectedImage(null)}>
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative max-w-6xl w-full text-center" onClick={e => e.stopPropagation()}>
                <img src={selectedImage.hd} className="w-full max-h-[70vh] object-contain rounded-[2rem] mb-10 shadow-2xl" />
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="text-left">
                    <h4 className="text-white text-4xl font-black italic tracking-tighter uppercase">Source Origin</h4>
                    <p className="text-zinc-600 text-[10px] tracking-[0.4em] uppercase mt-2">Asset ID: {selectedImage.id} • Photographer: {selectedImage.photographer}</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={() => downloadImage(selectedImage.hd, selectedImage.id)} className="flex-1 md:px-12 py-5 bg-white text-black font-black text-[10px] tracking-widest uppercase rounded-2xl hover:bg-cyan-500 transition-all">Download Master</button>
                  </div>
                </div>
                <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white opacity-20 hover:opacity-100"><X size={32}/></button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
                      
