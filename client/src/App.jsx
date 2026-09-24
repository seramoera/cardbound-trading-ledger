import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import userIcon from './assets/user_icon.svg'
import tradeIcon from './assets/trade_icon.svg'
import confirmIcon from './assets/confirm_icon.svg'
import smallStar from './assets/small_star.svg'
import goldDivider from './assets/GoldDivider.svg'
import dividerAsset from './assets/divider.svg'

const EMPTY_FORM = { displayName: '', username: '', password: '', confirmPassword: '' }

const partnerCards = [
  { id: 1, name: 'Elara Nightwhisper', initials: 'EN', color: 'blue', note: 'Met at FNM. Has lots of blue staples.', pending: 3, want: 2, have: 1, traded: 1, total: 40 },
  { id: 2, name: 'Dorian Ashvale', initials: 'DA', color: 'purple', note: 'Commander player, mostly green and black.', pending: 2, want: 1, have: 1, traded: 1, total: 35 },
  { id: 3, name: 'Mira Goldenleaf', initials: 'MG', color: 'green', note: 'Competitive modern player.', pending: 2, want: 1, have: 0, traded: 1, total: 5 },
]

const historyRows = [
  { partner: 'Elara Nightwhisper', card: 'Snapcaster Mage', status: 'Received', date: 'Aug 15', color: 'blue' },
  { partner: 'Elara Nightwhisper', card: 'Swords to Plowshares', status: 'Gave away', date: 'Aug 15', color: 'white' },
  { partner: 'Dorian Ashvale', card: 'Doubling Season', status: 'Received', date: 'Jul 28', color: 'green' },
]

