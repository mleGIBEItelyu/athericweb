import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Select } from '@/components/common/Select'
import { useToast } from '@/components/common/Toast'

// Apply theme to <html> element
function applyTheme(theme: string) {
  if (theme === 'dark') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

// Load saved settings on mount
function loadSettings() {
  try {
    const raw = localStorage.getItem('terminal_settings')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const AI_OPTIONS = [
  { value: 'generative', label: 'Generative Financial LLM (Default)' },
  { value: 'statistical', label: 'Statistical Model (ARIMA + GARCH)' },
  { value: 'machine-learning', label: 'Deep Learning (LSTM Neural Net)' },
]

const INDEX_OPTIONS = [
  { value: 'IHSG', label: 'IHSG (Pasar Saham Indonesia)' },
  { value: 'LQ45', label: 'LQ45 (Indeks 45 Saham Unggulan)' },
  { value: 'IDX30', label: 'IDX30 (Indeks 30 Ter-likuid)' },
]

const NOTIF_ITEMS = [
  {
    key: 'sentiment',
    title: 'Perubahan Sentimen Drastis',
    desc: 'Dapatkan pemberitahuan instan jika model mendeteksi perubahan sentimen dari bullish ke bearish.',
    demo: { title: '⚠ Sentimen Berubah — BBCA', body: 'Model mendeteksi pergeseran sentimen dari Bullish ke Bearish pada BBCA. Harga mendekati support 9.400.' },
  },
  {
    key: 'keylevels',
    title: 'Emiten Watchlist Menyentuh Key Levels',
    desc: 'Kirim alert jika salah satu emiten watchlist mendekati level Resistance atau Support kunci.',
    demo: { title: '📊 Key Level Alert — TLKM', body: 'TLKM menyentuh resistance kunci di Rp 3.720. Volume di atas rata-rata — waspadai breakout.' },
  },
  {
    key: 'news',
    title: 'Pembaruan Berita Prioritas Tinggi',
    desc: 'Alert khusus untuk berita dengan dampak tinggi (High impact news).',
    demo: { title: '📰 High-Impact News — IHSG', body: 'Bank Indonesia menaikkan suku bunga acuan sebesar 25bps. Dampak tinggi terhadap sektor perbankan.' },
  },
]

function sendBrowserNotif(title: string, body: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' })
  }
}

export function Settings() {
  const saved0 = loadSettings()
  const location  = useLocation()
  const navigate  = useNavigate()

  const VALID_TABS = ['general', 'display', 'notifications']
  const hashTab   = location.hash.replace('#', '')
  const activeTab = VALID_TABS.includes(hashTab) ? hashTab : 'general'

  function setActiveTab(tab: string) {
    navigate(`/settings#${tab}`, { replace: true })
  }

  const [aiModel, setAiModel] = useState(saved0?.aiModel ?? 'generative')
  const [confidence, setConfidence] = useState(saved0?.confidence ?? '90')
  const [defaultIndex, setDefaultIndex] = useState(saved0?.defaultIndex ?? 'IHSG')
  const [theme, setTheme] = useState(saved0?.theme ?? 'dark')
  const [notifEnabled, setNotifEnabled] = useState<Record<string, boolean>>(
    saved0?.notifEnabled ?? { sentiment: true, keylevels: true, news: true }
  )
  const [savedFeedback, setSavedFeedback] = useState(false)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  )

  // Apply saved theme on first mount
  useEffect(() => {
    applyTheme(theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleThemeChange(t: string) {
    setTheme(t)
    applyTheme(t)
    const names: Record<string, string> = { dark: 'Carbon Dark', blue: 'Deep Ocean Blue', emerald: 'Cyber Emerald', gibei: 'Gibei' }
    toast.info(`Tema ${names[t] ?? t} diterapkan`, 'Klik Simpan untuk menyimpan preferensi.')
  }

  // wantOn = desired new state (true = enable, false = disable)
  async function handleNotifToggle(key: string, wantOn: boolean) {
    if (wantOn && notifPermission !== 'granted') {
      const result = await Notification.requestPermission()
      setNotifPermission(result)
      if (result !== 'granted') {
        toast.error('Izin ditolak', 'Aktifkan notifikasi di pengaturan browser Anda.')
        return
      }
      sendBrowserNotif('Atheric AI — Notifikasi Aktif', 'Alert browser berhasil diaktifkan untuk terminal ini.')
      toast.success('Izin diberikan!', 'Browser notifications berhasil diaktifkan.')
    }
    setNotifEnabled(prev => ({ ...prev, [key]: wantOn }))
    if (wantOn) {
      const item = NOTIF_ITEMS.find(i => i.key === key)
      toast.success(`${item?.title ?? key} aktif`, 'Alert jenis ini akan dikirim ke browser Anda.')
    } else {
      toast.warning('Notifikasi dinonaktifkan', NOTIF_ITEMS.find(i => i.key === key)?.title)
    }
  }

  function sendTestNotif(item: typeof NOTIF_ITEMS[number]) {
    if (notifPermission !== 'granted') {
      toast.error('Izin belum diberikan', 'Aktifkan toggle terlebih dahulu untuk meminta izin.')
      return
    }
    sendBrowserNotif(item.demo.title, item.demo.body)
    toast.info('Test notifikasi dikirim', item.demo.title)
  }

  const toast = useToast()

  function handleSave() {
    localStorage.setItem(
      'terminal_settings',
      JSON.stringify({ aiModel, confidence, defaultIndex, theme, notifEnabled })
    )
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
    toast.success('Pengaturan disimpan', 'Preferensi Anda berhasil tersimpan.')
  }

  const tabs = [
    { id: 'general', label: 'Umum & AI Model' },
    { id: 'display', label: 'Tampilan (Theme)' },
    { id: 'notifications', label: 'Notifikasi Alert' },
  ]

  const themes = [
    { id: 'dark', label: 'Carbon Dark', desc: 'Skema hitam legam premium terminal.', dot: '#3b6ef6' },
    { id: 'blue', label: 'Deep Ocean Blue', desc: 'Tema biru samudera dengan kontras lembut.', dot: '#5ba4ff' },
    { id: 'emerald', label: 'Cyber Emerald', desc: 'Gaya terminal hacker dengan aksen hijau neon.', dot: '#00e87c' },
    { id: 'gibei', label: 'Gibei', desc: 'Hitam dominan dengan aksen emas, merah & putih.', dot: '#ffd400' },
  ]

  return (
    <div className="content">
      <div className="page-head">
        <div className="page-title">PENGATURAN</div>
        <div className="page-sub">Kustomisasi parameter model AI, rentang kepercayaan proyeksi, dan preferensi tampilan.</div>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left: Tab Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '160px', flexShrink: 0, width: '100%', maxWidth: '200px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 500,
                textAlign: 'left',
                transition: 'background .15s, color .15s',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: activeTab === tab.id ? 'var(--blue-soft)' : 'transparent',
                color: activeTab === tab.id ? 'var(--blue-bright)' : 'var(--text-dim)',
                border: activeTab === tab.id ? '1px solid rgba(79,125,255,0.3)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Content Panel */}
        <div className="card" style={{ flex: 1, minWidth: 0, padding: '20px' }}>

          {/* ── General Tab ── */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                Konfigurasi Model AI
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="stat-label" style={{ fontSize: '11.5px', fontWeight: 600 }}>AI Forecasting Engine</label>
                <Select value={aiModel} onChange={setAiModel} options={AI_OPTIONS} />
                <span style={{ fontSize: '11px', color: 'var(--text-mute)' }}>Model Generative AI menganalisis data numerik dan sentimen berita secara simultan.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="stat-label" style={{ fontSize: '11.5px', fontWeight: 600 }}>Confidence Interval (CI)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['90', '95', '99'].map(val => (
                    <button
                      key={val}
                      onClick={() => setConfidence(val)}
                      style={{
                        flex: 1, padding: '9px', fontSize: '13px', fontWeight: 600,
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        transition: 'background .15s, color .15s, border-color .15s',
                        background: confidence === val ? 'var(--blue-soft)' : 'var(--bg-2)',
                        border: confidence === val ? '1px solid var(--blue)' : '1px solid var(--border)',
                        color: confidence === val ? 'var(--blue-bright)' : 'var(--text-dim)',
                      }}
                    >
                      {val}% CI
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-mute)' }}>Batas keyakinan model membatasi rentang visualisasi area prediksi (Confidence Cone) di chart.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="stat-label" style={{ fontSize: '11.5px', fontWeight: 600 }}>Indeks Saham Utama (Topbar)</label>
                <Select value={defaultIndex} onChange={setDefaultIndex} options={INDEX_OPTIONS} />
              </div>
            </div>
          )}

          {/* ── Display Tab ── */}
          {activeTab === 'display' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                Tampilan &amp; Tema
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="stat-label" style={{ fontSize: '11.5px', fontWeight: 600 }}>Tema Terminal</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      style={{
                        padding: '14px', borderRadius: 'var(--radius-sm)', textAlign: 'left', cursor: 'pointer',
                        transition: 'background .15s, border-color .15s',
                        background: theme === t.id ? 'var(--blue-soft)' : 'var(--bg-2)',
                        border: theme === t.id ? '1px solid var(--blue)' : '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.dot, flexShrink: 0, display: 'block' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: theme === t.id ? 'var(--blue-bright)' : 'var(--text)' }}>{t.label}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-mute)' }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                Pengaturan Notifikasi
              </h2>

              {/* Permission status banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: notifPermission === 'granted'
                  ? 'rgba(46,194,122,0.08)' : notifPermission === 'denied'
                    ? 'rgba(240,86,75,0.08)' : 'rgba(217,161,58,0.08)',
                border: notifPermission === 'granted'
                  ? '1px solid rgba(46,194,122,0.25)' : notifPermission === 'denied'
                    ? '1px solid rgba(240,86,75,0.25)' : '1px solid rgba(217,161,58,0.25)',
              }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: notifPermission === 'granted' ? 'var(--green)' : notifPermission === 'denied' ? 'var(--red)' : 'var(--amber)',
                }} />
                <div>
                  <span style={{
                    fontSize: '12px', fontWeight: 700,
                    color: notifPermission === 'granted' ? 'var(--green)' : notifPermission === 'denied' ? 'var(--red)' : 'var(--amber)',
                  }}>
                    {notifPermission === 'granted' ? 'Notifikasi browser diizinkan' : notifPermission === 'denied' ? 'Notifikasi browser diblokir — ubah di pengaturan browser' : 'Izin notifikasi belum diberikan'}
                  </span>
                  {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                    <span style={{ fontSize: '11px', color: 'var(--text-mute)', marginLeft: '6px' }}>— aktifkan salah satu toggle di bawah untuk meminta izin</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {NOTIF_ITEMS.map((item, idx) => {
                  const isOn = notifEnabled[item.key]
                  return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px',
                      padding: '16px 0',
                      borderBottom: idx < NOTIF_ITEMS.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{item.title}</span>
                        {isOn && notifPermission === 'granted' && (
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px',
                            background: 'rgba(46,194,122,0.12)', border: '1px solid rgba(46,194,122,0.3)', color: 'var(--green)' }}>
                            AKTIF
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.5 }}>{item.desc}</div>
                      {isOn && notifPermission === 'granted' && (
                        <button
                          type="button"
                          onClick={() => sendTestNotif(item)}
                          style={{
                            marginTop: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                            padding: '4px 10px', borderRadius: '6px',
                            background: 'var(--blue-soft)', border: '1px solid rgba(79,125,255,0.25)',
                            color: 'var(--blue-bright)', display: 'inline-flex', alignItems: 'center', gap: '5px',
                          }}
                        >
                          <span>▶</span> Kirim Test Notifikasi
                        </button>
                      )}
                    </div>
                    {/* Toggle switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isOn}
                      onClick={() => handleNotifToggle(item.key, !isOn)}
                      style={{
                        flexShrink: 0,
                        width: '40px', height: '22px',
                        borderRadius: '999px',
                        border: 'none',
                        cursor: notifPermission === 'denied' ? 'not-allowed' : 'pointer',
                        background: isOn && notifPermission === 'granted' ? 'var(--blue)' : 'var(--border-strong)',
                        position: 'relative',
                        transition: 'background .2s',
                        marginTop: '2px',
                        opacity: notifPermission === 'denied' ? 0.4 : 1,
                      }}
                      disabled={notifPermission === 'denied'}
                    >
                      <span style={{
                        position: 'absolute', top: '3px',
                        left: isOn && notifPermission === 'granted' ? '20px' : '3px',
                        width: '16px', height: '16px',
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left .2s',
                        display: 'block',
                      }} />
                    </button>
                  </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            {savedFeedback ? (
              <span className="pill buy" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                Pengaturan Disimpan!
              </span>
            ) : (
              <button onClick={handleSave} className="stock-btn primary" style={{ cursor: 'pointer' }}>
                Simpan Perubahan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
