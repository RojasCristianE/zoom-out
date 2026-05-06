import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@web/api/client'
import { useAuthStore } from '@web/store/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: apiError } = await api.auth.login.post({
        email,
        password,
      })

      if (apiError) throw new Error(apiError.value?.message || 'Error al iniciar sesión')
      
      if (data?.user && data?.accessToken) {
        setAuth(data.user, data.accessToken)
        navigate('/')
      } else {
        throw new Error('Respuesta del servidor incompleta')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-glass-card">
        <div className="login-header">
          <h1>Zoom-Out</h1>
          <p>Bienvenido de nuevo</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p className="footer-text">
            Sistema de videollamadas privado y seguro.
          </p>
        </div>
      </div>

      <style>{`
        .login-container {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top left, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: white;
        }

        .login-glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3rem;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-header p {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .form-group input {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.8rem 1rem;
          border-radius: 12px;
          color: white;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4facfe;
          background: rgba(0, 0, 0, 0.3);
        }

        .primary-button {
          background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
          margin-top: 1rem;
        }

        .primary-button:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          padding: 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          text-align: center;
        }

        .login-footer {
          margin-top: 2rem;
          text-align: center;
        }

        .text-button {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.85rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .text-button:hover {
          color: #4facfe;
        }
      `}</style>
    </div>
  )
}
