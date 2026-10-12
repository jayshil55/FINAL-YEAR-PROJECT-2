import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function NotFound() {
  const { isAuthenticated } = useAuth();
  const destination = isAuthenticated ? '/upload' : '/';
  const destinationLabel = isAuthenticated ? 'Go to your workspace' : 'Back to NutriCare';

  return (
    <main className="not-found-page">
      <Link className="landing-brand" to="/"><span className="landing-brand-mark"><Compass size={18} /></span><span>NutriCare</span></Link>
      <div className="not-found-content"><span className="not-found-code">404</span><h1>This page isn’t here.</h1><p>The address may have changed, or the page may no longer be available. Let’s get you back to a familiar place.</p><div className="not-found-actions"><Link className="landing-primary" to={destination}>{destinationLabel} <ArrowRight size={16} /></Link><button className="not-found-back" type="button" onClick={() => window.history.back()}><ArrowLeft size={15} /> Go back</button></div></div>
    </main>
  );
}
