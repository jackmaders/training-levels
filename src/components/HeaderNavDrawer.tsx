import { Menu, X, Home, Layers, Dog, BookOpen } from 'lucide-react';

interface HeaderNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  activeRoute: 'home' | 'custom' | 'dog' | 'library';
  onNavigate: (route: 'home' | 'custom' | 'dog' | 'library') => void;
  dogName?: string;
}

export function HeaderNavDrawer({
  isOpen,
  onClose,
  onOpen,
  activeRoute,
  onNavigate,
  dogName = 'Barnaby',
}: HeaderNavDrawerProps) {
  return (
    <>
      {/* Header bar with Hamburger Menu */}
      <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open Navigation Menu"
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-100">Training Levels</span>
          <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
            {dogName}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('custom')}
          className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-800/60 border border-zinc-700/60 cursor-pointer"
        >
          Curriculum
        </button>
      </header>

      {/* Slide-in Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={onClose} />
          <div className="relative bg-zinc-900 border-r border-zinc-700 w-64 max-w-[80vw] h-full flex flex-col justify-between p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200 text-left">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                    <Dog size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-100">{dogName}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">Level 1 • Active</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="p-1 rounded-lg text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav Items */}
              <nav className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('home');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeRoute === 'home'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Home size={16} />
                  <span>Home (Recommended)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('custom');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeRoute === 'custom'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Layers size={16} />
                  <span>Custom Training (Curriculum)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('library');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeRoute === 'library'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <BookOpen size={16} />
                  <span>Sue's Rules & Guidelines</span>
                </button>
              </nav>
            </div>

            <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono text-center">
              Dog Training Levels • Volumes 1 & 2
            </div>
          </div>
        </div>
      )}
    </>
  );
}
