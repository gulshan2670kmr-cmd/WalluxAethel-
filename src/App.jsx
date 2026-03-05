import React, { useState, useEffect, useRef } from 'react';
import { Aperture, Download, Search, Loader2, Monitor, Smartphone, Zap, ShieldCheck, Info } from 'lucide-react';
import * as THREE from 'three';

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Amoled');
  const [deviceType, setDeviceType] = useState(window.innerWidth < 768 ? 'portrait' : 'landscape');
  const [view, setView] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [introVisible, setIntroVisible] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Intro Logic: Delay loading content for 3.5 seconds
    const timer = setTimeout(() => {
      setIntroVisible(false);
      fetchWalls(category, deviceType);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (introVisible) return; // Don't render 3D during Intro

    // --- PREMIUM NEURAL GRID 3D ENGINE ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Grid Parameters
    const nodesCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new THREE.Float32BufferAttribute(nodesCount * 3, 3);
    const colors = new THREE.Float32BufferAttribute(nodesCount * 3, 3);
    const color = new THREE.Color(0x22d3ee); // Cyan-400

    for (let i = 0; i < nodesCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
      positions.setXYZ(i, x, y, z);
      colors.setXYZ(i, color.r, color.g, color.b);
    }
    geometry.setAttribute('position', positions);
    geometry.setAttribute('color', colors);

    // Breathing Nodes Material
    const pointsMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    // Connected Lines
    const lineGeo = new THREE.BufferGeometry();
    const lineVerts = new THREE.Float32BufferAttribute(nodesCount * 6, 3);
    for (let i = 0; i < nodesCount; i++) {
      const startIndex = i * 2;
      const x1 = positions.getX(i);
      const y1 = positions.getY(i);
      const z1 = positions.getZ(i);
      const x2 = positions.getX((i + 1) % nodesCount);
      const y2 = positions.getY((i + 1) % nodesCount);
      const z2 = positions.getZ((i + 1) % nodesCount);
      lineVerts.setXYZ(startIndex, x1, y1, z1);
      lineVerts.setXYZ(startIndex + 1, x2, y2, z2);
    }
    lineGeo.setAttribute('position', lineVerts);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x083344, // Darker Cyan
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    camera.position.z = 400;

    // Mouse Interaction Logic
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.01;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.01;
    };
    window.addEventListener('mousemove', onMouseMove);

    let t = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.01;
      // Rotation
      points.rotation.y += 0.0001;
      points.rotation.x += 0.00005;
      lines.rotation.y = points.rotation.y;
      lines.rotation.x = points.rotation.x;

      // Pulse nodes opacity
      pointsMaterial.opacity = 0.2 + Math.sin(t) * 0.05;
      lineMat.opacity = 0.1 + Math.sin(t) * 0.02;

      // Mouse reactivity
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
        window.removeEventListener('mousemove', onMouseMove);
        renderer.dispose();
    };
  }, [introVisible]);

  const fetchWalls = async (q, orientation) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-wallpapers?query=${encodeURIComponent(q)}&orientation=${orientation}`);
      const data = await res.json();
      setWallpapers(data.photos || []);
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
    <div className="min-h-screen bg-[#000000] text-white selection:bg-cyan-500/30 relative overflow-x-hidden">
      
      {/* 1. SOLID INTRO LAYER - Highest Priority */}
      {introVisible && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-4 transition-opacity duration-1000">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl">
            <h1 className="text-4xl md:text-8xl lg:text-9xl font-black tracking-[0.2em] md:tracking-[0.5em] italic text-cyan-400 uppercase text-center leading-normal drop-shadow-[0_0_40px_rgba(34,211,238,0.7)] animate-pulse py-6">
              ASTHEXWALL
            </h1>
            <p className="text-cyan-600 text-[10px] md:text-sm mt-8 tracking-[1em] md:tracking-[1.8em] font-bold uppercase opacity-80 text-center pl-[1em]">
              Neural Visual Protocol
            </p>
            <div className="mt-16 w-32 md:w-64 h-[2px] bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite] w-1/2"></div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN WEBSITE CONTENT - Hidden during Intro */}
      <div className={`${introVisible ? 'hidden' : 'block animate-in fade-in duration-1000'}`}>
        <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />

        {/* FIXED NAVBAR */}
        <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-8 pointer-events-none px-4">
          <div className="w-full max-w-6xl glass-nav px-6 py-4 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 border border-white/10 shadow-2xl pointer-events-auto bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
              <Aperture className="text-cyan-400" size={24}/>
              <span className="font-black tracking-tighter text-2xl italic uppercase">ASTHEXWALL</span>
            </div>
            
            <form onSubmit={handleSearch} className="relative w-full max-w-sm group">
              <input type="text" placeholder="Explore Neural Grid..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl outline-none focus:border-cyan-400/50 transition-all text-sm italic" />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><Search size={18}/></button>
            </form>

            <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-white/5">
              <button onClick={() => {setDeviceType('portrait'); fetchWalls(category, 'portrait')}} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 ${deviceType === 'portrait' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'text-gray-400 hover:text-white'}`}><Smartphone size={14}/> Mobile</button>
              <button onClick={() => {setDeviceType('landscape'); fetchWalls(category, 'landscape')}} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 ${deviceType === 'landscape' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'text-gray-400 hover:text-white'}`}><Monitor size={14}/> Desktop</button>
            </div>
          </div>
        </nav>

        <main className="relative z-10 pt-72 md:pt-80 px-6 max-w-[1800px] mx-auto pb-40">
          {view === 'home' ? (
            <>
              {!loading && wallpapers.length > 0 && (
                <section className="mb-24 relative h-[65vh] md:h-[80vh] w-full rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                  <img src={wallpapers[0].src.original} className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110" alt="Hero" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent flex flex-col justify-end p-10 md:p-20">
                    <h2 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter mb-8 leading-[0.85] drop-shadow-2xl">THE<br/>GRID</h2>
                    <a href={wallpapers[0].src.original} target="_blank" className="w-fit bg-white text-black px-12 py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest flex items-center gap-3 hover:bg-cyan-400 active:scale-95 transition-all"><Download size={20}/> Download UHD</a>
                  </div>
                </section>
              )}
              
              <header className="mb-20 border-l-8 border-cyan-500 pl-10">
                {/* Fixed clipping: pt-6 leading-[1.2] py-2 */}
                <h2 className="text-6xl md:text-[10rem] lg:text-[12rem] font-black uppercase italic tracking-tighter text-cyan-400 leading-[1.2] pt-6 pb-2 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)] truncate">
                  /{category}
                </h2>
              </header>

              {loading ? <div className="h-96 flex flex-col items-center justify-center gap-6 text-cyan-400 font-black tracking-[2em] uppercase italic animate-pulse"><Loader2 className="animate-spin" size={40} /> Syncing</div> : 
                <div className={`grid gap-10 ${deviceType === 'portrait' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {wallpapers.map((p) => (
                    <div key={p.id} className={`wall-card relative group rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(34,211,238,0.15)] ${deviceType === 'portrait' ? 'aspect-[9/16]' : 'aspect-[16/10]'}`}>
                      <img src={p.src.large2x} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all">
                        <div className="flex justify-between items-center border-t border-white/10 pt-6">
                          <span className="text-[10px] font-black uppercase italic truncate text-gray-300 pr-4">{p.photographer}</span>
                          <a href={p.src.original} target="_blank" className="bg-white text-black p-3.5 rounded-xl hover:bg-cyan-400 transition-all shadow-xl"><Download size={18}/></a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </>
          ) : (
            <div className="pt-20 px-6 max-w-4xl mx-auto min-h-screen">
              <h1 className="text-5xl font-black text-cyan-400 mb-8 italic uppercase tracking-tighter leading-tight drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">{view === 'about' ? "Vision" : "Privacy Protocol"}</h1>
              <p className="text-gray-400 leading-relaxed text-xl border-l-2 border-cyan-500 pl-8 italic uppercase text-[12px] tracking-widest border-l-2 border-cyan-500 pl-8">Premium 4K OLED archive. Curated for performance displays. Powered by Pexels.</p>
              <button onClick={() => setView('home')} className="mt-16 bg-white text-black px-12 py-4 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-cyan-400 transition-all active:scale-95">Back to Grid</button>
            </div>
          )}
        </main>

        <footer className="relative z-10 bg-black border-t border-white/5 py-40 px-12 mt-40 text-center">
          <h3 className="text-4xl md:text-6xl font-black italic text-cyan-400 mb-8 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">ASTHEXWALL</h3>
          <div className="flex justify-center gap-16 text-[11px] font-black uppercase text-gray-500 tracking-[0.5em]">
              <button onClick={() => setView('about')} className="hover:text-cyan-400 transition-colors uppercase">Vision</button>
              <button onClick={() => setView('privacy')} className="hover:text-cyan-400 transition-colors uppercase">Privacy</button>
          </div>
          <p className="mt-20 text-[9px] text-zinc-800 font-black tracking-[1.5em] uppercase italic">© 2026 NEURAL GRID PROTOCOL</p>
        </footer>
      </div>
    </div>
  );
            }
            
