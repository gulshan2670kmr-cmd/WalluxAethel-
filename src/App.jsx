import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { Aperture, Download, Search, Loader2, Monitor, Smartphone, Zap, ShieldCheck, Info, ArrowDown } from 'lucide-react';

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Cyberpunk');
  const [deviceType, setDeviceType] = useState(window.innerWidth < 768 ? 'portrait' : 'landscape');
  const [view, setView] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 6000; i++) vertices.push(THREE.MathUtils.randFloatSpread(3000));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.9, transparent: true, opacity: 0.4 }));
    scene.add(stars);
    camera.position.z = 500;
    const animate = () => { 
      requestAnimationFrame(animate); 
      stars.position.z += 2.5; 
      if(stars.position.z > 500) stars.position.z = -1000;
      renderer.render(scene, camera); 
    };
    animate();
    const tl = gsap.timeline();
    tl.to(".logo-anim", { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: "power4.out" });
    tl.to("#intro-layer", { y: "-100%", duration: 1.5, delay: 1, ease: "expo.inOut", onComplete: () => fetchWalls(category, deviceType) });
  }, []);

  const fetchWalls = async (q, orientation) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-wallpapers?query=${encodeURIComponent(q)}&orientation=${orientation}`);
      const data = await res.json();
      setWallpapers(data.photos || []);
      gsap.fromTo(".wall-card", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" });
      gsap.fromTo(".wod-banner", { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 1.5, ease: "expo.out" });
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
      <div id="intro-layer" className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center pointer-events-none">
        <h1 className="logo-anim opacity-0 translate-y-10 text-6xl md:text-9xl font-black tracking-[0.3em] italic text-glow uppercase text-center">ASTHEXWALL</h1>
        <p className="logo-anim opacity-0 text-cyan-500 text-[10px] mt-6 tracking-[1.5em] font-bold uppercase">Neural Visual Protocol</p>
      </div>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />

      <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[94%] max-w-7xl z-[100] glass-nav px-8 py-5 rounded-[2.5rem] flex flex-col lg:flex-row justify-between items-center gap-6 border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => {setView('home'); fetchWalls('Cyberpunk', deviceType)}}>
          <Aperture className="text-cyan-400 animate-spin-slow" size={28}/>
          <span className="font-black tracking-tighter text-2xl italic uppercase">ASTHEXWALL</span>
        </div>
        <form onSubmit={handleSearch} className="relative w-full max-w-md group">
          <input type="text" placeholder="Explore Neural Grid..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/10 border border-white/10 px-6 py-3 rounded-2xl outline-none focus:border-cyan-500/50 focus:bg-white/20 transition-all text-sm italic" />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400"><Search size={18}/></button>
        </form>
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 shrink-0">
          <button onClick={() => {setDeviceType('portrait'); fetchWalls(category, 'portrait')}} className={`px-5 py-2 rounded-xl transition-all text-[10px] font-black uppercase flex items-center gap-2 ${deviceType === 'portrait' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'text-gray-500 hover:text-white'}`}><Smartphone size={14}/> Mobile</button>
          <button onClick={() => {setDeviceType('landscape'); fetchWalls(category, 'landscape')}} className={`px-5 py-2 rounded-xl transition-all text-[10px] font-black uppercase flex items-center gap-2 ${deviceType === 'landscape' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'text-gray-500 hover:text-white'}`}><Monitor size={14}/> Desktop</button>
        </div>
      </nav>

      {view === 'home' ? (
        <main className="relative z-10 pt-60 px-8 max-w-[1800px] mx-auto pb-40">
          {!loading && wallpapers.length > 0 && (
            <section className="wod-banner mb-24 relative h-[65vh] md:h-[80vh] w-full rounded-[4rem] overflow-hidden group border border-white/10 shadow-2xl">
              <img src={wallpapers[0].src.original} className="w-full h-full object-cover transition-transform duration-[15s] group-hover:scale-105" alt="Featured" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-12 md:p-20">
                <div className="flex items-center gap-3 text-cyan-400 text-[11px] font-black tracking-[0.8em] uppercase mb-6 animate-pulse">
                  <Zap size={16} /> Asset of the Day
                </div>
                <h2 className="text-5xl md:text-9xl font-black uppercase italic tracking-tighter text-glow leading-none mb-10">NEURAL<br/>SELECTION</h2>
                <div className="flex flex-wrap gap-8 items-center">
                  <a href={wallpapers[0].src.original} target="_blank" className="bg-white text-black px-12 py-5 rounded-3xl font-black uppercase text-[12px] tracking-widest flex items-center gap-3 hover:bg-cyan-400 transition-all shadow-2xl active:scale-95">
                    <Download size={20}/> Download UHD
                  </a>
                </div>
              </div>
            </section>
          )}

          <header className="mb-20 border-l-4 border-cyan-500 pl-10">
            <h2 className="text-7xl md:text-[9rem] font-black uppercase italic tracking-tighter text-glow leading-tight">/{category}</h2>
            <div className="flex items-center gap-4 mt-6 text-gray-600 font-bold uppercase text-[11px] tracking-[0.5em]">
              <ArrowDown size={14} className="animate-bounce text-cyan-500" /> Explore Collection
            </div>
          </header>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6 text-cyan-400 font-black tracking-[2em] uppercase italic animate-pulse">
              <Loader2 className="animate-spin" size={40} /> Syncing Grid
            </div>
          ) : (
            <div className={`grid gap-10 ${deviceType === 'portrait' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {wallpapers.map((p) => (
                <div key={p.id} className={`wall-card relative group rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(34,211,238,0.15)] hover:border-cyan-500/30 ${deviceType === 'portrait' ? 'aspect-[9/16]' : 'aspect-[16/10]'}`}>
                  <img src={p.src.large2x} className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-6 group-hover:translate-y-0">
                    <div className="flex justify-between items-center border-t border-white/10 pt-6">
                      <h4 className="text-[10px] font-black uppercase italic truncate pr-6 text-gray-300">{p.photographer}</h4>
                      <a href={p.src.original} target="_blank" className="bg-white text-black p-4 rounded-2xl hover:bg-cyan-400 transition-all shadow-2xl"><Download size={22}/></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : (
        <div className="pt-64 px-10 max-w-4xl mx-auto min-h-screen">
          <h1 className="text-6xl font-black text-cyan-400 mb-8 italic uppercase tracking-tighter text-glow">{view === 'about' ? "Visual Vision" : "Privacy Neural"}</h1>
          <p className="text-gray-400 leading-relaxed text-lg border-l-2 border-cyan-500 pl-8 italic">
            {view === 'about' ? 
              "Asthexwall is a premier digital destination for high-fidelity 4K visual assets and OLED-optimized wallpapers. Our mission is to bridge the gap between artistic photography and digital display excellence. In an era of high-density pixel displays, we provide a curated neural archive sourced through the professional Pexels API ecosystem. We focus on Cyberpunk, Amoled, Minimal, and Nature themes to provide a diverse yet sophisticated palette for your digital environment." : 
              "At Asthexwall, we prioritize the privacy of our visitors. We use standard industry practices, including the use of log files and cookies. These cookies are used to store information including visitors' preferences to optimize the users' experience by customizing our web page content based on visitors' browser type. Third-party ad networks may use technologies like cookies to measure the effectiveness of their advertising. We do not store personal identification information."
            }
          </p>
          <button onClick={() => setView('home')} className="mt-16 bg-white text-black px-12 py-4 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-cyan-400">Return to Grid</button>
        </div>
      )}

      <footer className="relative z-10 bg-black/90 border-t border-white/5 py-40 px-12 mt-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-20">
          <div className="max-w-md">
            <h3 className="text-5xl font-black tracking-tighter mb-8 italic uppercase text-glow">ASTHEXWALL</h3>
            <p className="text-[11px] text-gray-600 font-bold tracking-[0.4em] leading-loose uppercase italic border-l-2 border-cyan-500 pl-8">The Neural Visual Archive. Optimized for 4K OLED displays. All assets are royalty-free and sourced via Pexels API for ethical digital curation. Experience high-fidelity discovery.</p>
          </div>
          <div className="flex gap-16 text-[11px] font-black uppercase text-gray-500 tracking-widest">
            <button onClick={() => setView('about')} className="hover:text-cyan-400 flex items-center gap-2"><Info size={14}/> Vision</button>
            <button onClick={() => setView('privacy')} className="hover:text-cyan-400 flex items-center gap-2"><ShieldCheck size={14}/> Privacy</button>
          </div>
        </div>
        <div className="mt-32 pt-16 border-t border-white/5 text-center text-[10px] text-gray-800 font-black tracking-[2em] uppercase italic italic">© 2026 ASTHEXWALL | NEURAL ARCHIVE</div>
      </footer>
    </div>
  );
          }
