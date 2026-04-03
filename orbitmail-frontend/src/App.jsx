import { useState, useEffect } from 'react'
import { getEmails, sendEmail, deleteEmail } from './api'

const SYNC_INTERVAL = 30

export default function App() {
  const [view, setView] = useState('inbox')
  const [emails, setEmails] = useState([])
  const [selected, setSelected] = useState(null)
  const [syncCountdown, setSyncCountdown] = useState(SYNC_INTERVAL)
  const [syncing, setSyncing] = useState(false)
  const [syncLog, setSyncLog] = useState(['[SYSTEM] OrbitMail initialized...'])
  const [signal, setSignal] = useState(72)
  const [latency, setLatency] = useState(1340)
  const [form, setForm] = useState({ to: '', subject: '', body: '' })

  // Fetch emails from backend
  useEffect(() => {
    getEmails()
      .then(res => setEmails(res.data.data))
      .catch(err => console.error('Failed to fetch emails:', err))
  }, [])

  // Sync countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncCountdown(prev => {
        if (prev <= 1) {
          triggerSync()
          return SYNC_INTERVAL
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [emails])

  // Signal fluctuation
  useEffect(() => {
    const sig = setInterval(() => {
      setSignal(s => Math.max(40, Math.min(95, s + Math.floor(Math.random() * 7) - 3)))
      setLatency(l => Math.max(1200, Math.min(1600, l + Math.floor(Math.random() * 40) - 20)))
    }, 2000)
    return () => clearInterval(sig)
  }, [])

  const addLog = (msg) => {
    const now = new Date()
    const time = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')} UTC`
    setSyncLog(prev => [...prev, `[${time}] ${msg}`])
  }

  const triggerSync = () => {
    const queued = emails.filter(e => e.status === 'queued')
    if (queued.length === 0) {
      addLog('No queued messages. Sync window idle.')
      return
    }
    setSyncing(true)
    addLog(`Sync window opened. Transmitting ${queued.length} message(s)...`)
    setTimeout(() => {
      setEmails(prev => prev.map(e => e.status === 'queued' ? { ...e, status: 'sent' } : e))
      addLog('Transmission complete. Messages delivered to Earth.')
      setSyncing(false)
    }, 3000)
  }

  const handleCompose = async () => {
    if (!form.to || !form.subject || !form.body) return
    try {
      const res = await sendEmail({ ...form, status: 'queued' })
      setEmails(prev => [...prev, res.data.data])
      addLog(`Email "${form.subject}" added to outbox queue.`)
      setForm({ to: '', subject: '', body: '' })
      setView('outbox')
    } catch (err) {
      console.error('Failed to send email:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteEmail(id)
      setEmails(prev => prev.filter(e => e._id !== id))
      setSelected(null)
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const queued = emails.filter(e => e.status === 'queued').length
  const sent = emails.filter(e => e.status === 'sent').length
  const syncPct = Math.round((syncCountdown / SYNC_INTERVAL) * 100)

  return (
    <div style={{
      fontFamily: "'Courier New', monospace",
      background: '#050A14',
      minHeight: '100vh',
      color: '#C8D8E8',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Starfield */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(80)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() > 0.8 ? '2px' : '1px',
            height: Math.random() > 0.8 ? '2px' : '1px',
            background: '#fff',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.6,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:0.9} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A1628; }
        ::-webkit-scrollbar-thumb { background: #1E3A5F; border-radius: 2px; }
        button:hover { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <header style={{
        position: 'relative', zIndex: 10,
        background: 'linear-gradient(180deg, #0A1628 0%, #071020 100%)',
        borderBottom: '1px solid #1E3A5F',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '2px solid #3B82F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 0 12px rgba(59,130,246,0.4)',
          }}>🛸</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#E0F0FF', letterSpacing: 3 }}>ORBITMAIL</div>
            <div style={{ fontSize: 9, color: '#4A7FA5', letterSpacing: 2 }}>ARTEMIS II // ORION SPACECRAFT COMMS</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <StatusBadge label="SIGNAL" value={`${signal}%`} color={signal > 60 ? '#10B981' : '#F59E0B'} />
          <StatusBadge label="LATENCY" value={`${latency}ms`} color="#3B82F6" />
          <StatusBadge label="DISTANCE" value="384,400 KM" color="#8B5CF6" />
          <div style={{
            background: syncing ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${syncing ? '#3B82F6' : '#1E3A5F'}`,
            borderRadius: 4, padding: '4px 10px', fontSize: 10,
            color: syncing ? '#60A5FA' : '#4A7FA5', letterSpacing: 1,
          }}>
            {syncing ? '⚡ SYNCING...' : `NEXT SYNC: ${syncCountdown}s`}
          </div>
          <img src="/orbitmail-logo.svg" width="36" height="36" />
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 1 }}>

        {/* Sidebar */}
        <aside style={{
          width: 200, background: '#070E1C',
          borderRight: '1px solid #1E3A5F',
          display: 'flex', flexDirection: 'column', padding: '16px 0',
        }}>
          <button onClick={() => setView('compose')} style={{
            margin: '0 12px 16px',
            background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
            border: 'none', borderRadius: 6, padding: '10px',
            color: '#fff', fontFamily: 'inherit', fontWeight: 'bold',
            fontSize: 11, letterSpacing: 2, cursor: 'pointer',
            boxShadow: '0 0 20px rgba(59,130,246,0.3)',
          }}>✦ COMPOSE</button>

          {[
            { id: 'inbox', icon: '📡', label: 'INBOX', badge: emails.length },
            { id: 'outbox', icon: '📤', label: 'OUTBOX', badge: queued },
            { id: 'synclog', icon: '🔄', label: 'SYNC LOG', badge: 0 },
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id); setSelected(null) }} style={{
              background: view === item.id ? 'rgba(59,130,246,0.1)' : 'none',
              border: 'none',
              borderLeft: view === item.id ? '2px solid #3B82F6' : '2px solid transparent',
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', width: '100%', textAlign: 'left',
              color: view === item.id ? '#E0F0FF' : '#4A7FA5',
              fontFamily: 'inherit', fontSize: 11, letterSpacing: 1.5,
            }}>
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  background: '#1D4ED8', color: '#fff',
                  borderRadius: 10, padding: '1px 6px', fontSize: 9,
                }}>{item.badge}</span>
              )}
            </button>
          ))}

          {/* Sync Progress */}
          <div style={{ marginTop: 'auto', padding: '16px 12px', borderTop: '1px solid #1E3A5F' }}>
            <div style={{ fontSize: 9, color: '#4A7FA5', letterSpacing: 1, marginBottom: 6 }}>SYNC WINDOW</div>
            <div style={{ background: '#0A1628', borderRadius: 3, height: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: syncing ? '#3B82F6' : 'linear-gradient(90deg, #1D4ED8, #10B981)',
                width: syncing ? '100%' : `${100 - syncPct}%`,
                transition: 'width 1s linear',
                boxShadow: '0 0 8px rgba(59,130,246,0.6)',
              }} />
            </div>
            <div style={{ fontSize: 9, color: '#4A7FA5', marginTop: 4, textAlign: 'right' }}>
              {syncing ? 'TRANSMITTING' : `${syncCountdown}s REMAINING`}
            </div>
            <div style={{ marginTop: 10, fontSize: 9, color: '#4A7FA5' }}>
              <div>QUEUED: <span style={{ color: '#F59E0B' }}>{queued}</span></div>
              <div>SENT: <span style={{ color: '#10B981' }}>{sent}</span></div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* INBOX */}
          {view === 'inbox' && !selected && (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <SectionHeader title="INCOMING TRANSMISSIONS" subtitle={`${emails.length} messages from Earth`} />
              {emails.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: '#4A7FA5', fontSize: 12 }}>
                  No messages received yet.
                </div>
              )}
              {emails.map(email => (
                <div key={email._id} onClick={() => setSelected(email)} style={{
                  padding: '14px 20px', borderBottom: '1px solid #0D1F35',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#4A7FA5' }}>FROM: {email.from}</span>
                    <span style={{ fontSize: 10, color: '#2A4A6A' }}>{new Date(email.timestamp).toUTCString().slice(0, 16)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#E0F0FF' }}>{email.subject}</div>
                  <div style={{ fontSize: 11, color: '#2A4A6A', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.body}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EMAIL DETAIL */}
          {view === 'inbox' && selected && (
            <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button onClick={() => setSelected(null)} style={{
                  background: 'none', border: '1px solid #1E3A5F', color: '#4A7FA5',
                  fontFamily: 'inherit', fontSize: 10, letterSpacing: 2,
                  padding: '6px 12px', borderRadius: 4, cursor: 'pointer',
                }}>← BACK</button>
                <button onClick={() => handleDelete(selected._id)} style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444',
                  color: '#EF4444', fontFamily: 'inherit', fontSize: 10,
                  letterSpacing: 2, padding: '6px 12px', borderRadius: 4, cursor: 'pointer',
                }}>🗑 DELETE</button>
              </div>
              <div style={{ background: '#0A1628', border: '1px solid #1E3A5F', borderRadius: 8, padding: 24 }}>
                <div style={{ fontSize: 18, color: '#E0F0FF', marginBottom: 12 }}>{selected.subject}</div>
                <div style={{ fontSize: 11, color: '#4A7FA5', marginBottom: 4 }}>FROM: {selected.from}</div>
                <div style={{ fontSize: 11, color: '#4A7FA5', marginBottom: 20 }}>TO: {selected.to}</div>
                <div style={{ borderTop: '1px solid #1E3A5F', paddingTop: 16, lineHeight: 1.8, color: '#C8D8E8', fontSize: 13 }}>
                  {selected.body}
                </div>
              </div>
            </div>
          )}

          {/* OUTBOX */}
          {view === 'outbox' && (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <SectionHeader title="OUTBOX QUEUE" subtitle="Messages awaiting sync window" />
              {emails.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: '#4A7FA5', fontSize: 12 }}>No messages in queue.</div>
              )}
              {emails.map(email => (
                <div key={email._id} style={{
                  padding: '14px 20px', borderBottom: '1px solid #0D1F35',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: email.status === 'sending' ? 'rgba(59,130,246,0.05)' : 'transparent',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 9, padding: '2px 8px', borderRadius: 10, letterSpacing: 1,
                        background: email.status === 'queued' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                        color: email.status === 'queued' ? '#F59E0B' : '#10B981',
                        border: `1px solid ${email.status === 'queued' ? '#F59E0B44' : '#10B98144'}`,
                      }}>{email.status.toUpperCase()}</span>
                      <span style={{ fontSize: 12, color: '#C8D8E8' }}>{email.subject}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#4A7FA5' }}>TO: {email.to}</div>
                  </div>
                  {email.status === 'queued' && <div style={{ color: '#F59E0B', animation: 'pulse 2s infinite' }}>●</div>}
                  {email.status === 'sent' && <div style={{ color: '#10B981' }}>✓</div>}
                </div>
              ))}
            </div>
          )}

          {/* COMPOSE */}
          {view === 'compose' && (
            <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
              <SectionHeader title="COMPOSE TRANSMISSION" subtitle="Queued and sent during next sync window" />
              <div style={{ background: '#0A1628', border: '1px solid #1E3A5F', borderRadius: 8, padding: 24, maxWidth: 600 }}>
                {[
                  { label: 'TO', key: 'to', placeholder: 'mission.control@nasa.gov' },
                  { label: 'SUBJECT', key: 'subject', placeholder: 'Status report...' },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 9, color: '#4A7FA5', letterSpacing: 2, marginBottom: 6 }}>{field.label}</div>
                    <input value={form[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', background: '#050A14', border: '1px solid #1E3A5F',
                        color: '#C8D8E8', fontFamily: 'inherit', fontSize: 12,
                        padding: '10px 12px', borderRadius: 4, outline: 'none', boxSizing: 'border-box',
                      }} />
                  </div>
                ))}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 9, color: '#4A7FA5', letterSpacing: 2, marginBottom: 6 }}>MESSAGE</div>
                  <textarea rows={6} value={form.body}
                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                    placeholder="Enter your transmission..."
                    style={{
                      width: '100%', background: '#050A14', border: '1px solid #1E3A5F',
                      color: '#C8D8E8', fontFamily: 'inherit', fontSize: 12,
                      padding: '10px 12px', borderRadius: 4, outline: 'none',
                      resize: 'vertical', boxSizing: 'border-box',
                    }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleCompose} style={{
                    background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
                    border: 'none', borderRadius: 4, padding: '10px 20px',
                    color: '#fff', fontFamily: 'inherit', fontSize: 11,
                    letterSpacing: 2, cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(59,130,246,0.3)',
                  }}>⬆ QUEUE MESSAGE</button>
                  <button onClick={() => setView('inbox')} style={{
                    background: 'none', border: '1px solid #1E3A5F', borderRadius: 4,
                    padding: '10px 20px', color: '#4A7FA5',
                    fontFamily: 'inherit', fontSize: 11, letterSpacing: 2, cursor: 'pointer',
                  }}>CANCEL</button>
                </div>
                <div style={{ marginTop: 12, fontSize: 10, color: '#4A7FA5' }}>
                  ⚠ Message will transmit in {syncCountdown}s
                </div>
              </div>
            </div>
          )}

          {/* SYNC LOG */}
          {view === 'synclog' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <SectionHeader title="SYNC ENGINE LOG" subtitle="Real-time transmission activity" />
              <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px', fontFamily: 'monospace', fontSize: 11, lineHeight: 2 }}>
                {syncLog.map((log, i) => (
                  <div key={i} style={{
                    color: log.includes('complete') ? '#10B981' : log.includes('Transmitting') ? '#3B82F6' : '#4A7FA5'
                  }}>{log}</div>
                ))}
                {syncing && <div style={{ color: '#3B82F6', animation: 'pulse 0.8s infinite' }}>[LIVE] Transmitting to Earth...</div>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function StatusBadge({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 8, color: '#4A7FA5', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 11, color, fontWeight: 'bold', letterSpacing: 1 }}>{value}</div>
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E3A5F', background: '#070E1C' }}>
      <div style={{ fontSize: 13, color: '#E0F0FF', letterSpacing: 3, fontWeight: 'bold' }}>{title}</div>
      <div style={{ fontSize: 10, color: '#4A7FA5', marginTop: 3, letterSpacing: 1 }}>{subtitle}</div>
    </div>
  )
}