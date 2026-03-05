import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { Aperture, Download, Search, Loader2, Monitor, Smartphone, Zap, ShieldCheck, Info, FileText, ArrowDown } from 'lucide-react';

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Cyberpunk');
  const [deviceType, setDeviceType] = useState(window.innerWidth < 768 ? 'portrait' : 'landscape');
  const [view, setView] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    // 3D Starfield Logic
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 6000; i++) vertices.push(THREE.MathUtils.randFloatSpread(3000));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.9, transparent: true, opacity: 0.5 }));
    scene.add(stars);
    camera.position.z = 500;

    const animate = () => { 
      requestAnimationFrame(animate); 
      stars.position.z += 2.2; 
      if(stars.position.z > 500) stars.position.z = -1000;
      renderer.render(scene, camera); 
    };
    animate();

    // Intro Sequence
    gsap.to(".logo-anim", { opacity: 1, y: 0, duration: 1, stagger: 0.2 });
    setTimeout(() => {
      gsap.to("#intro-layer", { y: "-100%", duration: 1.5, ease: "expo.inOut", onComplete: () => fetchWalls(category, deviceType) });
    }, 2500);
  }, []);

  const fetchWalls = async (q, orientation) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-wallpapers?query=${encodeURIComponent(q)}&orientation=${orientation}`);
      const data = await res.json();
      setWallpapers(data.photos || []);
      gsap.fromTo(".wall-card", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" });
      gsap.fromTo(".wod-banner", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.2, ease: "expo.out" });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchTerm.trim()) {
      setCategory(searchTerm);
      fetchWalls(searchTerm, deviceType);
      setView('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      
      {/* Background & Intro */}
      <div id="intro-layer" className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
        <h1 className="logo-anim opacity-0 translate-y-10 text-6xl md:text-9xl font-black tracking-[0.3em] italic text-glow uppercase">ASTHEXWALL</h1>
        <p className="logo-anim opacity-0 text-cyan-500 text-[9px] mt-6 tracking-[1.2em] uppercase font-bold">Neural Protocol Activated</p>
      </div>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />

      {/* Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[94%] max-w-7xl z-50 glass-nav px-8 py-5 rounded-[2.5rem] flex flex-col lg:flex-row justify-between items-center gap-6 border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setView('home'); fetchWalls('Cyberpunk', deviceType)}}>
          <Aperture className="text-cyan-400 animate-spin-slow" size={28}/>
          <span className="font-black tracking-tighter text-2xl italic uppercase">ASTHEXWALL</span>
        </div>

        <form onSubmit={handleSearch} className="relative w-full max-w-md group">
          <input type="text" placeholder="Explore Visual Archive..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 px-6 py-3 rounded-2xl outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-sm italic" />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400"><Search size={18}/></button>
        </form>
        
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
          <button onClick={() => {setDeviceType('portrait'); fetchWalls(category, 'portrait')}} className={`px-5 py-2 rounded-xl transition-all text-[10px] font-black uppercase ${deviceType === 'portrait' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'text-gray-500'}`}><Smartphone size={14} className="inline mr-2"/> Mobile</button>
          <button onClick={() => {setDeviceType('landscape'); fetchWalls(category, 'landscape')}} className={`px-5 py-2 rounded-xl transition-all text-[10px] font-black uppercase ${deviceType === 'landscape' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'text-gray-500'}`}><Monitor size={14} className="inline mr-2"/> Desktop</button>
        </div>
      </nav>

      {view === 'home' && (
        <main className="relative z-10 pt-56 px-8 max-w-[1800px] mx-auto pb-40">
          
          {/* --- WALLPAPER OF THE DAY (WOD) BANNER --- */}
          {!loading && wallpapers.length > 0 && (
            <section className="wod-banner mb-24 relative h-[60vh] md:h-[75vh] w-full rounded-[4rem] overflow-hidden group shadow-[0_0_100px_rgba(34,211,238,0.15)] border border-white/10">
              <img src={wallpapers[0].src.original} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt="Featured" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-12 md:p-20">
                <div className="flex items-center gap-3 text-cyan-400 text-[11px] font-black tracking-[0.8em] uppercase mb-6 animate-pulse">
                  <Zap size={16} /> Neural Selection: Asset 01
                </div>
                <h2 className="text-5xl md:text-9xl font-black uppercase italic tracking-tighter text-glow leading-none mb-8">FEATURED<br/>ARCHIVE</h2>
                <div className="flex flex-wrap gap-6 items-center">
                  <a href={wallpapers[0].src.original} target="_blank" className="bg-white text-black px-10 py-5 rounded-3xl font-black uppercase text-[12px] tracking-widest flex items-center gap-3 hover:bg-cyan-400 transition-all active:scale-95 shadow-2xl">
                    <Download size={20}/> Download Ultra-HD
                  </a>
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest border-l border-white/20 pl-6">Optimized for<br/>OLED Panels</p>
                </div>
              </div>
            </section>
          )}

          {/* Gallery Header */}
          <header className="mb-16 border-l-4 border-cyan-500 pl-10">
            <h2 className="text-7xl md:text-[8rem] font-black uppercase italic tracking-tighter text-glow leading-tight italic">/{category}</h2>
            <div className="flex items-center gap-4 mt-4 text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em]">
              <ArrowDown size={14} className="animate-bounce" /> Explore Grid Below
            </div>
          </header>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6 text-cyan-400 font-black tracking-[1.5em] uppercase italic animate-pulse">
              <Loader2 className="animate-spin" size={40} /> Syncing
            </div>
          ) : (
            <div className={`grid gap-10 ${deviceType === 'portrait' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {wallpapers.map((p, i) => (
                <div key={p.id} className={`wall-card relative group rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(34,211,238,0.15)] hover:border-cyan-500/30 ${deviceType === 'portrait' ? 'aspect-[9/16]' : 'aspect-[16/10]'}`}>
                  <img src={p.src.large2x} className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex justify-between items-center border-t border-white/10 pt-6">
                      <h4 className="text-sm font-black uppercase italic truncate pr-6">{p.photographer}</h4>
                      <a href={p.src.original} target="_blank" className="bg-white text-black p-4 rounded-2xl hover:bg-cyan-400 transition-all shadow-2xl"><Download size={22}/></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Footer Content */}
      <footer className="relative z-10 bg-black/90 border-t border-white/5 py-40 px-12 mt-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-20">
          <div>
            <h3 className="text-5xl font-black tracking-tighter mb-8 italic uppercase text-glow">ASTHEXWALL</h3>
            <p className="text-[11px] text-gray-600 font-bold tracking-[0.4em] leading-loose uppercase italic border-l-2 border-cyan-500 pl-8 max-w-sm">Neural Visual Archive. Optimized for high-density pixels. Curated via Pexels API.</p>
          </div>
          <div className="flex gap-16 text-[11px] font-black uppercase text-gray-500 tracking-widest">
            <button onClick={() => setView('about')} className="hover:text-cyan-400">About Vision</button>
            <button onClick={() => setView('privacy')} className="hover:text-cyan-400">Privacy Neural</button>
          </div>
        </div>
        <div className="mt-32 pt-16 border-t border-white/5 text-center text-[10px] text-gray-800 font-black tracking-[2em] uppercase italic">© 2026 ASTHEXWALL | NEURAL ARCHIVE</div>
      </footer>
    </div>
  );
                                                                                                                                                                                                                                                              }
