import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { Aperture, Download, Search, Loader2, Maximize, Shield, Newspaper, Image as ImageIcon } from 'lucide-react'

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('4K Trends');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('home');
  const canvasRef = useRef(null);

  const getOrientation = () => window.innerWidth < 768 ? 'portrait' : 'landscape';

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for(let i=0; i<5000; i++) vertices.push(THREE.MathUtils.randFloatSpread(2000));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({color: 0x00f3ff, size: 1.2}));
    scene.add(stars);
    camera.position.z = 500;
    const animate = () => { requestAnimationFrame(animate); stars.rotation.y += 0.001; renderer.render(scene, camera); };
    animate();

    gsap.to("#logo", { opacity: 1, scale: 1.1, duration: 1.5 });
    gsap.to("#intro", { y: "-100%", delay: 2.2, duration: 1, ease: "expo.inOut", onComplete: () => fetchWalls(category) });
  }, []);

  const fetchWalls = async (q) => {
    setView('home');
    setLoading(true);
    const orientation = getOrientation();
    try {
      const res = await fetch(`/api/get-wallpapers?query=${q}&orientation=${orientation}`);
      const data = await res.json();
      setWallpapers(data.photos || []);
    } catch (e) { console.log(e) } finally { setLoading(false) }
  };

  const renderLegal = (title, content) => (
    <div className="pt-40 px-6 max-w-4xl mx-auto min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400 uppercase tracking-widest border-b border-cyan-500 pb-2">{title}</h1>
      <div className="text-gray-400 leading-relaxed text-sm md:text-base space-y-4">{content}</div>
      <button onClick={() => setView('home')} className="mt-10 border border-cyan-500 text-cyan-500 px-8 py-2 rounded-full hover:bg-cyan-500 hover:text-black transition-all">Back to Home</button>
    </div>
  );

  return (
    <div className="min-h-screen text-white bg-[#030305]">
      {/* 3D Intro */}
      <div id="intro" className="fixed inset-0 z-50 bg-black flex items-center justify-center pointer-events-none">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <h1 id="logo" className="relative z-10 text-4xl md:text-7xl font-black tracking-[0.4em] opacity-0 text-glow uppercase">ASTHEXWALL</h1>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => fetchWalls('4K Trends')}>
          <Aperture className="text-cyan-400"/><span className="font-bold tracking-widest text-xl">ASTHEXWALL</span>
        </div>
        <div className="flex gap-3 overflow-x-auto w-full md:w-auto no-scrollbar px-2">
          {['Nature', 'Space', 'Minimal', 'Anime', 'Car'].map(cat => (
            <button key={cat} onClick={() => {setCategory(cat); fetchWalls(cat)}} className={`text-[10px] font-bold px-4 py-1.5 rounded-full border transition-all ${category === cat ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-white/10 text-gray-400'}`}>{cat}</button>
          ))}
        </div>
        <form onSubmit={(e)=>{e.preventDefault(); fetchWalls(searchTerm)}} className="relative w-full md:w-64">
          <input type="text" placeholder="Search Wallpapers..." className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 px-10 focus:border-cyan-400 outline-none text-sm" onChange={(e)=>setSearchTerm(e.target.value)} />
          <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
        </form>
      </nav>

      {view === 'home' ? (
        <main className="pt-44 md:pt-36 px-4 max-w-7xl mx-auto pb-20">
          {/* AdSense Optimized Header Text */}
          <section className="mb-12 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-black mb-4 uppercase tracking-tighter text-glow">Premium {category} Wallpapers</h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Welcome to Asthexwall, your primary source for high-definition 4K {category} backgrounds. 
                Each visual is hand-picked to ensure it meets our aesthetic standards for OLED, Desktop, and Mobile screens. 
                Enhance your digital experience with our curated collection of free-to-download assets.
            </p>
          </section>

          {loading ? <div className="h-64 flex flex-col items-center justify-center gap-4 text-cyan-400"><Loader2 className="animate-spin" /><p className="text-xs tracking-widest">FETCHING ASSETS...</p></div> : 
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {wallpapers.map(p => (
                <div key={p.id} className="relative group rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 break-inside-avoid">
                  <img src={p.src.large} alt={`${category} wallpaper by ${p.photographer}`} className="w-full transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-all p-6 flex flex-col justify-end">
                    <p className="text-[10px] text-gray-300 italic mb-2 line-clamp-2">"A premium {category.toLowerCase()} visual captured by {p.photographer}. Highly optimized for 4K resolutions and vibrant displays."</p>
                    <div className="flex items-center gap-2 mb-3 text-cyan-400 text-[9px] font-bold uppercase"><Maximize size={10}/> {p.width} x {p.height} | Ultra HD</div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                      <p className="text-xs font-bold truncate w-32">{p.photographer}</p>
                      <a href={p.src.original} target="_blank" rel="noreferrer" className="bg-white text-black p-2 rounded-full hover:bg-cyan-400 transition-all shadow-lg"><Download size={18}/></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }

          {/* AdSense Optimized "Why Us" Section */}
          <section className="mt-20 grid md:grid-cols-3 gap-8 border-t border-white/5 pt-16">
            <div className="text-center p-6 bg-white/5 rounded-3xl">
                <Shield className="mx-auto text-cyan-400 mb-4" />
                <h4 className="font-bold mb-2">Copyright Free</h4>
                <p className="text-xs text-gray-500 leading-relaxed">All our 4K wallpapers are sourced via Pexels License, making them safe for personal and creative use.</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-3xl">
                <Newspaper className="mx-auto text-cyan-400 mb-4" />
                <h4 className="font-bold mb-2">Daily Updates</h4>
                <p className="text-xs text-gray-500 leading-relaxed">We refresh our trending gallery daily to provide the latest aesthetic trends in the visual world.</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-3xl">
                <ImageIcon className="mx-auto text-cyan-400 mb-4" />
                <h4 className="font-bold mb-2">OLED Optimized</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Our dark and minimalist categories are specially curated to save battery and look stunning on OLED panels.</p>
            </div>
          </section>
        </main>
      ) : (
        view === 'about' ? renderLegal("About Asthexwall", (
            <>
                <p>Asthexwall is a high-end wallpaper discovery platform designed for creators, enthusiasts, and anyone looking to beautify their digital workspace.</p>
                <p>We leverage the Pexels API to provide access to millions of high-quality images. Our interface is built using React and Three.js to provide a cinematic browsing experience that standard gallery sites lack.</p>
            </>
        )) :
        view === 'privacy' ? renderLegal("Privacy Policy", (
            <>
                <p>Your privacy is paramount. Asthexwall does not require any user registration or personal data collection.</p>
                <p><strong>Cookies:</strong> We may use third-party services like Google AdSense which use cookies to serve ads based on your visit to this and other sites on the internet.</p>
                <p><strong>External Links:</strong> We link to Pexels for image downloads; please refer to their privacy policy when visiting their platform.</p>
            </>
        )) :
        view === 'terms' ? renderLegal("Terms of Service", (
            <>
                <p>By using Asthexwall, you agree to the following terms:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>The wallpapers are for personal use as backgrounds on digital devices.</li>
                    <li>Redistribution or commercial sale of these images is strictly prohibited under the Pexels License.</li>
                    <li>Asthexwall is not responsible for any copyright claims made by the original photographers.</li>
                </ul>
            </>
        )) :
        renderLegal("Disclaimer", (
            <>
                <p>Asthexwall is an independent gallery app. We do not claim ownership of the visual assets provided. All credits belong to the original talented photographers on the Pexels platform.</p>
                <p>If you are a copyright owner and wish to have an image removed, please contact the Pexels team or reach out to our support.</p>
            </>
        ))
      )}

      {/* Footer */}
      <footer className="bg-black/90 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="font-black tracking-widest mb-4 text-cyan-400 uppercase">ASTHEXWALL</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                The world's most cinematic wallpaper portal. Discover thousands of ultra HD visuals for your phone and desktop. Powered by React and fueled by your aesthetic needs.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <p className="text-white mb-2">Company</p>
            <button onClick={() => setView('about')} className="text-left hover:text-cyan-400 transition-colors">About Us</button>
            <button onClick={() => setView('privacy')} className="text-left hover:text-cyan-400 transition-colors">Privacy Policy</button>
          </div>
          <div className="flex flex-col gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <p className="text-white mb-2">Legal</p>
            <button onClick={() => setView('terms')} className="text-left hover:text-cyan-400 transition-colors">Terms of Service</button>
            <button onClick={() => setView('disclaimer')} className="text-left hover:text-cyan-400 transition-colors">Disclaimer</button>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-white/5 text-[9px] text-gray-600 uppercase tracking-widest">
            © 2024 Asthexwall. High Resolution Gallery Platform.
        </div>
      </footer>
    </div>
  )
                      }
