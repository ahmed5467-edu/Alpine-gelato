import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowRight, Check, ChevronLeft, Clock3, Facebook, Instagram, MapPin, Menu as MenuIcon, Minus, Phone, Plus, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type Flavor = { name: string; note: string; tone: string; image: string };
type CartItem = { id: string; name: string; kind: 'scoop' | 'pack'; detail: string; price: number; qty: number };
type Order = { name: string; phone: string; address: string; notes: string; fulfillment: 'delivery' | 'pickup'; items: CartItem[]; total: number; orderNo: string };

const flavors: Flavor[] = [
  ['Mango','Sun-ripened and bright','#f5a229','story'], ['Strawberry','Fresh, softly tart','#e94b55','story'], ['Blueberry','Deep berry sweetness','#6c79c7','story'], ['Pineapple','A little tropical spark','#e8c73e','story'], ['Tutti Fruity','Colourful, creamy nostalgia','#f4868c','story'],
  ['Vanilla','Silky, fragrant and classic','#eee0bb','story'], ['Butter Scotch','Toasty caramel crunch','#c98243','story'], ['Butter Pecan','Roasted pecan warmth','#b47747','story'], ['Pistachio','Nutty, green and elegant','#a9bd78','story'], ['Crunch','Golden shards in every bite','#d39b62','story'],
  ['Shah Kulfa','A Karachi favourite','#c5b69b','story'], ['Chocolate Chip','Creamy with a crisp finish','#917268','hero'], ['White Fudge','Sweet, smooth and plush','#f2e1d1','story'], ['Bounty','Coconut and cocoa comfort','#7f594b','hero'], ['Cheese Strawberry','A rich berry swirl','#e97982','story'],
  ['Cookies and Creams','Dark biscuit, soft cream','#8a817e','hero'], ['Fig (Anjeer)','Honeyed fruit and cream','#ab775c','story'], ['Peshawari','A fragrant, nutty classic','#d2ac75','story'], ['Cashew','Buttery and delicate','#ddc694','story'], ['Bubble Yum','Playful, pink and nostalgic','#ef9eb2','story'],
  ['Belgian Chocolate','Our most famous flavour','#543631','hero'], ['Choc n Nut','Chocolate with a nutty edge','#8b5b3e','hero'], ['Hazelnut','Roasted, rounded, luxurious','#ae805c','hero'], ['Coffee','Bold roast, cool finish','#8f776c','hero'], ['Yogurt','Clean, fresh and tangy','#e5d8c4','story'],
].map(([name, note, tone, image]) => ({ name, note, tone, image: `/assets/gelato-${image === 'hero' ? 'hero' : 'story'}.jpg` }));

const branches = [
  ['Gulshan-e-Iqbal','A-102, Sahba Akhtar Road, Block 13-G.'], ['Nazimabad Block 5','Block 5, Nazimabad.'], ['Nazimabad Block 1','Plot C-6, Block 1, Nazimabad.'], ['Karimabad','Block 3, Gulberg, Federal B Area.'], ['North Nazimabad','Bhayani View Apartments, Block M.'], ['North Karachi','Sector 11-A.'], ['Liaquatabad','Near Venus Cinema, Block 3.'], ['Model Colony','Shop No. 42, Liaquat Ali Khan Road, Kazimabad Tina Square, Malir.'], ['Shah Faisal Colony','Bungalow 84-A, near Shahrah-e-Faisal Colony Flyover.'], ['Korangi','Sector 33-A, Landhi Road.'], ['Landhi','Sector 37-C, Landhi Town.'], ['Mehmoodabad','Mehmoodabad Number 2, near Rehman Kabab House.'],
];
const queryClient = new QueryClient();
const money = (value: number) => `Rs. ${value.toLocaleString('en-PK')}`;

function Logo({ dark = false, small = false, compact = false, source = '/assets/alpine-logo.jpg' }: { dark?: boolean; small?: boolean; compact?: boolean; source?: string }) {
  return <img src={source} alt="Alpine Gelato" className={`${compact ? 'h-10 w-[174px] object-cover object-center' : `${small ? 'w-[130px]' : 'w-[205px]'} h-auto object-contain`} ${dark ? 'mix-blend-screen' : 'mix-blend-multiply'}`} />;
}

