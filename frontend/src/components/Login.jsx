import { useState } from 'react'
import axios from 'axios'

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '1rem'
  },
  card: {
    background: '#12121a',
    border: '1px solid #2a2a4a',
    borderRadius: '12px',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#e0e0e0'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#0a0a0f',
    border: '1px solid #2a2a4a',
    borderRadius: '8px',
    color: '#e0e0e0',
    fontSize: '14px',
    marginBottom: '1rem',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '10px',
    background: '#7f77dd',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  error: {
    background: '#2a1a1a',
    border: '1px solid #e24b4a',
    borderRadius: '8px',
    padding: '10px',
    color: '#e24b4a',
    fontSize: '13px',
    marginBottom: '1rem'
  },
  link: {
    color: '#7f77dd',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#666'
  }
}

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        if (password !== password2) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        const response = await axios.post('http://localhost:8000/api/signup/', {
          email,
          username,
          password,
          password2
        })
        onLogin(response.data.user)

      } else {
        const response = await axios.post('http://localhost:8000/api/login/', {
          email,
          password
        })
        onLogin(response.data.user)
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isSignup ? 'Create Account' : 'Login'}</h2>

        {error && <div style={styles.error}>{error}</div>}

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        {isSignup && (
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        )}

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {isSignup && (
          <input
            style={styles.input}
            type="password"
            placeholder="Confirm Password"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
          />
        )}

        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Login')}
        </button>

        <div style={styles.footer}>
          {isSignup ? (
            <>Already have an account? <span style={styles.link} onClick={() => setIsSignup(false)}>Login</span></>
          ) : (
            <>No account? <span style={styles.link} onClick={() => setIsSignup(true)}>Sign up</span></>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login