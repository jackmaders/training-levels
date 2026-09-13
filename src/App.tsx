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
    name: 'Bottom Arc Action Hub',
    description: 'Stacked bottom timer, 5-rep tracker, pass/miss buttons & pull-up sheet',
  },
  {
    key: 'B',
    name: 'Split Bottom Dock Layout',
    description: 'Horizontal timer bar, linear rep tracker & full-height notes drawer',
  },
  {
    key: 'C',
    name: 'Tactical Bottom Bar & Side Tab',
    description: 'Oversized thumb buttons with side pull tab for notes drawer',
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start text-zinc-100 font-sans antialiased">
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
