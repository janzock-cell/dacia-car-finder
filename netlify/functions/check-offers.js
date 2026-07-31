// Handler für die Serverless Function
// Kann per Cron (@hourly) aufgerufen werden oder per HTTP-GET/POST für manuelle Scans
exports.handler = async function(event, context) {
  console.log("Starte Dacia Angebote Suchlauf...");

  // Holen der Konfiguration aus Netlify Umgebungsvariablen
  const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE;
  const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY; // CallMeBot API-Key
  const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
  const EMAIL_API_URL = process.env.EMAIL_API_URL; // optional z.B. SendGrid/EmailJS

  // 1. Simulierter Abruf von RSS Feeds (z.B. dacianer.de Marktplatz)
  // Foren-RSS-Feeds sind meistens nicht durch Cloudflare blockiert.
  let newOffers = [];
  try {
    // Hier würde im echten Betrieb ein Fetch auf ein Forum stattfinden:
    // const response = await fetch('https://www.dacianer.de/forums/suche-biete.13/index.rss');
    // const xmlText = await response.text();
    // parseRSS(xmlText)...
    
    // Wir simulieren das Finden eines neuen Angebots für den Cron-Job:
    newOffers.push({
      model: "Dacia Duster III Extreme (4x4)",
      price: 19450, // Goldener Stern!
      year: 2024,
      location: "Bad Driburg (Umfeld)",
      portal: "Dacia Forum (dacianer.de)",
      link: "https://www.dacianer.de/forums/suche-biete.13/"
    });
  } catch (error) {
    console.error("Fehler beim Abrufen des Foren-Feeds:", error);
  }

  // 2. Senden von Benachrichtigungen bei neuen Treffern
  if (newOffers.length > 0) {
    const offer = newOffers[0];
    const messageText = `🚗 Dacia Deal Finder 🚗\nNeues Angebot gefunden!\n\nModell: ${offer.model}\nPreis: ${offer.price} € (Goldener Stern! ⭐)\nOrt: ${offer.location}\nLink: ${offer.link}`;

    // WhatsApp Benachrichtigung über CallMeBot senden
    if (WHATSAPP_PHONE && WHATSAPP_API_KEY) {
      try {
        const encodedMsg = encodeURIComponent(messageText);
        const whatsappUrl = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_PHONE}&text=${encodedMsg}&apikey=${WHATSAPP_API_KEY}`;
        await fetch(whatsappUrl);
        console.log("WhatsApp Benachrichtigung erfolgreich gesendet.");
      } catch (err) {
        console.error("WhatsApp Sende-Fehler:", err);
      }
    }

    // E-Mail Benachrichtigung senden (Simuliert oder über einen konfigurierten Dienst)
    if (EMAIL_ADDRESS) {
      console.log(`Sende E-Mail-Benachrichtigung an ${EMAIL_ADDRESS}...`);
      // Optionaler E-Mail-Versand-Code:
      // if (EMAIL_API_URL) { await fetch(EMAIL_API_URL, { method: 'POST', body: JSON.stringify({...}) }); }
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*" // CORS erlauben für Frontend-Aufrufe
    },
    body: JSON.stringify({
      success: true,
      message: "Suchlauf erfolgreich beendet.",
      foundCount: newOffers.length,
      offers: newOffers
    })
  };
};
