import { Link } from 'react-router-dom';
import { ArrowUpRight, Award, Users, Clock, MapPin } from 'lucide-react';

export default function About() {
  return (
    <main className="about-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow--center" style={{ color: '#EEC7B4', marginBottom: 20 }}>Our Studio</span>
          <h1 className="page-hero__title">
            Craftsmanship, <em>uncompromising</em>.
          </h1>
          <p className="page-hero__sub">
            A quiet obsession with precision, materials and quiet luxury — that's the CNC Crafts studio.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div className="about-text">
            <span className="eyebrow">Our story</span>
            <h2>Built on precision, guided by taste.</h2>
            <p>
              CNC Crafts was born out of a passion for precision craftsmanship and quiet artistry.
              We combine cutting-edge CNC technology with a designer's eye — delivering pieces
              that transform spaces without shouting for attention.
            </p>
            <p>
              From bespoke acrylic wall art to weather-tested ACP signage, every piece leaves our
              studio only when it meets our standard. Because your space deserves nothing less
              than extraordinary.
            </p>
            <Link to="/categories" className="btn-primary">
              Shop the collection <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="about-stats">
            {[
              { icon: <Award size={22} strokeWidth={1.75} />, label: '5+ Years',       sub: 'In CNC craftsmanship' },
              { icon: <Users size={22} strokeWidth={1.75} />, label: '2,000+ Clients', sub: 'And growing every quarter' },
              { icon: <Clock size={22} strokeWidth={1.75} />, label: 'Fast Turnaround',sub: '3–7 business days' },
              { icon: <MapPin size={22} strokeWidth={1.75} />,label: 'Pan-India',      sub: 'Delivered nationwide' },
            ].map((s) => (
              <div key={s.label} className="about-stat">
                <div className="about-stat__icon">{s.icon}</div>
                <div>
                  <strong>{s.label}</strong>
                  <p>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
