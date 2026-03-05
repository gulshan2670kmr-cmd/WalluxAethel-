import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Aperture, Download, Search, Loader2, Monitor, Smartphone, Shield, BookOpen, Info, Scale } from 'lucide-react';
import * as THREE from 'three';

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('Amoled');
  const [deviceType, setDeviceType] = useState(window.innerWidth < 768 ? 'portrait' : 'landscape');
  const [view, setView] = useState('home'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [introVisible, setIntroVisible] = useState(true);
  const canvasRef = useRef(null);
  const observer = useRef();

  // 1. 3D NEURAL BACKGROUND
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const nodesCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new THREE.Float32BufferAttribute(nodesCount * 3, 3);
    for (let i = 0; i < nodesCount; i++) {
      positions.setXYZ(i, THREE.MathUtils.randFloatSpread(2000), THREE.MathUtils.randFloatSpread(2000), THREE.MathUtils.randFloatSpread(2000));
    }
    geometry.setAttribute('position', positions);
    const pointsMaterial = new THREE.PointsMaterial({ size: 2, color: 0x22d3ee, transparent: true, opacity: 0.3 });
    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);
    camera.position.z = 400;
    const animate = () => { requestAnimationFrame(animate); points.rotation.y += 0.0006; renderer.render(scene, camera); };
    animate();
    const timer = setTimeout(() => setIntroVisible(false), 3800);
    return () => { clearTimeout(timer); renderer.dispose(); };
  }, []);

  // 2. DATA FETCHING (INFINITE SCROLL)
  const fetchWalls = useCallback(async (q, orientation, pageNum, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-wallpapers?query=${encodeURIComponent(q)}&orientation=${orientation}&page=${pageNum}`);
      const data = await res.json();
      if (data.photos) {
        setWallpapers(prev => append ? [...prev, ...data.photos] : data.photos);
        setHasMore(data.photos.length > 0);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!introVisible) fetchWalls(category, deviceType, 1);
  }, [introVisible, category, deviceType, fetchWalls]);

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
          const next = prev + 1;
          fetchWalls(category, deviceType, next, true);
          return next;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, category, deviceType, fetchWalls]);

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchTerm.trim()) {
      setCategory(searchTerm);
      setPage(1);
      setView('home');
      fetchWalls(searchTerm, deviceType, 1, false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 overflow-x-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />

      {/* --- NEW FULLSCREEN CINEMATIC INTRO --- */}
      {introVisible && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
          <div className="relative w-full flex flex-col items-center justify-center px-6">
            <div className="relative py-10">
              <h1 className="text-[14vw] md:text-[12rem] font-black tracking-[0.1em] italic text-cyan-400 uppercase leading-[0.8] m-0 drop-shadow-[0_0_70px_rgba(34,211,238,0.9)] animate-pulse text-center">
                ASTHEXWALL
              </h1>
            </div>
            <p className="text-cyan-800 text-[10px] md:text-sm tracking-[1.5em] font-bold uppercase mt-6 pl-[1.5em] opacity-70 leading-none text-center">
              Neural Grid Protocol
            </p>
            <div className="mt-24 w-32 md:w-80 h-[1px] bg-white/10 rounded-full overflow-hidden relative">
              <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite] w-1/2 shadow-[0_0_20px_#22d3ee]"></div>
            </div>
          </div>
        </div>
      )}

      <div className={`${introVisible ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}`}>
        {/* NAVBAR */}
        <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-6 px-4 pointer-events-none">
          <div className="w-full max-w-5xl bg-black/40 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setView('home'); setCategory('Amoled')}}>
              <Aperture className="text-cyan-400" size={24}/>
              <span className="font-black tracking-tighter text-2xl italic uppercase">ASTHEXWALL</span>
            </div>
            <form onSubmit={handleSearch} className="relative w-full max-w-xs group">
              <input type="text" placeholder="Search Archive..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl outline-none text-xs italic focus:border-cyan-500/50" />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"><Search size={18}/></button>
            </form>
            <div className="flex bg-zinc-900/60 p-1 rounded-2xl border border-white/5 scale-90">
              <button onClick={() => {setDeviceType('portrait'); setPage(1); fetchWalls(category, 'portrait', 1)}} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ${deviceType === 'portrait' ? 'bg-cyan-500 text-black' : 'text-gray-400'}`}><Smartphone size={14}/> Mobile</button>
              <button onClick={() => {setDeviceType('landscape'); setPage(1); fetchWalls(category, 'landscape', 1)}} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ${deviceType === 'landscape' ? 'bg-cyan-500 text-black' : 'text-gray-400'}`}><Monitor size={14}/> Desktop</button>
            </div>
          </div>
        </nav>

        <main className="relative z-10 pt-72 md:pt-80 px-4 md:px-12 max-w-[1800px] mx-auto pb-20">
          {view === 'home' ? (
            <>
              <header className="mb-12 border-l-[6px] border-cyan-500 pl-8">
                <h2 className="text-6xl md:text-[10rem] font-black uppercase italic tracking-tighter text-cyan-400 leading-[0.85] py-4 truncate">/{category}</h2>
                <p className="text-gray-500 text-xs md:text-sm tracking-[0.5em] uppercase mt-4">Premium Assets for {deviceType} Grid</p>
              </header>

              <div className={`grid gap-5 md:gap-10 ${deviceType === 'portrait' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {wallpapers.map((p, index) => {
                  const isLast = wallpapers.length === index + 1;
                  return (
                    <div key={p.id} ref={isLast ? lastElementRef : null} className={`group relative rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/10 transition-all duration-700 hover:scale-[1.03] ${deviceType === 'portrait' ? 'aspect-[9/16]' : 'aspect-[16/10]'}`}>
                      <img src={p.src.large2x} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex justify-between items-center border-t border-white/10 pt-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <span className="text-[10px] font-black uppercase italic truncate text-gray-400 max-w-[100px]">{p.photographer}</span>
                          <a href={p.src.original} target="_blank" className="bg-white text-black p-3 rounded-2xl hover:bg-cyan-400 transition-all"><Download size={20}/></a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="pt-10 px-6 max-w-4xl mx-auto min-h-screen bg-zinc-900/40 p-10 rounded-[3rem] border border-white/5 backdrop-blur-xl">
              {view === 'vision' && (
                <article>
                  <h1 className="text-5xl font-black text-cyan-400 mb-8 italic uppercase tracking-tighter">Vision & Mission</h1>
                  <p className="text-gray-300 leading-relaxed text-lg mb-6">AsthexWall is a specialized visual portal designed to optimize the digital aesthetics of modern high-fidelity screens. Our goal is to provide a seamless, ad-friendly, and high-performance environment for wallpaper discovery.</p>
                  <p className="text-gray-400">All assets are legally sourced via Pexels API, ensuring a high-quality standard for our global user base.</p>
                </article>
              )}
              {view === 'privacy' && (
                <article>
                  <h1 className="text-5xl font-black text-cyan-400 mb-8 italic uppercase tracking-tighter">Privacy Protocol</h1>
                  <p className="text-gray-300 leading-relaxed text-base mb-4 italic">Last Updated: March 2026</p>
                  <p className="text-gray-300 mb-6 font-bold uppercase tracking-widest text-xs">This document explains how we handle data and user privacy within the Neural Grid.</p>
                  <h3 className="text-cyan-400 font-bold mt-6 mb-2 uppercase">1. Google AdSense & Cookies</h3>
                  <p className="text-gray-400 mb-4 italic text-sm">We use Google AdSense to serve ads. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</p>
                  <h3 className="text-cyan-400 font-bold mt-6 mb-2 uppercase">2. Image Sourcing</h3>
                  <p className="text-gray-400 italic text-sm">Visual content is provided by Pexels API. We do not store personal images or user-uploaded content.</p>
                </article>
              )}
              {view === 'terms' && (
                <article>
                  <h1 className="text-5xl font-black text-cyan-400 mb-8 italic uppercase tracking-tighter">Terms of Service</h1>
                  <p className="text-gray-300 leading-relaxed text-base mb-4 italic">By accessing AsthexWall, you agree to comply with the following protocols:</p>
                  <h3 className="text-cyan-400 font-bold mt-6 mb-2 uppercase tracking-widest">1. Acceptable Use</h3>
                  <p className="text-gray-400 mb-4 text-sm">You may use our wallpapers for personal, non-commercial use only. Automated scraping of the neural grid is strictly prohibited.</p>
                  <h3 className="text-cyan-400 font-bold mt-6 mb-2 uppercase tracking-widest">2. Content Ownership</h3>
                  <p className="text-gray-400 text-sm mb-4">All images are property of their respective owners as identified via the Pexels platform. AsthexWall acts as a curator and does not claim ownership of individual assets.</p>
                  <h3 className="text-cyan-400 font-bold mt-6 mb-2 uppercase tracking-widest">3. Service Modifications</h3>
                  <p className="text-gray-400 text-sm italic">We reserve the right to modify or terminate the neural archive at any time without prior notice.</p>
                </article>
              )}
              <button onClick={() => setView('home')} className="mt-12 bg-white text-black px-12 py-4 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-cyan-400 transition-all">Back to Grid</button>
            </div>
          )}
        </main>

        <footer className="relative z-10 bg-black py-40 text-center border-t border-white/5">
            <h3 className="text-4xl font-black italic text-cyan-400 tracking-[0.5em] uppercase mb-12">ASTHEXWALL</h3>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-12">
              <button onClick={() => setView('vision')} className="hover:text-cyan-400 transition-colors flex items-center gap-2"><Info size={14}/> Vision</button>
              <button onClick={() => setView('privacy')} className="hover:text-cyan-400 transition-colors flex items-center gap-2"><Shield size={14}/> Privacy</button>
              <button onClick={() => setView('terms')} className="hover:text-cyan-400 transition-colors flex items-center gap-2"><Scale size={14}/> Terms</button>
              <a href="mailto:contact@asthexwall.com" className="hover:text-cyan-400 transition-colors flex items-center gap-2"><Mail size={14}/> Contact</a>
            </div>
            <p className="text-[9px] text-zinc-800 tracking-[1.5em] uppercase italic">© 2026 Neural Grid Protocol - All Assets Optimized</p>
        </footer>
      </div>
    </div>
  );
              }
