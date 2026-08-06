import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Policies({ type = 'privacy' }) {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      intro: 'We respect your privacy and keep your personal information secure.',
      points: [
        'We collect only the details needed to process your order, respond to your enquiry, and improve your shopping experience.',
        'Your contact details are never shared with third parties for marketing purposes without your explicit consent.',
        'Payments are handled securely through trusted gateways, and we do not store sensitive card information on our servers.',
        'You may contact us at any time to request access, correction, or deletion of your personal data.',
      ],
    },
    refund: {
      title: 'Refund & Return Policy',
      intro: 'We aim to make every order a satisfying experience, and we support fair returns when needed.',
      points: [
        'Returns are accepted for damaged, incorrect, or defective products within 7 days of delivery.',
        'Custom-made or personalised items are generally non-returnable unless there is a manufacturing defect.',
        'Refunds are processed within 5–7 business days after the returned item is inspected.',
        'Shipping charges are non-refundable unless the return is due to our error.',
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      intro: 'These terms outline how you can use our site and purchase our products.',
      points: [
        'All product images and descriptions are illustrative and may vary slightly from the final piece.',
        'Orders are subject to availability, confirmation, and production timelines.',
        'By placing an order, you agree to provide accurate delivery details and pay the stated amount.',
        'We reserve the right to refuse or cancel orders that appear suspicious, duplicate, or inconsistent with our policies.',
      ],
    },
  };

  const item = content[type] || content.privacy;

  return (
    <main className="container" style={{ padding: '56px 0 84px' }}>
      <Link to="/" className="section-head__link" style={{ marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div className="cta-card" style={{ padding: 32 }}>
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>Studio policy</span>
        <h1 className="page-hero__title" style={{ fontSize: '2rem', marginBottom: 12 }}>{item.title}</h1>
        <p className="product-section__desc" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>{item.intro}</p>
        <ul style={{ marginTop: 18, paddingLeft: 20, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
          {item.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
