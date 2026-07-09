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
  const location = useLocation()
  const navigate = useNavigate()

  const VALID_TABS = ['general', 'display', 'notifications', 'account']
  const hashTab = location.hash.replace('#', '')
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
    { id: 'account', label: 'Akun & Keamanan' },
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

      <div className="settings-layout">
        {/* Left: Tab Nav */}
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`settings-tab-btn${activeTab === tab.id ? ' active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Content Panel */}
        <div className="card settings-panel">

          {/* ── General Tab ── */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <h2 className="settings-section-title">
                Konfigurasi Model AI
              </h2>

              <div className="settings-form-group">
                <label>AI Forecasting Engine</label>
                <Select value={aiModel} onChange={setAiModel} options={AI_OPTIONS} />
                <span className="hint">Model Generative AI menganalisis data numerik dan sentimen berita secara simultan.</span>
              </div>

              <div className="settings-form-group">
                <label>Confidence Interval (CI)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['90', '95', '99'].map(val => (
                    <button
                      key={val}
                      onClick={() => setConfidence(val)}
                      style={{
                        flex: 1, padding: '12px', fontSize: '13.5px', fontWeight: 600,
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        transition: 'all .15s ease',
                        background: confidence === val ? 'var(--blue-soft)' : 'var(--bg-2)',
                        border: confidence === val ? '1px solid var(--blue)' : '1px solid var(--border-strong)',
                        color: confidence === val ? 'var(--blue-bright)' : 'var(--text-dim)',
                      }}
                    >
                      {val}% CI
                    </button>
                  ))}
                </div>
                <span className="hint">Batas keyakinan model membatasi rentang visualisasi area prediksi (Confidence Cone) di chart.</span>
              </div>

              <div className="settings-form-group">
                <label>Indeks Saham Utama (Topbar)</label>
                <Select value={defaultIndex} onChange={setDefaultIndex} options={INDEX_OPTIONS} />
                <span className="hint">Indeks utama yang ditampilkan secara real-time di bar bagian atas layar Anda.</span>
              </div>
            </div>
          )}

          {/* ── Display Tab ── */}
          {activeTab === 'display' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <h2 className="settings-section-title">
                Tampilan &amp; Tema
              </h2>

              <div className="settings-form-group">
                <label>Tema Terminal</label>
                <div className="theme-grid">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`theme-card${theme === t.id ? ' active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.dot, flexShrink: 0, display: 'block' }} />
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: theme === t.id ? 'var(--blue-bright)' : 'var(--text)' }}>{t.label}</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-mute)', lineHeight: 1.4 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <h2 className="settings-section-title">
                Pengaturan Notifikasi
              </h2>

              {/* Permission status banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px', borderRadius: 'var(--radius-sm)',
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
                  <div style={{
                    fontSize: '12.5px', fontWeight: 700,
                    color: notifPermission === 'granted' ? 'var(--green)' : notifPermission === 'denied' ? 'var(--red)' : 'var(--amber)',
                  }}>
                    {notifPermission === 'granted' ? 'Notifikasi browser diizinkan' : notifPermission === 'denied' ? 'Notifikasi browser diblokir — ubah di pengaturan browser' : 'Izin notifikasi belum diberikan'}
                  </div>
                  {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                    <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginTop: '3px' }}>Aktifkan salah satu toggle di bawah untuk meminta izin browser</div>
                  )}
                </div>
              </div>

              <div className="notif-settings-list">
                {NOTIF_ITEMS.map((item, idx) => {
                  const isOn = notifEnabled[item.key]
                  return (
                    <div key={item.key} className="notif-settings-item">
                      <div className="notif-item-content">
                        <div className="notif-item-title-row">
                          <span className="notif-item-title">{item.title}</span>
                          {isOn && notifPermission === 'granted' && (
                            <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px',
                              background: 'rgba(46,194,122,0.12)', border: '1px solid rgba(46,194,122,0.3)', color: 'var(--green)'
                            }}>
                              AKTIF
                            </span>
                          )}
                        </div>
                        <div className="notif-item-desc">{item.desc}</div>
                        {isOn && notifPermission === 'granted' && (
                          <button
                            type="button"
                            onClick={() => sendTestNotif(item)}
                            style={{
                              marginTop: '12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                              padding: '5px 12px', borderRadius: '6px',
                              background: 'var(--blue-soft)', border: '1px solid rgba(79,125,255,0.25)',
                              color: 'var(--blue-bright)', display: 'inline-flex', alignItems: 'center', gap: '5px',
                              transition: 'all .15s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,125,255,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--blue-soft)'}
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

          {/* ── Account Tab ── */}
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h2 className="settings-section-title">
                  Ganti Password
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '16px', maxWidth: '400px' }}>
                  <div className="settings-form-group" style={{ marginBottom: 0 }}>
                    <label>Password Sekarang</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="settings-form-group" style={{ marginBottom: 0 }}>
                    <label>Password Baru</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="settings-form-group" style={{ marginBottom: 0 }}>
                    <label>Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    onClick={() => toast.success('Password diperbarui', 'Password akun Anda berhasil diganti.')}
                    className="stock-btn primary"
                    style={{ alignSelf: 'flex-start', marginTop: '6px', cursor: 'pointer', height: '42px', padding: '0 20px' }}
                  >
                    Perbarui Password
                  </button>
                </div>
              </div>

              <div>
                <h2 className="settings-section-title">
                  Sesi Akun
                </h2>
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.6 }}>
                    Keluar dari sesi terminal aktif Anda di perangkat ini. Anda perlu memasukkan kredensial Anda kembali untuk masuk.
                  </p>
                  <button
                    onClick={() => {
                      toast.warning('Anda telah keluar', 'Mengarahkan kembali ke sesi tamu...');
                      setTimeout(() => navigate('/'), 1500)
                    }}
                    className="stock-btn"
                    style={{
                      cursor: 'pointer', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-strong)', color: 'var(--text)',
                      height: '42px', padding: '0 20px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  >
                    Logout / Keluar
                  </button>
                </div>
              </div>

              <div className="settings-danger-zone">
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)' }} />
                  Zona Bahaya: Hapus Akun
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginTop: '10px', marginBottom: '20px', lineHeight: 1.6 }}>
                  Tindakan ini tidak dapat dibatalkan. Seluruh data transaksi, watchlist, preferensi analisis AI, dan konfigurasi terminal Anda akan dihapus secara permanen dari server kami.
                </p>
                <button
                  onClick={() => {
                    const confirmDel = window.confirm('Apakah Anda yakin ingin menghapus akun? Seluruh data akan hilang secara permanen.');
                    if (confirmDel) {
                      toast.error('Akun Dihapus', 'Seluruh data Anda telah dihapus secara permanen.');
                      localStorage.clear();
                      setTimeout(() => window.location.reload(), 1500);
                    }
                  }}
                  className="stock-btn sell"
                  style={{ cursor: 'pointer', height: '42px', padding: '0 20px' }}
                >
                  Hapus Akun Permanen
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          {activeTab !== 'account' && (
            <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              {savedFeedback ? (
                <span className="pill buy" style={{ padding: '10px 20px', fontSize: '13px' }}>
                  Pengaturan Disimpan!
                </span>
              ) : (
                <button onClick={handleSave} className="stock-btn primary" style={{ cursor: 'pointer', height: '42px', padding: '0 24px' }}>
                  Simpan Perubahan
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
