import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Files,
  MonitorUp,
  PenTool,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'HD video meetings',
    description: 'Meet face-to-face with real-time audio and video powered by WebRTC.',
  },
  {
    icon: MonitorUp,
    title: 'Screen sharing',
    description: 'Present your screen, explain ideas and keep everyone on the same page.',
  },
  {
    icon: Files,
    title: 'File sharing',
    description: 'Share meeting documents securely without leaving your workspace.',
  },
  {
    icon: PenTool,
    title: 'Live whiteboard',
    description: 'Sketch, brainstorm and collaborate together on a synchronized canvas.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by design',
    description: 'Protected authentication, authorization and encrypted WebRTC media.',
  },
];

const steps = [
  ['01', 'Create a meeting', 'Start a room in seconds and get a unique meeting code.'],
  ['02', 'Invite your team', 'Share the code or meeting link with your participants.'],
  ['03', 'Collaborate live', 'Use video, chat, files, screen sharing and the whiteboard together.'],
];

export function Landing() {
  return (
    <main>
      <section className="hero-shell">
        <div className="max-w-7xl mx-auto px-5 py-16 md:py-24 lg:py-28 grid lg:grid-cols-[1.02fr_.98fr] gap-14 items-center">
          <div>
            <div className="badge"><Sparkles size={13} /> Real-time collaboration</div>
            <h1 className="hero-title mt-5">
              Meet.
              <br />
              Share.
              <br />
              <span>Build together.</span>
            </h1>
            <p className="hero-copy mt-6">
              One focused workspace for video meetings, screen sharing, chat, files and a
              synchronized whiteboard.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/register" className="btn-primary btn-lg">
                Create free account <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="btn-secondary btn-lg">
                Sign in
              </Link>
            </div>
            <div className="hero-trust mt-7">
              <span><Check size={14} /> Browser based</span>
              <span><Check size={14} /> WebRTC powered</span>
              <span><Check size={14} /> Built for teams</span>
            </div>
          </div>

          <div className="meeting-preview-wrap">
            <div className="meeting-preview">
              <div className="meeting-preview-top">
                <div>
                  <span className="live-dot" /> Live meeting
                  <strong>Product discussion</strong>
                </div>
                <span className="meeting-time">10:42</span>
              </div>
              <div className="preview-grid">
                {['You', 'Alex', 'Maya', 'Sam'].map((name, index) => (
                  <div className={`preview-tile tile-${index + 1}`} key={name}>
                    <div className="preview-avatar">{name[0]}</div>
                    <div className="preview-name">{name}</div>
                    <span className="preview-status">{index === 0 ? 'You' : 'Speaking'}</span>
                  </div>
                ))}
              </div>
              <div className="preview-controls">
                <span>🎤</span><span>🎥</span><span>🖥</span><span>💬</span><span className="preview-leave">Leave</span>
              </div>
            </div>
            <div className="floating-card floating-card-one"><Users size={17} /><div><strong>4 participants</strong><small>Connected now</small></div></div>
            <div className="floating-card floating-card-two"><Play size={16} /><div><strong>Screen sharing</strong><small>Alex is presenting</small></div></div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-5 py-20 md:py-24">
        <div className="section-heading">
          <div className="badge">Everything in one room</div>
          <h2>Tools that keep the conversation moving.</h2>
          <p>From the first hello to the final shared file, ConnectHub keeps your team together.</p>
        </div>
        <div className="feature-grid mt-10">
          {features.map(({ icon: Icon, title, description }) => (
            <div className="feature-card" key={title}>
              <div className="feature-icon"><Icon size={21} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="feature-arrow"><ArrowRight size={16} /></span>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="how-section">
        <div className="max-w-7xl mx-auto px-5 py-20 md:py-24">
          <div className="section-heading centered">
            <div className="badge">Simple by design</div>
            <h2>From idea to collaboration in three steps.</h2>
          </div>
          <div className="steps-grid mt-12">
            {steps.map(([number, title, description]) => (
              <div className="step-card" key={number}>
                <span className="step-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="max-w-7xl mx-auto px-5 py-20 md:py-24">
        <div className="security-panel">
          <div>
            <div className="badge"><ShieldCheck size={14} /> Secure collaboration</div>
            <h2 className="security-title mt-5">Built with privacy and control in mind.</h2>
            <p className="security-copy mt-4">
              Protected routes, server-side authorization and encrypted WebRTC media give your
              meetings a secure foundation.
            </p>
          </div>
          <div className="security-list">
            {['Authenticated meeting access', 'Server-side authorization', 'Encrypted WebRTC media', 'Validated file uploads'].map((item) => (
              <div key={item}><Check size={16} /> {item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 pb-20 md:pb-24">
        <div className="cta-panel">
          <div>
            <span className="eyebrow">Ready when you are</span>
            <h2>Bring your next meeting to life.</h2>
            <p>Create a free account and start collaborating from your browser.</p>
          </div>
          <Link to="/register" className="btn-primary btn-lg">Get started <ArrowRight size={17} /></Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="max-w-7xl mx-auto px-5 py-10 flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="flex items-center gap-2 font-bold"><span className="brand-mark"><Video size={17} /></span>ConnectHub</div>
          <p>Real-time collaboration for modern teams.</p>
          <div className="flex gap-5 text-sm"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#security">Security</a></div>
        </div>
      </footer>
    </main>
  );
}
