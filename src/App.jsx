import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { Aperture, Download, Search, Loader2, ArrowUpRight, Monitor, Smartphone, Zap } from 'lucide-react';

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Abstract');
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceType, setDeviceType] = useState(window.innerWidth < 768 ? 'portrait' : 'landscape');
  const [view, setView] = useState('home');
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Starfield Background
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 4000; i++) vertices.push(THREE.MathUtils.randFloatSpread(2000));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x00f3ff, size: 0.8, transparent: true, opacity: 0.3 }));
    scene.add(stars);
    camera.position.z = 500;
    const animate = () => { requestAnimationFrame(animate); stars.rotation.y += 0.0005; renderer.render(scene, camera); };
    animate();

    // 2. Intro Animation
    const tl = gsap.timeline();
    tl.to("#logo", { opacity: 1, scale: 1.1, duration: 1.5, ease: "power4.out" })
      .to("#intro", { y: "-100%", delay: 0.5, duration: 1.2, ease: "expo.inOut", onComplete: () => fetchWalls(category, deviceType) });
  }, []);

  const fetchWalls = async (q, orientation) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-wallpapers?query=${encodeURIComponent(q)}&orientation=${orientation}`);
      const data = await res.json();
      setWallpapers(data.photos || []);
      gsap.fromTo(".wall-card", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDeviceSwitch = (type) => {
    setDeviceType(type);
    fetchWalls(category, type);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-cyan-500/30">
      
      {/* Intro Overlay */}
      <div id="intro" className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
        <h1 id="logo" className="relative z-10 text-6xl md:text-9xl font-black tracking-[0.5em] opacity-0 text-white italic text-glow">WALLUX</h1>
      </div>

      {/* Floating Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[94%] max-w-6xl z-50 bg-white/[0.02] backdrop-blur-3xl border border-white/5 px-8 py-5 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => fetchWalls('Abstract', deviceType)}>
          <div className="bg-cyan-500 p-2 rounded-xl group-hover:rotate-180 transition-all duration-700 shadow-cyan-500/20 shadow-lg"><Aperture size={22} className="text-black"/></div>
          <span className="font-black tracking-[0.3em] text-2xl italic">WALLUX</span>
        </div>
        
        {/* Device Mode Toggle */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button onClick={() => handleDeviceSwitch('portrait')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black tracking-widest uppercase ${deviceType === 'portrait' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'text-gray-500 hover:text-white'}`}>
                <Smartphone size={14}/> Mobile
            </button>
            <button onClick={() => handleDeviceSwitch('landscape')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black tracking-widest uppercase ${deviceType === 'landscape' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'text-gray-500 hover:text-white'}`}>
                <Monitor size={14}/> Desktop
            </button>
        </div>

        <div className="flex gap-6 overflow-x-auto no-scrollbar py-1">
          {['Cyber', 'Abstract', 'Amoled', 'Space'].map(cat => (
            <button key={cat} onClick={() => {setCategory(cat); fetchWalls(cat, deviceType)}} className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all relative ${category === cat ? 'text-cyan-400' : 'text-gray-500 hover:text-white'}`}>
                {cat}
                {category === cat && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-cyan-400 blur-[1px]"></span>}
            </button>
          ))}
        </div>
      </nav>

      {view === 'home' ? (
        <main className="pt-56 px-6 max-w-[1800px] mx-auto pb-40">
          
          <header className="mb-20 flex flex-col md:flex-row justify-between items-end border-l-4 border-cyan-500 pl-8">
            <div>
              <div className="flex items-center gap-2 mb-3 text-cyan-500 font-bold tracking-[0.5em] text-[10px] uppercase"><Zap size={14}/> Curated Neural Assets</div>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic">/{category}</h2>
            </div>
            <p className="max-w-xs text-[9px] text-gray-500 leading-loose tracking-[0.2em] uppercase italic hidden md:block">Optimized for {deviceType === 'portrait' ? 'Mobile OLED' : 'Desktop Ultra-HD'} displays.</p>
          </header>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6 opacity-30 text-cyan-400 italic tracking-[1em] font-black animate-pulse"><Loader2 className="animate-spin" size={32}/> Syncing Assets</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-[450px]">
              {wallpapers.map((p, index) => (
                <div key={p.id} className={`wall-card relative group rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-700 hover:border-cyan-500/40 ${deviceType === 'landscape' && index % 5 === 0 ? 'md:col-span-2' : ''}`}>
                  <img src={p.src.large2x || p.src.large} alt="Wallpaper" className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0" loading="lazy" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-10 flex flex-col justify-end">
                    <div className="flex justify-between items-center border-t border-white/10 pt-6">
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Artist</p>
                        <p className="text-sm font-black tracking-widest uppercase truncate w-44 italic text-white">{p.photographer}</p>
                      </div>
                      <a href={p.src.original} target="_blank" rel="noreferrer" className="bg-white text-black p-4 rounded-3xl hover:bg-cyan-400 hover:scale-110 transition-all shadow-2xl">
                        <Download size={22}/>
                      </a>
                    </div>
                  </div>
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500"><ArrowUpRight className="text-cyan-400" size={24}/></div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : (
        <div className="pt-48 px-12 max-w-4xl mx-auto min-h-screen text-white uppercase tracking-widest">
            <h1 className="text-6xl font-black text-cyan-400 mb-8 italic">{view}</h1>
            <p className="text-gray-500 leading-relaxed italic border-l-2 border-cyan-500 pl-8">Premium visuals for the aesthetic generation. Optimized for 4K and OLED screens.</p>
            <button onClick={() => setView('home')} className="mt-16 bg-white text-black px-12 py-5 rounded-full font-black text-[10px] hover:bg-cyan-400 transition-all">Back to Archive</button>
        </div>
      )}

      {/* Footer (with AdSense links) */}
      <footer className="bg-black/50 border-t border-white/5 py-32 px-12 mt-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-20">
          <div className="max-w-sm">
            <h3 className="text-4xl font-black tracking-[0.4em] mb-6 italic">WALLUX</h3>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-loose font-bold border-l-2 border-cyan-500 pl-8">Curating high-end neural assets. Powered by Pexels API. Optimized for high-density pixels.</p>
          </div>
          <div className="flex gap-20 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
             <div className="flex flex-col gap-4">
                <span className="text-white mb-2">Legal</span>
                <button onClick={() => setView('about')}>About</button>
                <button onClick={() => setView('privacy')}>Privacy</button>
             </div>
          </div>
        </div>
        <div className="mt-32 pt-12 border-t border-white/5 text-center text-[9px] text-gray-800 font-black tracking-[1em] uppercase">© 2024 WALLUX ARCHIVE | NEURAL VISUALS</div>
      </footer>
    </div>
  );
              }
