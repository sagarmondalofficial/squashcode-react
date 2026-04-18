import { useState } from 'react'

const campaigns = [
  { id: 1, name: 'Meta Ads', icon: '📣', color: '#3b82f6', spend: '₹38,720', leads: 412, ctr: '4.77%', cpl: '₹94', status: 'Active' },
  { id: 2, name: 'Google Ads', icon: '🔍', color: '#ff6b00', spend: '₹51,300', leads: 284, ctr: '4.57%', cpl: '₹181', status: 'Active' },
  { id: 3, name: 'SEO', icon: '🌐', color: '#a855f7', spend: '₹20,000', leads: 96, ctr: '3.20%', cpl: '₹208', status: 'Monitoring' },
]

function Card({ c }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#17171f', border: `1px solid ${c.color}44`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ height: 3, background: c.color }} />
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: c.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{c.icon}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{c.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#666' }}>Apr 2026</div>
            </div>
          </div>
          <span style={{ background: c.status === 'Active' ? '#22c55e22' : '#f59e0b22', color: c.status === 'Active' ? '#22c55e' : '#f59e0b', border: `1px solid ${c.status === 'Active' ? '#22c55e44' : '#f59e0b44'}`, padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600 }}>
            {c.status}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[['Spend', c.spend], ['Leads', c.leads], ['CTR', c.ctr], ['CPL', c.cpl]].map(([label, val]) => (
            <div key={label} style={{ background: '#0f0f13', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: '0.65rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f0f0f0', marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'transparent', border: `1px solid ${c.color}33`, color: c.color, borderRadius: 8, padding: '8px 0', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
          {open ? '▲ Hide' : '▼ Details'}
        </button>
        {open && (
          <div style={{ marginTop: 12, fontSize: '0.8rem', color: '#888', lineHeight: 1.7 }}>
            <div>📍 Audience: Custom + Lookalike · 25–54 · India</div>
            <div>🎯 Goal: Lead Form Submissions</div>
            <div>🖼 Formats: Image · Carousel · Reel</div>
            <div>👤 Manager: SquashCode · Kolkata</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', color: '#f0f0f0', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 5%', borderBottom: '1px solid #1e1e2a', background: '#0f0f13', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>Squash<span style={{ color: '#ff6b00' }}>Code</span></div>
        <div style={{ fontSize: '0.8rem', color: '#555' }}>Campaign Dashboard · April 2026</div>
      </nav>
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 5% 60px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#ff6b00', marginBottom: 6 }}>Live Campaigns</div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.5px' }}>Performance Overview</h1>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'Total Leads', value: '792', icon: '🎯', color: '#22c55e' },
            { label: 'Total Spend', value: '₹90,020', icon: '💰', color: '#3b82f6' },
            { label: 'Avg. CTR', value: '4.67%', icon: '📈', color: '#ff6b00' },
            { label: 'Blended CPL', value: '₹114', icon: '⚡', color: '#a855f7' },
          ].map(s => (
            <div key={s.label} style={{ background: '#17171f', border: '1px solid #2a2a38', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: '0.73rem', color: '#666', marginTop: 1 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {campaigns.map(c => <Card key={c.id} c={c} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40, fontSize: '0.72rem', color: '#333' }}>
          SquashCode Agency · squashcode.in · Kolkata, India
        </div>
      </main>
    </div>
  )
}
