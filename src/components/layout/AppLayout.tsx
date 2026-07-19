import { useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { AiChatPanel } from '@/components/dashboard/AiChatPanel'
import { MessageSquareIcon } from '@/components/common/icons'

interface Props { onSearch?: (q: string) => void }

function AppLayoutInner({ onSearch }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const { ticker } = useParams<{ ticker?: string }>()

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Backdrop overlay for chat panel on mobile */}
      {chatOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49 }}
          className="lg:hidden"
          onClick={() => setChatOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main">
        <Topbar
          onSearch={onSearch}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <Outlet />
      </div>

      {/* Floating AI Chat Button */}
      {!chatOpen && (
        <button
          id="ai-chat-fab"
          onClick={() => setChatOpen(true)}
          title="Buka Atheric AI Chat"
          aria-label="Buka Atheric AI Chat"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            border: '1.5px solid var(--blue)',
            background: 'var(--blue-soft)',
            color: 'var(--blue-bright)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            zIndex: 50,
            boxShadow: '0 4px 20px color-mix(in srgb, var(--blue) 35%, transparent)',
            transition: 'transform .2s ease, background .2s ease, box-shadow .2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.background = 'var(--blue)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = 'var(--blue-soft)'
            e.currentTarget.style.color = 'var(--blue-bright)'
          }}
        >
          <span style={{ width: '22px', height: '22px', display: 'block' }}>
            <MessageSquareIcon />
          </span>
        </button>
      )}

      {/* AI Chat Panel */}
      {chatOpen && (
        <AiChatPanel
          activeTicker={ticker?.toUpperCase()}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  )
}

export function AppLayout({ onSearch }: Props) {
  return <AppLayoutInner onSearch={onSearch} />
}
