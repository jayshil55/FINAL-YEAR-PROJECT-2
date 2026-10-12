import React from 'react';
import { Activity, ArrowRight, Check, FileText, HeartPulse, LockKeyhole, MessageCircle, Sparkles, Utensils, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: FileText, title: 'Make sense of your reports', text: 'Bring a lab report into one clear place and explore the values in everyday language.' },
  { icon: MessageCircle, title: 'Ask better questions', text: 'Use the AI assistant to learn about nutrition and discuss the context in your report.' },
  { icon: Utensils, title: 'Keep your habits in view', text: 'Save food preferences, personal goals, and health context to guide your workspace.' },
];

export default function Landing() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="landing-brand" to="/" aria-label="NutriCare home"><span className="landing-brand-mark"><Activity size={19} /></span><span>NutriCare</span></Link>
        <nav className="landing-nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a><a href="#what-you-can-do">What you can do</a>
          <Link className="landing-signin" to="/login">Sign in</Link><Link className="landing-nav-cta" to="/signup">Get started <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-eyebrow"><span className="landing-eyebrow-dot" /> A clearer picture of your health</div>
          <h1>Health information,<br /><em>made more human.</em></h1>
          <p className="landing-lede">Bring your reports, nutrition questions, and everyday goals into one thoughtful space. Understand the details, then decide what to explore next.</p>
          <div className="landing-actions"><Link className="landing-primary" to="/signup">Create your free account <ArrowRight size={17} /></Link><Link className="landing-secondary" to="/login">I already have an account</Link></div>
          <p className="landing-footnote"><LockKeyhole size={14} /> Your account is protected by secure sign-in. Your health journey stays yours.</p>
        </div>

        <div className="landing-preview-wrap" aria-label="Preview of the NutriCare health workspace">
          <div className="landing-preview-glow" />
          <div className="landing-preview">
            <div className="preview-head"><div className="preview-brand"><span className="landing-brand-mark"><Activity size={14} /></span><span>NutriCare</span></div><span className="preview-label">YOUR WORKSPACE</span></div>
            <div className="preview-greeting"><span className="preview-kicker">A LITTLE MORE CLARITY</span><h2>Good morning.</h2><p>Your health information, gathered in one place.</p></div>
            <div className="preview-report"><div className="preview-report-icon"><FileText size={18} /></div><div className="preview-report-copy"><strong>Your reports</strong><span>Upload a lab report to get started</span></div><span className="preview-arrow"><ArrowRight size={16} /></span></div>
            <div className="preview-assistant"><div className="preview-assistant-heading"><span className="preview-assistant-icon"><Sparkles size={15} /></span><div><strong>Ask NutriCare</strong><span>AI health & nutrition assistant</span></div></div><div className="preview-bubble">What would you like to understand today?</div><div className="preview-prompt">How can I read my lab report? <ArrowRight size={13} /></div></div>
            <div className="preview-foot"><span><span className="preview-status-dot" /> Ready when you are</span><span>Example workspace</span></div>
          </div>
          <div className="preview-note"><HeartPulse size={16} /><span>Thoughtful tools for everyday health</span></div>
        </div>
      </section>

      <section className="landing-trust" aria-label="NutriCare principles"><span><Check size={15} /> Clear, approachable language</span><span><Check size={15} /> Your reports stay in context</span><span><Check size={15} /> AI guidance, not a diagnosis</span></section>

      <section className="landing-section" id="how-it-works">
        <div className="landing-section-intro"><span className="landing-eyebrow">A SIMPLE PLACE TO START</span><h2>From information to a next question.</h2><p>NutriCare helps you organize health information and explore it at your own pace.</p></div>
        <div className="landing-steps"><article><span className="landing-step-number">01</span><UploadCloud size={21} /><h3>Bring in a report</h3><p>Upload a supported PDF or image of your lab report to see its analysis in your workspace.</p></article><article><span className="landing-step-number">02</span><Sparkles size={21} /><h3>Explore the details</h3><p>Review the available report summary and ask the AI assistant about health or nutrition.</p></article><article><span className="landing-step-number">03</span><HeartPulse size={21} /><h3>Make it personal</h3><p>Add your preferences and goals so your account reflects what matters to you.</p></article></div>
      </section>

      <section className="landing-capabilities" id="what-you-can-do"><div className="landing-section-intro"><span className="landing-eyebrow">MADE FOR REAL LIFE</span><h2>Useful, without the overwhelm.</h2></div><div className="landing-feature-grid">{features.map((feature) => <article key={feature.title}><span className="landing-feature-icon">{React.createElement(feature.icon, { size: 20 })}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></section>

      <section className="landing-privacy"><div><span className="landing-eyebrow">YOUR HEALTH, YOUR PACE</span><h2>Built to help you understand.<br />Made to be clear about its limits.</h2></div><p>NutriCare provides AI-generated information to support your learning. It does not diagnose conditions or replace advice from a qualified health professional. For urgent concerns, contact local emergency services or a clinician.</p></section>

      <section className="landing-final"><div><span className="landing-eyebrow">A MORE ORGANIZED START</span><h2>Make room for better questions.</h2><p>Create an account to bring your reports and health goals together.</p></div><Link className="landing-primary" to="/signup">Get started with NutriCare <ArrowRight size={17} /></Link></section>
      <footer className="landing-footer"><Link className="landing-brand" to="/"><span className="landing-brand-mark"><Activity size={16} /></span><span>NutriCare</span></Link><span>Thoughtful tools for your health journey.</span><Link to="/login">Sign in</Link></footer>
    </main>
  );
}
