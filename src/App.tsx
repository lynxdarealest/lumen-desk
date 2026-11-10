import { useMemo, useState, type ReactNode } from "react";
import {
  Activity, AudioLines, Bell, ChevronDown, CircleHelp, CloudSun, Code2, FolderOpen,
  GalleryVerticalEnd, Grid2X2, Image, LayoutDashboard, Monitor,
  MoreHorizontal, Music2, Pause, Play, Plus, Search, Settings2,
  SlidersHorizontal, Sun, Tv2, Upload, Volume2, Wallpaper,
  Waves, X
} from "lucide-react";

type View = "overview" | "wallpapers" | "taskbar" | "projects";
type WallpaperItem = { title: string; type: string; duration: string; accent: string; active?: boolean; source?: string; kind?: "video" | "image" | "audio" };

const wallpapers: WallpaperItem[] = [
  { title: "Neon Tokyo", type: "MP4 / 4K", duration: "02:14", accent: "tokyo", active: true },
  { title: "Aurora Drift", type: "WebM / 1440p", duration: "01:48", accent: "aurora" },
  { title: "Liquid Metal", type: "HTML / WebGL", duration: "Interactive", accent: "metal" },
  { title: "Midnight Rain", type: "MP4 / 1080p", duration: "03:20", accent: "rain" }
];

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "wallpapers", label: "Thư viện wallpaper", icon: GalleryVerticalEnd },
  { id: "taskbar", label: "Tuỳ chỉnh taskbar", icon: SlidersHorizontal },
  { id: "projects", label: "Project chuyên nghiệp", icon: Code2 }
];

function App() {
  const [view, setView] = useState<View>("overview");
  const [library, setLibrary] = useState(wallpapers);
  const [playing, setPlaying] = useState(true);
  const [brightness, setBrightness] = useState(78);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState("");
  const activeWallpaper = library.find((item) => item.active) ?? library[0];
  const filtered = useMemo(() => library.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())), [library, search]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Waves size={18} /></div><span>LUMEN <b>DESK</b></span></div>
        <div className="workspace-picker"><div className="workspace-dot" /><div><small>WORKSPACE</small><strong>Personal setup</strong></div><ChevronDown size={15} /></div>
        <nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "nav-item active" : "nav-item"} onClick={() => setView(id)}><Icon size={18} /><span>{label}</span>{id === "projects" && <em>PRO</em>}</button>)}</nav>
        <div className="sidebar-bottom">
          <div className="storage"><div className="storage-label"><span>Thư viện</span><strong>68%</strong></div><div className="progress"><i /></div><small>34.2 GB / 50 GB</small></div>
          <button className="nav-item" onClick={() => notify("Đã mở phần cài đặt")}><Settings2 size={18} /><span>Cài đặt</span></button>
          <div className="profile"><div className="avatar">DT</div><div><strong>Đức Trương</strong><small>Local profile</small></div><MoreHorizontal size={17} /></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar"><div className="crumb"><span>Workspace</span><b>/</b><strong>{navItems.find((item) => item.id === view)?.label}</strong></div><div className="top-actions"><button className="icon-btn"><Bell size={18} /></button><button className="icon-btn"><CircleHelp size={18} /></button><button className="system-status"><i /> Windows 11 <ChevronDown size={14} /></button></div></header>
        <div className="content">
          <section className="page-heading"><div><p className="eyebrow">THỨ BA, 10 THÁNG 11, 2026</p><h1>{view === "overview" ? "Chào buổi sáng, Trương." : navItems.find((item) => item.id === view)?.label}</h1><p className="subheading">Không gian desktop của bạn, được thiết kế theo cách của bạn.</p></div><button className="primary-btn" onClick={() => setShowAdd(true)}><Plus size={17} /> Thêm wallpaper</button></section>

          {view === "overview" && <Overview item={activeWallpaper} playing={playing} setPlaying={setPlaying} brightness={brightness} setBrightness={setBrightness} onOpen={(next) => setView(next)} notify={notify} />}
          {view === "wallpapers" && <Library items={filtered} search={search} setSearch={setSearch} onAdd={() => setShowAdd(true)} notify={notify} />}
          {view === "taskbar" && <Taskbar notify={notify} />}
          {view === "projects" && <Projects notify={notify} />}
        </div>
      </main>
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onImport={(item) => { setLibrary((current) => [item, ...current.map((entry) => ({ ...entry, active: false }))]); setShowAdd(false); setPlaying(true); notify(`Đã thêm ${item.title}`); }} />}
      {toast && <div className="toast"><Activity size={16} />{toast}</div>}
    </div>
  );
}

