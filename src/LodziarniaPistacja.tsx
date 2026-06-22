/**
 * Lodziarnia Pistacja — jednostronicowa, mobile-first strona (one-page).
 * Samodzielny komponent React + TypeScript + Tailwind. Bez backendu (demo).
 *
 * Główny cel strony (ONE primary action): klik „Wyznacz trasę" lub „Zadzwoń"
 * do najbliższej / otwartej budki.
 *
 * Wszystkie dane (adresy, godziny, oceny, cytaty) pochodzą z briefu klienta.
 * Fragmenty oznaczone [do potwierdzenia] / [placeholder] czekają na dane od właściciela.
 */

import { useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────────
   DANE (prawdziwe — wyłącznie z briefu)
   ──────────────────────────────────────────────────────────────────────────── */

type Booth = {
  id: string;
  district: string;
  street: string;
  postal: string;
  rating: number;
  reviews: number;
  /** Telefon publiczny potwierdzony tylko dla Łagiewnik. */
  phone?: string;
  /** Godziny otwarcia (taki sam grafik pon–nd). */
  openHour: number;
  closeHour: number;
  /** Współrzędne przybliżone — używane WYŁĄCZNIE do podpowiedzi „najbliżej Ciebie".
   *  Nawigacja („Wyznacz trasę") korzysta z pełnego adresu, więc jest dokładna.
   *  [współrzędne do potwierdzenia — przybliżone wg dzielnicy] */
  coords: { lat: number; lng: number };
};

const BOOTHS: Booth[] = [
  {
    id: "radogoszcz",
    district: "Radogoszcz",
    street: "Syrenki 18",
    postal: "91-496",
    rating: 4.9,
    reviews: 91,
    openHour: 10,
    closeHour: 21,
    coords: { lat: 51.8085, lng: 19.449 },
  },
  {
    id: "lagiewniki",
    district: "Łagiewniki",
    street: "Warszawska 55",
    postal: "91-859",
    rating: 4.8,
    reviews: 23,
    phone: "667 485 760",
    openHour: 10,
    closeHour: 21,
    coords: { lat: 51.8235, lng: 19.473 },
  },
  {
    id: "retkinia",
    district: "Retkinia",
    street: "Wileńska 44a",
    postal: "94-011",
    rating: 4.7,
    reviews: 47,
    openHour: 10,
    closeHour: 20,
    coords: { lat: 51.746, lng: 19.394 },
  },
];

type Review = { quote: string; author: string; rating: number };

const REVIEWS: Review[] = [
  {
    quote:
      "Jedne z lepszych lodów w Łodzi! Ricotta z marakują oraz pistacja — obłęd. Bardzo miła obsługa.",
    author: "Karolina C.",
    rating: 5,
  },
  {
    quote:
      "Porcja 8 PLN, całkiem spora, lody smaczne, nie są sztuczne, niezły wybór smaków.",
    author: "Wojciech",
    rating: 5,
  },
  {
    quote:
      "Gorąco polecam gofry z budki na Radogoszczu! Są przepyszne i świeże. Obsługa niezwykle miła.",
    author: "Łukasz",
    rating: 5,
  },
  {
    quote: "Pyszne lody! Super porcja, co się chwali, za normalną cenę.",
    author: "Kasia K.",
    rating: 5,
  },
];

/** Link do listy opinii w Google (wyszukiwarka map). [docelowo: link do wizytówki Google] */
const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=Lodziarnia+Pistacja+%C5%81%C3%B3d%C5%BA";

// BASE_URL = ścieżka bazowa builda (np. "/lodziarnia-pistacja/"), żeby zdjęcia
// z public/ ładowały się poprawnie również pod podkatalogiem GitHub Pages.
const B = import.meta.env.BASE_URL;
const PHOTOS = {
  lodyKubek: {
    src: `${B}photos/lody-kubek.jpg.jpg`,
    alt: "Lody jagodowe w kubku i lody w rożku z bitą śmietaną na tle budki Pistacja",
  },
  budka: {
    src: `${B}photos/budka.jpg.webp`,
    alt: "Różowa budka Lodziarni Pistacja z neonem i obsługą w oknie",
  },
  gofr: {
    src: `${B}photos/gofr.jpg.webp`,
    alt: "Gofr z truskawkami, kiwi, gruszką i bitą śmietaną na papierowej tacce",
  },
  lodyRozek: {
    src: `${B}photos/lody-rozek.jpg.webp`,
    alt: "Lody w rożku — śmietankowe i mango — trzymane przed budką",
  },
} as const;

/* ────────────────────────────────────────────────────────────────────────────
   POMOCNICZE
   ──────────────────────────────────────────────────────────────────────────── */

const fullAddress = (b: Booth) => `${b.street}, ${b.postal} Łódź`;

const mapsDirUrl = (b: Booth) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    fullAddress(b)
  )}`;

const telHref = (phone: string) => `tel:+48${phone.replace(/\s/g, "")}`;

/** „Otwarte teraz" liczone na żywo z godzin budki i aktualnej godziny. */
const isOpenNow = (b: Booth, now: Date) => {
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= b.openHour && h < b.closeHour;
};

type Status =
  | { open: true; closingSoon: boolean; label: string }
  | { open: false; label: string };

const getStatus = (b: Booth, now: Date): Status => {
  const h = now.getHours() + now.getMinutes() / 60;
  if (h >= b.openHour && h < b.closeHour) {
    const closingSoon = h >= b.closeHour - 1;
    return {
      open: true,
      closingSoon,
      label: closingSoon
        ? `Zamknięcie o ${b.closeHour}:00`
        : `Czynne do ${b.closeHour}:00`,
    };
  }
  if (h < b.openHour) return { open: false, label: `Otwarcie o ${b.openHour}:00` };
  return { open: false, label: `Otwarte jutro od ${b.openHour}:00` };
};

/** Odległość w km (haversine) — tylko do podpowiedzi najbliższej budki. */
const haversineKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

const formatKm = (km: number) =>
  `${km.toFixed(km < 10 ? 1 : 0).replace(".", ",")} km`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
};

/* ────────────────────────────────────────────────────────────────────────────
   IKONY (inline SVG — bez emoji, jednolity stroke)
   ──────────────────────────────────────────────────────────────────────────── */

type IconProps = { className?: string };
const S = 1.75;

const StarIcon = ({ className, filled = true }: IconProps & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={S} strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L12 3.5z" />
  </svg>
);
const MapPinIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 1116 0z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);
const PhoneIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.5 5.5c0 8 6 14 14 14a2 2 0 002-2v-2.2a1 1 0 00-.8-1l-3-.6a1 1 0 00-1 .4l-.9 1.2a12 12 0 01-5-5l1.2-.9a1 1 0 00.4-1l-.6-3a1 1 0 00-1-.8H6.5a2 2 0 00-2 2z" />
  </svg>
);
const ClockIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
const NavIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3.5 11L20.5 4l-7 16.5-2.4-7.1L3.5 11z" />
  </svg>
);
const ArrowRightIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const ImageIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M5 17l4.5-4.5a2 2 0 012.8 0L19 19" />
  </svg>
);
const InstagramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 8.5V7c0-1 .5-1.5 1.6-1.5H17V2.6h-2.2C12.3 2.6 11 4 11 6.6v1.9H8.8V12H11v9.4h3.5V12h2.3l.5-3.5h-2.8z" />
  </svg>
);

/* ────────────────────────────────────────────────────────────────────────────
   MAŁE KOMPONENTY
   ──────────────────────────────────────────────────────────────────────────── */

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-pistachio-500 ${className}`} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} className="h-4 w-4" filled={i < Math.round(rating)} />
      ))}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const open = status.open;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
        open ? "bg-pistachio-100 text-pistachio-700" : "bg-cream-100 text-ink-muted"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          open
            ? `bg-pistachio-500 ${
                status.closingSoon ? "" : "motion-safe:animate-pulse-soft"
              }`
            : "bg-ink-muted/60"
        }`}
      />
      {open ? "Otwarte teraz" : "Zamknięte"}
    </span>
  );
}

/** Wyraźnie oznaczony slot na zdjęcie — nie generujemy fałszywych zdjęć.
 *  Używany też jako fallback w <Photo>, gdy pliku brakuje. */
function PhotoPlaceholder({
  label,
  className = "",
  ratio = "aspect-[4/3]",
}: {
  label: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <div
      className={`${ratio} ${className} flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-pistachio-200 bg-gradient-to-br from-cream-100 to-pistachio-50 p-4 text-center`}
      role="img"
      aria-label={`Miejsce na zdjęcie: ${label}`}
    >
      <ImageIcon className="h-8 w-8 text-pistachio-400" />
      <span className="text-sm font-medium text-ink-muted">[{label}]</span>
    </div>
  );
}

/** Prawdziwe zdjęcie z lazy-loadingiem; przy braku pliku (404) wraca do placeholdera. */
function Photo({
  src,
  alt,
  label,
  ratio = "aspect-[4/3]",
  className = "",
}: {
  src: string;
  alt: string;
  label: string;
  ratio?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return <PhotoPlaceholder label={label} ratio={ratio} className={className} />;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`${ratio} ${className} w-full rounded-2xl object-cover shadow-sm`}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   KARTA LOKALIZACJI
   ──────────────────────────────────────────────────────────────────────────── */

function BoothCard({
  booth,
  now,
  recommended,
  ribbon,
  distanceKm,
}: {
  booth: Booth;
  now: Date;
  recommended: boolean;
  ribbon: string | null;
  distanceKm: number | null;
}) {
  const status = getStatus(booth, now);
  return (
    <article
      className={`relative flex flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 transition-shadow duration-200 hover:shadow-md sm:p-6 ${
        recommended ? "ring-2 ring-raspberry-500" : "ring-pistachio-100"
      }`}
    >
      {ribbon && (
        <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-raspberry-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
          {ribbon}
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold text-pistachio-700">
            {booth.district}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-ink-muted">
            <MapPinIcon className="h-4 w-4 shrink-0" />
            <span>{fullAddress(booth)}</span>
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <dl className="mt-4 space-y-2 text-[15px]">
        <div className="flex items-center gap-2 text-ink">
          <ClockIcon className="h-4 w-4 shrink-0 text-pistachio-500" />
          <dt className="sr-only">Godziny otwarcia</dt>
          <dd>
            Codziennie 10:00–{booth.closeHour}:00{" "}
            <span className={status.open ? "text-pistachio-600" : "text-ink-muted"}>
              · {status.label}
            </span>
          </dd>
        </div>
        <div className="flex items-center gap-2 text-ink">
          <Stars rating={booth.rating} />
          <dt className="sr-only">Ocena</dt>
          <dd>
            <span className="font-semibold tabular-nums">
              {booth.rating.toFixed(1).replace(".", ",")}
            </span>{" "}
            <span className="text-ink-muted">· {booth.reviews} opinii</span>
          </dd>
        </div>
        {distanceKm !== null && (
          <div className="flex items-center gap-2 text-ink">
            <NavIcon className="h-4 w-4 shrink-0 text-raspberry-600" />
            <dt className="sr-only">Odległość</dt>
            <dd className="text-ink-muted">ok. {formatKm(distanceKm)} od Ciebie</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <a
          href={mapsDirUrl(booth)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-pistachio-600 px-4 py-3 font-semibold text-white shadow-sm outline-none transition-colors duration-200 hover:bg-pistachio-700 focus-visible:ring-2 focus-visible:ring-pistachio-700 focus-visible:ring-offset-2"
        >
          <NavIcon className="h-5 w-5" />
          Wyznacz trasę
        </a>
        {booth.phone ? (
          <a
            href={telHref(booth.phone)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-raspberry-500 px-4 py-3 font-semibold text-white shadow-sm outline-none transition-colors duration-200 hover:bg-raspberry-600 focus-visible:ring-2 focus-visible:ring-raspberry-600 focus-visible:ring-offset-2"
          >
            <PhoneIcon className="h-5 w-5" />
            Zadzwoń
          </a>
        ) : (
          <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-pistachio-200 px-4 py-3 text-sm text-ink-muted">
            <PhoneIcon className="h-4 w-4" />
            Telefon [do potwierdzenia]
          </span>
        )}
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   GŁÓWNY KOMPONENT
   ──────────────────────────────────────────────────────────────────────────── */

export default function LodziarniaPistacja() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "loading" | "ok" | "denied" | "unsupported"
  >("idle");
  const locationsRef = useRef<HTMLDivElement | null>(null);

  // „Otwarte teraz" odświeżane co minutę (bez przeładowania strony).
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const requestLocation = (scroll = true) => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      if (scroll) scrollToId("lokalizacje");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("ok");
        if (scroll) scrollToId("lokalizacje");
      },
      () => {
        setGeoStatus("denied");
        if (scroll) scrollToId("lokalizacje");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 }
    );
  };

  const openCount = useMemo(
    () => BOOTHS.filter((b) => isOpenNow(b, now)).length,
    [now]
  );

  // Rekomendowana budka: najbliższa otwarta (gdy znamy lokalizację),
  // w innym wypadku otwarta z najwyższą oceną; awaryjnie budka główna.
  const distanceFor = (b: Booth) =>
    userPos ? haversineKm(userPos, b.coords) : null;

  const recommendedId = useMemo(() => {
    const open = BOOTHS.filter((b) => isOpenNow(b, now));
    if (userPos) {
      const pool = open.length ? open : BOOTHS;
      return [...pool].sort(
        (a, b) => haversineKm(userPos, a.coords) - haversineKm(userPos, b.coords)
      )[0].id;
    }
    if (open.length)
      return [...open].sort((a, b) => b.rating - a.rating)[0].id;
    return "radogoszcz";
  }, [now, userPos]);

  // Kolejność kart: najbliższe pierwsze (gdy znamy lokalizację), inaczej stała.
  const orderedBooths = useMemo(() => {
    if (!userPos) return BOOTHS;
    return [...BOOTHS].sort(
      (a, b) => haversineKm(userPos, a.coords) - haversineKm(userPos, b.coords)
    );
  }, [userPos]);

  const recommended = BOOTHS.find((b) => b.id === recommendedId) ?? BOOTHS[0];
  const recommendedOpen = isOpenNow(recommended, now);

  const ribbonFor = (id: string): string | null => {
    if (id !== recommendedId) return null;
    if (userPos) return "Najbliżej Ciebie";
    if (recommendedOpen) return "Polecana teraz";
    return "Nasza główna budka";
  };

  const year = new Date().getFullYear();

  return (
    <div className="min-h-dvh bg-cream-50 font-body text-ink antialiased">
      {/* Pasek górny */}
      <header className="sticky top-0 z-40 border-b border-pistachio-100/70 bg-cream-50/85 backdrop-blur supports-[backdrop-filter]:bg-cream-50/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2 font-display text-xl font-semibold text-pistachio-700">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-pistachio-600 text-white">
              <StarIcon className="h-4 w-4" />
            </span>
            Pistacja
          </a>
          <button
            type="button"
            onClick={() => scrollToId("lokalizacje")}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-pistachio-700 outline-none transition-colors hover:bg-pistachio-50 focus-visible:ring-2 focus-visible:ring-pistachio-600"
          >
            Lokalizacje
          </button>
        </div>
      </header>

      <main id="top">
        {/* 1. HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-pistachio-600 to-pistachio-700" aria-labelledby="hero-title">
          <div className="relative mx-auto grid max-w-5xl gap-8 px-4 pb-10 pt-10 sm:px-6 md:grid-cols-2 md:items-center md:gap-10 md:pb-16 md:pt-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-pistachio-700 shadow-sm ring-1 ring-pistachio-100">
                <span
                  className={`h-2 w-2 rounded-full ${
                    openCount > 0 ? "bg-pistachio-500 motion-safe:animate-pulse-soft" : "bg-ink-muted/60"
                  }`}
                  aria-hidden="true"
                />
                <span aria-live="polite">
                  {openCount > 0
                    ? `${openCount} z 3 budek otwarte teraz`
                    : "Budki teraz zamknięte · otwieramy o 10:00"}
                </span>
              </span>

              <h1
                id="hero-title"
                className="mt-4 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl"
              >
                Świeże lody, nie sztuczne.
                <br />
                Spore porcje.
                <br />
                <span className="text-cream-200">Trzy budki w Łodzi.</span>
              </h1>

              <p className="mt-4 max-w-md text-lg text-pistachio-100">
                Lody, gofry i kawa na Radogoszczu, w Łagiewnikach i na Retkini.
                Średnia 4,8★ z ponad 160 opinii w Google — sprawdź, gdzie dziś
                najbliżej.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => scrollToId("lokalizacje")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-semibold text-pistachio-700 shadow-sm outline-none transition-colors duration-200 hover:bg-cream-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pistachio-700"
                >
                  Zobacz, gdzie dziś zjesz
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => requestLocation(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-transparent px-5 py-3.5 font-semibold text-white ring-2 ring-white/70 outline-none transition-colors duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pistachio-700"
                >
                  <NavIcon className="h-5 w-5" />
                  Najbliższa budka
                </button>
              </div>
            </div>

            <div className="relative">
              <Photo {...PHOTOS.lodyKubek} label="zdjęcie lodów Pistacja" ratio="aspect-[4/3]" />
            </div>
          </div>
        </section>

        {/* 2. PASEK DOWODU SPOŁECZNEGO */}
        <section aria-label="Liczby" className="bg-pistachio-700">
          <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-white/20 px-4 py-6 sm:px-6">
            {[
              { big: "4,8★", small: "średnia ocen" },
              { big: "160+", small: "opinii w Google" },
              { big: "3", small: "budki w Łodzi" },
            ].map((s) => (
              <div key={s.small} className="px-2 text-center">
                <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {s.big}
                </div>
                <div className="mt-1 text-xs text-pistachio-100 sm:text-sm">{s.small}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. LOKALIZACJE — serce strony */}
        <section id="lokalizacje" ref={locationsRef} className="scroll-mt-20" aria-labelledby="loc-title">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="loc-title" className="font-display text-3xl font-bold text-pistachio-700 sm:text-4xl">
                  Gdzie dziś na lody
                </h2>
                <p className="mt-2 max-w-md text-ink-muted">
                  Wybierz najbliższą budkę i wyznacz trasę. Badge pokazuje na żywo,
                  która jest teraz otwarta.
                </p>
              </div>
              <button
                type="button"
                onClick={() => requestLocation(false)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-pistachio-700 shadow-sm ring-1 ring-pistachio-200 outline-none transition-colors hover:bg-pistachio-50 focus-visible:ring-2 focus-visible:ring-pistachio-600"
              >
                <NavIcon className="h-4 w-4" />
                {geoStatus === "loading" ? "Szukam…" : "Znajdź najbliższą"}
              </button>
            </div>

            {geoStatus === "denied" && (
              <p className="mt-3 text-sm text-ink-muted">
                Nie udało się ustalić lokalizacji — pokazujemy wszystkie budki. Możesz
                wyznaczyć trasę do dowolnej z nich.
              </p>
            )}
            {geoStatus === "unsupported" && (
              <p className="mt-3 text-sm text-ink-muted">
                Twoja przeglądarka nie udostępnia lokalizacji — wybierz budkę ręcznie poniżej.
              </p>
            )}
            {geoStatus === "ok" && (
              <p className="mt-3 text-sm text-pistachio-700">
                Ustaliliśmy Twoją lokalizację — najbliższa budka jest na górze i wyróżniona.
              </p>
            )}

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {orderedBooths.map((b) => (
                <BoothCard
                  key={b.id}
                  booth={b}
                  now={now}
                  recommended={b.id === recommendedId}
                  ribbon={ribbonFor(b.id)}
                  distanceKm={distanceFor(b)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. MENU (zajawka) */}
        <section aria-labelledby="menu-title" className="bg-pistachio-50">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
              <div>
                <h2 id="menu-title" className="font-display text-3xl font-bold text-pistachio-700 sm:text-4xl">
                  Co u nas zjesz
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Lody", "Gofry", "Kawa"].map((item) => (
                    <span key={item} className="rounded-full bg-pistachio-100 px-4 py-2 font-semibold text-pistachio-700">
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-lg text-ink">
                  Autorskie smaki, które wracają w opiniach:{" "}
                  <span className="font-semibold text-pistachio-700">pistacja</span> oraz{" "}
                  <span className="font-semibold text-pistachio-700">ricotta z marakują</span>.
                </p>
                <p className="mt-3 text-ink">
                  Spora porcja lodów za{" "}
                  <span className="font-semibold text-pistachio-700">8 zł</span> — w
                  normalnej cenie, jak chwalą w opiniach.
                </p>
                <p className="mt-4 inline-flex rounded-lg bg-white px-3 py-2 text-sm text-ink-muted">
                  [Pełne menu i pozostałe ceny do potwierdzenia z właścicielem]
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Photo {...PHOTOS.gofr} label="zdjęcie gofra" ratio="aspect-square" />
                <Photo {...PHOTOS.lodyRozek} label="zdjęcie lodów w rożku" ratio="aspect-square" />
              </div>
            </div>
          </div>
        </section>

        {/* 5. OPINIE */}
        <section aria-labelledby="reviews-title" className="bg-cream-100">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <h2 id="reviews-title" className="font-display text-3xl font-bold text-pistachio-700 sm:text-4xl">
              Co mówią klienci
            </h2>
            <p className="mt-2 text-ink-muted">Prawdziwe opinie z Google.</p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {REVIEWS.map((r) => (
                <figure key={r.author} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-pistachio-100">
                  <Stars rating={r.rating} className="text-pistachio-500" />
                  <blockquote className="mt-3 text-lg leading-relaxed text-ink">
                    „{r.quote}"
                  </blockquote>
                  <figcaption className="mt-4 font-semibold text-pistachio-700">
                    — {r.author}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="mt-8">
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-pistachio-700 shadow-sm ring-1 ring-pistachio-200 outline-none transition-colors hover:bg-pistachio-50 focus-visible:ring-2 focus-visible:ring-pistachio-600"
              >
                Zobacz wszystkie opinie w Google
                <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* 6. O NAS */}
        <section aria-labelledby="about-title" className="bg-pistachio-50">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
            <h2 id="about-title" className="font-display text-3xl font-bold text-pistachio-700 sm:text-4xl">
              O nas
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink">
              Pistacja to lokalna lodziarnia z Łodzi — trzy budki prowadzone z myślą
              o świeżych, naturalnych lodach i miłej obsłudze, którą klienci doceniają
              w opiniach.
            </p>
            <p className="mt-4 rounded-xl border border-dashed border-pistachio-200 bg-white px-4 py-3 text-ink-muted">
              [Krótka historia marki do uzupełnienia z właścicielem — kto prowadzi,
              od kiedy, co was wyróżnia.]
            </p>
            <Photo
              {...PHOTOS.budka}
              label="zdjęcie budki Pistacja"
              ratio="aspect-[16/10]"
              className="mt-6 max-w-md"
            />
          </div>
        </section>
      </main>

      {/* 7. STOPKA + FINALNE CTA */}
      <footer className="border-t border-pistachio-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <p className="font-display text-2xl font-semibold text-pistachio-700">
            Świeże lody, gofry i kawa — w trzech miejscach w Łodzi.
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {BOOTHS.map((b) => (
              <div key={b.id}>
                <h3 className="font-display text-lg font-semibold text-pistachio-700">
                  {b.district}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">{fullAddress(b)}</p>
                <p className="mt-1 text-sm text-ink-muted">Codziennie 10:00–{b.closeHour}:00</p>
                {b.phone ? (
                  <a href={telHref(b.phone)} className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-raspberry-600 hover:underline">
                    <PhoneIcon className="h-4 w-4" />
                    {b.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-ink-muted">Telefon: [do potwierdzenia]</p>
                )}
                <a
                  href={mapsDirUrl(b)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-pistachio-700 hover:underline"
                >
                  <NavIcon className="h-4 w-4" />
                  Wyznacz trasę
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-pistachio-100 pt-6">
            <span className="text-sm text-ink-muted">Znajdź nas:</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-pistachio-200 px-3 py-1.5 text-sm text-ink-muted">
              <InstagramIcon className="h-4 w-4" /> Instagram [do potwierdzenia]
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-pistachio-200 px-3 py-1.5 text-sm text-ink-muted">
              <FacebookIcon className="h-4 w-4" /> Facebook [do potwierdzenia]
            </span>
          </div>

          <p className="mt-8 text-sm text-ink-muted">
            © {year} Lodziarnia Pistacja · Łódź. Strona demonstracyjna.
          </p>
        </div>
      </footer>

      {/* Mobilny sticky pasek — najszybsza droga do celu (Trasa / Zadzwoń) */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-pistachio-100 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-muted">
              {userPos ? "Najbliżej Ciebie" : "Polecana budka"}
            </p>
            <p className="flex items-center gap-1.5 truncate font-semibold text-pistachio-700">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  recommendedOpen ? "bg-pistachio-500" : "bg-ink-muted/60"
                }`}
                aria-hidden="true"
              />
              {recommended.district}
              <span className="font-normal text-ink-muted">
                · {recommendedOpen ? "otwarte" : "zamknięte"}
              </span>
            </p>
          </div>
          {recommended.phone && (
            <a
              href={telHref(recommended.phone)}
              aria-label={`Zadzwoń do budki ${recommended.district}`}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-raspberry-500 text-white outline-none transition-colors hover:bg-raspberry-600 focus-visible:ring-2 focus-visible:ring-raspberry-600"
            >
              <PhoneIcon className="h-5 w-5" />
            </a>
          )}
          <a
            href={mapsDirUrl(recommended)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-pistachio-600 px-4 font-semibold text-white outline-none transition-colors hover:bg-pistachio-700 focus-visible:ring-2 focus-visible:ring-pistachio-700"
          >
            <NavIcon className="h-5 w-5" />
            Trasa
          </a>
        </div>
      </div>
      {/* Bufor, by sticky pasek nie zasłaniał stopki na mobile */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
