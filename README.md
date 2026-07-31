# Dacia Deal Finder

Eine moderne, installierbare PWA (Progressive Web App) zur Suche nach Dacia-Modellen ab Baujahr 2024 mit spezieller Ausstattung (4x4, Bett-Umbau, Gas, Hybrid) im Raum Deutschland (Ausgangspunkt Bad Driburg).

## 🚀 Features

- **Reaktives Dashboard**: Auswahl von Modellen und Kriterien in Echtzeit.
- **Farbcodierung der Preise**:
  - 🟢 **Grün**: 17.000 € – 19.500 € (Bestpreis)
  - 🟡 **Gelb**: 20.000 € – 22.000 €
  - 🟠 **Orange**: 23.000 € – 24.000 €
  - 🔴 **Rot**: alles über 24.500 €
- **Präzise Such-Direktlinks**: Generiert tiefe Direktlinks für jedes spezifische Modell auf Mobile.de, AutoScout24 und Kleinanzeigen, um sofort zu den genauen Angeboten zu gelangen.
- **WhatsApp & E-Mail-Push**: Sofortige Benachrichtigung über die CallMeBot API, wenn neue Angebote gefunden werden.
- **Offline-Fähig**: Durch Service-Worker auf Android und Windows PC installierbar.

## 🛠️ Lokale Ausführung

1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```
3. Projekt kompilieren:
   ```bash
   npm run build
   ```

## 🌐 Netlify Deployment

Das Projekt enthält eine Serverless-Funktion unter `netlify/functions/check-offers.js` für automatisierte Hintergrund-Suchen.
Trage in den Netlify Environment Variables deine Schlüssel ein:
- `WHATSAPP_PHONE` (z. B. `+491512345678`)
- `WHATSAPP_API_KEY` (CallMeBot Key)
- `EMAIL_ADDRESS` (Deine E-Mail)