export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [session, setSession] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPartner, setSelectedPartner] = useState(partnerCards[0])
  const [partnerForm, setPartnerForm] = useState({ name: '', notes: '' })
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    async function loadSession() {
      const { data: { session: activeSession } } = await supabase.auth.getSession()
      setSession(activeSession)
      setLoading(false)
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let active = true

    async function syncUserProfile(activeSession) {
      if (!activeSession?.user) {
        if (active) setCurrentUser(null)
        return
      }

      const authUser = activeSession.user
      const metadata = authUser.user_metadata || {}
      const fallbackUsername = metadata.username || metadata.display_name || authUser.email?.split('@')[0] || 'Cardbound User'
      const baseProfile = {
        username: fallbackUsername,
        display_name: metadata.display_name || fallbackUsername,
        email: authUser.email,
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('id', authUser.id)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.warn('Could not load Cardbound profile:', error.message)
        }

        if (active) {
          setCurrentUser({
            ...baseProfile,
            ...(data || {}),
            username: data?.username || baseProfile.username,
            display_name: data?.display_name || baseProfile.display_name,
          })
        }
      } catch (caught) {
        console.warn('Profile sync failed:', caught)
        if (active) setCurrentUser(baseProfile)
      }
    }

    syncUserProfile(session)
    return () => {
      active = false
    }
  }, [session])

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function normalizeUsername(username) {
    return username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9._-]/g, '')
      .replace(/^\.+|\.+$/g, '')
      .slice(0, 30)
  }

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async function upsertProfileForUser(user, overrides = {}) {
    const metadata = user?.user_metadata || {}
    const username = normalizeUsername(overrides.username || metadata.username || user?.email?.split('@')[0] || 'cardbound-user')
    const displayName = (overrides.display_name || metadata.display_name || 'Cardbound User').trim() || 'Cardbound User'

    if (!username) {
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username,
        display_name: displayName,
      }, { onConflict: 'id' })
      .select()
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
  }

  function buildInternalAuthEmail(username) {
    const cleanUsername = normalizeUsername(username) || 'cardbound-user'

    let hash = 0
    for (let index = 0; index < cleanUsername.length; index += 1) {
      hash = (hash * 31 + cleanUsername.charCodeAt(index)) >>> 0
    }

    return `${cleanUsername}-${hash.toString(16)}@cardbound.app`
  }

  async function isUsernameAvailable(username) {
    const normalizedUsername = normalizeUsername(username)

    if (!normalizedUsername) {
      return false
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', normalizedUsername)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return !data
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    const password = form.password

    if (screen === 'signup') {
      const displayName = form.displayName.trim()
      const username = form.username.trim()
      const confirmed = form.confirmPassword

      if (!displayName || !username || !password || !confirmed) {
        setError('Please complete every field.')
        setBusy(false)
        return
      }

      if (password !== confirmed) {
        setError('Passwords do not match.')
        setBusy(false)
        return
      }

      const normalizedUsername = normalizeUsername(username)
      if (!normalizedUsername) {
        setError('Please enter a valid username.')
        setBusy(false)
        return
      }

      try {
        const usernameAvailable = await isUsernameAvailable(normalizedUsername)
        if (!usernameAvailable) {
          setError('That username is already taken. Please choose another one.')
          setBusy(false)
          return
        }

                const authEmail = buildInternalAuthEmail(normalizedUsername)

        const { data, error: authError } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              username: normalizedUsername,
              display_name: displayName,
            },
          },
        })

        if (authError) throw authError

        // Email confirmation is off, so data.session is already populated —
        // log the user straight in instead of sending them to the login screen.
        setCurrentUser({
          id: data.user.id,
          username: normalizedUsername,
          display_name: displayName,
        })
        setSession(data.session)
        setMessage('Account created successfully.')
        setForm(EMPTY_FORM)
        setScreen('dashboard')
      } catch (caught) {
        setError(caught.message || 'Account creation failed.')
      } finally {
        setBusy(false)
      }

      return
    }

    const username = form.username.trim()

    if (!username || !password) {
      setError('Username and password are required.')
      setBusy(false)
      return
    }

    try {
      const authEmail = buildInternalAuthEmail(username)
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: authEmail, password })
      if (authError) throw authError

      const profile = await fetchProfile(data.user.id) || await upsertProfileForUser(data.user, { username })
      setCurrentUser({
        id: data.user.id,
        username: profile?.username || username,
        display_name: profile?.display_name || 'Cardbound User',
      })

      setMessage('Signed in successfully.')
      setSession(data.session)
      setScreen('dashboard')
      setForm(EMPTY_FORM)
    } catch (caught) {
      setError(caught.message || 'Log in failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
      return
    }

    setSession(null)
    setScreen('welcome')
    setForm(EMPTY_FORM)
    setPartnerForm({ name: '', notes: '' })
  }

  function handleSavePartner(event) {
    event.preventDefault()

    if (!partnerForm.name.trim()) {
      setError('A partner name is required.')
      return
    }

    const newPartner = {
      id: Date.now(),
      name: partnerForm.name.trim(),
      initials: partnerForm.name.trim().slice(0, 2).toUpperCase(),
      color: 'blue',
      note: partnerForm.notes.trim() || 'New trading partner.',
      pending: 1,
      want: 0,
      have: 0,
      traded: 0,
      total: 10,
    }

    partnerCards.unshift(newPartner)
    setSelectedPartner(newPartner)
    setPartnerForm({ name: '', notes: '' })
    setScreen('dashboard')
    setError('')
  }

  if (loading) {
    return (
      <div className="app-shell scene-shell">
        <div className="auth-panel loading-panel">
          <p>Loading Cardbound…</p>
        </div>
      </div>
    )
  }

  if (!session && screen === 'welcome') {
    return (
      <div className="app-shell scene-shell">
        <main className="welcome-panel">
          <h1>CARDBOUND</h1>
          <div className="welcome-divider" aria-hidden="true">
            <img src={dividerAsset} alt="" className="brand-divider" />
          </div>
          <p className="welcome-copy">Track what you owe and what you&apos;re owed — card by card, trade by trade.</p>

          <div className="feature-row">
            <div className="feature-item">
              <div className="feature-icon">
                <img src={userIcon} alt="Add your trading partners" />
              </div>
              <span>Add your trading partners</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src={tradeIcon} alt="Log cards you want and cards they want" />
              </div>
              <span>Log cards you want and cards they want</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src={confirmIcon} alt="Check them off when trades happen" />
              </div>
              <span>Check them off when trades happen</span>
            </div>
          </div>

          <div className="cta-row">
            <button type="button" className="welcome-cta-button" onClick={() => setScreen('signup')}>Create Account</button>
            <button type="button" className="onboarding-login-button" onClick={() => setScreen('login')}>Log In</button>
          </div>
        </main>
      </div>
    )
  }

  if (!session && (screen === 'login' || screen === 'signup')) {
    const isLogin = screen === 'login'

    return (
      <div className="app-shell scene-shell">
        <div className="auth-brand-wrap">
          <div className="auth-brand" aria-label="Cardbound">
            <span className="auth-brand-letter">C</span>
            <span className="auth-brand-rest">ARDBOUND</span>
          </div>
          <div className="auth-brand-divider" aria-hidden="true">
            <img src={dividerAsset} alt="" className="brand-divider" />
          </div>
        </div>

        <main className="auth-panel form-panel">
          <div className="auth-header">
            <h2>
              {isLogin ? (
                <>
                  <span className="welcome-letter">W</span>ELCOME <span className="back-letter">B</span>ACK
                </>
              ) : (
                <>
                  CREATE <span className="account-letter">A</span>CCOUNT
                </>
              )}
            </h2>
          </div>
          <div className="gold-divider-wrap" aria-hidden="true">
            <img src={goldDivider} alt="" className="gold-divider" />
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {!isLogin && (
              <>
                <label htmlFor="displayName">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={form.displayName}
                  onChange={(event) => updateForm('displayName', event.target.value)}
                  placeholder="Elara Nightwhisper"
                />
              </>
            )}

            {!isLogin && (
              <>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(event) => updateForm('username', event.target.value)}
                  placeholder="elara_nw"
                />
              </>
            )}

            {isLogin && (
              <>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(event) => updateForm('username', event.target.value)}
                  placeholder="Username"
                />
              </>
            )}

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => updateForm('password', event.target.value)}
              placeholder="••••••••"
            />

            {!isLogin && (
              <>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => updateForm('confirmPassword', event.target.value)}
                  placeholder="••••••••"
                />
              </>
            )}

            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            <div className="auth-actions">
              <button type="submit" className="primary-button" disabled={busy}>
                {busy ? 'Please wait…' : isLogin ? 'Log In' : 'Create Account'}
              </button>
              <button type="button" className="ghost-button" onClick={() => setScreen('welcome')}>Back</button>
            </div>
          </form>

          <p className="switch-link">
            {isLogin ? 'No account?' : 'Already have an account?'}{' '}
            <button type="button" className="text-link" onClick={() => setScreen(isLogin ? 'signup' : 'login')}>
              {isLogin ? 'Create one' : 'Log in'}
            </button>
          </p>
        </main>
      </div>
    )
  }

  if (session && screen === 'dashboard') {
    return (
      <div className="app-shell scene-shell dashboard-shell">
        <header className="top-bar">
          <div className="brand">CARDBOUND</div>
          <div className="top-actions">
            <button type="button" className="mini-button" onClick={() => setScreen('history')}>History</button>
            <button type="button" className="mini-button" onClick={() => setScreen('new-partner')}>+ Add Partner</button>
            <button type="button" className="mini-button ghost" onClick={handleSignOut}>Sign Out</button>
          </div>
        </header>

        <main className="dashboard-page">
          <div className="dashboard-header">
            <div className="status-badge">Home</div>
            <div className="status-badge">{currentUser?.display_name || currentUser?.username || 'Trader'}</div>
            <div className="status-badge">Partners: {partnerCards.length}</div>
            <div className="status-badge">Pending: 7</div>
            <div className="status-badge">Traded: 3</div>
          </div>

          <h2 className="section-title">Trading Partners</h2>

          <div className="search-wrap">
            <input type="text" placeholder="Search partners by name or notes..." />
          </div>

          <section className="partner-grid">
            {partnerCards.map((partner) => (
              <button
                type="button"
                key={partner.id}
                className={`partner-card ${selectedPartner?.id === partner.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedPartner(partner)
                  setScreen('trade')
                }}
              >
                <div className="partner-row">
                  <div className={`mini-avatar ${partner.color}`}>{partner.initials}</div>
                  <div className="partner-name-wrap">
                    <div className="partner-name">{partner.name}</div>
                    <div className="partner-note">{partner.note}</div>
                  </div>
                </div>

                <div className="stats-row">
                  <span>{partner.pending} Pending</span>
                  <span>{partner.want} I want</span>
                  <span>{partner.have} They want</span>
                  <span>{partner.traded} Traded</span>
                </div>

                <div className="progress-wrap">
                  <div className="progress-bar" style={{ width: `${partner.total}%` }} />
                </div>
                <div className="last-trade">Last traded {partner.lastTrade || 'Aug 15, 2026'}</div>
              </button>
            ))}
          </section>
        </main>
      </div>
    )
  }

  if (screen === 'trade' && selectedPartner) {
    return (
      <div className="app-shell scene-shell dashboard-shell">
        <header className="top-bar">
          <div className="brand">CARDBOUND</div>
          <button type="button" className="mini-button ghost" onClick={() => setScreen('dashboard')}>Back</button>
        </header>

        <main className="trade-page">
          <div className="trade-header">
            <div className="trade-name-block">
              <div className={`mini-avatar large ${selectedPartner.color}`}>{selectedPartner.initials}</div>
              <div>
                <div className="trade-title">{selectedPartner.name}</div>
                <div className="trade-meta">{selectedPartner.pending} pending · {selectedPartner.traded} traded · {selectedPartner.want} cards</div>
              </div>
            </div>
            <div className="progress-wrap progress-tight">
              <div className="progress-bar" style={{ width: `${selectedPartner.total}%` }} />
            </div>
          </div>

          <div className="trade-columns">
            <section className="trade-panel">
              <div className="panel-heading">I WANT · FROM {selectedPartner.name.toUpperCase()}</div>
              <div className="trade-list">
                <div className="trade-item active"><span>Force of Will</span><span className="badge blue">Blue</span><button type="button">✓</button></div>
                <div className="trade-item"><span> Tarmogoyf </span><span className="badge green">Green</span><button type="button">✓</button></div>
                <div className="trade-item"><span> Snapcaster Mage </span><span className="badge blue">Blue</span><button type="button">✓</button></div>
              </div>
            </section>

            <section className="trade-panel">
              <div className="panel-heading">THEY WANT · FROM ME</div>
              <div className="trade-list">
                <div className="trade-item active"><span>Lightning Bolt</span><span className="badge red">Red</span><button type="button">✓</button></div>
                <div className="trade-item"><span>Swords to Plowshares</span><span className="badge white">White</span><button type="button">✓</button></div>
              </div>
            </section>
          </div>

          <div className="mana-legend">
            <span>White</span>
            <span>Blue</span>
            <span>Black</span>
            <span>Red</span>
            <span>Green</span>
            <span>Colorless</span>
          </div>
        </main>
      </div>
    )
  }

  if (screen === 'history') {
    return (
      <div className="app-shell scene-shell dashboard-shell">
        <header className="top-bar">
          <div className="brand">CARDBOUND</div>
          <button type="button" className="mini-button ghost" onClick={() => setScreen('dashboard')}>Back</button>
        </header>

        <main className="history-page">
          <h2>TRADE HISTORY</h2>
          <div className="summary-row">
            <div className="summary-box"><span>3</span><small>Total Traded</small></div>
            <div className="summary-box"><span>2</span><small>Received</small></div>
            <div className="summary-box"><span>1</span><small>Gave Away</small></div>
            <div className="summary-box"><span>Elara</span><small>Most Active</small></div>
          </div>

          <div className="history-search">
            <input type="text" placeholder="Filter by card or partner..." />
          </div>

          <div className="history-list">
            {historyRows.map((row, index) => (
              <div key={`${row.partner}-${index}`} className="history-row">
                <div className="history-partner">
                  <div className="mini-avatar small blue">EN</div>
                  <span>{row.partner}</span>
                </div>
                <div className="history-card">
                  <div className={`card-swatch ${row.color}`} />
                  <span>{row.card}</span>
                </div>
                <div className={`history-status ${row.status.toLowerCase().replace(/\s+/g, '-')}`}>{row.status}</div>
                <div className="history-date">{row.date}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (screen === 'new-partner') {
    return (
      <div className="app-shell scene-shell">
        <header className="top-brand">CARDBOUND</header>
        <div className="overlay-backdrop" onClick={() => setScreen('dashboard')} />

        <div className="modal-card" role="dialog" aria-modal="true">
          <h3>NEW TRADING PARTNER</h3>
          <div className="panel-divider" />

          <form onSubmit={handleSavePartner} className="partner-form">
            <label htmlFor="partnerName">Name</label>
            <input
              id="partnerName"
              type="text"
              value={partnerForm.name}
              onChange={(event) => setPartnerForm({ ...partnerForm, name: event.target.value })}
              placeholder="Partner&apos;s name..."
            />

            <label htmlFor="partnerNotes">Notes</label>
            <textarea
              id="partnerNotes"
              value={partnerForm.notes}
              onChange={(event) => setPartnerForm({ ...partnerForm, notes: event.target.value })}
              placeholder="FNM buddy, has lots of blue staples..."
            />

            <div className="modal-actions">
              <button type="submit" className="primary-button">Save Partner</button>
              <button type="button" className="ghost-button" onClick={() => setScreen('dashboard')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return null
}
