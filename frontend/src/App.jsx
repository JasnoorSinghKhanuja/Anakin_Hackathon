import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Loader2,
  Search,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Zap
} from 'lucide-react';
import { Badge } from './components/ui/badge.jsx';
import { Button } from './components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card.jsx';
import { Input } from './components/ui/input.jsx';
import { Skeleton } from './components/ui/skeleton.jsx';
import { Textarea } from './components/ui/textarea.jsx';
import { compactTitle, formatCurrency } from './lib/utils.js';
import { getRecommendation, searchProducts } from './services/api.js';

const storeNames = {
  electronics: ['Amazon', 'Flipkart', 'Reliance Digital'],
  grocery: ['Blinkit', 'JioMart', 'BigBasket']
};

const quickSearches = {
  electronics: ['iPhone 15', 'Sony headphones', 'Samsung 55 inch TV'],
  grocery: ['bread milk eggs atta', 'rice dal oil sugar', 'paneer curd vegetables']
};

export default function App() {
  const [mode, setMode] = useState('electronics');
  const [query, setQuery] = useState('iPhone 15');
  const [pincode, setPincode] = useState('');
  const [results, setResults] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const basketItems = useMemo(() => query.split(/[\n, ]+/).map((item) => item.trim()).filter(Boolean).slice(0, 10), [query]);

  async function handleSearch(event) {
    event?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const search = await searchProducts(mode, {
        query: query.trim(),
        pincode: pincode.trim() || undefined,
        page: 1,
        limit: 8
      });
      setResults(search);

      const rec = await getRecommendation({
        mode,
        query: query.trim(),
        results: search
      });
      setRecommendation(rec.recommendation);
    } catch (err) {
      setError(err.message || 'Something went wrong while comparing stores.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setResults(null);
    setRecommendation(null);
    setError('');
    setQuery(nextMode === 'electronics' ? 'iPhone 15' : 'bread milk eggs atta');
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#eef5f3] text-slate-950">
      <div className="ambient-bg" />
      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-5 sm:px-6 lg:px-8">
        <Nav />
        <Hero
          mode={mode}
          query={query}
          pincode={pincode}
          basketItems={basketItems}
          onModeChange={switchMode}
          onPincodeChange={setPincode}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          loading={loading}
        />

        <StoreStrip mode={mode} />

        <AnimatePresence mode="wait">
          {loading && <LoadingState key="loading" />}
          {!loading && error && <ErrorState key="error" message={error} />}
          {!loading && !error && results && (
            <ResultsView
              key="results"
              mode={mode}
              results={results}
              recommendation={recommendation}
              onCompareAgain={handleSearch}
            />
          )}
          {!loading && !error && !results && <EmptyState key="empty" mode={mode} />}
        </AnimatePresence>
      </section>
    </main>
  );
}

function Nav() {
  return (
    <div className="flex items-center justify-between rounded-full border border-white/70 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-glow">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-black tracking-normal">BuyWise.AI</p>
          <p className="text-xs font-medium text-slate-500">Shopping intelligence</p>
        </div>
      </div>
      <Badge tone="teal" className="hidden sm:inline-flex">Wire + Gemini</Badge>
    </div>
  );
}

function Hero({ mode, query, pincode, basketItems, onModeChange, onPincodeChange, onQueryChange, onSearch, loading }) {
  return (
    <div className="grid items-center gap-8 pt-4 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl">
          <Zap className="h-4 w-4 text-teal-600" />
          Search supported stores in parallel
        </div>
        <div className="space-y-4">
          <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
            BuyWise.AI
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            An AI shopping copilot that normalizes store data, compares total value, and tells you the smartest place to buy.
          </p>
        </div>

        <form onSubmit={onSearch} className="rounded-lg border border-white/70 bg-white/75 p-3 shadow-panel backdrop-blur-xl">
          <div className="mb-3 grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1">
            <ModeButton active={mode === 'electronics'} icon={SlidersHorizontal} onClick={() => onModeChange('electronics')}>
              Electronics
            </ModeButton>
            <ModeButton active={mode === 'grocery'} icon={ShoppingBasket} onClick={() => onModeChange('grocery')}>
              Grocery
            </ModeButton>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_150px_auto]">
            {mode === 'grocery' ? (
              <Textarea
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="bread milk eggs atta"
                className="min-h-12 rounded-lg lg:min-h-12"
              />
            ) : (
              <Input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search iPhone 15, TV, headphones..."
              />
            )}
            <Input
              value={pincode}
              onChange={(event) => onPincodeChange(event.target.value)}
              inputMode="numeric"
              placeholder="Pincode"
              aria-label="Pincode"
            />
            <Button type="submit" variant="dark" size="lg" disabled={loading} className="h-12">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              Compare
            </Button>
          </div>

          {mode === 'grocery' && basketItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {basketItems.map((item) => (
                <Badge key={item} tone="teal">{item}</Badge>
              ))}
            </div>
          )}
        </form>

        <div className="flex flex-wrap gap-2">
          {quickSearches[mode].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onQueryChange(item)}
              className="rounded-full border border-white/80 bg-white/55 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white"
            >
              {item}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }} className="relative">
        <div className="hero-visual">
          <div className="hero-grid">
            {storeNames[mode].map((store, index) => (
              <motion.div
                key={store}
                className="store-tile"
                animate={{ y: [0, index % 2 ? 8 : -8, 0] }}
                transition={{ duration: 4 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Store className="h-5 w-5 text-teal-300" />
                <span>{store}</span>
              </motion.div>
            ))}
          </div>
          <div className="hero-orbit-card">
            <Bot className="h-7 w-7 text-teal-300" />
            <div>
              <p className="text-sm font-bold text-white">AI recommendation</p>
              <p className="text-xs text-slate-300">Price, rating, delivery, offers</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ModeButton({ active, icon: Icon, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 items-center justify-center gap-2 rounded-full text-sm font-bold transition ${
        active ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:bg-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function StoreStrip({ mode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {storeNames[mode].map((store) => (
        <Badge key={store} tone="white" className="border border-white/15 bg-slate-950/75 text-white backdrop-blur-xl">
          {store}
        </Badge>
      ))}
    </div>
  );
}

function ResultsView({ mode, results, recommendation, onCompareAgain }) {
  const summary = results.summary || {};
  const grocery = summary.grocery;

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-14">
      <RecommendationCard recommendation={recommendation} query={results.query} />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={CircleDollarSign} label="Best price" product={summary.cheapest} tone="green" />
        <MetricCard icon={Star} label="Best value" product={summary.bestValue} tone="amber" />
        <MetricCard icon={Clock3} label="Fastest delivery" product={summary.fastest} tone="teal" />
      </div>

      {mode === 'grocery' && grocery && <GroceryView grocery={grocery} recommendation={recommendation} />}

      {results.errors?.length > 0 && (
        <Card className="border-amber-300/40 bg-amber-50/80">
          <CardContent className="py-4 text-sm font-medium text-amber-900">
            Some stores could not be reached: {results.errors.map((err) => err.storeName).join(', ')}. BuyWise kept the successful results.
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-normal">Store comparison</h2>
          <p className="text-sm text-slate-500">{results.products.length} normalized products sorted by effective price.</p>
        </div>
        <Button type="button" variant="subtle" onClick={onCompareAgain}>
          <Search className="h-4 w-4" />
          Compare again
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Object.values(results.stores || {}).map((storeResult) => (
          <StoreComparison key={storeResult.store.id} storeResult={storeResult} />
        ))}
      </div>
    </motion.section>
  );
}

function RecommendationCard({ recommendation, query }) {
  return (
    <Card className="overflow-hidden border-slate-950/10 bg-slate-950 text-white">
      <CardContent className="grid gap-5 p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-300 text-slate-950">
          <Bot className="h-7 w-7" />
        </div>
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone="white">AI pick: {recommendation?.bestStore || 'Analyzing'}</Badge>
            <Badge tone="white">Cheapest: {recommendation?.cheapestStore || 'Pending'}</Badge>
          </div>
          <h2 className="text-2xl font-black tracking-normal">{recommendation?.summary || `BuyWise is ready to compare "${query}".`}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{recommendation?.bestReason || 'Recommendation appears here after store results are normalized.'}</p>
        </div>
        <Sparkles className="hidden h-10 w-10 text-teal-300 lg:block" />
      </CardContent>
    </Card>
  );
}

function MetricCard({ icon: Icon, label, product, tone }) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge tone={tone}>{label}</Badge>
          <Icon className="h-5 w-5 text-slate-500" />
        </div>
        <div>
          <p className="text-2xl font-black tracking-normal">{product ? formatCurrency(product.effectivePrice || product.price) : '-'}</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">{product?.storeName || 'No result yet'}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{product ? compactTitle(product.title, 64) : 'Search supported stores to compare.'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function GroceryView({ grocery, recommendation }) {
  const split = grocery.splitBasket || recommendation?.splitBasketSuggestion;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Single-store basket totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(grocery.storeTotals || []).map((store) => (
            <div key={store.storeId} className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="font-bold">{store.storeName}</p>
                <p className="text-xs text-slate-500">{store.itemCount} matched items · {store.deliveryText || 'Delivery unknown'}</p>
              </div>
              <p className="text-lg font-black">{formatCurrency(store.total)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className={split?.worthIt ? 'border-teal-400/30 bg-teal-50/80' : 'border-slate-200/70'}>
        <CardHeader>
          <CardTitle>Split basket suggestion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge tone={split?.worthIt ? 'green' : 'slate'}>{split?.worthIt ? 'Worth considering' : 'Skip the split'}</Badge>
            <p className="text-sm font-bold text-slate-700">Savings: {formatCurrency(split?.savings || 0)}</p>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {split?.reason || 'BuyWise only suggests a split when savings are meaningful.'}
          </p>
          <p className="rounded-lg bg-white/70 p-3 text-xs font-semibold leading-5 text-slate-500">
            Split baskets can arrive at different times because each store fulfills separately.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StoreComparison({ storeResult }) {
  const first = storeResult.products?.[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{storeResult.store.name}</CardTitle>
          <p className="mt-1 text-sm text-slate-500">{storeResult.products?.length || 0} results · {storeResult.store.actionId}</p>
        </div>
        {first?.availability && first.availability !== 'unknown' && (
          <Badge tone={first.availability === 'in stock' ? 'green' : 'slate'}>
            {first.availability}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4 max-h-[700px] overflow-y-auto">
        {storeResult.error && <p className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{storeResult.error}</p>}
        {(storeResult.products || []).sort(
          (a, b) =>
            (a.effectivePrice || a.price || Infinity) -
            (b.effectivePrice || b.price || Infinity)
          ).map((product) => (
            <ProductRow key={`${product.storeId}-${product.rawId}-${product.title}`} product={product} />
        ))}
      </CardContent>
    </Card>
  );
}

function ProductRow({ product }) {
  return (
    <div className="grid grid-cols-[74px_1fr] gap-4 rounded-lg border border-slate-100 bg-white/75 p-3">
      <img
        src={product.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80'}
        alt={product.title}
        className="h-[74px] w-[74px] rounded-lg object-cover"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-black">{compactTitle(product.title, 80)}</p>
          {product.rating && (
            <Badge tone="amber" className="px-2 py-0.5">
              <Star className="mr-1 h-3 w-3 fill-current" />
              {product.rating}
            </Badge>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <p className="text-xl font-black tracking-normal">{formatCurrency(product.effectivePrice || product.price)}</p>
          {product.mrp && <p className="text-sm font-semibold text-slate-400 line-through">{formatCurrency(product.mrp)}</p>}
          {product.deliveryText && <Badge tone="teal">{product.deliveryText}</Badge>}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {product.offers?.slice(0, 2).map((offer) => (
              <Badge key={offer} tone="green">{offer}</Badge>
            ))}
          </div>
          {product.productUrl && (
            <Button asChild variant="subtle" size="sm" className="h-8 px-3">
              <a href={product.productUrl} target="_blank" rel="noreferrer">
                Open store
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 pb-14">
      <Card className="bg-slate-950 text-white">
        <CardContent className="flex items-center gap-4 p-6">
          <Loader2 className="h-6 w-6 animate-spin text-teal-300" />
          
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </motion.section>
  );
}

function EmptyState({ mode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-14">
      <Card className="border-dashed border-slate-300 bg-white/50">
        <CardContent className="flex flex-col items-center justify-center py-14 text-center">
          <CheckCircle2 className="h-12 w-12 text-teal-600" />
          <h2 className="mt-4 text-2xl font-black tracking-normal">
            Paste {mode === 'grocery' ? 'a grocery basket' : 'a product'} to begin
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            BuyWise searches the supported stores, normalizes pricing and availability, then asks Gemini for a compact decision explanation.
          </p>
        </CardContent>
      </Card>
    </motion.section>
  );
}

function ErrorState({ message }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-14">
      <Card className="border-red-200 bg-red-50/80">
        <CardContent className="py-8">
          <p className="text-lg font-black text-red-800">BuyWise hit a snag</p>
          <p className="mt-2 text-sm leading-6 text-red-700">{message}</p>
        </CardContent>
      </Card>
    </motion.section>
  );
}
