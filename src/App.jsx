import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Search, Download, Sparkles, Loader2, Moon, Mountain, 
  Box, Stars, Ghost, X, Info, ShieldCheck, Monitor, Smartphone 
} from 'lucide-react';

// --- 3D Card Component for Immersive Feel ---
const WallpaperCard = ({ img, orientation, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Mouse move par rotation values calculate karna
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div 
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <motion.div
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        onClick={() => onClick(img)}
        className={`relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer shadow-2xl transition-shadow hover:shadow-cyan-500/10 ${
          orientation === 'landscape' ? 'aspect-video' : 'aspect-[9/16]'
        }`}
      >
        <motion.img 
          src={img.url} 
          className="w-full h-full object-cover pointer-events-none"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-cyan-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Ultra 4K Render</p>
          <p className="text-white text-xs font-medium italic">by {img.photographer}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main App ---
const CATEGORIES = [
  { name: "Curated", query: "4k wallpaper aesthetic", icon: <Sparkles size={16} /> },
  { name: "Nature", query: "4k nature landscape", icon: <Mountain size={16} /> },
  { name: "Space", query: "galaxy stars nebula", icon: <Stars size={16} /> },
  { name: "3D", query: "3d abstract render", icon: <Box size={16} /> },
  { name: "Anime", query: "anime scenery art", icon: <Ghost size={16} /> },
  { name: "Dark", query: "black amoled dark", icon: <Moon size={16} /> }
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

  const fetchWallpapers = useCallback(async (isNewSearch = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const query = searchQuery || CATEGORIES.find(c => c.name === activeCategory).query;
      const targetPage = isNewSearch ? 1 : page;
      const response = await fetch(`/api/pexels?query=${encodeURIComponent(query)}&page=${targetPage}&orientation=${orientation}`);
      const data = await response.json();
      if (data.photos) {
        const formatted = data.photos.map(p => ({
          id: p.id, url: orientation === 'portrait' ? p.src.large2x : p.src.large,
          hd: p.src.original, photographer: p.photographer
        }));
        setWallpapers(prev => isNewSearch ? formatted : [...prev, ...formatted]);
        setPage(targetPage + 1);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [activeCategory, searchQuery, page, loading, orientation]);

  useEffect(() => { fetchWallpapers(true); }, [activeCategory, orientation]);

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-400 font-sans selection:bg-cyan-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 p-8 border-r border-white/5 md:h-screen sticky top-0 bg-[#020203]/80 backdrop-blur-xl z-40">
          <motion.h1 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-3xl font-black text-white italic mb-10 tracking-tighter bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent"
          >
            WALLUX.PRO
          </motion.h1>
          
          <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl mb-8 border border-white/5">
            <button onClick={() => setOrientation('landscape')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${orientation === 'landscape' ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-zinc-500'}`}>DESKTOP</button>
            <button onClick={() => setOrientation('portrait')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${orientation === 'portrait' ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-zinc-500'}`}>MOBILE</button>
          </div>

          <nav className="space-y-2 mb-10">
            {CATEGORIES.map((c) => (
              <button key={c.name} onClick={() => { setActiveCategory(c.name); setView('gallery'); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[10px] font-bold tracking-[0.2em] transition-all ${activeCategory === c.name ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                {c.icon} {c.name}
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <button onClick={() => setView('about')} className="flex items-center gap-3 text-[10px] font-black tracking-widest hover:text-white"><Info size={16}/> EDITORIAL BUREAU</button>
            <button onClick={() => setView('privacy')} className="flex items-center gap-3 text-[10px] font-black tracking-widest hover:text-white"><ShieldCheck size={16}/> LEGAL PRIVACY</button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 lg:p-12">
          {view === 'gallery' ? (
            <>
              <motion.header initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-16">
                <h2 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-none italic">CURATED <br/><span className="text-cyan-500">EXCELLENCE.</span></h2>
                <p className="text-lg text-zinc-500 max-w-xl leading-relaxed">Experience high-fidelity 4K visual assets, mathematically processed for high-end displays.</p>
              </motion.header>

              <div className={`grid gap-8 ${orientation === 'landscape' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {wallpapers.map((img, i) => (
                  <WallpaperCard key={`${img.id}-${i}`} img={img} orientation={orientation} onClick={setSelectedImage} />
                ))}
              </div>

              <div className="mt-20 flex justify-center pb-20">
                <button onClick={() => fetchWallpapers(false)} className="group relative px-16 py-5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest overflow-hidden">
                  <span className="relative z-10">{loading ? "SYNCING..." : "LOAD NEXT BATCH"}</span>
                  <motion.div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </>
          ) : (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl py-10">
                <h2 className="text-4xl font-black text-white mb-8 italic">DOCUMENTATION</h2>
                <div className="space-y-8 text-zinc-400 leading-relaxed text-sm">
                  {view === 'about' ? (
                    <>
                      <p>Wallux Pro is a premier destination for digital artists and display enthusiasts. Our platform leverages the high-performance Pexels API to deliver source-original 4K imagery.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-zinc-900 rounded-3xl border border-white/5 italic">"The highest resolution for the sharpest minds."</div>
                        <div className="p-6 bg-zinc-900 rounded-3xl border border-white/5 italic">"Optimized for OLED and HDR displays."</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>We value transparency. Our Privacy Policy ensures that your data remains yours. We use standard browser cookies to optimize your wallpaper browsing experience and integrate Google AdSense for sustainable operations.</p>
                      <p>All assets fall under the Pexels Creative Commons license, making them safe for both personal and professional creative work.</p>
                    </>
                  )}
                </div>
                <button onClick={() => setView('gallery')} className="mt-12 text-cyan-400 font-black text-[10px] tracking-widest hover:underline uppercase">← Back to Visuals</button>
             </motion.div>
          )}
        </main>
      </div>

      {/* 3D Modal Experience */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, rotateY: 20 }} animate={{ scale: 1, rotateY: 0 }}
              className="relative max-w-6xl w-full bg-[#0a0a0c] rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <img src={selectedImage.hd} className={`w-full object-contain ${orientation === 'portrait' ? 'max-h-[65vh]' : 'max-h-[75vh]'}`} />
              <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-8 bg-gradient-to-r from-zinc-950 to-transparent">
                <div className="text-center md:text-left">
                  <h4 className="text-white font-black uppercase tracking-[0.2em] text-2xl italic">ASSET READY.</h4>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-2">Source Origin: Master 4K Resolution</p>
                </div>
                <a href={selectedImage.hd} target="_blank" className="w-full md:w-auto text-center bg-cyan-500 text-black px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-xl shadow-cyan-500/20">Download File</a>
              </div>
              <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={32}/></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
                
