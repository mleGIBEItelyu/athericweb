import { useState, useRef, useEffect, useCallback } from 'react'
import { useRagChat } from '@/hooks/useRagChat'
import type { ChatMessage } from '@/services/rag'

const QUICK_PROMPTS = [
  { label: 'Analisis BBCA', text: 'Berikan analisis lengkap saham BBCA saat ini.' },
  { label: 'Bandingkan BBRI vs BBCA', text: 'Bandingkan saham BBRI dan BBCA dari sisi fundamental dan rekomendasi AI.' },
  { label: 'Top Pick hari ini', text: 'Saham apa yang paling direkomendasikan saat ini berdasarkan skor AI?' },
  { label: 'GOTO worth it?', text: 'Apakah saham GOTO layak dibeli atau dijual saat ini?' },
]

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
}

function MessageBubble({ msg, isLatest }: { msg: ChatMessage; isLatest: boolean }) {
  const isUser = msg.role === 'user'
  const html = isUser ? msg.text : renderMarkdown(msg.text)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
        animation: isLatest ? 'chatBubbleIn 0.25s ease' : 'none',
      }}
    >
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
          overflow: 'hidden', border: '1px solid var(--border-strong)',
          marginRight: '8px', marginTop: '2px', background: 'var(--panel-2)',
        }}>
          <img
            src="/assets/avatar.svg"
            alt="Atheric AI"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
      <div
        style={{
          maxWidth: '82%',
          padding: '10px 14px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
          background: isUser ? 'var(--blue)' : 'var(--panel)',
          border: isUser ? 'none' : '1px solid var(--border-strong)',
          fontSize: '13px',
          lineHeight: 1.6,
          color: isUser ? '#fff' : 'var(--text)',
          wordBreak: 'break-word',
        }}
        dangerouslySetInnerHTML={isUser ? undefined : { __html: `<p>${html}</p>` }}
      >
        {isUser ? msg.text : undefined}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        overflow: 'hidden', border: '1px solid var(--border-strong)',
        flexShrink: 0, background: 'var(--panel-2)',
      }}>
        <img src="/assets/avatar.svg" alt="Atheric AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{
        padding: '12px 16px', borderRadius: '4px 14px 14px 14px',
        background: 'var(--panel)', border: '1px solid var(--border-strong)',
        display: 'flex', gap: '5px', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--blue)', display: 'block',
            animation: `typingDot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

function NoKeyNotice() {
  return (
    <div style={{
      margin: '16px', padding: '16px', borderRadius: 'var(--radius-sm)',
      background: 'rgba(217,161,58,0.08)', border: '1px solid rgba(217,161,58,0.25)',
    }}>
      <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--amber)', marginBottom: '6px' }}>
        ⚠ Gemini API Key belum dikonfigurasi
      </div>
      <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
        Buat file <code style={{ background: 'var(--bg-2)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>.env.local</code> di root project dengan isi:
        <br />
        <code style={{
          display: 'block', marginTop: '8px', padding: '8px 10px',
          background: 'var(--bg-2)', borderRadius: '6px', fontFamily: 'monospace',
          fontSize: '11px', color: 'var(--blue-bright)', wordBreak: 'break-all',
        }}>
          VITE_GEMINI_API_KEY=your_key_here
        </code>
        <br />
        Dapatkan API key gratis di{' '}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--blue-bright)', textDecoration: 'underline' }}
        >
          aistudio.google.com
        </a>
        {' '}lalu restart dev server.
      </div>
    </div>
  )
}

interface Props {
  activeTicker?: string
  onClose: () => void
}

export function AiChatPanel({ activeTicker, onClose }: Props) {
  const { messages, isLoading, sendMessage, clearMessages, hasKey } = useRagChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !hasKey) return
    const text = input.trim()
    setInput('')
    await sendMessage(text, activeTicker)
  }, [input, isLoading, hasKey, sendMessage, activeTicker])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickPrompt = async (text: string) => {
    if (isLoading || !hasKey) return
    setInput('')
    await sendMessage(text, activeTicker)
  }

  return (
    <div className="ai-chat-panel" role="dialog" aria-label="Atheric AI Chat">
      <div className="ai-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            overflow: 'hidden', border: '1px solid var(--border-strong)',
            background: 'var(--panel-2)',
          }}>
            <img src="/assets/avatar.svg" alt="Atheric AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>Atheric AI</div>
            <div style={{ fontSize: '10.5px', color: hasKey ? 'var(--green)' : 'var(--amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: hasKey ? 'var(--green)' : 'var(--amber)', display: 'inline-block' }} />
              {hasKey ? (activeTicker ? `Konteks: ${activeTicker}` : 'Siap') : 'API Key tidak ada'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={clearMessages}
            title="Hapus riwayat chat"
            style={{
              width: '30px', height: '30px', borderRadius: '8px', border: 'none',
              background: 'transparent', color: 'var(--text-dim)',
              cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '13px',
              transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--panel-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            ↺
          </button>
          <button
            onClick={onClose}
            title="Tutup chat"
            style={{
              width: '30px', height: '30px', borderRadius: '8px', border: 'none',
              background: 'transparent', color: 'var(--text-dim)',
              cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '16px',
              transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--panel-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            ×
          </button>
        </div>
      </div>

      {!hasKey && <NoKeyNotice />}

      {hasKey && messages.length <= 1 && (
        <div style={{ padding: '10px 16px 0', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.map(qp => (
            <button
              key={qp.label}
              onClick={() => handleQuickPrompt(qp.text)}
              disabled={isLoading}
              style={{
                padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                background: 'var(--blue-soft)', border: '1px solid rgba(79,125,255,0.25)',
                color: 'var(--blue-bright)', cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1, transition: 'all .15s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = 'rgba(79,125,255,0.22)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--blue-soft)' }}
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}

      <div className="ai-chat-messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} isLatest={i === messages.length - 1} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasKey ? 'Tanya tentang saham... (Enter untuk kirim)' : 'Konfigurasi API key terlebih dahulu'}
          disabled={!hasKey || isLoading}
          rows={1}
          style={{
            flex: 1,
            background: 'var(--bg-2)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            color: 'var(--text)',
            fontSize: '13px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            maxHeight: '80px',
            overflowY: 'auto',
            transition: 'border-color .15s',
            opacity: !hasKey ? 0.5 : 1,
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--blue)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-strong)' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || !hasKey}
          style={{
            width: '38px', height: '38px', borderRadius: 'var(--radius-sm)',
            border: 'none', flexShrink: 0,
            background: !input.trim() || isLoading || !hasKey ? 'var(--border-strong)' : 'var(--blue)',
            color: !input.trim() || isLoading || !hasKey ? 'var(--text-mute)' : '#fff',
            cursor: !input.trim() || isLoading || !hasKey ? 'not-allowed' : 'pointer',
            display: 'grid', placeItems: 'center', fontSize: '16px',
            transition: 'all .15s',
          }}
        >
          {isLoading ? (
            <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'block', animation: 'spin 0.8s linear infinite' }} />
          ) : '➤'}
        </button>
      </div>

      <div style={{ padding: '6px 16px 10px', fontSize: '10px', color: 'var(--text-mute)', textAlign: 'center' }}>
        Powered by Google Gemini · Bukan saran investasi
      </div>
    </div>
  )
}
