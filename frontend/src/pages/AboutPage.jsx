import './AboutPage.css';

const VALUES = [
  { icon: 'favorite', title: 'Compassion First', desc: 'Every design decision puts patient comfort and dignity at the center.' },
  { icon: 'visibility', title: 'Transparency', desc: 'Clear communication between patients, doctors, and technology.' },
  { icon: 'shield', title: 'Trust & Privacy', desc: 'Medical data is sacred. We protect it with the highest standards.' },
  { icon: 'accessibility_new', title: 'Accessibility', desc: 'Healthcare access for everyone, regardless of tech experience.' },
];

const TIMELINE = [
  { year: '2024', title: 'The Idea', desc: 'Born from a vision to make healthcare feel less intimidating and more personal.' },
  { year: '2025', title: 'Building Cura', desc: 'A dedicated team began building a platform that balances AI intelligence with human care.' },
  { year: '2026', title: 'Launch & Growth', desc: 'Cura launches with appointment management, AI chat, medication tracking, and lab result access.' },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero section">
        <div className="container">
          <div className="about-hero-content">
            <span className="section-badge">About Cura</span>
            <h1>Healthcare That<br /><span className="text-gradient">Truly Cares</span></h1>
            <p className="about-hero-text">
              Cura was built with a simple belief: healthcare technology should feel human.
              We combine the precision of AI with the warmth of compassionate care to create
              a platform that patients actually want to use.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-mission section-sm">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">
                <span className="material-symbols-rounded">explore</span>
              </div>
              <h3>Our Mission</h3>
              <p>To make quality healthcare accessible, understandable, and emotionally supportive through thoughtful technology.</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">
                <span className="material-symbols-rounded">visibility</span>
              </div>
              <h3>Our Vision</h3>
              <p>A world where every patient feels informed, connected, and cared for — no matter where they are.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">What We Stand For</span>
            <h2>Our Core Values</h2>
          </div>
          <div className="values-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="value-card">
                <div className="value-icon">
                  <span className="material-symbols-rounded">{v.icon}</span>
                </div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Ethics */}
      <section className="about-ai section">
        <div className="container">
          <div className="ai-content">
            <div className="ai-text">
              <span className="section-badge">Responsible AI</span>
              <h2>Why We Use AI Carefully</h2>
              <p>
                Our AI assistant is designed to help — not replace — medical professionals.
                It provides general wellness guidance, appointment reminders, and health education,
                but always includes a disclaimer that it does not substitute professional medical advice.
              </p>
              <ul className="ai-principles">
                <li><span className="material-symbols-rounded">check_circle</span> AI never makes diagnostic decisions</li>
                <li><span className="material-symbols-rounded">check_circle</span> All suggestions reference medical sources</li>
                <li><span className="material-symbols-rounded">check_circle</span> Patient data is never shared with AI training</li>
                <li><span className="material-symbols-rounded">check_circle</span> Emergency situations redirect to real professionals</li>
              </ul>
            </div>
            <div className="ai-visual">
              <div className="ai-visual-card">
                <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--color-primary)' }}>smart_toy</span>
                <h3>Guided, Not Autonomous</h3>
                <p>AI assists, doctors decide.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="about-timeline section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Journey</span>
            <h2>The Cura Story</h2>
          </div>
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className="timeline-item" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="timeline-marker">{t.year}</div>
                <div className="timeline-content">
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
