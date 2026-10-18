import React, { useState } from 'react';
import {
  Button,
  Input,
  Field,
  Badge,
  Spinner,
  Dialog,
  Select,
  Pagination,
  DatePicker,
  Skeleton,
  EmptyState,
  ErrorState,
  OfflineBanner,
  PokemonSprite,
} from '@/components/ui';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Smartphone, Monitor, Zap, Sparkles } from 'lucide-react';

export function ComponentShowcase() {
  const isSystemReducedMotion = useReducedMotion();
  const [emulatedReducedMotion, setEmulatedReducedMotion] = useState(false);
  const [viewportMode, setViewportMode] = useState<'full' | '320' | '360' | '390' | '768' | '1024'>('full');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectValue, setSelectValue] = useState('charizard');
  const [page, setPage] = useState(1);
  const [sampleDate, setSampleDate] = useState<string>('2026-10-18');
  const [errorRetried, setErrorRetried] = useState(0);

  const activeReducedMotion = isSystemReducedMotion || emulatedReducedMotion;

  const viewportWidthClass = {
    full: 'max-w-6xl space-y-12',
    '320': 'max-w-[320px] border-4 border-border rounded-3xl p-3 shadow-2xl bg-background overflow-x-hidden space-y-8',
    '360': 'max-w-[360px] border-4 border-border rounded-3xl p-4 shadow-2xl bg-background overflow-x-hidden space-y-8',
    '390': 'max-w-[390px] border-4 border-border rounded-3xl p-4 shadow-2xl bg-background overflow-x-hidden space-y-8',
    '768': 'max-w-[768px] border-4 border-border rounded-3xl p-6 shadow-2xl bg-background overflow-x-hidden space-y-10',
    '1024': 'max-w-[1024px] border-4 border-border rounded-3xl p-6 shadow-2xl bg-background overflow-x-hidden space-y-12',
  }[viewportMode];

  return (
    <div className={`min-h-[100dvh] bg-background text-foreground p-3 sm:p-4 md:p-8 ${activeReducedMotion ? 'motion-reduce' : ''}`}>
      {/* Dev Control Bar */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8 bg-surface border border-border rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-foreground shrink-0" />
            <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Design System & UI Primitives Showcase</h1>
          </div>
          <p className="text-xs text-muted mt-0.5">Development-only environment (`/dev/components`) for visual QA and responsive audit.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reduced Motion Toggle */}
          <button
            onClick={() => setEmulatedReducedMotion(!emulatedReducedMotion)}
            className={`flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl border text-xs font-semibold transition-colors touch-manipulation ${
              activeReducedMotion
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-surface-raised text-muted border-border hover:text-foreground'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Motion: {activeReducedMotion ? 'Reduced' : 'Normal'}
          </button>

          {/* Viewport Frame Switchers */}
          <div className="flex items-center bg-surface-raised border border-border rounded-xl p-1 gap-1">
            {(['full', '320', '360', '390', '768', '1024'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewportMode(mode)}
                className={`px-2.5 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-lg text-xs font-bold transition-all touch-manipulation ${
                  viewportMode === mode
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted hover:text-foreground hover:bg-surface'
                }`}
                title={`Simulate ${mode === 'full' ? 'Full Responsive Width' : mode + 'px'}`}
              >
                {mode === 'full' ? 'Full' : `${mode}px`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container - Supports Simulated Viewport Widths */}
      <div className={`mx-auto transition-all ${viewportWidthClass}`}>
        
        {/* Section 1: Buttons & Interactive Targets */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="text-lg font-bold text-foreground">1. Buttons & Touch Targets (≥ 44px on mobile)</h2>
            <p className="text-xs text-muted">Primary, outline, and ghost variants in multiple sizes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md">Primary Button</Button>
            <Button variant="outline" size="md">Outline Button</Button>
            <Button variant="ghost" size="md">Ghost Button</Button>
            <Button variant="danger" size="md">Danger Button</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Open Dialog</Button>
          </div>
        </section>

        {/* Section 2: Form Controls & Inputs */}
        <section className="space-y-4 mt-8">
          <div className="border-b border-border pb-2">
            <h2 className="text-lg font-bold text-foreground">2. Form Fields, Inputs & Accessible Validation</h2>
            <p className="text-xs text-muted">Aria-wired label and error description handling without browser spinners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Trainer Nickname" helperText="Visible to other players in battle and trades">
              <Input placeholder="e.g. Red" defaultValue="Red" />
            </Field>

            <Field label="Astral Trade Quantity" error="Quantity cannot exceed available inventory balance">
              <Input placeholder="Enter quantity" defaultValue="999" />
            </Field>

            <Field label="Select Starter Pokémon">
              <Select
                value={selectValue}
                onChange={setSelectValue}
                options={[
                  { label: 'Bulbasaur', value: 'bulbasaur' },
                  { label: 'Charmander', value: 'charmander' },
                  { label: 'Squirtle', value: 'squirtle' },
                  { label: 'Charizard', value: 'charizard' },
                ]}
              />
            </Field>

            <Field label="Tournament Date">
              <DatePicker value={sampleDate} onChange={setSampleDate} />
            </Field>
          </div>
        </section>

        {/* Section 3: Badges, Status & Feedback */}
        <section className="space-y-4 mt-8">
          <div className="border-b border-border pb-2">
            <h2 className="text-lg font-bold text-foreground">3. Badges, Indicators & Health Tokens</h2>
            <p className="text-xs text-muted">Strict functional health tokens and monochrome tags.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">Neutral Tag</Badge>
            <Badge variant="ink">Ink Badge</Badge>
            <Badge variant="silt">Silt Badge</Badge>
            <Badge variant="success">High HP / Active</Badge>
            <Badge variant="warning">Mid HP / Warning</Badge>
            <Badge variant="error">Low HP / Critical</Badge>
            <div className="flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-lg text-xs font-semibold">
              <Spinner size="sm" />
              <span>Async Spinner</span>
            </div>
          </div>
        </section>


        {/* Section 4: Screen State Primitives */}
        <section className="space-y-4 mt-8">
          <div className="border-b border-border pb-2">
            <h2 className="text-lg font-bold text-foreground">4. Screen State Primitives (Loading, Empty, Error, Offline)</h2>
            <p className="text-xs text-muted">Standardized states used across all 7 core game and admin screens.</p>
          </div>

          <div className="space-y-6">
            {/* Skeleton Variants */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-2">Skeleton Loading Placeholders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="80%" />
                </div>
                <div className="p-4 bg-surface border border-border rounded-xl flex items-center gap-3">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="space-y-2 flex-1">
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="40%" />
                  </div>
                </div>
                <Skeleton variant="card" />
              </div>
            </div>

            {/* Offline Banner Preview */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted mb-2">Offline Banner Preview</h3>
              <div className="border border-border rounded-xl overflow-hidden">
                <OfflineBanner />
                <div className="p-4 text-xs text-subtle text-center bg-surface">
                  (Simulated banner automatically appears when device disconnects from internet)
                </div>
              </div>
            </div>

            {/* EmptyState and ErrorState in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EmptyState
                title="No Wild Pokémon Found"
                description="There are currently no encounters available in this zone. Check back shortly!"
                action={<Button variant="outline" size="sm">Explore Another Zone</Button>}
              />

              <ErrorState
                title="Failed to Sync Battle"
                message="Socket connection dropped unexpectedly while resolving turn calculations."
                requestId="req_dev_showcase_999"
                onRetry={() => setErrorRetried((c) => c + 1)}
                retryLabel={`Retry Connection (${errorRetried})`}
              />
            </div>
          </div>
        </section>

        {/* Section 5: Sprite Preloading & Optimization */}
        <section className="space-y-4 mt-8 pb-12">
          <div className="border-b border-border pb-2">
            <h2 className="text-lg font-bold text-foreground">5. Optimized Sprite Preloading & Fallbacks</h2>
            <p className="text-xs text-muted">Cloudinary auto-format/quality transformations with skeleton and fallback states.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-surface border border-border rounded-2xl flex flex-col items-center text-center">
              <PokemonSprite speciesId={6} size="xl" alt="Charizard" />
              <span className="text-xs font-bold text-foreground mt-2">Charizard (No. 6)</span>
              <span className="text-[10px] text-muted">Normal Sprite</span>
            </div>

            <div className="p-4 bg-surface border border-border rounded-2xl flex flex-col items-center text-center">
              <PokemonSprite speciesId={25} size="xl" alt="Pikachu" />
              <span className="text-xs font-bold text-foreground mt-2">Pikachu (No. 25)</span>
              <span className="text-[10px] text-muted">Auto WebP / f_auto</span>
            </div>

            <div className="p-4 bg-surface border border-border rounded-2xl flex flex-col items-center text-center">
              <PokemonSprite speciesId={150} size="xl" alt="Mewtwo" />
              <span className="text-xs font-bold text-foreground mt-2">Mewtwo (No. 150)</span>
              <span className="text-[10px] text-muted">Pixelated Rendering</span>
            </div>


            <div className="p-4 bg-surface border border-border rounded-2xl flex flex-col items-center text-center">
              <PokemonSprite speciesId={9999999} size="xl" alt="Missing Pokémon" />
              <span className="text-xs font-bold text-foreground mt-2">Invalid ID Fallback</span>
              <span className="text-[10px] text-muted">Graceful Error State</span>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Pagination
              page={page}
              totalPages={5}
              onPageChange={setPage}
            />
          </div>
        </section>

      </div>

      {/* Accessible Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Sample Design System Modal"
        description="This modal adheres strictly to monochrome palette tokens and focus trapping."
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-muted leading-relaxed">
            All interactive dialogs render on white background with semantic borders, avoiding custom arbitrary colors and adhering to the Astranox accessibility guidelines.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
            <Button variant="primary" onClick={() => setIsDialogOpen(false)}>Confirm Action</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default ComponentShowcase;
