import { useState, useEffect, useRef } from 'react'

const styles = {
  container: { minHeight: '100vh' },
  navbar: {
    background: '#12121a',
    borderBottom: '1px solid #7f77dd',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: { color: '#7f77dd', fontWeight: '500', fontSize: '1.4rem' },
  badge: {
    background: '#7f77dd',
    color: 'white',
    fontSize: '11px',
    padding: '3px 8px',
    borderRadius: '20px',
    marginLeft: '8px'
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  email: { color: '#666', fontSize: '13px' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#e0e0e0',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  main: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' },
  card: {
    background: '#12121a',
    border: '1px solid #2a2a4a',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    background: '#0a0a0f',
    border: '1px solid #2a2a4a',
    borderRadius: '8px',
    color: '#e0e0e0',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '100px',
    outline: 'none',
    marginBottom: '1rem',
    fontFamily: 'inherit'
  },
  runBtn: {
    background: '#7f77dd',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    padding: '10px 24px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  runBtnDisabled: {
    background: '#3c3489',
    border: 'none',
    borderRadius: '8px',
    color: '#888',
    padding: '10px 24px',
    fontSize: '15px',
    cursor: 'not-allowed'
  },
  agentLog: {
    fontFamily: 'monospace',
    fontSize: '13px',
    lineHeight: '2',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  thinkingLine: { color: '#7f77dd' },
  errorLine: { color: '#e24b4a' },
  resultText: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.8',
    fontSize: '14px'
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid #fff',
    borderRadius: '50%',
    borderTopColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
    marginRight: '8px',
    verticalAlign: 'middle'
  }
}

function Agent({ user, onLogout }) {
  const [goal, setGoal] = useState('')
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState([])
  const [result, setResult] = useState('')
  const [showAgent, setShowAgent] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const logEndRef = useRef(null)

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (socketRef.current) socketRef.current.close()
    }
  }, [])

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/agent/')

    ws.onopen = () => {
      setConnected(true)
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleMessage(data)
    }

    ws.onclose = () => {
      setConnected(false)
      console.log('WebSocket disconnected')
      setTimeout(connectWebSocket, 3000)
    }

    ws.onerror = (error) => {
      console.log('WebSocket error:', error)
    }

    socketRef.current = ws
  }

  const handleMessage = (data) => {
    if (data.type === 'connected') {
      console.log('Agent ready')
    }
    else if (data.type === 'thinking') {
      setShowAgent(true)
      setLogs(prev => [...prev, { type: 'thinking', message: data.message }])
    }
    else if (data.type === 'result') {
      setResult(data.message)
      setShowResult(true)
      setRunning(false)
    }
    else if (data.type === 'error') {
      setLogs(prev => [...prev, { type: 'error', message: data.message }])
      setRunning(false)
    }
  }

  const runAgent = () => {
    if (!goal.trim()) {
      alert('Please enter a goal!')
      return
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      alert('Not connected. Please refresh the page.')
      return
    }

    setLogs([])
    setResult('')
    setShowAgent(false)
    setShowResult(false)
    setRunning(true)

    socketRef.current.send(JSON.stringify({ goal }))
  }

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <nav style={styles.navbar}>
        <div>
          <span style={styles.brand}>AgentOS</span>
          <span style={styles.badge}>AI + Agent</span>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.email}>{user.email}</span>
          <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div style={styles.main}>

        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Run Agent
            <span style={{ fontSize: '12px', color: connected ? '#1D9E75' : '#e24b4a' }}>
              {connected ? '● Connected' : '● Disconnected'}
            </span>
          </div>
          <textarea
            style={styles.textarea}
            placeholder="Enter a goal... e.g. Research the latest AI trends and summarize key findings"
            value={goal}
            onChange={e => setGoal(e.target.value)}
          />
          <button
            style={running ? styles.runBtnDisabled : styles.runBtn}
            onClick={runAgent}
            disabled={running}
          >
            {running ? (
              <>
                <span style={styles.spinner}></span>
                Agent running...
              </>
            ) : 'Run Agent'}
          </button>
        </div>

        {showAgent && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>Agent Activity</div>
            <div style={styles.agentLog}>
              {logs.map((log, i) => (
                <div
                  key={i}
                  style={log.type === 'error' ? styles.errorLine : styles.thinkingLine}
                >
                  {log.type === 'error' ? '✕ ' : '▶ '}{log.message}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        )}

        {showResult && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Final Result
              <span style={styles.badge}>Complete</span>
            </div>
            <div style={styles.resultText}>{result}</div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Agent 