function Overview({ item, playing, setPlaying, brightness, setBrightness, onOpen, notify }: { item: WallpaperItem; playing: boolean; setPlaying: (v: boolean) => void; brightness: number; setBrightness: (v: number) => void; onOpen: (v: View) => void; notify: (v: string) => void }) {
  return <><div className="hero-grid"><div className="preview-card"><div className="preview-scene" style={{ filter: `brightness(${brightness}%)` }}>{item.source && item.kind === "video" && <video className="media-preview" src={item.source} autoPlay={playing} loop muted playsInline />}{item.source && item.kind === "image" && <img className="media-preview" src={item.source} alt={item.title} />}{!item.source && <><div className="sun-glow" /><div className="city-grid" /></>}<div className="scene-title"><span>ĐANG PHÁT</span><h2>{item.title}</h2><p>{item.type}</p></div><div className="preview-controls"><button className="round-control" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button><div className="track-line"><i /><span>{item.kind === "audio" ? "Audio" : "Live"}</span><b>{item.duration}</b></div><button className="round-control"><Volume2 size={17} /></button></div></div></div><div className="quick-panel"><div className="panel-title"><span>ĐIỀU KHIỂN NHANH</span><button onClick={() => onOpen("taskbar")}><Settings2 size={16} /></button></div><div className="control-row"><div className="control-icon violet"><Sun size={18} /></div><div><small>Độ sáng wallpaper</small><strong>{brightness}%</strong></div></div><input className="range" type="range" min="0" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} /><div className="control-row"><div className="control-icon blue"><Monitor size={18} /></div><div><small>Đang hiển thị trên</small><strong>DELL U2723QE <span className="online">● Online</span></strong></div></div><button className="outline-btn" onClick={() => notify("Đang dùng màn hình chính")}><Grid2X2 size={16} /> Quản lý màn hình</button></div></div><section className="section"><div className="section-heading"><div><h3>Wallpaper gần đây</h3><p>Chuyển đổi nhanh giữa bộ sưu tập của bạn.</p></div><button className="text-btn" onClick={() => onOpen("wallpapers")}>Xem tất cả <span>→</span></button></div><div className="wallpaper-row">{wallpapers.slice(0, 3).map((entry) => <WallpaperCard key={entry.title} item={entry} onClick={() => notify(`Đã chọn ${entry.title}`)} />)}</div></section><div className="bottom-grid"><div className="tip-card"><div className="tip-icon"><Activity size={20} /></div><div><span>MẸO NHANH</span><h3>Biến taskbar thành một phần của wallpaper.</h3><p>Thử chế độ trong suốt và tự động đổi màu theo nền.</p></div><button onClick={() => onOpen("taskbar")}>Khám phá <span>→</span></button></div><div className="weather-card"><CloudSun size={25} /><div><small>HÀ NỘI / HÔM NAY</small><strong>27° <span>Ít mây</span></strong></div><div className="weather-wave" /></div></div></>;
}

function Library({ items, search, setSearch, onAdd, notify }: { items: WallpaperItem[]; search: string; setSearch: (v: string) => void; onAdd: () => void; notify: (v: string) => void }) {
  return <section className="library-view"><div className="library-toolbar"><div className="search-box"><Search size={17} /><input placeholder="Tìm trong thư viện..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><button className="filter-btn"><SlidersHorizontal size={16} /> Bộ lọc</button><button className="outline-btn compact" onClick={onAdd}><Upload size={15} /> Import media</button></div><div className="format-pills"><span className="selected">Tất cả <b>{items.length}</b></span><span>Video</span><span>Ảnh</span><span>Project</span><span>Audio</span></div><div className="library-grid">{items.map((item) => <WallpaperCard key={item.title} item={item} large onClick={() => notify(`Đã áp dụng ${item.title}`)} />)}{items.length === 0 && <div className="empty-state">Không tìm thấy wallpaper phù hợp.</div>}</div></section>;
}

function WallpaperCard({ item, large, onClick }: { item: WallpaperItem; large?: boolean; onClick: () => void }) {
  return <button className={`wallpaper-card ${large ? "large" : ""}`} onClick={onClick}><div className={`wallpaper-thumb ${item.accent}`}><div className="thumb-overlay">{item.active && <span className="active-badge"><i /> ĐANG DÙNG</span>}<span className="duration">{item.duration}</span>{item.type.includes("Audio") && <Music2 size={28} />}</div></div><div className="card-meta"><div><strong>{item.title}</strong><small>{item.type}</small></div><MoreHorizontal size={17} /></div></button>;
}

