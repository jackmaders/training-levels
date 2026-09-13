import { useState, useEffect } from 'react';
import { VariantA } from './prototypes/VariantA';
import { VariantB } from './prototypes/VariantB';
import { VariantC } from './prototypes/VariantC';
import { PrototypeSwitcher, VariantOption } from './components/PrototypeSwitcher';

// Prototype Question:
// "How should the level completion dashboard, behavior step card, one-handed bottom navigation,
// and quick-reference slide-over/bottom sheet (Vaul) be organized for seamless outdoor dog handling ergonomics?"

const VARIANTS: VariantOption[] = [
  {
    key: 'A',
    name: 'Thumb-Zone Deck & Arc Dock',
    description: '100% lower-thumb reach arc, slide-up sheet, hold timer',
  },
  {
    key: 'B',
    name: 'StrongLifts Matrix & Split Dock',
    description: '4-tab bottom navigation dock, behavior progress rings',
  },
  {
    key: 'C',
    name: 'Tactical High-Vis Field HUD',
    description: '64px+ oversized buttons, sunlight mode, edge swipe tab',
  },
];

export function App() {
  const getInitialVariant = () => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('variant')?.toUpperCase();
    if (v && ['A', 'B', 'C'].includes(v)) {
      return v;
    }
    return 'A';
  };

  const [currentVariant, setCurrentVariant] = useState<string>(getInitialVariant);

  const handleSelectVariant = (key: string) => {
    setCurrentVariant(key);
    const url = new URL(window.location.href);
    url.searchParams.set('variant', key);
    window.history.replaceState({}, '', url.toString());
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('variant')?.toUpperCase();
      if (v && ['A', 'B', 'C'].includes(v)) {
        setCurrentVariant(v);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start text-slate-100 font-sans antialiased">
      {/* Active Prototype Render */}
      <div className="w-full">
        {currentVariant === 'A' && <VariantA />}
        {currentVariant === 'B' && <VariantB />}
        {currentVariant === 'C' && <VariantC />}
      </div>

      {/* Floating Prototype Switcher Bar */}
      <PrototypeSwitcher
        variants={VARIANTS}
        currentVariant={currentVariant}
        onSelectVariant={handleSelectVariant}
      />
    </div>
  );
}

export default App;