function Header({ count, onCart }: { count: number; onCart: () => void }) {
  const [open, setOpen] = useState(false);
  const scrollTo = (id: string) => { setOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  return <header className="sticky top-0 z-20 border-b border-white/10 bg-black text-white backdrop-blur-md">
    <div className="border-b border-white/10 bg-black text-white">
      <div className="mx-auto flex min-h-9 max-w-[1240px] items-center justify-between gap-4 px-5 py-1.5 md:px-8">
        <div className="flex items-center gap-3">
          <Sparkles size={15} className="shrink-0 text-[#ff513d]" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[.16em]">Free delivery all over Karachi</span>
        </div>
        <button data-testid="button-shop-now" onClick={() => scrollTo('menu')} className="group flex shrink-0 items-center gap-2 rounded-full bg-[#fffaf3] px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#151313] transition-transform hover:-translate-y-0.5">
          Shop now <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
    <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 md:px-8">
      <button aria-label="Back to top" onClick={() => scrollTo('home')}><Logo dark compact source="/assets/alpine-logo-nav.jpg" /></button>
      <nav className="hidden items-center gap-8 md:flex">
        {['home','menu','about','branches','contact'].map((item) => <button key={item} onClick={() => scrollTo(item)} className="font-mono text-[10px] uppercase tracking-[.16em] text-white transition-colors hover:text-[#ff513d]">{item}</button>)}
      </nav>
      <div className="flex items-center gap-2">
        <button onClick={onCart} className="group flex items-center gap-2 rounded-full border border-white/20 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-black transition-transform hover:-translate-y-0.5">
          <ShoppingBag size={14} strokeWidth={2.5} /><span className="hidden sm:inline">Cart</span><span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e91519] px-1 text-[9px] text-white">{count}</span>
        </button>
        <button aria-label="Open menu" onClick={() => setOpen(!open)} className="rounded-full border border-white/25 p-2 md:hidden">{open ? <X size={17}/> : <MenuIcon size={17}/>}</button>
      </div>
    </div>
    {open && <div className="mobile-sheet border-t border-white/10 bg-black px-5 py-4 text-white md:hidden">{['home','menu','about','branches','contact'].map(item => <button key={item} onClick={() => scrollTo(item)} className="block w-full border-b border-white/10 py-3 text-left font-mono text-[11px] uppercase tracking-[.18em]">{item}</button>)}</div>}
  </header>;
}