function Taskbar({ notify }: { notify: (v: string) => void }) {
  const [transparent, setTransparent] = useState(true); const [centered, setCentered] = useState(true); const [autoColor, setAutoColor] = useState(true);
  return <section className="settings-view"><div className="settings-intro"><div className="settings-icon"><SlidersHorizontal /></div><div><h2>Taskbar, theo phong cách của bạn.</h2><p>Tinh chỉnh từng chi tiết để desktop hòa vào không gian wallpaper.</p></div></div><div className="settings-layout"><div className="settings-card"><h3>Giao diện taskbar</h3><SettingToggle label="Trong suốt hoàn toàn" description="Hoà trộn taskbar với wallpaper đang phát." value={transparent} setValue={setTransparent} /><SettingToggle label="Tự động đổi màu" description="Lấy màu nhấn từ wallpaper hiện tại." value={autoColor} setValue={setAutoColor} /><SettingToggle label="Căn giữa biểu tượng" description="Giữ layout cân bằng ở mọi màn hình." value={centered} setValue={setCentered} /></div><div className="settings-card accent-card"><div className="card-topline"><h3>Preview</h3><span><i /> Live</span></div><div className="taskbar-preview"><div className="mini-wallpaper"><div className="mini-sun" /></div><div className="mini-taskbar"><span>⊞</span><span>⌕</span><span>◈</span><span>▣</span><b>10:42</b></div></div><button className="primary-btn full" onClick={() => notify("Đã áp dụng cấu hình taskbar")}>Áp dụng thay đổi</button></div></div></section>;
}

function SettingToggle({ label, description, value, setValue }: { label: string; description: string; value: boolean; setValue: (v: boolean) => void }) {
  return <div className="setting-row"><div><strong>{label}</strong><p>{description}</p></div><button className={`toggle ${value ? "on" : ""}`} onClick={() => setValue(!value)}><i /></button></div>;
}

function Projects({ notify }: { notify: (v: string) => void }) {
  return <section className="projects-view"><div className="project-banner"><div><span className="eyebrow">LUMEN RUNTIME</span><h2>Đưa project của bạn lên desktop.</h2><p>Chạy HTML, WebGL, Three.js và shader realtime như một live wallpaper native.</p><button className="primary-btn" onClick={() => notify("Trình tạo project đang sẵn sàng")}><Plus size={16} /> Tạo project mới</button></div><div className="code-orb"><span>&lt;/&gt;</span></div></div><div className="project-features"><Feature icon={<Wallpaper />} title="HTML / WebGL" text="Tương thích Three.js, PixiJS và shader canvas." /><Feature icon={<AudioLines />} title="Audio reactive" text="Đồng bộ hình ảnh với MP3, M4A, WAV và mic." /><Feature icon={<Tv2 />} title="Multi-monitor" text="Mỗi màn hình một scene, một cấu hình riêng." /></div><div className="project-list"><div className="section-heading"><div><h3>Project của bạn</h3><p>Quản lý các workspace realtime.</p></div><button className="text-btn" onClick={() => notify("Đã mở thư mục project")}>Mở thư mục <FolderOpen size={15} /></button></div><div className="project-empty"><Code2 size={25} /><strong>Chưa có project nào</strong><span>Import một folder HTML/WebGL để bắt đầu.</span><button className="outline-btn compact" onClick={() => notify("Đã mở trình chọn folder")}>Import project</button></div></div></section>;
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="feature"><div className="feature-icon">{icon}</div><strong>{title}</strong><p>{text}</p></div>; }

function AddModal({ onClose, onImport }: { onClose: () => void; onImport: (item: WallpaperItem) => void }) {
  const [error, setError] = useState("");
  const selectFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const kind = file.type.startsWith("video/") || ["mp4", "webm", "mov", "m4v"].includes(extension) ? "video" : file.type.startsWith("image/") || ["gif", "jpg", "jpeg", "png", "webp"].includes(extension) ? "image" : file.type.startsWith("audio/") || ["m4a", "mp3", "wav", "ogg"].includes(extension) ? "audio" : undefined;
    if (!kind) { setError("Chọn video, ảnh hoặc audio (MP4, WebM, GIF, JPG, PNG, M4A)."); return; }
    onImport({ title: file.name.replace(/\.[^/.]+$/, ""), type: `${extension.toUpperCase()} / ${Math.round(file.size / 1024 / 1024)} MB`, duration: kind === "audio" ? "Audio" : "Imported", accent: kind === "image" ? "metal" : "tokyo", active: true, source: URL.createObjectURL(file), kind });
  };
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="upload-icon"><Upload /></div><h2>Thêm wallpaper mới</h2><p>Kéo thả file vào đây hoặc chọn từ máy tính.</p><label className="dropzone"><FolderOpen size={24} /><strong>Chọn media từ máy</strong><span>MP4, WebM, GIF, JPG, PNG, M4A</span><span className="outline-btn">Chọn file<input className="file-input" type="file" accept="video/*,image/*,audio/*" onChange={(event) => selectFiles(event.target.files)} /></span>{error && <small className="upload-error">{error}</small>}</label><div className="supported"><span><Image size={15} /> Video & ảnh</span><span><Music2 size={15} /> M4A / audio</span><span><Code2 size={15} /> WebGL project</span></div></div></div>;
}

export default App;
