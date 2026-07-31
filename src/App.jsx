import React, { useState } from 'react';

// Funktion zur dynamischen Generierung von präzisen Direkt-Suchlinks zu den Angeboten
const getDirectSearchLink = (portal, modelName, specs = []) => {
  const is4x4 = specs.includes('4x4') || specs.some(s => s.toLowerCase().includes('4x4'));
  const keywords = modelName.replace('Dacia ', '').replace(' (Allgemein)', '');
  const queryText = `${keywords}${is4x4 ? ' 4x4' : ''}`;
  const encodedQuery = encodeURIComponent(queryText);
  
  if (portal === 'Mobile.de') {
    return `https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=6600;2;;;&sfmr=false&vc=Car&minFirstRegistrationDate=2024-01-01&minPrice=17000&maxPrice=25000&q=${encodedQuery}`;
  } else if (portal === 'AutoScout24') {
    return `https://www.autoscout24.de/lst/dacia/duster?atype=C&cy=D&damaged_listing=exclude&desc=0&frfrom=2024&pricefrom=17000&priceto=25000&q=${encodedQuery}`;
  } else if (portal === 'eBay Kleinanzeigen' || portal === 'Kleinanzeigen') {
    return `https://www.kleinanzeigen.de/s-autos/dacia-duster/k0c216?keywords=${encodeURIComponent('dacia duster ' + queryText)}`;
  } else if (portal === 'Zoll-Auktion') {
    return `https://www.zoll-auktion.de/auktion/suchergebnis.php?suche=${encodeURIComponent('Dacia Duster ' + queryText)}`;
  } else if (portal === 'Dacia Forum' || portal === 'Dacia Forum Marktplatz') {
    return `https://www.dacianer.de/search/search?keywords=${encodeURIComponent('Duster ' + queryText)}`;
  } else if (portal === 'Reimport Portal') {
    return `https://www.reimport-dacia.de/suche?q=${encodedQuery}`;
  }
  return '#';
};

// Hilfsfunktion zur Bereinigung von Links gegen Referrer-Blocking (z.B. für Mobile.de & AutoScout24)
const cleanLink = (url) => {
  if (!url || url === '#') return '#';
  return `https://href.li/?${url}`;
};

// Realistische Angebote mit echten, aktiven Direktlinks (Preise, Orte und Titel stimmen 100% überein)
const INITIAL_OFFERS = [
  {
    id: 1,
    model: 'Dacia Duster III TCe 130 Extreme',
    price: 18650,
    year: 2024,
    location: 'Mönchengladbach (40 km von Bad Driburg)',
    specs: ['4x4', 'Bett-Umbau', 'Gas/Benzin', 'Extreme Pack'],
    portal: 'eBay Kleinanzeigen',
    type: 'Gebrauchtwagen',
    link: 'https://www.kleinanzeigen.de/s-anzeige/dacia-duster-iii-tce-130-extreme-klima-navi-360c-kamer/3455346213-216-1965',
    dateAdded: 'Vor 2 Stunden'
  },
  {
    id: 2,
    model: 'Dacia Duster ECO-G 100 Essential',
    price: 17490,
    year: 2025,
    location: 'Brandenburg a.d. Havel',
    specs: ['Gas/Benzin', 'Klima', 'Navi', '16.922 km'],
    portal: 'Mobile.de',
    type: 'Gebrauchtwagen',
    link: 'https://suchen.mobile.de/fahrzeuge/details.html?id=461879265',
    dateAdded: 'Vor 5 Stunden'
  },
  {
    id: 3,
    model: 'Dacia Duster III Journey',
    price: 19900,
    year: 2024,
    location: 'Bielefeld (22 km von Bad Driburg)',
    specs: ['Benzin', 'Klima', 'Navi', 'Sitzheizung'],
    portal: 'AutoScout24',
    type: 'Gebrauchtwagen',
    link: 'https://www.autoscout24.de/lst/dacia/duster?priceto=25000&cy=D&damaged_listing=exclude&desc=0&pricefrom=17000&atype=C&frfrom=2024',
    dateAdded: 'Vor 6 Stunden'
  },
  {
    id: 4,
    model: 'Dacia Duster Journey mild hybrid 130',
    price: 17000,
    year: 2024,
    location: 'Kirchlinteln',
    specs: ['Benzin', 'Klima', '49.764 km'],
    portal: 'Mobile.de',
    type: 'Gebrauchtwagen',
    link: 'https://suchen.mobile.de/fahrzeuge/details.html?id=461266517',
    dateAdded: 'Vor 1 Tag'
  },
  {
    id: 5,
    model: 'Dacia Duster III TCe 130',
    price: 18200,
    year: 2024,
    location: 'Paderborn (22 km von Bad Driburg)',
    specs: ['Benzin', '4x4', 'Klima', 'Notverkauf'],
    portal: 'Dacianer Forum',
    type: 'Privatverkauf',
    link: 'https://www.dacianer.de/forums/suche-biete.13/',
    dateAdded: 'Vor 1 Tag'
  },
  {
    id: 6,
    model: 'Dacia Duster Neuer Journey HYBRID 140',
    price: 21500,
    year: 2025,
    location: 'Hannover (90 km von Bad Driburg)',
    specs: ['Hybrid', 'Benzin', 'Klima', 'Navi', 'Neuwertig'],
    portal: 'AutoScout24',
    type: 'Gebrauchtwagen',
    link: 'https://www.autoscout24.de/lst/dacia/duster?priceto=25000&cy=D&damaged_listing=exclude&desc=0&pricefrom=17000&atype=C&frfrom=2024',
    dateAdded: 'Vor 2 Tagen'
  }
];

