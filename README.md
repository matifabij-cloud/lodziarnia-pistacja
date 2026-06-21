# Lodziarnia Pistacja — strona one-page

Jednostronicowa, mobile-first strona dla lokalnego brandu lodziarni **Pistacja** z Łodzi.
Pokazuje w kilka sekund, **gdzie jest najbliższa otwarta budka** i dlaczego warto tam pójść.

**Stack:** React + TypeScript + Tailwind CSS (Vite). Bez backendu — demo.

## Uruchomienie

```bash
npm install
npm run dev      # tryb deweloperski (http://localhost:5173)
npm run build    # produkcyjny build (sprawdza też typy)
npm run preview  # podgląd builda
```

## Co jest w środku

Cała strona to jeden samodzielny komponent: [`src/LodziarniaPistacja.tsx`](src/LodziarniaPistacja.tsx).
Reszta plików to standardowy scaffold Vite + Tailwind (paleta i fonty w `tailwind.config.js`).

Sekcje: Hero · pasek dowodu społecznego · **Lokalizacje** (serce strony) · Menu (zajawka) ·
Opinie · O nas · Stopka + finalne CTA, plus mobilny sticky pasek „Trasa / Zadzwoń".

### Funkcje
- **„Otwarte teraz"** liczone na żywo z godzin każdej budki i aktualnej godziny (`new Date()`),
  badge odświeża się co minutę.
- **„Najbliższa budka"** (opcjonalnie) — geolokalizacja przeglądarki sortuje i wyróżnia
  najbliższą **otwartą** budkę. Działa progresywnie: bez zgody na lokalizację strona pokazuje
  wszystkie budki w stałej kolejności.
- **„Wyznacz trasę"** → Google Maps (`dir/?api=1&destination=<adres>`), zawsze z pełnego,
  dokładnego adresu.
- **„Zadzwoń"** → `tel:` (klikalne na telefonie) — tam, gdzie mamy potwierdzony numer.

## ⚠️ Placeholdery do potwierdzenia z klientem

Zgodnie z zasadą uczciwości użyto **wyłącznie** danych i cytatów z briefu. Do uzupełnienia:

| Element | Status |
|---|---|
| **Zdjęcia** (lody, gofry, kawa, budki) | oznaczone sloty `[zdjęcie …]` — brak realnych zdjęć |
| **Pełne menu i ceny** | `[do potwierdzenia]` — cena „od ok. 8 zł" pochodzi z jednej opinii |
| **Telefony: Radogoszcz, Retkinia** | `[do potwierdzenia]` — potwierdzony tylko numer do Łagiewnik |
| **„O nas" / historia marki** | `[do uzupełnienia z właścicielem]` — brak zmyślonej historii |
| **Social media** (Instagram, Facebook) | `[do potwierdzenia]` — placeholdery w stopce |
| **Link „wszystkie opinie w Google"** | tymczasowo wyszukiwarka Map — podmienić na link do wizytówki Google |
| **Współrzędne budek** | przybliżone (tylko do podpowiedzi „najbliżej Ciebie"); nawigacja używa dokładnego adresu |

## Dane (z briefu)

| Budka | Adres | Godziny | Ocena | Telefon |
|---|---|---|---|---|
| Radogoszcz | Syrenki 18, 91-496 Łódź | 10:00–21:00 | 4,9★ (91) | [do potwierdzenia] |
| Łagiewniki | Warszawska 55, 91-859 Łódź | 10:00–21:00 | 4,8★ (23) | 667 485 760 |
| Retkinia | Wileńska 44a, 94-011 Łódź | 10:00–20:00 | 4,7★ (47) | [do potwierdzenia] |
