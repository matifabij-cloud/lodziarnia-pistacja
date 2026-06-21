# Zdjęcia produktowe

Wgraj tutaj 4 zdjęcia z budki **dokładnie pod tymi nazwami** — komponent
`src/LodziarniaPistacja.tsx` podpina je automatycznie. Dopóki pliku nie ma,
w danym miejscu wyświetla się oznaczony placeholder (strona nigdy nie jest pusta).

| Nazwa pliku | Co ma przedstawiać | Gdzie się pojawia |
|---|---|---|
| `lody-kubek.jpg` | Lody jagodowe w kubku + rożek z bitą śmietaną na tle budki | Hero (główne) + Menu |
| `budka.jpg` | Różowa budka z neonem i obsługą w oknie | Hero (małe) + sekcja „O nas" |
| `gofr.jpg` | Gofr z truskawkami, kiwi, gruszką i bitą śmietaną | Hero (małe) + Menu |
| `lody-rozek.jpg` | Lody w rożku (śmietankowe + mango) | Menu |

## Wskazówki
- Format: `.jpg` (lub zmień rozszerzenia w `PHOTOS` w komponencie).
- Zalecane: szerokość ~1200–1600 px, skompresowane (~200–400 KB/zdjęcie).
- Zdjęcia są ładowane leniwie (`loading="lazy"`) i przycinane `object-cover`,
  więc kadr dopasuje się do slotu automatycznie.

> Pliki binarne (zdjęcia) trzeba dograć ręcznie — przez „Add file → Upload files"
> w GitHubie na branchu `claude/tender-curie-9lvb3i` albo `git add` z lokalnego dysku.