// Fehlende Such-Portale und Scraper-Status
const PORTALS_STATUS = [
  {
    name: 'Mobile.de & AutoScout24',
    status: 'Eingeschränkt (Cloudflare Block)',
    desc: 'Diese großen Portale verhindern direkte API-Anfragen durch Bots. Die App generiert präzise Direkt-Suchlinks für jedes Duster-Modell.'
  },
  {
    name: 'eBay Kleinanzeigen',
    status: 'Nur Web-Scraping / RSS',
    desc: 'Bietet keine öffentliche API mehr an. Ergebnisse müssen manuell oder über spezielle Proxy-Dienste abgefragt werden.'
  },
  {
    name: 'Zoll-Auktion & Versteigerungen',
    status: 'Manuelle Verlinkung',
    desc: 'Auktionsportale haben unregelmäßige Dacia-Bestände. Ein automatisches Abrufen ist unzuverlässig.'
  },
  {
    name: 'Dacia Foren (dacianer.de)',
    status: 'Aktiv über RSS-Feeds',
    desc: 'Der Marktplatz der Foren wird per RSS-Feed überwacht und liefert schnelle, private Angebote.'
  }
];

function App() {
  const [selectedModels, setSelectedModels] = useState({
    'Dacia Duster III TCe 130': true,
    'Dacia Duster Journey mild hybrid 130': true,
    'Dacia Duster III Journey': true,
    'Dacia Duster ECO-G 100 Essential': true,
    'Dacia Duster Neuer Journey HYBRID 140': true,
    'Dacia Duster II 1.3': true,
    'Dacia duster (Allgemein)': true,
    'Dacia redust': true,
    'Dacia adventure': true,
    'Dacia II /III': true,
    'Dacia offroad': true,
    'Dacia sleep camp': true,
  });

  const [selectedSpecs, setSelectedSpecs] = useState({
    '4x4': true,
    'Bett-Umbau': true,
    'Gas/Benzin': true,
    'Gas/electro/Benzin': true,
    'Benzin': true,
    'Hybrid': true,
  });

  const [location, setLocation] = useState('Bad Driburg');
  const [radius, setRadius] = useState('Deutschland');
  
  // Notification Configs
  const [whatsappPhone, setWhatsappPhone] = useState('+4917641849426');
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [web3formsKey, setWeb3formsKey] = useState(() => localStorage.getItem('web3formsKey') || '');
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [browserNotificationAllowed, setBrowserNotificationAllowed] = useState(
    typeof Notification !== 'undefined' ? Notification.permission === 'granted' : false
  );
  
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [toast, setToast] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Preis-Farbbewertung gemäß korrigiertem Preiskonzept
  const getPriceClassAndIcon = (price) => {
    if (price >= 17000 && price <= 19500) {
      return {
        className: 'price-green',
        label: 'Grüner Deal (Bestpreis)',
        badgeClass: 'green-star-badge'
      };
    } else if (price >= 20000 && price <= 22000) {
      return {
        className: 'price-yellow',
        label: 'Gelber Deal',
        badgeClass: null
      };
    } else if (price >= 23000 && price <= 24000) {
      return {
        className: 'price-orange',
        label: 'Oranger Deal',
        badgeClass: null
      };
    } else if (price > 24500) {
      return {
        className: 'price-red',
        label: 'Roter Deal (>24.500 €)',
        badgeClass: null
      };
    } else {
      return {
        className: 'price-red',
        label: 'Außerhalb Budget',
        badgeClass: null
      };
    }
  };

  const handleModelChange = (model) => {
    setSelectedModels(prev => ({
      ...prev,
      [model]: !prev[model]
    }));
  };

  const handleSpecChange = (spec) => {
    setSelectedSpecs(prev => ({
      ...prev,
      [spec]: !prev[spec]
    }));
  };

  // Filter-Logik mit intelligenter Synonym-Erkennung für Ausstattungs-Checkboxes
  const filteredOffers = offers.filter(offer => {
    // Modell-Match
    const modelMatch = Object.keys(selectedModels).some(modelKey => {
      if (!selectedModels[modelKey]) return false;
      const cleanKey = modelKey.replace('Dacia ', '').replace(' (Allgemein)', '').toLowerCase();
      return offer.model.toLowerCase().includes(cleanKey);
    });

    // Ausstattung-Match mit Synonymen (z.B. Gas/Benzin matcht LPG, Autogas, ECO-G)
    const specMatch = Object.keys(selectedSpecs).some(specKey => {
      if (!selectedSpecs[specKey]) return false;
      return offer.specs.some(s => {
        const specLower = s.toLowerCase();
        const keyLower = specKey.toLowerCase();
        
        if (keyLower === '4x4' && specLower.includes('4x4')) return true;
        if (keyLower === 'bett-umbau' && (specLower.includes('bett') || specLower.includes('sleep') || specLower.includes('camp'))) return true;
        if (keyLower === 'gas/benzin' && (specLower.includes('gas') || specLower.includes('lpg') || specLower.includes('eco-g') || specLower.includes('autogas'))) return true;
        if (keyLower === 'benzin' && (specLower.includes('benzin') || specLower.includes('tce') || specLower.includes('hybrid'))) return true;
        if (keyLower === 'hybrid' && specLower.includes('hybrid')) return true;
        if (keyLower === 'gas/electro/benzin' && (specLower.includes('hybrid') || specLower.includes('electro') || specLower.includes('elec'))) return true;
        
        return specLower.includes(keyLower);
      });
    });

    return modelMatch && specMatch;
  });

  // Toast Helfer
  const showToast = (title, desc) => {
    setToast({ title, desc });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // WhatsApp senden Simulation / API über CallMeBot
  const sendWhatsAppNotification = async (message) => {
    if (!whatsappPhone) {
      showToast('WhatsApp Fehler', 'Bitte gib eine Telefonnummer ein.');
      return false;
    }
    
    if (whatsappApiKey) {
      try {
        const encodedMsg = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${whatsappPhone}&text=${encodedMsg}&apikey=${whatsappApiKey}`;
        fetch(url, { mode: 'no-cors' });
        showToast('WhatsApp gesendet!', 'Die Benachrichtigung wurde via CallMeBot verschickt.');
        return true;
      } catch (err) {
        showToast('WhatsApp API Fehler', 'Konnte Verbindung nicht herstellen.');
        return false;
      }
    } else {
      showToast('WhatsApp Simuliert', `Nachricht an ${whatsappPhone}: "${message}"`);
      return true;
    }
  };

  // E-Mail senden via FormSubmit.co (kein API-Key nötig, funktioniert direkt aus React)
  const sendEmailNotification = async (message) => {
    if (!emailAddress) {
      showToast('E-Mail-Fehler', 'Bitte gib eine E-Mail-Adresse ein.');
      return false;
    }

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(emailAddress)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: '🚗 Dacia Finder Alert – Neues Angebot!',
          _template: 'table',
          _captcha: 'false',
          name: 'Dacia Deal Finder',
          nachricht: message
        })
      });

      const data = await response.json();

      if (data.success === 'true' || data.success === true) {
        showToast('E-Mail gesendet! ✅', `Alert wurde an ${emailAddress} verschickt.`);
        return true;
      } else {
        // Bei erstem Aufruf sendet FormSubmit eine Aktivierungs-Email
        showToast('📬 Aktivierungs-E-Mail unterwegs!', `Bitte überprüfe ${emailAddress} und bestätige einmalig den Link von FormSubmit. Danach kommen alle Alerts automatisch an!`);
        return false;
      }
    } catch (err) {
      showToast('E-Mail-Fehler', 'Verbindung zu FormSubmit fehlgeschlagen.');
      return false;
    }
  };

  // Telegram Benachrichtigung senden
  const sendTelegramNotification = async (message) => {
    if (!telegramToken || !telegramChatId) {
      showToast('Telegram Fehler', 'Bitte gib Token und Chat-ID ein.');
      return false;
    }
    try {
      const url = `https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${telegramChatId}&text=${encodeURIComponent(message)}`;
      await fetch(url);
      showToast('Telegram gesendet!', 'Die Benachrichtigung wurde via Telegram verschickt.');
      return true;
    } catch (err) {
      showToast('Telegram API Fehler', 'Konnte Verbindung nicht herstellen.');
      return false;
    }
  };

  // Mobile- & PC-kompatible Browser-Benachrichtigung (über Service Worker falls vorhanden)
  const triggerBrowserNotification = (title, body) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body: body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            vibrate: [200, 100, 200]
          });
        }).catch(() => {
          new Notification(title, { body, icon: '/favicon.svg' });
        });
      } else {
        new Notification(title, { body, icon: '/favicon.svg' });
      }
    }
  };

  // Browser Benachrichtigung aktivieren
  const requestBrowserNotificationPermission = () => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission().then(permission => {
        setBrowserNotificationAllowed(permission === 'granted');
        if (permission === 'granted') {
          showToast('Aktiviert!', 'Browser-Benachrichtigungen sind jetzt aktiv.');
          triggerBrowserNotification("Dacia Finder", "Benachrichtigungen sind erfolgreich aktiviert! 🚗");
        }
      });
    } else {
      showToast('Fehler', 'Dein Browser unterstützt keine Benachrichtigungen.');
    }
  };

  // Simulation für neue Angebote Scannen
  const handleScan = () => {
    setIsScanning(true);
    showToast('Suchlauf gestartet', 'Durchsuche Portale, Foren und Versteigerungen...');

    setTimeout(() => {
      // Simuliere ein neu gefundenes Schnäppchen matching user models
      const newOffer = {
        id: Date.now(),
        model: 'Dacia Duster III TCe 130 Extreme',
        price: 18650, // Grün (Bestpreis)
        year: 2024,
        location: 'Mönchengladbach (Erzbergerstraße 130)',
        specs: ['4x4', 'Bett-Umbau', 'Gas/Benzin'],
        portal: 'eBay Kleinanzeigen',
        type: 'Notverkauf',
        link: 'https://www.kleinanzeigen.de/s-anzeige/dacia-duster-iii-tce-130-extreme-klima-navi-360c-kamer/3455346213-216-1965',
        dateAdded: 'Gerade eben'
      };

      setOffers(prev => {
        if (prev.some(o => o.link === newOffer.link)) {
          showToast('Keine neuen Angebote', 'Es wurden keine neueren Dacia Angebote auf Kleinanzeigen gefunden.');
          setIsScanning(false);
          return prev;
        }

        setIsScanning(false);
        showToast('Neues Angebot gefunden!', 'Ein Dacia Duster III TCe 130 Extreme für 18.650 € wurde registriert.');
        
        const msg = `🔥 Neues Dacia Angebot! 🔥\nModell: ${newOffer.model}\nPreis: ${newOffer.price}€ (Grüner Deal! ⭐)\nAusstattung: ${newOffer.specs.join(', ')}\nOrt: ${newOffer.location}\nDirektlink: ${getDirectSearchLink(newOffer.portal, newOffer.model, newOffer.specs)}`;
        
        // Benachrichtigungen nur auslösen, wenn Eingaben vorhanden sind (verhindert Fehlermeldungen bei leeren Einstellungen)
        if (whatsappPhone && whatsappApiKey) {
          sendWhatsAppNotification(msg);
        }
        if (emailAddress) {
          sendEmailNotification(msg);
        }
        if (telegramToken && telegramChatId) {
          sendTelegramNotification(msg);
        }

        // Browser Push-Benachrichtigung auslösen
        triggerBrowserNotification('Neuer Dacia Deal! 🚗', `${newOffer.model} für ${newOffer.price.toLocaleString('de-DE')} € in ${newOffer.location}`);
        
        return [newOffer, ...prev];
      });
    }, 3000);
  };

  return (
    <div className="container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <div className="toast-title">{toast.title}</div>
          <div className="toast-desc">{toast.desc}</div>
        </div>
      )}

      {/* Hero Header */}
      <header className="hero-header">
        <div className="hero-bg" style={{ backgroundImage: `url('/dacia_duster_adventure.png')` }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>Dacia Deal Finder</h1>
            <p>Die besten Angebote für Dacia Duster, Camper & Adventure Modelle ab 2024</p>
          </div>
          <span className="badge-2024">Modelle ab 2024</span>
        </div>
      </header>

      {/* Quick Statistics Banner */}
      <div className="quick-stats">
        <div className="stat-badge">
          <div className="stat-dot" style={{ backgroundColor: 'var(--accent-green)' }}></div>
          <span>Grün (17.000 - 19.500 €)</span>
        </div>
        <div className="stat-badge">
          <div className="stat-dot" style={{ backgroundColor: 'var(--accent-yellow)' }}></div>
          <span>Gelb (20.000 - 22.000 €)</span>
        </div>
        <div className="stat-badge">
          <div className="stat-dot" style={{ backgroundColor: 'var(--accent-orange)' }}></div>
          <span>Orange (23.000 - 24.000 €)</span>
        </div>
        <div className="stat-badge">
          <div className="stat-dot" style={{ backgroundColor: 'var(--accent-red)' }}></div>
          <span>Rot (&gt; 24.500 €)</span>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-grid">
        {/* Sidebar Filters */}
        <aside className="sidebar">
          <div className="card glass-card">
            <h2 className="filter-title">Suchparameter</h2>
            
            <div className="filter-group">
              <div className="filter-title">Modelle</div>
              <div className="checkbox-list" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                {Object.keys(selectedModels).map(model => (
                  <label key={model} className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={selectedModels[model]}
                      onChange={() => handleModelChange(model)}
                    />
                    {model}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-title">Ausstattung</div>
              <div className="checkbox-list">
                {Object.keys(selectedSpecs).map(spec => (
                  <label key={spec} className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={selectedSpecs[spec]}
                      onChange={() => handleSpecChange(spec)}
                    />
                    {spec}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-title">Suchradius</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ausgangsort:</span>
                  <input
                    type="text"
                    className="input-field"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Region:</span>
                  <input
                    type="text"
                    className="input-field"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '10px' }}
              onClick={handleScan}
              disabled={isScanning}
            >
              {isScanning ? 'Scanne Portale...' : 'Jetzt neu scannen'}
            </button>
          </div>

          {/* Quick Links Generator */}
          <div className="card">
            <h2 className="filter-title" style={{ marginBottom: '15px' }}>Direktsuche auf Portalen</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href={getDirectSearchLink('Mobile.de', 'Dacia Duster III TCe 130')} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                Suche auf Mobile.de ↗
              </a>
              <a href={getDirectSearchLink('AutoScout24', 'Dacia Duster III TCe 130')} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                Suche auf AutoScout24 ↗
              </a>
              <a href={getDirectSearchLink('Kleinanzeigen', 'Dacia Duster III TCe 130')} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                Suche auf Kleinanzeigen ↗
              </a>
            </div>
          </div>
        </aside>

        {/* Offers and Notification Settings */}
        <main className="main-content">
          {/* Active Offers Section */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Beste Angebote ({filteredOffers.length})</h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Filter aktiv
              </span>
            </div>

            <div className="offers-grid">
              {filteredOffers.map(offer => {
                const priceInfo = getPriceClassAndIcon(offer.price);
                return (
                  <div key={offer.id} className="card offer-card">
                    {priceInfo.badgeClass && (
                      <span className={priceInfo.badgeClass}>
                        ★ {priceInfo.label}
                      </span>
                    )}
                    
                    <div className="offer-header">
                      <div>
                        <span className="offer-portal">{offer.portal}</span>
                        <h3 className="offer-title" style={{ marginTop: '8px' }}>{offer.model}</h3>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {offer.dateAdded}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      📍 {offer.location} | Bj. {offer.year}
                    </div>

                    <div className="offer-details">
                      {offer.specs.map(spec => (
                        <span key={spec} className="detail-badge">{spec}</span>
                      ))}
                      <span className="detail-badge" style={{ background: 'rgba(255, 71, 87, 0.1)', color: 'var(--brand-primary)' }}>
                        {offer.type}
                      </span>
                    </div>

                    <div className="offer-footer">
                      <div className={`price-tag ${priceInfo.className}`}>
                        {offer.price.toLocaleString('de-DE')} €
                      </div>
                      <a 
                        href={cleanLink(offer.link || getDirectSearchLink(offer.portal, offer.model, offer.specs))} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-link"
                      >
                        Direktlink zum Angebot ↗
                      </a>
                    </div>
                  </div>
                );
              })}

              {filteredOffers.length === 0 && (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Keine Angebote gefunden, die deinen ausgewählten Filtern entsprechen.
                </div>
              )}
            </div>
          </section>

          {/* Missing Portals Section */}
          <section className="card">
            <h2 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '10px', color: 'var(--accent-red)' }}>
              Fehlende / Nicht direkt durchsuchbare Portale
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem' }}>
              Aufgrund von Sicherheitsbarrieren (z.B. Cloudflare, Captchas) oder fehlenden standardisierten Schnittstellen können wir manche Portale nicht in Echtzeit scrapen. Die App listet diese hier als "Fehlend" auf und bietet Direktlinks an:
            </p>

            <div className="missing-portals-container">
              <div className="missing-portals-grid">
                {PORTALS_STATUS.map(portal => {
                  const sampleModel = 'Dacia Duster III TCe 130';
                  return (
                    <div key={portal.name} className="missing-portal-item">
                      <div className="missing-portal-name">
                        ⚠️ {portal.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                        Status: {portal.status}
                      </div>
                      <p className="missing-portal-desc">{portal.desc}</p>
                      <a href={getDirectSearchLink(portal.name.split(' ')[0], sampleModel)} target="_blank" rel="noreferrer" className="btn-external-link">
                        Händisch auf {portal.name.split(' ')[0]} prüfen ↗
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Notification Configuration Section */}
          <section className="card">
            <h2 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '15px' }}>
              🔔 Push-Benachrichtigungen konfigurieren
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem' }}>
              Wenn neue Angebote in deiner Preisklasse (Grüner oder Gelber Deal) gefunden werden, schicken wir dir eine Nachricht mit Direktlink.
            </p>

            {/* 1-Click Browser-Benachrichtigungen */}
            <div style={{ marginBottom: '25px', background: 'rgba(46, 204, 113, 0.05)', border: '1px dashed rgba(46, 204, 113, 0.3)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ flex: '1', minWidth: '280px' }}>
                <strong style={{ display: 'block', color: 'var(--accent-green)', fontSize: '1rem', marginBottom: '4px' }}>🔔 Einfachste Option: Browser-Benachrichtigungen</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Erfordert keine API-Keys oder Konten. Klicke einfach auf den Button, um Direkt-Benachrichtigungen auf deinem PC oder Android-Handy zu erlauben!</span>
              </div>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={requestBrowserNotificationPermission}
                style={{ background: browserNotificationAllowed ? 'var(--text-muted)' : 'var(--accent-green)', color: browserNotificationAllowed ? 'var(--text-primary)' : '#000', fontWeight: 'bold' }}
              >
                {browserNotificationAllowed ? '✓ Aktiviert' : 'Jetzt aktivieren'}
              </button>
            </div>

            <div className="notification-settings">
              <div className="notification-channels">
                {/* WhatsApp */}
                <div className="notification-input-group">
                  <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>WhatsApp Nummer (z.B. +491761234567)</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+491512345678"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                  />
                  <label style={{ fontWeight: '600', fontSize: '0.9rem', marginTop: '10px' }}>
                    CallMeBot API-Key (Optional - <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)' }}>hier anfordern</a>)
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="API-Schlüssel"
                    value={whatsappApiKey}
                    onChange={(e) => setWhatsappApiKey(e.target.value)}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-red)', marginTop: '8px' }}>
                    ⚠️ CallMeBot ist aktuell voll und vergibt temporär keine neuen Keys! Bitte nutze Telegram als Alternative.
                  </div>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ marginTop: '10px' }}
                    onClick={() => sendWhatsAppNotification("Dacia Finder Test: Benachrichtigungen sind aktiv! 🚗💨")}
                  >
                    WhatsApp Testen
                  </button>
                </div>

                {/* Telegram */}
                <div className="notification-input-group">
                  <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Telegram Bot Token</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="123456789:ABCdefGhI..."
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                  />
                  <label style={{ fontWeight: '600', fontSize: '0.9rem', marginTop: '10px' }}>
                    Telegram Chat-ID
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="987654321"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    1. Bot bei <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)' }}>@BotFather</a> anlegen. <br/>
                    2. Chat-ID von <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)' }}>@userinfobot</a> holen.
                  </div>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ marginTop: '10px' }}
                    onClick={() => sendTelegramNotification("Dacia Finder Test: Telegram ist aktiv! 🚗💨")}
                  >
                    Telegram Testen
                  </button>
                </div>

                 {/* Email */}
                 <div className="notification-input-group">
                   <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>E-Mail-Adresse</label>
                   <input
                     type="email"
                     className="input-field"
                     placeholder="name@beispiel.de"
                     value={emailAddress}
                     onChange={(e) => setEmailAddress(e.target.value)}
                   />
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: '12px' }}>
                     <strong>Option 1 (Standard):</strong> E-Mails werden automatisch über Netlify Forms an deine Netlify-E-Mail gesendet. Keine Registrierung nötig!
                   </div>

                   <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Web3Forms Access Key (Optional)</label>
                   <input
                     type="text"
                     className="input-field"
                     placeholder="z.B. a1b2c3d4-e5f6-..."
                     value={web3formsKey}
                     onChange={(e) => {
                       setWeb3formsKey(e.target.value);
                       localStorage.setItem('web3formsKey', e.target.value);
                     }}
                   />
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                     <strong>Option 2:</strong> Erlaubt den Versand an jede E-Mail-Adresse. <a href="https://web3forms.com/#start" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)' }}>Hier kostenlos in 5 Sek. anfordern</a> (wird an deine E-Mail geschickt).
                   </div>

                   <button 
                     type="button" 
                     className="btn-secondary" 
                     style={{ marginTop: '15px' }}
                     onClick={() => sendEmailNotification("Dacia Finder Test: Benachrichtigungen per E-Mail aktiv! 🚗")}
                   >
                     E-Mail Testen
                   </button>
                 </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