function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.2em] ${light ? 'text-white/60' : 'text-black/45'}`}><span className={`h-1.5 w-1.5 rounded-full ${light ? 'bg-[#ff513d]' : 'bg-[#e91519]'}`}/>{children}</div>;
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`scroll-reveal ${visible ? 'is-visible' : ''} ${className}`}>{children}</div>;
}

function HeroBanner({ image }: { image?: string }) {
  return <div data-testid="hero-banner" data-admin-field="hero-banner-image" className="relative min-h-[430px] overflow-hidden rounded-[28px] border border-white/25 bg-[#c90f17]/30 shadow-2xl md:min-h-[510px]">
    {image ? <img src={image} alt="Alpine Gelato hero banner" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,250,243,.14),transparent_26%),radial-gradient(circle_at_15%_88%,rgba(255,207,151,.12),transparent_30%)]" />}
    <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border-[42px] border-white/10" />
    <div className="absolute -bottom-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full border-[28px] border-[#ffcf97]/10" />
    <div className="relative flex min-h-[430px] flex-col justify-between p-6 md:min-h-[510px] md:p-12">
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-white/60">Hero banner space</span>
        <span className="rounded-full border border-white/20 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.14em] text-white/55">Admin editable</span>
      </div>
      <div className="max-w-[690px]">
        <h1 className="font-display text-[clamp(3.7rem,10vw,7.8rem)] leading-[.86] tracking-[-.055em]">Cold comfort.<br/><em className="text-[#ffcf97]">Hot demand.</em></h1>
        <p className="mt-7 max-w-[480px] text-base leading-relaxed text-white/80 md:text-lg">Once you get a taste of our delicious Belgian Chocolate, you’ll be begging for more.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button data-testid="button-hero-order-now" onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })} className="group rounded-full bg-[#fffaf3] px-6 py-4 text-xs font-bold uppercase tracking-[.16em] text-[#151313] transition-transform hover:-translate-y-1">
            Order now <ArrowRight className="ml-2 inline transition-transform group-hover:translate-x-0.5" size={15}/>
          </button>
          <span className="border-l border-white/25 pl-4 font-mono text-[10px] uppercase tracking-[.16em] text-white/75">Free delivery<br/>all over Karachi</span>
        </div>
      </div>
    </div>
  </div>;
}

function FeaturedFlavor({ onOpenProduct }: { onOpenProduct: (flavor: Flavor) => void }) {
  return <Reveal>
    <section data-testid="featured-flavor" className="border-y border-black/10 bg-[#151313] text-[#fffaf3]">
      <div className="mx-auto grid max-w-[1240px] items-center gap-8 px-5 py-12 md:grid-cols-[1.05fr_.95fr] md:px-8 md:py-16">
        <div>
          <SectionLabel light>The house favourite</SectionLabel>
          <h2 className="font-display text-5xl leading-[.9] md:text-7xl">Killer <span className="text-[#e91519]">Belgian</span><br/>Chocolate.</h2>
          <p className="mt-5 max-w-[450px] text-sm leading-relaxed text-white/65">Our most famous flavour, made for the first scoop and the one you come back for.</p>
          <button data-testid="button-featured-flavor" onClick={() => onOpenProduct(flavors[20])} className="group mt-7 rounded-full bg-[#e91519] px-5 py-3.5 text-xs font-bold uppercase tracking-[.14em] text-white transition-transform hover:-translate-y-1">
            Try the house favourite <ArrowRight className="ml-2 inline transition-transform group-hover:translate-x-0.5" size={15}/>
          </button>
        </div>
        <div className="relative">
          <img src="/assets/chocolate-detail.jpg" alt="Killer Belgian Chocolate gelato" className="h-56 w-full rounded-[24px] object-cover md:h-72" />
          <div className="absolute -bottom-4 right-4 rounded-full bg-[#ffcf97] px-5 py-4 text-center text-[#151313] shadow-xl">
            <span className="block font-mono text-[9px] uppercase tracking-[.13em]">The one</span>
            <span className="font-display text-2xl">Rs. 50</span>
          </div>
        </div>
      </div>
    </section>
  </Reveal>;
}

function ProductModal({ flavor, onClose, onAdd }: { flavor: Flavor; onClose: () => void; onAdd: (item: CartItem) => void }) {
  const [scoops, setScoops] = useState<1 | 2>(1);
  const [vessel, setVessel] = useState<'Cup' | 'Cone'>('Cup');
  const price = scoops === 1 ? 50 : 90;
  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={onClose}>
    <div onMouseDown={e => e.stopPropagation()} className="w-full max-w-[520px] overflow-hidden rounded-t-[26px] bg-[#fffaf3] shadow-2xl sm:rounded-[26px]">
      <div className="relative h-48 overflow-hidden bg-[#e5d2b6] sm:h-56"><img src={flavor.image} alt={`${flavor.name} gelato`} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"/><button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-[#fffaf3]/90 p-2"><X size={17}/></button><div className="absolute bottom-5 left-6 text-[#fffaf3]"><p className="font-mono text-[10px] uppercase tracking-[.18em]">Make it yours</p><h2 className="font-display text-4xl">{flavor.name}</h2></div></div>
      <div className="p-6 sm:p-7"><p className="mb-5 text-sm text-black/55">{flavor.note}. Choose your scoop and vessel.</p>
        <div className="mb-5"><p className="mb-2 font-mono text-[10px] uppercase tracking-[.15em] text-black/45">Number of scoops</p><div className="grid grid-cols-2 gap-2">{([1,2] as const).map(n => <button key={n} onClick={() => setScoops(n)} className={`rounded-xl border p-3 text-left transition-colors ${scoops === n ? 'border-[#e91519] bg-[#e91519] text-white' : 'border-black/12 bg-white/50'}`}><span className="block font-semibold">{n === 1 ? 'Single scoop' : 'Double scoop'}</span><span className={`font-mono text-[11px] ${scoops === n ? 'text-white/75' : 'text-black/45'}`}>{money(n === 1 ? 50 : 90)}</span></button>)}</div></div>
        <div className="mb-6"><p className="mb-2 font-mono text-[10px] uppercase tracking-[.15em] text-black/45">Cup or cone</p><div className="grid grid-cols-2 gap-2">{(['Cup','Cone'] as const).map(v => <button key={v} onClick={() => setVessel(v)} className={`rounded-xl border p-3 font-semibold transition-colors ${vessel === v ? 'border-[#151313] bg-[#151313] text-white' : 'border-black/12 bg-white/50'}`}>{v}<span className="ml-1 text-xs opacity-50">— {money(price)}</span></button>)}</div></div>
        <button onClick={() => { onAdd({ id: `scoop-${flavor.name}-${scoops}-${vessel}`, name: flavor.name, kind:'scoop', detail:`${scoops === 1 ? 'Single' : 'Double'} Scoop — ${vessel}`, price, qty:1 }); onClose(); }} className="flex w-full items-center justify-between rounded-xl bg-[#e91519] px-5 py-4 font-bold uppercase tracking-[.12em] text-white transition-transform hover:-translate-y-0.5"><span>Add to cart</span><span>{money(price)} <ArrowRight className="ml-2 inline" size={16}/></span></button>
      </div>
    </div>
  </div>;
}

function CartDrawer({ items, onClose, onChange, onCheckout }: { items: CartItem[]; onClose: () => void; onChange: (id: string, change: number) => void; onCheckout: () => void }) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onMouseDown={onClose}><aside onMouseDown={e=>e.stopPropagation()} className="ml-auto flex h-full w-full max-w-[470px] flex-col bg-[#fffaf3] shadow-2xl">
    <div className="flex items-center justify-between border-b border-black/10 px-6 py-5"><div><SectionLabel>Current order</SectionLabel><h2 className="font-display text-3xl">Your cart <span className="font-sans text-base text-black/35">({items.reduce((s,i)=>s+i.qty,0)})</span></h2></div><button onClick={onClose} className="rounded-full border border-black/15 p-2"><X size={18}/></button></div>
    <div className="scroll-hide flex-1 overflow-y-auto px-6 py-4">{items.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><div className="mb-5 rounded-full bg-[#f3e8d6] p-5"><ShoppingBag size={28} className="text-[#e91519]"/></div><h3 className="font-display text-2xl">Nothing scooped yet</h3><p className="mt-2 max-w-[220px] text-sm text-black/50">Pick a flavour and we’ll keep it here.</p><button onClick={onClose} className="mt-6 rounded-full bg-[#151313] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Browse flavours</button></div> : items.map(item => <div key={item.id} className="flex gap-3 border-b border-black/10 py-4"><div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1dfc5]"><span className="font-display text-xl text-[#e91519]">{item.name.charAt(0)}</span></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="font-semibold">{item.name}</p><button aria-label={`Remove ${item.name}`} onClick={() => onChange(item.id, -item.qty)} className="text-black/35 hover:text-[#e91519]"><Trash2 size={15}/></button></div><p className="text-xs text-black/50">{item.detail}</p><div className="mt-2 flex items-center justify-between"><div className="flex items-center gap-2 rounded-full border border-black/12 bg-white/60 p-1"><button aria-label="Decrease quantity" onClick={() => onChange(item.id,-1)} className="rounded-full p-1 hover:bg-black/5"><Minus size={13}/></button><span className="w-4 text-center text-xs">{item.qty}</span><button aria-label="Increase quantity" onClick={() => onChange(item.id,1)} className="rounded-full p-1 hover:bg-black/5"><Plus size={13}/></button></div><p className="font-mono text-xs">{money(item.price * item.qty)}</p></div></div></div>)}</div>
    <div className="border-t border-black/10 bg-[#f5ecdf] px-6 py-5"><div className="mb-2 flex justify-between text-sm"><span className="text-black/55">Subtotal</span><span className="font-mono">{money(subtotal)}</span></div><div className="mb-4 flex justify-between text-sm"><span className="font-semibold text-[#e91519]">Delivery</span><span className="font-semibold text-[#e91519]">FREE</span></div><div className="mb-5 flex justify-between border-t border-black/10 pt-3"><span className="font-semibold">Total</span><span className="font-mono font-bold">{money(subtotal)}</span></div><button disabled={!items.length} onClick={onCheckout} className="w-full rounded-xl bg-[#e91519] py-4 text-sm font-bold uppercase tracking-[.14em] text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-black/15">Proceed to checkout <ArrowRight className="ml-2 inline" size={16}/></button></div>
  </aside></div>;
}

function Home({ onOpenProduct, onAdd }: { onOpenProduct: (flavor: Flavor) => void; onAdd: (item: CartItem) => void }) {
  const [category, setCategory] = useState<'all' | 'fruit' | 'classic'>('all');
  const filtered = useMemo(() => category === 'all' ? flavors : category === 'fruit' ? flavors.slice(0,5) : flavors.slice(5), [category]);
  return <main>
    <section id="home" className="relative overflow-hidden bg-[#e91519] text-[#fffaf3]">
      <div className="mx-auto max-w-[1240px] px-5 pb-12 pt-10 md:px-8 md:pb-16 md:pt-14">
        <SectionLabel light>Karachi’s neighborhood gelato</SectionLabel>
        <Reveal><HeroBanner /></Reveal>
      </div>
    </section>
    <FeaturedFlavor onOpenProduct={onOpenProduct}/>
    <section id="menu" className="mx-auto max-w-[1240px] scroll-mt-32 px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><SectionLabel>Pick your mood</SectionLabel><h2 className="font-display text-5xl leading-none tracking-tight md:text-7xl">25 ways to<br/><span className="text-[#e91519]">make it a day.</span></h2></div>
          <div className="flex gap-2">{(['all','fruit','classic'] as const).map(c => <button key={c} onClick={() => setCategory(c)} className={`rounded-full border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[.12em] transition-colors ${category === c ? 'border-[#151313] bg-[#151313] text-white' : 'border-black/15 hover:border-[#e91519]'}`}>{c === 'all' ? 'All flavours' : c === 'fruit' ? 'Fruit forward' : 'Creamy classics'}</button>)}</div>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-4">{filtered.map((flavor, i) => <button key={flavor.name} onClick={() => onOpenProduct(flavor)} className="menu-card group text-left" style={{animationDelay:`${Math.min(i,8)*35}ms`}}><div className="relative mb-3 aspect-[.9] overflow-hidden rounded-[22px] bg-[#eadac4]"><img src={flavor.image} alt={`${flavor.name} gelato`} className="menu-image h-full w-full object-cover"/><div className="absolute inset-0 mix-blend-color" style={{backgroundColor: flavor.tone, opacity:.38}}/><span className="absolute right-2 top-2 rounded-full bg-[#fffaf3]/85 px-2 py-1 font-mono text-[9px] text-black/55">Rs. 50</span><span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#e91519] text-white opacity-0 transition-opacity group-hover:opacity-100"><Plus size={16}/></span></div><p className="font-semibold leading-tight">{flavor.name}</p><p className="mt-1 text-xs text-black/45">{flavor.note}</p></button>)}</div>
    </section>
    <section className="bg-[#f0e4d3] px-5 py-20 md:px-8 md:py-28"><div className="mx-auto grid max-w-[1240px] items-center gap-10 md:grid-cols-[.8fr_1.2fr]"><div className="relative order-2 md:order-1"><div className="absolute -left-4 -top-5 h-20 w-20 rounded-full border border-[#e91519]/35"/><img src="/assets/gelato-story.jpg" alt="Artisanal gelato scoops" className="aspect-square w-full max-w-[460px] rounded-[50%_46%_48%_44%] object-cover shadow-lg"/></div><div id="about" className="order-1 scroll-mt-20 md:order-2"><SectionLabel>Made for Karachi</SectionLabel><h2 className="font-display text-5xl leading-[.95] md:text-6xl">A little joy,<br/><span className="text-[#e91519]">by the scoop.</span></h2><p className="mt-7 max-w-[500px] text-[17px] leading-relaxed text-black/65">Alpine Gelato is the place for delicious ice cream, a wide variety of flavours, and the kind of Belgian Chocolate people keep coming back for. From our parlours to your doorstep, we’re serving customers across Karachi.</p><div className="mt-8 grid grid-cols-2 gap-4 border-t border-black/10 pt-5"><div><p className="font-display text-3xl">25</p><p className="font-mono text-[9px] uppercase tracking-[.15em] text-black/45">Flavours to find</p></div><div><p className="font-display text-3xl">12</p><p className="font-mono text-[9px] uppercase tracking-[.15em] text-black/45">Karachi branches</p></div></div></div></div></section>
    <section className="overflow-hidden bg-[#151313] px-5 py-20 text-[#fffaf3] md:px-8 md:py-28"><div className="mx-auto grid max-w-[1240px] items-center gap-10 md:grid-cols-[1fr_1.15fr]"><div><SectionLabel light>Not subtle. Not sorry.</SectionLabel><h2 className="font-display text-6xl leading-[.86] tracking-tight md:text-8xl">Killer<br/><span className="text-[#e91519]">Belgian</span><br/>Chocolate.</h2><p className="mt-7 max-w-[420px] text-base leading-relaxed text-white/65">Once you get a taste of our delicious Belgian Chocolate, you’ll be begging for more.</p><p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-[#ffcf97]">Our most famous item on the menu.</p><button onClick={() => onOpenProduct(flavors[20])} className="mt-8 rounded-full bg-[#e91519] px-6 py-4 text-xs font-bold uppercase tracking-[.14em] text-white transition-transform hover:-translate-y-1">Try it now <ArrowRight className="ml-2 inline" size={15}/></button></div><div className="relative"><img src="/assets/chocolate-detail.jpg" alt="Rich Belgian chocolate gelato" className="h-[390px] w-full rounded-[28px] object-cover md:h-[510px]"/><div className="absolute -bottom-5 -left-5 rounded-full bg-[#ffcf97] px-6 py-5 text-center text-[#151313] shadow-xl"><span className="block font-mono text-[9px] uppercase tracking-[.13em]">The one</span><span className="font-display text-2xl">Rs. 50</span></div></div></div></section>
    <FamilyPacks onAdd={onAdd}/>
    <Branches />
  </main>;
}

function FamilyPacks({ onAdd }: { onAdd: (item: CartItem) => void }) {
  const [flavor, setFlavor] = useState(flavors[20].name);
  return <section className="mx-auto max-w-[1240px] px-5 py-20 md:px-8 md:py-28"><div className="grid overflow-hidden rounded-[28px] bg-[#e91519] text-white md:grid-cols-[.85fr_1.15fr]"><div className="flex flex-col justify-between p-7 md:p-10"><div><SectionLabel light>For the whole table</SectionLabel><h2 className="font-display text-5xl leading-[.92] md:text-6xl">Family<br/>packs.</h2><p className="mt-5 max-w-[310px] text-sm leading-relaxed text-white/75">Take the good stuff home. Pick a flavour, choose your size, and we’ll handle the rest.</p></div><div className="mt-10 flex gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#151313]"><span className="rounded-full bg-[#ffcf97] px-3 py-2">1 litre · Rs. 400</span><span className="rounded-full bg-white px-3 py-2">½ litre · Rs. 200</span></div></div><div className="bg-[#151313] p-7 md:p-10"><p className="mb-3 font-mono text-[10px] uppercase tracking-[.15em] text-white/50">Choose a flavour</p><select value={flavor} onChange={e=>setFlavor(e.target.value)} className="mb-5 w-full appearance-none rounded-xl border border-white/15 bg-white/10 p-4 text-sm text-white outline-none">{flavors.map(f=><option className="text-black" key={f.name}>{f.name}</option>)}</select><div className="grid grid-cols-2 gap-2">{([[200,'½ litre'],[400,'1 litre']] as const).map(([price,label]) => <button key={label} onClick={() => onAdd({id:`pack-${flavor}-${label}`, name:flavor, kind:'pack', detail:`Family Pack — ${label}`, price, qty:1})} className="rounded-xl border border-white/20 p-4 text-left transition-colors hover:border-[#ffcf97] hover:bg-white/10"><span className="block font-display text-2xl">{label}</span><span className="mt-1 block font-mono text-xs text-[#ffcf97]">{money(price)} <Plus className="float-right" size={15}/></span></button>)}</div></div></div></section>;
}

function Branches() {
  return <section id="branches" className="scroll-mt-20 border-t border-black/10 bg-[#fffaf3] px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-[1240px]"><div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><SectionLabel>Find your nearest scoop</SectionLabel><h2 className="font-display text-5xl md:text-7xl">Our branches.</h2></div><p className="max-w-[290px] text-sm leading-relaxed text-black/50">Twelve neighbourhoods, one very good reason to leave the house.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{branches.map(([name,address],i)=><div key={name} className="group rounded-2xl border border-black/10 bg-[#f8f2e8] p-5 transition-colors hover:border-[#e91519]"><div className="mb-10 flex items-start justify-between"><span className="font-mono text-[10px] text-black/35">0{i+1}</span><MapPin size={17} className="text-[#e91519]"/></div><h3 className="font-display text-2xl leading-none">{name}</h3><p className="mt-2 min-h-10 text-xs leading-relaxed text-black/55">{address}</p><a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, Karachi`)}`} className="mt-5 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.12em] text-[#e91519]">Get directions <ArrowRight size={13}/></a></div>)}</div></div></section>;
}

function Checkout({ items, onBack, onComplete }: { items: CartItem[]; onBack: () => void; onComplete: (order: Order) => void }) {
  const [form, setForm] = useState({ name:'', phone:'', address:'', notes:'', fulfillment:'delivery' as 'delivery'|'pickup' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const total = items.reduce((s,i)=>s+i.price*i.qty,0);
  const update = (key: string, value: string) => { setForm(f=>({...f,[key]:value})); setErrors(e=>({...e,[key]:''})); };
  const submit = () => { const next: Record<string,string> = {}; if (!form.name.trim()) next.name='Please enter your full name.'; if (!/^[\d\s+()-]{8,}$/.test(form.phone)) next.phone='Please enter a valid phone number.'; if (form.fulfillment === 'delivery' && !form.address.trim()) next.address='A delivery address is required.'; if (Object.keys(next).length) { setErrors(next); return; } onComplete({...form,items,total,orderNo:`AG-${Date.now().toString().slice(-6)}`}); };
  return <main className="min-h-[calc(100dvh-84px)] bg-[#f0e4d3] px-5 py-10 md:px-8 md:py-16"><div className="mx-auto max-w-[1100px]"><button onClick={onBack} className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-black/55 hover:text-[#e91519]"><ChevronLeft size={15}/> Back to menu</button><div className="grid gap-10 md:grid-cols-[1.1fr_.9fr]"><div><SectionLabel>Almost there</SectionLabel><h1 className="font-display text-6xl leading-[.88] md:text-8xl">Your order,<br/><span className="text-[#e91519]">your way.</span></h1><div className="mt-9 rounded-[22px] bg-[#fffaf3] p-6 md:p-8"><div className="mb-6 flex rounded-xl bg-[#f0e4d3] p-1">{(['delivery','pickup'] as const).map(type=><button key={type} onClick={()=>update('fulfillment',type)} className={`flex-1 rounded-lg py-3 text-xs font-bold uppercase tracking-[.1em] transition-colors ${form.fulfillment===type?'bg-[#151313] text-white':'text-black/45'}`}>{type}</button>)}</div>{form.fulfillment==='delivery' && <div className="mb-6 flex items-center gap-3 rounded-xl bg-[#e91519] p-4 text-white"><Sparkles size={17}/><div><p className="text-sm font-semibold">FREE DELIVERY ALL OVER KARACHI</p><p className="mt-0.5 text-xs text-white/70">Delivery charge: Rs. 0</p></div></div>}<div className="space-y-4"><Field label="Full name" value={form.name} error={errors.name} onChange={v=>update('name',v)} placeholder="Your name"/><Field label="Phone number" value={form.phone} error={errors.phone} onChange={v=>update('phone',v)} placeholder="03xx-xxxxxxx" type="tel"/>{form.fulfillment==='delivery' && <Field label="Delivery address" value={form.address} error={errors.address} onChange={v=>update('address',v)} placeholder="House, street, area, Karachi"/>}<Field label="Special instructions / order notes" value={form.notes} error="" onChange={v=>update('notes',v)} placeholder="Anything we should know?" textarea/></div><button onClick={submit} className="mt-7 w-full rounded-xl bg-[#e91519] py-4 text-sm font-bold uppercase tracking-[.15em] text-white transition-transform hover:-translate-y-0.5">Place order <ArrowRight className="ml-2 inline" size={16}/></button></div></div><OrderSummary items={items} total={total}/></div></div></main>;
}
 function Field({ label,value,error,onChange,placeholder,type='text',textarea=false }: {label:string;value:string;error?:string;onChange:(v:string)=>void;placeholder:string;type?:string;textarea?:boolean}) { return <label className="block"><span className="mb-1.5 block font-mono text-xs font-semibold uppercase tracking-[.14em] text-black/70">{label}</span>{textarea?<textarea rows={3} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full resize-none rounded-xl border border-black/12 bg-[#f8f2e8] px-4 py-3 text-sm outline-none placeholder:text-black/25 focus:border-[#e91519]"/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={`w-full rounded-xl border bg-[#f8f2e8] px-4 py-3 text-sm outline-none placeholder:text-black/25 focus:border-[#e91519] ${error?'border-[#e91519]':'border-black/12'}`}/>} {error && <span className="mt-1 block text-xs text-[#e91519]">{error}</span>}</label>; }
function OrderSummary({items,total}:{items:CartItem[];total:number}) { return <aside className="h-fit rounded-[22px] bg-[#151313] p-6 text-[#fffaf3] md:sticky md:top-28"><SectionLabel light>Order summary</SectionLabel><div className="mb-5 space-y-4">{items.map(i=><div key={i.id} className="flex justify-between gap-3 border-b border-white/10 pb-3"><div><p className="text-sm">{i.name} <span className="text-white/40">× {i.qty}</span></p><p className="mt-1 text-xs text-white/45">{i.detail}</p></div><span className="font-mono text-xs">{money(i.price*i.qty)}</span></div>)}</div><div className="flex justify-between text-sm text-white/55"><span>Subtotal</span><span className="font-mono">{money(total)}</span></div><div className="mt-3 flex justify-between text-sm text-[#ffcf97]"><span>Delivery</span><span className="font-semibold">FREE</span></div><div className="mt-5 flex justify-between border-t border-white/15 pt-4"><span className="font-semibold">Total</span><span className="font-mono font-bold">{money(total)}</span></div></aside>; }

function Confirmation({ order, onHome }: { order: Order; onHome: () => void }) {
  return <main className="min-h-[calc(100dvh-84px)] bg-[#e91519] px-5 py-16 text-white md:px-8 md:py-24"><div className="mx-auto max-w-[820px]"><div className="mb-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffcf97] text-[#151313]"><Check size={32} strokeWidth={2.5}/></div><SectionLabel light>Order received</SectionLabel><h1 className="font-display text-6xl leading-[.88] md:text-8xl">That’s the<br/><span className="text-[#ffcf97]">good stuff.</span></h1><p className="mt-7 max-w-[470px] text-lg text-white/80">Thank you for ordering from Alpine Gelato, {order.name}.</p><div className="mt-12 grid gap-4 md:grid-cols-[1.2fr_.8fr]"><div className="rounded-[22px] bg-[#fffaf3] p-6 text-[#151313]"><div className="mb-5 flex items-center justify-between border-b border-black/10 pb-4"><span className="font-mono text-[10px] uppercase tracking-[.15em] text-black/45">Order {order.orderNo}</span><span className="rounded-full bg-[#f0e4d3] px-3 py-1 font-mono text-[9px] uppercase">{order.fulfillment}</span></div>{order.items.map(i=><div key={i.id} className="flex justify-between border-b border-black/10 py-3 text-sm"><div><p>{i.name} × {i.qty}</p><p className="text-xs text-black/45">{i.detail}</p></div><span className="font-mono text-xs">{money(i.price*i.qty)}</span></div>)}<div className="mt-4 flex justify-between font-semibold"><span>Total</span><span className="font-mono">{money(order.total)}</span></div></div><div className="rounded-[22px] bg-[#151313] p-6"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-white/45">{order.fulfillment==='delivery'?'Delivering to':'Pickup for'}</p><p className="mt-3 text-sm leading-relaxed">{order.fulfillment==='delivery'?order.address:'Your selected Alpine Gelato branch'}</p><div className="mt-6 flex items-center gap-2 text-xs text-[#ffcf97]"><Clock3 size={15}/> We’ll be in touch at {order.phone}</div></div></div><button onClick={onHome} className="mt-8 rounded-full bg-white px-6 py-4 text-xs font-bold uppercase tracking-[.15em] text-[#151313]">Back to Alpine Gelato <ArrowRight className="ml-2 inline" size={15}/></button></div></main>;
}

function Footer() { return <footer id="contact" className="scroll-mt-20 bg-[#151313] px-5 pb-8 pt-16 text-[#fffaf3] md:px-8"><div className="mx-auto max-w-[1240px]"><div className="grid gap-10 border-b border-white/15 pb-14 md:grid-cols-[1.3fr_.7fr_.8fr_1fr]"><div><div className="mb-5 inline-block rounded-xl bg-black p-2"><Logo dark small/></div><p className="max-w-[240px] text-sm leading-relaxed text-white/55">Delicious ice cream, a wide variety of flavours, and Karachi’s most famous Belgian Chocolate.</p></div><div><h3 className="mb-4 font-mono text-[10px] uppercase tracking-[.18em] text-white/40">Explore</h3><div className="space-y-3 text-sm text-white/75"><a className="block hover:text-[#ff513d]" href="#menu">Menu</a><a className="block hover:text-[#ff513d]" href="#about">About</a><a className="block hover:text-[#ff513d]" href="#branches">Branches</a></div></div><div><h3 className="mb-4 font-mono text-[10px] uppercase tracking-[.18em] text-white/40">Opening hours</h3><p className="text-sm leading-relaxed text-white/75">Mon–Tue, Thu–Fri, Sun:<br/>4:30 PM – 1:00 AM</p><p className="mt-3 text-sm leading-relaxed text-white/75">Saturday: 4:30 PM – 2:00 AM<br/>Wednesday: 3:16 PM – 1:00 AM</p></div><div><h3 className="mb-4 font-mono text-[10px] uppercase tracking-[.18em] text-white/40">Say hello</h3><div className="space-y-3 text-sm text-white/75"><a href="tel:02135052266" className="flex items-center gap-2 hover:text-[#ff513d]"><Phone size={14}/>021-35052266</a><a href="tel:03010080525" className="block hover:text-[#ff513d]">0301-0080525</a><a href="tel:03010080526" className="block hover:text-[#ff513d]">0301-0080526</a><a href="mailto:info@alpinofoods.com" className="block hover:text-[#ff513d]">info@alpinofoods.com</a><div className="flex gap-3 pt-1"><a href="https://www.instagram.com/alpinegelatoofficial/?hl=en" target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-white/20 p-2 hover:border-[#ff513d]"><Instagram size={15}/></a><a href="https://www.facebook.com/AlpineGelato007/" target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full border border-white/20 p-2 hover:border-[#ff513d]"><Facebook size={15}/></a></div></div></div></div><div className="flex flex-col justify-between gap-3 pt-6 font-mono text-[9px] uppercase tracking-[.14em] text-white/35 md:flex-row"><span>© Alpine Gelato</span><span>Made for late-night cravings in Karachi</span></div></div></footer>; }

function MainApp() {
  const [location, setLocation] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Flavor | null>(null);
  const [notice, setNotice] = useState('');
  const [cart, setCart] = useState<CartItem[]>(() => { try { return JSON.parse(localStorage.getItem('alpine-cart') || '[]'); } catch { return []; } });
  const [order, setOrder] = useState<Order | null>(() => { try { return JSON.parse(sessionStorage.getItem('alpine-order') || 'null'); } catch { return null; } });
  useEffect(() => { localStorage.setItem('alpine-cart', JSON.stringify(cart)); }, [cart]);
  const add = (item: CartItem) => { setCart(current => { const found=current.find(i=>i.id===item.id); return found ? current.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i) : [...current,item]; }); setNotice(`${item.name} added to cart`); setTimeout(()=>setNotice(''),2600); };
  const change = (id:string, amount:number) => setCart(c=>c.map(i=>i.id===id?{...i,qty:i.qty+amount}:i).filter(i=>i.qty>0));
  const checkout = () => { setCartOpen(false); setLocation('/checkout'); window.scrollTo(0,0); };
  const complete = (next: Order) => { setOrder(next); sessionStorage.setItem('alpine-order',JSON.stringify(next)); setCart([]); setLocation('/confirmation'); window.scrollTo(0,0); };
  return <div className="grain min-h-[100dvh]"><Header count={cart.reduce((s,i)=>s+i.qty,0)} onCart={()=>setCartOpen(true)}/><Switch><Route path="/checkout"><Checkout items={cart} onBack={()=>setLocation('/')} onComplete={complete}/></Route><Route path="/confirmation"><Confirmation order={order || {name:'there',phone:'',address:'',notes:'',fulfillment:'delivery',items:[],total:0,orderNo:'AG-000000'}} onHome={()=>setLocation('/')}/></Route><Route path="/"><Home onOpenProduct={setSelected} onAdd={add}/><Footer/></Route></Switch>{selected && <ProductModal flavor={selected} onClose={()=>setSelected(null)} onAdd={add}/>} {cartOpen && <CartDrawer items={cart} onClose={()=>setCartOpen(false)} onChange={change} onCheckout={checkout}/>} {notice && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#151313] px-5 py-3 text-xs font-semibold text-white shadow-xl"><Check size={15} className="text-[#ffcf97]"/>{notice}</div>}</div>;
}

function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary resetKey={location.href}><MainApp/></ErrorBoundary></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>; }
export default App;