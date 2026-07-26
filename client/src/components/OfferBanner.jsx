import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function OfferBanner() {
  const [banner, setBanner] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(s => {
        if (s.banner_active === '1' && (s.banner_image || s.banner_text)) {
          setBanner({ image: s.banner_image || '', text: s.banner_text || '' });
        }
      })
      .catch(() => {});
  }, []);

  if (!banner || dismissed) return null;

  return (
    <div className="offer-banner">
      {banner.image && (
        <img src={banner.image} alt="Special Offer" className="offer-banner__img" />
      )}
      {banner.text && !banner.image && (
        <p className="offer-banner__text">{banner.text}</p>
      )}
      <button className="offer-banner__close" onClick={() => setDismissed(true)} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}
