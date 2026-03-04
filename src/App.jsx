import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Download, Sparkles, Loader2, Moon, Mountain, 
  Box, Stars, X, Monitor, Smartphone, Menu, Trees, Tv, Heart, Share2, Zap, Info, ShieldCheck 
} from 'lucide-react';

const CATEGORIES = [
  { name: "Curated", query: "4k wallpaper aesthetic ultra hd", icon: <Sparkles size={18} /> },
  { name: "Anime", query: "anime scenery 4k art 8k", icon: <Tv size={18} /> },
  { name: "Nature", query: "8k nature landscape cinematic", icon: <Mountain size={18} /> },
  { name: "Dark", query: "amoled black dark 4k wallpaper", icon: <Moon size={18} /> },
  { name: "Forest", query: "mystical forest fog green 4k", icon: <Trees size={18} /> },
  { name: "Space", query: "galaxy nebula deep space 4k", icon: <Stars size={18} /> },
  { name: "Animation", query: "3d animation abstract render 4k", icon: <Box size={18} /> },
  { name: "Saved", query: "SAVED_ITEMS", icon: <Heart size={18} /> }
];

const App = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Curated");
  const [searchQuery, setSearchQuery] = useState("");
  const [orientation, setOrientation] = useState("landscape");
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [savedWallpapers, setSavedWallpapers] = useState(() => {
    const localData = localStorage.getItem('wallux_saved');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('wallux_saved', JSON.stringify(savedWallpapers));
  }, [savedWallpapers]);

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
          id: p.id, thumb: p.src.large2x, full4k: p.src.original, photographer: p.photographer
        }));
        setWallpapers(prev => isNewSearch ? formatted : [...prev, ...formatted]);
        setPage(targetPage + 1);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [activeCategory, searchQuery, page, loading, orientation, savedWallpapers]);

  useEffect(() => { fetchWallpapers(true); }, [activeCategory, orientation]);

  const toggleSave = (e, img) => {
    e.stopPropagation();
    const isSaved = savedWallpapers.find(item => item.id === img.id);
    setSavedWallpapers(prev => isSaved ? prev.filter(i => i.id !== img.id) : [img, ...prev]);
  };

  const copyLink = (e, url, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-300 flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-5 bg-black/90 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Wallux</h1>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-white/5 rounded-xl">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-72 bg-[#050507] border-r border-white/5 p-8 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${isMenuOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}`}>
        <div className="hidden lg:flex items-center gap-3 mb-10">
          <Zap className="text-cyan-500 fill-cyan-500" size={24} />
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Wallux</h1>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-500" size={16} />
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs text-white outline-none focus:border-cyan-500/40" 
              placeholder="Search Wallpapers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWallpapers(true)}
            />
          </div>

          <nav className="space-y-1 pr-2 max-h-[60vh] overflow-y-auto">
            {CATEGORIES.map((c) => (
              <button key={c.name} onClick={() => { setActiveCategory(c.name); setIsMenuOpen(false); setSearchQuery(""); }} 
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeCategory === c.name ? 'bg-white text-black font-bold' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                {c.icon} <span className="text-[10px] tracking-widest uppercase">{c.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 relative z-10 flex flex-col min-h-screen">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
          <h2 className="text-7xl lg:text-9xl font-black text-white italic tracking-tighter leading-none opacity-10 absolute -top-4 left-0 pointer-events-none uppercase select-none">{activeCategory}</h2>
          <div className="relative z-10">
             <h3 className="text-5xl font-black text-white italic tracking-tighter">PREMIUM ASSETS<span className="text-cyan-500">.</span></h3>
          </div>

          <div className="flex bg-white/5 p-1 rounded-[1.5rem] border border-white/5 z-10">
            <button onClick={() => setOrientation('landscape')} className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] text-[10px] font-black transition-all ${orientation === 'landscape' ? 'bg-white text-black' : 'text-zinc-500'}`}><Monitor size={14}/> 4K DESKTOP</button>
            <button onClick={() => setOrientation('portrait')} className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] text-[10px] font-black transition-all ${orientation === 'portrait' ? 'bg-white text-black' : 'text-zinc-500'}`}><Smartphone size={14}/> 4K MOBILE</button>
          </div>
        </header>

        {/* Grid */}
        <div className={`grid gap-8 lg:gap-10 flex-grow ${orientation === 'landscape' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
          {wallpapers.map((img, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={img.id + i} className="group cursor-pointer">
              <div onClick={() => setSelectedImage(img)} className={`relative rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 ${orientation === 'landscape' ? 'aspect-[16/9]' : 'aspect-[9/16]'}`}>
                <img src={img.thumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute top-5 right-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <button onClick={(e) => toggleSave(e, img)} className={`p-3 rounded-full backdrop-blur-xl border border-white/10 ${savedWallpapers.find(s => s.id === img.id) ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-black/40 text-white hover:bg-white hover:text-black'}`}>
                    <Heart size={16} fill={savedWallpapers.find(s => s.id === img.id) ? "currentColor" : "none"} />
                  </button>
                  <button onClick={(e) => copyLink(e, img.full4k, img.id)} className="p-3 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/10 hover:bg-white hover:text-black">
                    {copiedId === img.id ? <Zap size={16} className="text-cyan-400" /> : <Share2 size={16} />}
                  </button>
                </div>
              </div>
              <p className="mt-4 px-2 text-[9px] text-zinc-700 uppercase tracking-widest font-bold">Asset #{img.id} • 4K Source</p>
            </motion.div>
          ))}
        </div>

        {activeCategory !== "Saved" && (
          <div className="mt-20 flex justify-center"><button onClick={() => fetchWallpapers(false)} className="px-12 py-5 border border-white/10 rounded-full text-[10px] font-black tracking-[0.4em] hover:bg-white hover:text-black transition-all uppercase">{loading ? <Loader2 className="animate-spin" /> : "Next Batch"}</button></div>
        )}

        {/* SEO SECTION FOR ADSENSE */}
        <section className="mt-32 pt-20 border-t border-white/5 max-w-5xl">
          <h4 className="text-white text-2xl font-black italic tracking-tighter mb-8 uppercase">Premium 4K Wallpaper Bureau</h4>
          <div className="grid md:grid-cols-2 gap-12 text-sm text-zinc-500 leading-relaxed">
            <p>Wallux Pro provides a high-fidelity repository for <span className="text-cyan-500">Ultra HD 4K Wallpapers</span>. Our collection includes <span className="text-white">Anime, Nature, Dark Amoled, and 3D Animation</span> renders optimized for HDR displays.</p>
            <p>All assets are curated under the Pexels Open License. Our interface is designed to meet <span className="text-white">Google AdSense Publisher Policies</span>, ensuring a high-quality, user-safe experience with zero tracking.</p>
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            {["4K Wallpaper", "UHD Art", "Anime 8K", "Minimalist", "OLED Dark"].map(t => <span key={t} className="text-[9px] font-bold px-4 py-2 bg-white/5 rounded-full border border-white/5 uppercase tracking-widest">{t}</span>)}
          </div>
          <footer className="mt-20 pb-10 border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between text-[10px] font-bold tracking-[0.3em] text-zinc-700 uppercase">
            <p>© 2026 Wallux Bureau</p>
            <div className="flex gap-6"><span>Privacy</span><span>Terms</span><span>DMCA</span></div>
          </footer>
        </section>
      </main>

      {/* Full Screen 4K Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={() => setSelectedImage(null)}>
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative w-full h-full flex items-center justify-center p-0 lg:p-10" onClick={e => e.stopPropagation()}>
                <img src={selectedImage.full4k} className="max-w-full max-h-full object-contain shadow-2xl" />
                <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-xl transition-all"><X size={24}/></button>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] md:w-auto bg-black/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row items-center gap-10">
                  <div className="text-center md:text-left"><h5 className="text-white text-2xl font-black italic tracking-tighter uppercase leading-none">Original 4K</h5><p className="text-zinc-500 text-[9px] tracking-widest mt-2 font-bold uppercase">Creator: {selectedImage.photographer}</p></div>
                  <a href={selectedImage.full4k} download target="_blank" className="px-12 py-5 bg-white text-black font-black text-[10px] tracking-widest uppercase rounded-2xl hover:bg-cyan-500 transition-all flex items-center gap-3"><Download size={16}/> Get Master File</a>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
            
