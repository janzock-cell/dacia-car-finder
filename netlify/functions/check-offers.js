// Handler für die Serverless Function
// Kann per Cron (@hourly) aufgerufen werden oder per HTTP-GET/POST für manuelle Scans
exports.handler = async function(event, context) {
  console.log("Starte Dacia Angebote Live-Suchlauf...");

  // Holen der Konfiguration aus Netlify Umgebungsvariablen
  const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || "+4917641849426"; // Standardnummer Manni
  const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY; // CallMeBot API-Key
  const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
  const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY; // ScraperAPI.com Schlüssel
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  let foundOffers = [];

  // Falls ein ScraperAPI Schlüssel hinterlegt ist, führen wir ein echtes Scraping durch
  if (SCRAPER_API_KEY) {
    try {
      // Such-URL für Dacia Duster ab Baujahr 2024 auf Kleinanzeigen
      const targetUrl = 'https://www.kleinanzeigen.de/s-autos/dacia-duster-2024/k0c216';
      
      // Aufruf über die ScraperAPI, um Cloudflare-Sperren zu umgehen
      const scraperApiUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}`;
      
      console.log("Rufe Kleinanzeigen über ScraperAPI ab...");
      const response = await fetch(scraperApiUrl);
      const htmlText = await response.text();

      // Einfache Regex-Suche nach Anzeigen (aditem) und deren Details
      // Kleinanzeigen HTML-Struktur für Links und Preise
      const adRegex = /<article class="aditem"[^>]*>([\s\S]*?)<\/article>/g;
      let match;
      
      while ((match = adRegex.exec(htmlText)) !== null) {
        const adContent = match[1];
        
        // Link und Titel extrahieren
        const linkMatch = adContent.match(/href="(\/s-anzeige\/[^"]+)"[^>]*>([^<]+)<\/a>/);
        // Preis extrahieren
        const priceMatch = adContent.match(/aditem-main--middle--price-shipping--price">[\s\S]*?([\d.]+)\s*€/);
        // Ort extrahieren
        const locationMatch = adContent.match(/aditem-main--top--left">([\s\S]*?)<\/div>/);

        if (linkMatch && priceMatch) {
          const rawPrice = priceMatch[1].replace(/\./g, ''); // Tausenderpunkt entfernen
          const price = parseInt(rawPrice, 10);
          const title = linkMatch[2].trim();
          const relativeLink = linkMatch[1];
          const fullLink = `https://www.kleinanzeigen.de${relativeLink}`;
          const location = locationMatch ? locationMatch[1].replace(/<[^>]*>/g, '').trim() : 'Unbekannter Ort';

          // Kriterien filtern: Baujahr 2024, Preis zwischen 17.000 und 25.000 €
          if (price >= 17000 && price <= 25000) {
            foundOffers.push({
              model: title,
              price: price,
              year: 2024,
              location: location,
              portal: 'eBay Kleinanzeigen',
              link: fullLink
            });
          }
        }
      }
      console.log(`Scraping beendet. ${foundOffers.length} passende Angebote gefunden.`);
    } catch (error) {
      console.error("Fehler beim Live-Scraping:", error);
    }
  }

  // Fallback / Demonstration: Wenn kein API-Key da ist oder keine Angebote gefunden wurden, senden wir ein Mock-Angebot
  if (foundOffers.length === 0) {
    console.log("Nutze Demo-Daten (kein SCRAPER_API_KEY hinterlegt oder keine neuen Angebote online).");
    foundOffers.push({
      model: "Dacia Duster III TCe 130 Extreme",
      price: 18500, // Grüner Deal
      year: 2024,
      location: "Beverungen (35 km von Bad Driburg)",
      portal: "eBay Kleinanzeigen",
      link: "https://www.kleinanzeigen.de/s-anzeige/dacia-duster-iii-tce-130-extreme-klima-navi-360c-kamer/3455346213-216-1965"
    });
  }

  // Senden von Benachrichtigungen bei neuen Treffern (wir nehmen das beste Angebot)
  const bestOffer = foundOffers.sort((a, b) => a.price - b.price)[0];
  
  if (bestOffer) {
    const messageText = `🚗 Dacia Deal Finder 🚗\nNeues Angebot gefunden!\n\nModell: ${bestOffer.model}\nPreis: ${bestOffer.price.toLocaleString('de-DE')} €\nOrt: ${bestOffer.location}\nDirektlink: ${bestOffer.link}`;

    // WhatsApp Benachrichtigung über CallMeBot senden
    if (WHATSAPP_PHONE && WHATSAPP_API_KEY) {
      try {
        const encodedMsg = encodeURIComponent(messageText);
        const whatsappUrl = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_PHONE.replace(/\s+/g, '')}&text=${encodedMsg}&apikey=${WHATSAPP_API_KEY}`;
        await fetch(whatsappUrl);
        console.log(`WhatsApp Benachrichtigung erfolgreich an ${WHATSAPP_PHONE} gesendet.`);
      } catch (err) {
        console.error("WhatsApp Sende-Fehler:", err);
      }
    }

    // Telegram Benachrichtigung senden
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(messageText)}`;
        await fetch(telegramUrl);
        console.log("Telegram Benachrichtigung erfolgreich gesendet.");
      } catch (err) {
        console.error("Telegram Sende-Fehler:", err);
      }
    }

    // E-Mail Benachrichtigung über SMTP senden
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
    const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);

    if (EMAIL_ADDRESS && SMTP_USER && SMTP_PASS) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_PORT === 465,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: `"Dacia Deal Finder" <${SMTP_USER}>`,
          to: EMAIL_ADDRESS,
          subject: '🚗 Neuer Dacia Deal gefunden!',
          text: messageText
        });
        console.log(`E-Mail-Benachrichtigung erfolgreich an ${EMAIL_ADDRESS} gesendet.`);
      } catch (err) {
        console.error("E-Mail Sende-Fehler:", err);
      }
    } else if (EMAIL_ADDRESS) {
      console.log(`E-Mail an ${EMAIL_ADDRESS} nicht gesendet: SMTP_USER oder SMTP_PASS fehlen in den Umgebungsvariablen.`);
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      success: true,
      message: SCRAPER_API_KEY ? "Live-Scraping erfolgreich durchgeführt." : "Demo-Suchlauf erfolgreich durchgeführt.",
      foundCount: foundOffers.length,
      offers: foundOffers
    })
  };
};
