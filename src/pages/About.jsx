import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

function About() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={styles.container}>
      <style>{componentCSS}</style>

      <SEO
        title="About the Creator"
        description="Meet Ibrahim Abdulrahman Maulid (Matembo) — software engineer, system architect, and founder of Matembo Prompts. Discover the story behind the AI prompt library."
        url="https://matembo-prompts.netlify.app/about"
      />

      {/* ── Section 1: Hero ── */}
      <section className="responsive-section" style={{ ...styles.sectionDark, ...styles.heroSection }}>
        <div style={styles.heroNav}>
          <Link to="/" style={styles.heroLogo}>
            <img src="/logo.webp" alt="Matembo Prompts Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            <span style={{ color: '#fff' }}>Matembo Prompts</span>
          </Link>
          <Link to="/" style={styles.backLink}>Back to Prompts</Link>
        </div>

        <div style={styles.heroContent} className="hero-layout">
          <div className="reveal" style={styles.heroLeft}>
            <h1 className="hero-heading" style={styles.heroHeading}>
              About <br />
              <span style={{ color: '#0a6b5e' }}>the Creator</span>
            </h1>
            <p style={styles.heroText}>
              Most people see AI as a tool. I see it as a language. Matembo
              Prompts was built on the conviction that mastering this language — knowing exactly
              what to say, how to say it, and in what order — is what separates forgettable content
              from visuals that stop people mid-scroll. This is not just a prompt library. It is a creative weapon.
            </p>
          </div>
          <div className="reveal" style={styles.heroRight}>
            <div className="image-wrapper">
              <div className="color-block" style={{ background: '#0a6b5e', top: '20px', left: '20px' }} />
              <img src="/creator.png" alt="Creator" className="image-bw" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: The Story ── */}
      <section className="responsive-section" style={styles.sectionLight}>
        <div style={styles.containerInner}>
          <div className="reveal two-col-layout" style={styles.twoCol}>
            <div style={styles.col}>
              <span style={styles.label}>THE STORY</span>
              <h2 style={styles.headingDark}>How It All Began</h2>
              <p style={styles.paragraph}>
                My name is Ibrahim Abdulrahman Maulid — Matembo to the world that knows my work. I am a software engineer, system architect, and founder of Matembo Tech Software Company. But behind every line of code, there was always a second obsession quietly growing: what AI could create when given exactly the right words.
              </p>
              <p style={styles.paragraph}>
                It started in the comments. Every time I posted an AI-generated video or image, the same thing happened — hundreds of people stopping mid-scroll, asking the same question: where is the prompt? They could see the result but had no way to reach the words behind it. Instagram gave them nothing. No copy button. No access. Just frustration typed into a comment box at midnight.
                That frustration — repeated across thousands of comments, in Swahili, in English — became impossible to ignore. People did not just want to see stunning AI visuals. They wanted to create them. They just needed the right words
              </p>
              <p style={styles.paragraph}>
                So I built Matembo Prompts. Not as a side project — as an answer. A clean, professional vault of prompts I personally crafted, tested, and refined across Midjourney, Kling, Sora, and Seedance. Every prompt here has been earned through experimentation, not guesswork. Every word chosen because it works.
              </p>
              <p style={styles.paragraph}>
                The goal has never changed: give every creator, designer, and storyteller the exact words they need to generate visuals that stop people mid-scroll — without spending hours figuring it out alone.
              </p>
            </div>
            <div style={styles.colRight}>
              <div className="image-wrapper">
                <div className="color-block" style={{ background: '#e8521a', top: '20px', right: '20px', left: 'auto' }} />
                <img src="/prompt.jpeg" alt="Story" className="image-bw" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Why Prompting Matters ── */}
      <section className="responsive-section" style={styles.sectionDarkCenter}>
        <div style={styles.containerInnerCenter}>
          <span className="reveal" style={styles.label}>PROMPT ENGINEERING</span>
          <h2 className="reveal" style={styles.headingLightCenter}>The Most Valuable Skill in the AI Era</h2>
          <p className="reveal" style={styles.paragraphCenterLight}>
            We are living through the most significant technological shift in human history. AI is no longer a tool for researchers — it is in the hands of creators, entrepreneurs, and storytellers. And at the center of it all is one skill: knowing how to communicate with AI.
          </p>

          <div className="reveal stats-grid" style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>10x</h3>
              <p style={styles.statText}>Faster content creation with optimized prompts</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>2025+</h3>
              <p style={styles.statText}>The era where prompt engineers become the most sought-after creatives</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statNumber}>∞</h3>
              <p style={styles.statText}>Possibilities unlocked when you master the language of AI</p>
            </div>
          </div>

          <div className="reveal" style={styles.quoteBlock}>
            "Prompting is not just typing words — it is system design for creativity. You are architecting outputs, defining constraints, and engineering imagination."
            <br />
            <span style={styles.quoteAuthor}>— Matembo</span>
          </div>
        </div>
      </section>

      {/* ── Section 4: The Programmer Behind It ── */}
      <section className="responsive-section" style={styles.sectionLight}>
        <div style={styles.containerInner}>
          <span className="reveal" style={styles.label}>BEYOND PROMPTS</span>
          <h2 className="reveal" style={styles.headingDark}>System Design & Engineering</h2>
          <p className="reveal" style={{ ...styles.paragraph, maxWidth: '800px', marginBottom: '40px' }}>
            Long before the first prompt was saved on this platform, there was code. Lots of it.
            I am the founder of Matembo Tech — a software company built on one obsession: engineering systems that are intelligent,
            scalable, and architecturally sound. My world is system design — understanding not just how to build an application,
            how it breathes,
            how it grows, and how every layer connects to the next.
          </p>

          <div className="reveal skills-grid" style={styles.skillsGrid}>
            {[
              {
                title: "System Architecture",
                desc: "Designing scalable backend systems, microservices, and API-first architectures that handle growth from day one."
              },
              {
                title: "Full Stack Development",
                desc: "React, Next.js, TypeScript, Node.js, Python — building end-to-end digital products with clean, maintainable code."
              },
              {
                title: "Database Design",
                desc: "PostgreSQL, MongoDB, Redis, Supabase — structuring data layers that are fast, reliable, and built for real-world usage."
              },
              {
                title: "AI & Automation",
                desc: "Integrating AI into real products, building automation systems, and using tools like Docker, Kubernetes, and AWS for deployment."
              }
            ].map(skill => (
              <div key={skill.title} style={styles.skillCard} className="hover-lift">
                <h4 style={styles.skillTitle}>{skill.title}</h4>
                <p style={styles.skillDesc}>{skill.desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal" style={styles.techStack}>
            <span style={styles.techLabel}>Tech Stack</span>
            <div style={styles.techLogos}>
              {['Python', 'React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Supabase', 'Redis', 'AWS'].map(tech => (
                <span key={tech} className="tech-badge">{tech}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Matembo Tech CTA ── */}
      <section className="responsive-section" style={styles.sectionDark}>
        <div style={styles.containerInner}>
          <div className="reveal two-col-layout" style={styles.twoColCenter}>
            <div style={styles.col}>
              <h2 style={{ ...styles.headingLightCenter, textAlign: 'left', margin: '0 0 16px 0' }}>Need a System Built?</h2>
              <p style={{ ...styles.paragraphCenterLight, textAlign: 'left', margin: '0 0 32px 0' }}>
                Beyond prompts, Matembo Tech builds full digital products — from architecture to deployment.
              </p>
              <div style={styles.buttonRow}>
                <a href="https://company-profile-navy-six.vercel.app/" target="_blank" rel="noreferrer" className="interactive-btn" style={styles.btnSolid}>Visit Matembo Tech</a>
                <a href="https://company-profile-navy-six.vercel.app/portfolio/website-design" target="_blank" rel="noreferrer" className="interactive-btn" style={styles.btnOutline}>View Projects</a>
              </div>
            </div>
            <div style={styles.colRight}>
              <div className="image-wrapper" style={{ maxWidth: '500px' }}>
                <div className="color-block" style={{ background: '#e8521a', bottom: '-20px', right: '-20px', left: 'auto', top: 'auto' }} />
                <img src="/logo.webp" alt="Projects" className="image-bw" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Connect ── */}
      <section className="responsive-section" style={{ ...styles.sectionLight, textAlign: 'center', paddingBottom: '120px' }}>
        <div className="reveal" style={styles.containerInnerCenter}>
          <h2 style={{ ...styles.headingDark, textAlign: 'center', margin: '0 0 12px 0' }}>Let's Connect</h2>
          <p style={{ ...styles.paragraph, textAlign: 'center', margin: '0 0 40px 0' }}>
            Follow the journey on social media or reach out directly.
          </p>
          <div style={styles.socialRow}>
            {[
              { icon: <IconInstagram />, link: "https://www.instagram.com/matembo_dev/" },
              { icon: <IconLinkedIn />, link: "https://www.linkedin.com/in/ibrahim-abdulrahman-maulid-458211368/" },
              { icon: <IconGitHub />, link: "https://github.com/Matembotech" },
              { icon: <IconFacebook />, link: "https://www.facebook.com/MatemboTech" }
            ].map((social, i) => (
              <a key={i} href={social.link} target="_blank" rel="noreferrer" className="social-icon">
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

// Icons
const IconInstagram = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
const IconLinkedIn = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
const IconGitHub = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
const IconFacebook = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;

const componentCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');

  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  }
  .revealed {
    opacity: 1;
    transform: translateY(0);
  }

  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.05);
  }

  .tech-badge {
    padding: 8px 16px;
    background: #e5e7eb;
    color: #6b7280;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: default;
  }
  .tech-badge:hover {
    background: #0a6b5e;
    color: #ffffff;
  }

  .social-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #0d0d0d;
    color: #ffffff;
    transition: all 0.3s ease;
    text-decoration: none;
  }
  .social-icon:hover {
    background: #0a6b5e;
    transform: scale(1.1);
  }

  /* Image wrappers */
  .image-wrapper {
    position: relative;
    width: 100%;
    max-width: 460px;
    margin: 0 auto;
  }
  .color-block {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  .image-bw {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    min-height: 300px;
    object-fit: cover;
    display: block;
    filter: grayscale(100%);
    transition: filter 0.5s ease;
  }
  .image-wrapper:hover .image-bw {
    filter: grayscale(0%);
  }
  
  @media (max-width: 900px) {
    .responsive-section {
      padding: 60px 6% !important;
    }
    .two-col-layout {
      flex-direction: column !important;
      text-align: center;
    }
    .hero-layout {
      flex-direction: column !important;
      padding-top: 40px !important;
      text-align: center;
    }
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    .skills-grid {
      grid-template-columns: 1fr !important;
    }
    .hero-heading {
      font-size: 56px !important;
    }
  }
`;

const styles = {
  container: {
    fontFamily: "'DM Sans', sans-serif",
    width: '100%',
    overflowX: 'hidden',
  },
  sectionDark: {
    backgroundColor: '#0d0d0d',
    color: '#ffffff',
    padding: '100px 8%',
    position: 'relative',
  },
  sectionDarkCenter: {
    backgroundColor: '#0d0d0d',
    color: '#ffffff',
    padding: '120px 8%',
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
  },
  sectionLight: {
    backgroundColor: '#f5f5f0',
    color: '#0d0d0d',
    padding: '120px 8%',
  },
  containerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  containerInnerCenter: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  // Hero
  heroSection: {
    paddingTop: '40px',
    minHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  heroNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '80px',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto 80px',
  },
  heroLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '18px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#0a6b5e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLink: {
    color: '#0a6b5e',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
    transition: 'opacity 0.2s',
  },
  heroContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '60px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    flex: 1,
  },
  heroLeft: {
    flex: '1 1 500px',
  },
  heroRight: {
    flex: '1 1 400px',
  },
  heroHeading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '84px',
    fontWeight: '800',
    lineHeight: '1.05',
    margin: '0 0 30px 0',
  },
  heroText: {
    fontSize: '18px',
    color: '#9ca3af',
    lineHeight: '1.6',
    maxWidth: '500px',
  },

  // Typography
  label: {
    display: 'block',
    color: '#0a6b5e',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  headingDark: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '42px',
    fontWeight: '800',
    lineHeight: '1.2',
    color: '#0d0d0d',
    margin: '0 0 24px 0',
  },
  headingLightCenter: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '48px',
    fontWeight: '800',
    lineHeight: '1.2',
    color: '#ffffff',
    margin: '0 0 24px 0',
    maxWidth: '700px',
  },
  paragraph: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.8',
    marginBottom: '20px',
  },
  paragraphCenterLight: {
    fontSize: '18px',
    color: '#9ca3af',
    lineHeight: '1.7',
    maxWidth: '600px',
    margin: '0 auto 60px',
  },

  // Layouts
  twoCol: {
    display: 'flex',
    gap: '80px',
    alignItems: 'center',
  },
  twoColCenter: {
    display: 'flex',
    gap: '60px',
    alignItems: 'center',
  },
  col: {
    flex: '1 1 400px',
  },
  colRight: {
    flex: '1 1 400px',
  },

  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    width: '100%',
    marginBottom: '80px',
  },
  statCard: {
    background: '#1a1a1a',
    borderTop: '4px solid #0a6b5e',
    padding: '40px 30px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statNumber: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '56px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 16px 0',
    lineHeight: '1',
  },
  statText: {
    color: '#9ca3af',
    fontSize: '15px',
    lineHeight: '1.6',
    margin: 0,
  },

  // Quote
  quoteBlock: {
    borderLeft: '4px solid #0a6b5e',
    paddingLeft: '32px',
    textAlign: 'left',
    fontSize: '24px',
    lineHeight: '1.5',
    color: '#ffffff',
    fontStyle: 'italic',
    maxWidth: '800px',
    margin: '0 auto',
  },
  quoteAuthor: {
    display: 'block',
    marginTop: '20px',
    fontSize: '16px',
    color: '#0a6b5e',
    fontWeight: '700',
    fontStyle: 'normal',
  },

  // Skills
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px',
    marginBottom: '80px',
  },
  skillCard: {
    background: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
  },
  skillTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '22px',
    fontWeight: '700',
    color: '#0d0d0d',
    margin: '0 0 12px 0',
  },
  skillDesc: {
    color: '#6b7280',
    fontSize: '15px',
    lineHeight: '1.6',
    margin: 0,
  },

  // Tech Stack
  techStack: {
    textAlign: 'center',
    marginTop: '40px',
  },
  techLabel: {
    display: 'block',
    fontSize: '13px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '24px',
    fontWeight: '600',
  },
  techLogos: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
    maxWidth: '800px',
    margin: '0 auto',
  },

  // CTA
  buttonRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  btnSolid: {
    background: '#0a6b5e',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
    transition: 'all 0.3s',
  },
  btnOutline: {
    background: 'transparent',
    color: '#ffffff',
    border: '2px solid #ffffff',
    padding: '12px 28px',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
    transition: 'all 0.3s',
  },

  // Connect
  socialRow: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  }
};

export default About;
