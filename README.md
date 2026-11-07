# PORT°273

Website for PORT-273, an industrial cultural hub in Kyiv. Concept project by Iryna Vorobchuk.

- `index.html` — home page, built from the Figma frame "desing 1440"
- `spaces.html` — all four spaces with a filter by event type
- `space.html?id=…` — one space: details, equipment, booking card
- `book.html` — booking flow: space → date & time → details → review → confirmation

Static HTML/CSS/JS, no build step. Bookings are a demo: nothing is sent anywhere. Capacity, prices and equipment in `data.js` are placeholders.

```bash
python3 -m http.server 8273
```

Fonts: e-Ukraine (bundled in `fonts/`) for text, Syne from Google Fonts for the wordmark and display headings.
