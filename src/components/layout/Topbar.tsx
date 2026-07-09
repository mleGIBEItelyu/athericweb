import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, BellIcon } from '@/components/common/icons'
import { useIndices } from '@/hooks/useMarkets'
import { RANKING_ROWS } from '@/data/dummy'

interface Props { 
  onSearch?: (q: string) => void;
  onMenuClick: () => void;
}

export function Topbar({ onSearch, onMenuClick }: Props) {
  const navigate = useNavigate()
  const { data: indices = [] } = useIndices()
  const [notifOpen, setNotifOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const rawVal = e.target.value
    setQuery(rawVal)
    const sanitizedVal = rawVal.replace(/[<>'"&]/g, '').trim().slice(0, 50)
    onSearch?.(sanitizedVal)
    setShowDropdown(true)
  }

  const searchResults = query.trim() ? RANKING_ROWS.filter(r => {
    const cleanQuery = query.replace(/[<>'"&]/g, '').trim().toLowerCase()
    return r.ticker.toLowerCase().includes(cleanQuery) ||
      r.company.toLowerCase().includes(cleanQuery)
  }) : []

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  // Close notif dropdown when clicking outside
  const notifRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  function selectStock(ticker: string) {
    navigate(`/stock/${ticker}`)
    setQuery('')
    setShowDropdown(false)
  }

  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="topbar">
      {/* Hamburger button — shown via CSS class below 1024px */}
      <button
        onClick={onMenuClick}
        className="menu-btn"
        aria-label="Open menu"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <div className="search" style={{ position: 'relative' }} ref={searchRef}>
        <SearchIcon />
        <input
          placeholder="Cari saham (BBCA, GOTO)..."
          value={query}
          onChange={handleSearch}
          onFocus={() => setShowDropdown(true)}
        />
        {showDropdown && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: 'var(--panel)', border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            zIndex: 200, maxHeight: '220px', overflowY: 'auto',
          }}>
            {searchResults.map(res => (
              <div
                key={res.ticker}
                style={{
                  padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--panel-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                onClick={() => selectStock(res.ticker)}
              >
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--text)' }}>{res.ticker}</span>
                  <span style={{ marginLeft: '8px', fontSize: '11.5px', color: 'var(--text-dim)' }}>{res.company}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: res.dir === 'up' ? 'var(--green)' : 'var(--red)' }}>
                  {res.ret}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Indices — hidden below 1280px via CSS (.indices) */}
      <div className="indices">
        {indices.map(idx => (
          <span key={idx.label} className={`index ${idx.dir}`}>
            <span className="index-label">{idx.label}</span>
            <span className="index-value live-tick">{idx.value}</span>
          </span>
        ))}
      </div>

      <div className="topbar-actions">
        <div className="notif-wrap" ref={notifRef}>
          <button className="icon-btn" onClick={() => setNotifOpen(o => !o)} aria-label="Notifications">
            <BellIcon />
          </button>
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-title">Notifications</div>
              <div className="notif-empty">No new notifications</div>
            </div>
          )}
        </div>
        <div 
          className="avatar" 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setProfileOpen(true)}
        >
          <img src="/assets/avatar.svg" alt="User avatar" />
        </div>
      </div>

      {profileOpen && (
        <div 
          onClick={() => setProfileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="card"
            style={{
              padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              width: '320px', gap: '16px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)',
              background: 'var(--panel)',
            }}
          >
            <button 
              onClick={() => setProfileOpen(false)}
              style={{
                position: 'absolute', top: '12px', right: '16px',
                fontSize: '20px', color: 'var(--text-mute)', cursor: 'pointer',
                background: 'none', border: 'none', padding: '4px',
              }}
            >
              ×
            </button>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              overflow: 'hidden', border: '3px solid var(--blue)',
              boxShadow: '0 0 20px rgba(79,125,255,0.4)',
            }}>
              <img src="/assets/avatar.svg" alt="User avatar large" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>Deva</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', marginTop: '4px' }}>deva@atheric.ai</div>
              <div className="pill buy" style={{ display: 'inline-block', fontSize: '10px', padding: '2px 8px', marginTop: '12px' }}>
                Premium AI Member
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
