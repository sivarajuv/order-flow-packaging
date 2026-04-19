import { useState, useRef, useEffect } from 'react'
import { sendChat } from '../api/client'

const QUICK_PROMPTS = [
  'What orders are in production today?',
  'Show all pending invoices and balances',
  'Which clients have the highest outstanding?',
  'What is the production stage of active job cards?',
  'Summarize overdue payments',
]

export default function AiChat({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm OrderFlow AI. I have live access to your orders, invoices, job cards, and client data. Ask me anything — try \"what's in production?\" or \"who owes us money?\"",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    const updated = [...messages, { role: 'user', content: msg }]
    setMessages(updated)
    setLoading(true)
    try {
      const history = updated.slice(1, -1).map(m => ({ role: m.role, content: m.content }))
      const res = await sendChat({ message: msg, history })
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I ran into an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <span className="ai-badge">AI</span>
          OrderFlow Assistant
        </div>
        <button className="ai-close" onClick={onClose}>×</button>
      </div>

      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role}`}>
            {m.role === 'assistant' && <div className="ai-avatar">OF</div>}
            <div className="ai-bubble">
              {m.content.split('\n').map((line, j) => (
                <span key={j}>
                  {line.split(/(\*\*.*?\*\*)/g).map((part, k) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={k}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                  {j < m.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg assistant">
            <div className="ai-avatar">OF</div>
            <div className="ai-bubble">
              <div className="ai-typing-dots"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="ai-quick-prompts">
          {QUICK_PROMPTS.map(q => (
            <button key={q} className="quick-btn" onClick={() => send(q)}>{q}</button>
          ))}
        </div>
      )}

      <div className="ai-input-row">
        <input
          ref={inputRef}
          className="ai-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about orders, production, invoices…"
          disabled={loading}
        />
        <button className="ai-send" onClick={() => send()} disabled={loading || !input.trim()}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14" height="14">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
