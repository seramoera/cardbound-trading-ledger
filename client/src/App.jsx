import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './lib/supabase.js'
import userIcon from './assets/user_icon.svg'
import tradeIcon from './assets/trade_icon.svg'
import confirmIcon from './assets/confirm_icon.svg'
import smallStar from './assets/small_star.svg'
import goldDivider from './assets/GoldDivider.svg'
import dividerAsset from './assets/divider.svg'
import cardboundLogo from './assets/cardbound-logo.svg'
import cardboundTop from './assets/cardbound_top.svg'
import cardboundFooter from './assets/cardbound_footer.svg'
import circleTrade from './assets/circle_trade.svg'
import historyIcon from './assets/history.svg'
import addIcon from './assets/add.svg'
import signOutIcon from './assets/sign_out.svg'

const EMPTY_FORM = { displayName: '', username: '', password: '', confirmPassword: '' }

const partnerColorOptions = ['gold', 'blue', 'purple', 'rose', 'sage', 'amber', 'teal']

function getRandomPartnerColor() {
  const index = Math.floor(Math.random() * partnerColorOptions.length)
  return partnerColorOptions[index]
}

function getPartnerGradient(color) {
  const gradients = {
    gold: 'linear-gradient(90deg, #d7ad61, #f0d898)',
    blue: 'linear-gradient(90deg, #8ab6ff, #d8ecff)',
    purple: 'linear-gradient(90deg, #b58af7, #efd9ff)',
    rose: 'linear-gradient(90deg, #d0768a, #f1d0d5)',
    sage: 'linear-gradient(90deg, #a7d5a6, #d6efd3)',
    amber: 'linear-gradient(90deg, #d09941, #f1d07a)',
    teal: 'linear-gradient(90deg, #7cc9c1, #d4f5f0)',
  }

  return gradients[color] || gradients.gold
}

function getPartnerBorderColor(color) {
  const colors = {
    gold: 'rgba(216, 176, 106, 0.7)',
    blue: 'rgba(75, 140, 255, 0.55)',
    purple: 'rgba(163, 100, 255, 0.55)',
    rose: 'rgba(208, 118, 138, 0.5)',
    sage: 'rgba(132, 190, 130, 0.45)',
    amber: 'rgba(208, 153, 65, 0.5)',
    teal: 'rgba(100, 190, 180, 0.48)',
  }

  return colors[color] || colors.gold
}

function getCardManaColorClass(colors = []) {
  if (colors.length > 1) return 'multicolor'

  const manaColorClasses = { W: 'white', U: 'blue', B: 'black', R: 'red', G: 'green' }
  return manaColorClasses[colors[0]] || 'colorless'
}

function getTradeCardCounts(cards = []) {
  const counts = cards.reduce((current, card) => {
    const quantity = Number(card.quantity) || 0
    return {
      total: current.total + quantity,
      pending: current.pending + (card.isTraded ? 0 : quantity),
      traded: current.traded + (card.isTraded ? quantity : 0),
    }
  }, { total: 0, pending: 0, traded: 0 })

  return {
    ...counts,
    progress: counts.total ? Math.round((counts.traded / counts.total) * 100) : 0,
  }
}

function getPartnerTradeCounts(cardLists = {}) {
  const fromPartner = getTradeCardCounts(cardLists.fromPartner || [])
  const fromUser = getTradeCardCounts(cardLists.fromUser || [])
  const total = fromPartner.total + fromUser.total
  const traded = fromPartner.traded + fromUser.traded

  return {
    fromPartner,
    fromUser,
    pending: fromPartner.pending + fromUser.pending,
    traded,
    total,
    want: fromPartner.total,
    have: fromUser.total,
    progress: total ? Math.round((traded / total) * 100) : 0,
  }
}

function tradeStateFromRows(rows = []) {
  return rows.reduce((current, row) => {
    const partnerLists = current[row.partner_id] || { fromPartner: [], fromUser: [] }
    const listName = row.list_name === 'fromUser' ? 'fromUser' : 'fromPartner'
    const card = {
      ...(row.card_data || {}),
      id: row.card_id,
      quantity: row.quantity,
      isTraded: row.is_traded,
      tradedAt: row.traded_at,
    }

    return {
      ...current,
      [row.partner_id]: {
        ...partnerLists,
        [listName]: [...partnerLists[listName], card],
      },
    }
  }, {})
}

function toTradeHistoryRow(ownerId, partnerId, listName, card) {
  return {
    owner_id: ownerId,
    partner_id: partnerId,
    list_name: listName,
    card_id: String(card.id),
    card_data: card,
    quantity: card.quantity,
    is_traded: Boolean(card.isTraded),
    traded_at: card.tradedAt || null,
  }
}

function formatScryfallPrice(price) {
  if (price === null || price === undefined || price === '') return 'Price unavailable'

  const amount = Number(price)
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    : 'Price unavailable'
}

function CardImageButton({ name, thumbnail, fullImage, compact = false }) {
  const [hovered, setHovered] = useState(false)
  const [hoverPosition, setHoverPosition] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (!previewOpen) return undefined

    function closeOnEscape(event) {
      if (event.key === 'Escape') setPreviewOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [previewOpen])

  if (!thumbnail) return null

  const previewImage = fullImage || thumbnail

  function positionHoverPreview(clientX, clientY) {
    const margin = 12
    const gap = 16
    const previewWidth = Math.min(230, window.innerWidth * 0.56) + 16
    const previewHeight = Math.min(window.innerHeight * 0.68, previewWidth * 1.45) + 16
    const left = clientX + gap + previewWidth <= window.innerWidth - margin
      ? clientX + gap
      : Math.max(margin, clientX - previewWidth - gap)
    const top = clientY + gap + previewHeight <= window.innerHeight - margin
      ? clientY + gap
      : Math.max(margin, Math.min(clientY - previewHeight / 2, window.innerHeight - previewHeight - margin))

    setHoverPosition({ left, top })
  }

  function handleImageFocus(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    setHovered(true)
    positionHoverPreview(bounds.right, bounds.top + bounds.height / 2)
  }

  return (
    <>
      <button
        type="button"
        className={`card-image-trigger${compact ? ' compact' : ''}`}
        aria-label={`Preview ${name}`}
        aria-haspopup="dialog"
        aria-expanded={previewOpen}
        onMouseEnter={(event) => {
          setHovered(true)
          positionHoverPreview(event.clientX, event.clientY)
        }}
        onMouseMove={(event) => positionHoverPreview(event.clientX, event.clientY)}
        onMouseLeave={() => setHovered(false)}
        onFocus={handleImageFocus}
        onBlur={() => setHovered(false)}
        onClick={() => setPreviewOpen(true)}
      >
        <img
          className={compact ? 'card-search-thumbnail' : 'trade-card-image'}
          src={thumbnail}
          alt={`${name} Magic: The Gathering card`}
          loading="lazy"
        />
      </button>
      {hovered && !previewOpen && createPortal(
        <div className="card-hover-preview" style={hoverPosition || undefined} aria-hidden="true">
          <img src={previewImage} alt="" />
        </div>,
        document.body,
      )}
      {previewOpen && createPortal(
        <div className="card-preview-backdrop" onClick={() => setPreviewOpen(false)}>
          <div
            className="card-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${name} card preview`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="card-preview-close"
              aria-label="Close card preview"
              onClick={() => setPreviewOpen(false)}
            >
              ×
            </button>
            <img className="card-preview-full-image" src={previewImage} alt={`${name} Magic: The Gathering card`} />
            <div className="card-preview-caption">{name}</div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

function ScryfallCardSearch({ label, onAddCard }) {
  const [query, setQuery] = useState('')
  const [cards, setCards] = useState([])
  const [visibleCardCount, setVisibleCardCount] = useState(6)
  const [hasMorePrints, setHasMorePrints] = useState(false)
  const [nextPrintsPage, setNextPrintsPage] = useState(null)
  const [loadingMorePrints, setLoadingMorePrints] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    const searchTerm = query.trim()
    setCards([])
    setVisibleCardCount(6)
    setHasMorePrints(false)
    setNextPrintsPage(null)
    setSearchError('')
    setSearching(false)

    if (searchTerm.length < 2) {
      return undefined
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)

      try {
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchTerm)}&unique=prints&order=released&dir=desc`,
          {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          },
        )
        const result = await response.json()

        if (response.status === 404) {
          setCards([])
          setHasMorePrints(false)
          setNextPrintsPage(null)
          setSearchError('No matching cards found.')
          return
        }

        if (!response.ok) {
          throw new Error(result.details || 'Scryfall search is unavailable right now.')
        }

        setCards(result.data || [])
        setHasMorePrints(Boolean(result.has_more))
        setNextPrintsPage(result.next_page || null)
      } catch (caught) {
        if (caught.name !== 'AbortError') {
          setCards([])
          setHasMorePrints(false)
          setNextPrintsPage(null)
          setSearchError(caught.message || 'Could not search Scryfall.')
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 400)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  async function loadMorePrints() {
    if (visibleCardCount < cards.length) {
      setVisibleCardCount((current) => current + 6)
      return
    }

    if (!nextPrintsPage || loadingMorePrints) return

    setLoadingMorePrints(true)
    try {
      const response = await fetch(nextPrintsPage, { headers: { Accept: 'application/json' } })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || 'Could not load more printings.')
      }

      const nextPageCards = result.data || []
      setCards((current) => [...current, ...nextPageCards])
      setVisibleCardCount((current) => current + 6)
      setHasMorePrints(Boolean(result.has_more))
      setNextPrintsPage(result.next_page || null)
    } catch (caught) {
      setSearchError(caught.message || 'Could not load more printings.')
    } finally {
      setLoadingMorePrints(false)
    }
  }

  return (
    <div className="scryfall-search">
      <label className="scryfall-search-label">
        {label}
        <div className="scryfall-search-field">
          <span className="home-search-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Magic cards..."
            autoComplete="off"
          />
        </div>
      </label>
      {searching && <p className="scryfall-search-status" role="status">Searching cards...</p>}
      {searchError && <p className="scryfall-search-status" role="status">{searchError}</p>}
      {cards.length > 0 && (
        <div className="scryfall-results" aria-label="Scryfall card search results">
          {cards.slice(0, visibleCardCount).map((card) => {
            const thumbnail = card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small
            const fullImage = card.image_uris?.large
              || card.card_faces?.[0]?.image_uris?.large
              || card.image_uris?.png
              || card.card_faces?.[0]?.image_uris?.png
              || card.image_uris?.normal
              || card.card_faces?.[0]?.image_uris?.normal
              || thumbnail

            return (
              <article className="scryfall-result" key={card.id}>
                <CardImageButton name={card.name} thumbnail={thumbnail} fullImage={fullImage} compact />
                <div className="scryfall-result-info">
                  <strong>{card.name}</strong>
                  <span>{card.set_name} ({card.set.toUpperCase()}) · #{card.collector_number}</span>
                  <span>{card.rarity} · {card.released_at}</span>
                  <span>{card.type_line}</span>
                  <span className="scryfall-price">USD {formatScryfallPrice(card.prices?.usd)}</span>
                  {card.prices?.usd_foil && <span className="scryfall-price">Foil {formatScryfallPrice(card.prices.usd_foil)}</span>}
                </div>
                <button type="button" onClick={() => onAddCard(card)}>Add print</button>
              </article>
            )
          })}
        </div>
      )}
      <p className="scryfall-attribution">Card data and unmodified images via Scryfall.</p>
      {(visibleCardCount < cards.length || hasMorePrints) && (
        <button type="button" className="scryfall-more-button" onClick={loadMorePrints} disabled={loadingMorePrints}>
          {loadingMorePrints ? 'Loading...' : 'Load more prints'}
        </button>
      )}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [session, setSession] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [partnerCards, setPartnerCards] = useState([])
  const [partnerSearch, setPartnerSearch] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [mobileTradeSide, setMobileTradeSide] = useState('fromPartner')
  const [tradeCardsByPartner, setTradeCardsByPartner] = useState({})
  const [partnerForm, setPartnerForm] = useState({ name: '', notes: '' })
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    async function loadSession() {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession()
        setSession(activeSession)
        if (activeSession) setScreen('dashboard')
      } catch (caught) {
        setError(caught.message || 'Could not restore your session.')
      } finally {
        setLoading(false)
      }
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

  useEffect(() => {
    let active = true

    async function loadPartners() {
      setPartnerCards([])
      setSelectedPartner(null)
      setTradeCardsByPartner({})

      if (!session?.user) return

      const [partnersResult, tradeHistoryResult] = await Promise.all([
        supabase
          .from('partners')
          .select('id, name, initials, notes, color, created_at')
          .eq('owner_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('trade_history')
          .select('partner_id, list_name, card_id, card_data, quantity, is_traded, traded_at')
          .eq('owner_id', session.user.id),
      ])

      const { data, error: partnersError } = partnersResult
      const { data: tradeRows, error: tradeHistoryError } = tradeHistoryResult

      if (!active) return

      if (partnersError) {
        setError(`Could not load trading partners: ${partnersError.message}`)
        return
      }

      if (tradeHistoryError) {
        setError(`Could not load trade history: ${tradeHistoryError.message}`)
        return
      }

      const loadedTradeState = tradeStateFromRows(tradeRows || [])

      const loadedPartners = (data || []).map((partner) => ({
        ...partner,
        color: partner.color || getRandomPartnerColor(),
        note: partner.notes || 'New trading partner.',
        ...getPartnerTradeCounts(loadedTradeState[partner.id]),
      }))

      setPartnerCards(loadedPartners)
      setSelectedPartner(loadedPartners[0] || null)
      setTradeCardsByPartner(loadedTradeState)
    }

    loadPartners()
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

    const { data, error } = await supabase.rpc('is_username_available', {
      requested_username: normalizedUsername,
    })

    if (error) throw error

    return Boolean(data)
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

  async function handleSavePartner(event) {
    event.preventDefault()

    if (!partnerForm.name.trim()) {
      setError('A partner name is required.')
      return
    }

    if (!session?.user) {
      setError('Please sign in before adding a trading partner.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const name = partnerForm.name.trim()
      const color = getRandomPartnerColor()
      const { data, error: insertError } = await supabase
        .from('partners')
        .insert({
          owner_id: session.user.id,
          name,
          initials: name.slice(0, 2).toUpperCase(),
          notes: partnerForm.notes.trim(),
          color,
        })
        .select('id, name, initials, notes, color, created_at')
        .single()

      if (insertError) throw insertError

      const newPartner = {
        ...data,
        note: data.notes || 'New trading partner.',
        pending: 0,
        want: 0,
        have: 0,
        traded: 0,
        total: 0,
      }

      setPartnerCards((current) => [newPartner, ...current])
      setSelectedPartner(newPartner)
      setPartnerForm({ name: '', notes: '' })
      setScreen('dashboard')
    } catch (caught) {
      setError(caught.message || 'Could not save the trading partner.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeletePartner(partnerId) {
    if (!session?.user) {
      setError('Please sign in before removing a partner.')
      return
    }

    const partnerToDelete = partnerCards.find((partner) => partner.id === partnerId)
    if (!partnerToDelete) return

    setBusy(true)
    setError('')

    try {
      const { error: tradeRowsError } = await supabase
        .from('trade_history')
        .delete()
        .eq('owner_id', session.user.id)
        .eq('partner_id', partnerId)

      if (tradeRowsError) throw tradeRowsError

      const { error: partnerDeleteError } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerId)
        .eq('owner_id', session.user.id)

      if (partnerDeleteError) throw partnerDeleteError

      setPartnerCards((current) => {
        const remaining = current.filter((partner) => partner.id !== partnerId)
        setSelectedPartner((currentSelection) => (currentSelection?.id === partnerId ? remaining[0] || null : currentSelection))
        return remaining
      })

      setTradeCardsByPartner((current) => {
        const nextTradeCards = { ...current }
        delete nextTradeCards[partnerId]
        return nextTradeCards
      })

      if (screen === 'trade' && selectedPartner?.id === partnerId) {
        setScreen('dashboard')
      }
    } catch (caught) {
      setError(caught.message || `Could not remove ${partnerToDelete.name}.`)
    } finally {
      setBusy(false)
    }
  }

  async function saveTradeCard(listName, card) {
    if (!session?.user || !selectedPartner) {
      throw new Error('Sign in before saving trade cards.')
    }

    const { error: saveError } = await supabase
      .from('trade_history')
      .upsert(
        toTradeHistoryRow(session.user.id, selectedPartner.id, listName, card),
        { onConflict: 'owner_id,partner_id,list_name,card_id' },
      )

    if (saveError) throw saveError
  }

  async function addTradeCard(listName, card) {
    if (!selectedPartner) return

    const cardEntry = {
      id: card.id,
      name: card.name,
      setName: card.set_name,
      setCode: card.set,
      collectorNumber: card.collector_number,
      rarity: card.rarity,
      typeLine: card.type_line,
      colors: card.colors || [],
      image: card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small || '',
      normalImage: card.image_uris?.large
        || card.card_faces?.[0]?.image_uris?.large
        || card.image_uris?.png
        || card.card_faces?.[0]?.image_uris?.png
        || card.image_uris?.normal
        || card.card_faces?.[0]?.image_uris?.normal
        || '',
      usdPrice: card.prices?.usd ?? null,
      usdFoilPrice: card.prices?.usd_foil ?? null,
      quantity: 1,
      isTraded: false,
    }

    const partnerLists = tradeCardsByPartner[selectedPartner.id] || { fromPartner: [], fromUser: [] }
    const existingCard = partnerLists[listName].find((item) => item.id === cardEntry.id)
    const updatedCard = existingCard
      ? { ...existingCard, quantity: existingCard.quantity + 1 }
      : cardEntry

    try {
      await saveTradeCard(listName, updatedCard)
      setTradeCardsByPartner((current) => {
        const lists = current[selectedPartner.id] || { fromPartner: [], fromUser: [] }
        const hasCard = lists[listName].some((item) => item.id === updatedCard.id)

        return {
          ...current,
          [selectedPartner.id]: {
            ...lists,
            [listName]: hasCard
              ? lists[listName].map((item) => item.id === updatedCard.id ? updatedCard : item)
              : [...lists[listName], updatedCard],
          },
        }
      })
    } catch (caught) {
      setError(`Could not save card: ${caught.message}`)
    }
  }

  async function changeTradeCardQuantity(listName, cardId, amount) {
    if (!selectedPartner) return

    const partnerLists = tradeCardsByPartner[selectedPartner.id] || { fromPartner: [], fromUser: [] }
    const card = partnerLists[listName].find((item) => item.id === cardId)
    if (!card) return

    const updatedCard = { ...card, quantity: Math.max(1, card.quantity + amount) }
    try {
      await saveTradeCard(listName, updatedCard)
      setTradeCardsByPartner((current) => ({
        ...current,
        [selectedPartner.id]: {
          ...(current[selectedPartner.id] || { fromPartner: [], fromUser: [] }),
          [listName]: (current[selectedPartner.id]?.[listName] || []).map((item) =>
            item.id === cardId ? updatedCard : item,
          ),
        },
      }))
    } catch (caught) {
      setError(`Could not save quantity: ${caught.message}`)
    }
  }

  async function toggleTradeCardTraded(listName, cardId) {
    if (!selectedPartner) return

    const partnerLists = tradeCardsByPartner[selectedPartner.id] || { fromPartner: [], fromUser: [] }
    const card = partnerLists[listName].find((item) => item.id === cardId)
    if (!card) return

    const updatedCard = {
      ...card,
      isTraded: !card.isTraded,
      tradedAt: card.isTraded ? null : new Date().toISOString(),
    }
    try {
      await saveTradeCard(listName, updatedCard)
      setTradeCardsByPartner((current) => ({
        ...current,
        [selectedPartner.id]: {
          ...(current[selectedPartner.id] || { fromPartner: [], fromUser: [] }),
          [listName]: (current[selectedPartner.id]?.[listName] || []).map((item) =>
            item.id === cardId ? updatedCard : item,
          ),
        },
      }))
    } catch (caught) {
      setError(`Could not save trade status: ${caught.message}`)
    }
  }

  async function removeTradeCard(listName, cardId) {
    if (!selectedPartner) return

    try {
      const { error: deleteError } = await supabase
        .from('trade_history')
        .delete()
        .eq('owner_id', session.user.id)
        .eq('partner_id', selectedPartner.id)
        .eq('list_name', listName)
        .eq('card_id', String(cardId))

      if (deleteError) throw deleteError

      setTradeCardsByPartner((current) => ({
        ...current,
        [selectedPartner.id]: {
          ...(current[selectedPartner.id] || { fromPartner: [], fromUser: [] }),
          [listName]: (current[selectedPartner.id]?.[listName] || []).filter((card) => card.id !== cardId),
        },
      }))
    } catch (caught) {
      setError(`Could not remove card: ${caught.message}`)
    }
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
          <img src={cardboundLogo} alt="Cardbound" className="welcome-logo" />
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
          <img src={cardboundLogo} alt="Cardbound" className="auth-brand-logo" />
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
    const homeAccents = ['gold', 'blue', 'purple', 'rose', 'sage', 'amber', 'teal']
    const searchTerm = partnerSearch.trim().toLowerCase()
    const dashboardPartners = partnerCards.map((partner) => ({
      ...partner,
      ...getPartnerTradeCounts(tradeCardsByPartner[partner.id]),
    }))
    const visiblePartners = dashboardPartners.filter((partner) =>
      `${partner.name} ${partner.notes || partner.note || ''}`.toLowerCase().includes(searchTerm),
    )
    const dashboardPendingCount = dashboardPartners.reduce((total, partner) => total + partner.pending, 0)
    const dashboardTradedCount = dashboardPartners.reduce((total, partner) => total + partner.traded, 0)

    return (
      <div className="app-shell scene-shell dashboard-shell home-dashboard-shell">
        <header className="home-header">
          <div className="home-top-bar">
            <img src={cardboundTop} alt="Cardbound" className="topbar-logo" />
            <div className="home-top-actions">
              <button type="button" className="home-mini-button" onClick={() => setScreen('history')}>
                <img src={historyIcon} alt="" aria-hidden="true" className="home-mobile-action-icon history-action-icon" />
                History
              </button>
              <button type="button" className="home-add-button" onClick={() => setScreen('new-partner')}>
                <span className="add-action-icon-wrap" aria-hidden="true">
                  <img src={addIcon} alt="" className="home-mobile-action-icon add-action-icon" />
                </span>
                + Add Partner
              </button>
              <span className="home-top-divider" aria-hidden="true" />
              <span className="home-username">{currentUser?.display_name || currentUser?.username || 'trader'}</span>
              <button type="button" className="home-signout-button" onClick={handleSignOut}>
                <img src={signOutIcon} alt="" aria-hidden="true" className="home-mobile-action-icon signout-action-icon" />
                SIGN OUT
              </button>
            </div>
          </div>

          <div className="home-stats-bar">
            <span className="home-stat">Partners <strong>{partnerCards.length}</strong></span>
            <span className="home-stat-divider" />
            <span className="home-stat">Pending <strong>{dashboardPendingCount}</strong></span>
            <span className="home-stat-divider" />
            <span className="home-stat">Traded <strong>{dashboardTradedCount}</strong></span>
          </div>
        </header>

        <main className="home-page">

          <h2 className="home-section-title">Trading Partners</h2>

          <div className="home-search-wrap">
            <span className="home-search-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              value={partnerSearch}
              onChange={(event) => setPartnerSearch(event.target.value)}
              placeholder="Search partners by name or notes..."
            />
          </div>

          <section className="home-grid">
            {partnerCards.length === 0 && (
              <p className="home-empty-state">No trading partners yet. Add one to get started.</p>
            )}
            {partnerCards.length > 0 && visiblePartners.length === 0 && (
              <p className="home-empty-state">No trading partners match your search.</p>
            )}
            {visiblePartners.map((partner, index) => {
              const accent = partner.color || homeAccents[index % homeAccents.length]

              return (
                <div
                  key={partner.id}
                  className={`home-card home-card-${accent} ${selectedPartner?.id === partner.id ? 'selected' : ''}`}
                  style={selectedPartner?.id === partner.id ? { '--card-border-color': getPartnerBorderColor(accent) } : undefined}
                >
                  <div className="home-card-shell">
                    <button
                      type="button"
                      className="home-card-main"
                      onClick={() => {
                        setSelectedPartner(partner)
                        setMobileTradeSide('fromPartner')
                        setScreen('trade')
                      }}
                    >
                      <div className="home-card-body">
                        <div className="home-card-row">
                          <div className={`home-avatar ${accent}`}>
                            {partner.initials}
                            <span className="home-avatar-dot" />
                          </div>
                          <div className="home-card-name-wrap">
                            <div className="home-card-name-row">
                              <span className="home-card-name">{partner.name}</span>
                              <span className="home-pending-badge">{partner.pending} Pending</span>
                            </div>
                            <div className="home-card-note">{partner.note}</div>
                          </div>
                        </div>

                        <div className="home-stats-row">
                          <div className="home-stat-col">
                            <span className="home-stat-num">{partner.pending}</span>
                            <span className="home-stat-label">Pending</span>
                          </div>
                          <div className="home-stat-col">
                            <span className="home-stat-num blue">{partner.want}</span>
                            <span className="home-stat-label">I Want</span>
                          </div>
                          <div className="home-stat-col">
                            <span className="home-stat-num green">{partner.have}</span>
                            <span className="home-stat-label">They Want</span>
                          </div>
                          <div className="home-stat-col">
                            <span className="home-stat-num">{partner.traded}</span>
                            <span className="home-stat-label">Traded</span>
                          </div>
                        </div>

                        <div className="home-progress-label">
                          <span>Trade Progress</span>
                          <span>{partner.progress}%</span>
                        </div>
                        <div className="home-progress-wrap">
                          <div className="home-progress-bar" style={{ width: `${partner.progress}%`, background: getPartnerGradient(partner.color) }} />
                        </div>
                      </div>

                      <div className="home-card-footer">Last traded {partner.lastTrade || 'Aug 15, 2026'}</div>
                    </button>

                    <button
                      type="button"
                      className="home-card-delete"
                      aria-label={`Delete ${partner.name}`}
                      title={`Delete ${partner.name}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeletePartner(partner.id)
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m-9 0 1.2 12.3A2 2 0 0 0 9.17 21h5.66a2 2 0 0 0 1.97-1.7L18 7H6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </section>
        </main>

        <footer className="home-footer">
          <div className="home-footer-brand">
            <img src={cardboundFooter} alt="Cardbound" className="footer-logo" />
            <span className="home-footer-divider" aria-hidden="true" />
            <span className="home-footer-text">Your personal trading ledger</span>
          </div>

          <div className="home-footer-meta">
            <span>Not affiliated with Wizards of the Coast</span>
            <span className="home-footer-divider" aria-hidden="true" />
            <span>v1.0.0</span>
          </div>
        </footer>
      </div>
    )
  }

  if (screen === 'trade' && selectedPartner) {
    const partnerTradeCards = tradeCardsByPartner[selectedPartner.id] || { fromPartner: [], fromUser: [] }
    const partnerCounts = getPartnerTradeCounts(partnerTradeCards)
    const { fromPartner: fromPartnerCounts, fromUser: fromUserCounts } = partnerCounts
    const { total: totalCardCount, pending: pendingCardCount, traded: tradedCardCount, progress: tradeProgress } = partnerCounts

    return (
      <div className="app-shell scene-shell trade-shell">
        <header className="top-bar trade-top-bar">
          <img src={cardboundTop} alt="Cardbound" className="topbar-logo" />
          <button type="button" className="mini-button ghost trade-back-button" onClick={() => setScreen('dashboard')}>← Back</button>
        </header>

        <section className="trade-partner-bar">
          <div className="trade-partner-overview">
            <span className="trade-overline"><span aria-hidden="true">◇</span> Trading with</span>
            <div className="trade-identity">
              <div className={`mini-avatar large ${selectedPartner.color}`}>{selectedPartner.initials}</div>
              <div className="trade-identity-copy">
                <div className="trade-title">{selectedPartner.name}</div>
                <span className="trade-name-divider" aria-hidden="true" />
                <div className="trade-meta">
                  <span><strong>{pendingCardCount}</strong> pending</span>
                  <i aria-hidden="true" />
                  <span><strong>{tradedCardCount}</strong> traded</span>
                  <i aria-hidden="true" />
                  <span><strong>{totalCardCount}</strong> total cards</span>
                </div>
              </div>
            </div>
          </div>
          <div className="trade-progress-summary">
            <div><span>Progress</span><strong>{tradeProgress}%</strong></div>
            <div className="progress-wrap progress-tight">
              <div className="progress-bar" style={{ width: `${tradeProgress}%` }} />
            </div>
          </div>
        </section>

        <div
          className="trade-mobile-tabs"
          role="tablist"
          aria-label="Trade inventory"
          style={{
            '--trade-partner-accent': getPartnerBorderColor(selectedPartner.color),
            '--trade-partner-gradient': getPartnerGradient(selectedPartner.color),
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileTradeSide === 'fromPartner'}
            className={mobileTradeSide === 'fromPartner' ? 'active' : ''}
            onClick={() => setMobileTradeSide('fromPartner')}
          >
            I WANT <strong>{fromPartnerCounts.total}</strong> <small>({fromPartnerCounts.pending})</small>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTradeSide === 'fromUser'}
            className={mobileTradeSide === 'fromUser' ? 'active' : ''}
            onClick={() => setMobileTradeSide('fromUser')}
          >
            THEY WANT <strong>{fromUserCounts.total}</strong> <small>({fromUserCounts.pending})</small>
          </button>
        </div>

        <main className="trade-page">
          <div
            className="trade-columns"
            style={{
              '--trade-partner-accent': getPartnerBorderColor(selectedPartner.color),
              '--trade-partner-gradient': getPartnerGradient(selectedPartner.color),
            }}
          >
            <section className={`trade-panel trade-panel-from-partner${mobileTradeSide === 'fromPartner' ? ' mobile-active' : ''}`}>
              <div className="trade-panel-heading">
                <div className="panel-heading panel-heading-want">I WANT · FROM {selectedPartner.name.toUpperCase()}</div>
                <div className="trade-panel-count"><strong>{fromPartnerCounts.total}</strong><small>Cards</small></div>
              </div>
              <div className="trade-panel-stats">
                <span><strong>{fromPartnerCounts.pending}</strong> Pending</span>
                <i aria-hidden="true" />
                <span><strong>{fromPartnerCounts.traded}</strong> Traded</span>
              </div>
              <div className="trade-panel-progress trade-panel-progress-want">
                <span style={{ width: `${fromPartnerCounts.progress}%` }} />
              </div>
              <ScryfallCardSearch label="Find a card" onAddCard={(card) => addTradeCard('fromPartner', card)} />
              <div className="trade-list">
                {partnerTradeCards.fromPartner.map((card) => (
                  <div className={`trade-item${card.isTraded ? ' is-traded' : ''}`} key={card.id}>
                    <CardImageButton name={card.name} thumbnail={card.image} fullImage={card.normalImage} />
                    <div className="trade-card-info">
                      <strong>{card.name}</strong>
                      <span>{card.setName} ({card.setCode.toUpperCase()}) · #{card.collectorNumber} · {card.rarity}</span>
                      <span className="trade-card-price">
                        USD {formatScryfallPrice(card.usdPrice)}
                        {card.usdPrice !== null && ` · Total ${formatScryfallPrice(Number(card.usdPrice) * card.quantity)}`}
                      </span>
                      {card.usdFoilPrice && <span className="trade-card-price">Foil {formatScryfallPrice(card.usdFoilPrice)}</span>}
                    </div>
                    <span
                      className={`trade-card-color-indicator ${getCardManaColorClass(card.colors)}`}
                      role="img"
                      aria-label={`${getCardManaColorClass(card.colors)} card color`}
                    />
                    <span className="badge">{card.colors.length ? card.colors.join('/') : 'Colorless'}</span>
                    <div className="trade-quantity" aria-label={`${card.quantity} copies`}>
                      <button type="button" aria-label={`Decrease ${card.name} quantity`} disabled={card.quantity <= 1} onClick={() => changeTradeCardQuantity('fromPartner', card.id, -1)}>-</button>
                      <span>{card.quantity}</span>
                      <button type="button" aria-label={`Increase ${card.name} quantity`} onClick={() => changeTradeCardQuantity('fromPartner', card.id, 1)}>+</button>
                    </div>
                    <button
                      type="button"
                      className={`trade-card-traded-button${card.isTraded ? ' selected' : ''}`}
                      aria-label={`${card.isTraded ? 'Unmark' : 'Mark'} ${card.name} as traded`}
                      aria-pressed={Boolean(card.isTraded)}
                      onClick={() => toggleTradeCardTraded('fromPartner', card.id)}
                    >
                      ✓
                    </button>
                    <button type="button" aria-label={`Remove ${card.name}`} onClick={() => removeTradeCard('fromPartner', card.id)}>×</button>
                  </div>
                ))}
                {partnerTradeCards.fromPartner.length === 0 && <p className="trade-empty">Search for cards this partner has.</p>}
              </div>
            </section>

            <div className="trade-center-divider" aria-hidden="true">
              <span className="trade-divider-marker" />
              <span className="trade-swap-mark"><img src={circleTrade} alt="" /></span>
              <span className="trade-divider-marker" />
            </div>

            <section className={`trade-panel trade-panel-from-user${mobileTradeSide === 'fromUser' ? ' mobile-active' : ''}`}>
              <div className="trade-panel-heading">
                <div className="panel-heading panel-heading-they-want">THEY WANT · FROM ME</div>
                <div className="trade-panel-count"><strong>{fromUserCounts.total}</strong><small>Cards</small></div>
              </div>
              <div className="trade-panel-stats">
                <span><strong>{fromUserCounts.pending}</strong> Pending</span>
                <i aria-hidden="true" />
                <span><strong>{fromUserCounts.traded}</strong> Traded</span>
              </div>
              <div className="trade-panel-progress trade-panel-progress-they-want">
                <span style={{ width: `${fromUserCounts.progress}%` }} />
              </div>
              <ScryfallCardSearch label="Find a card" onAddCard={(card) => addTradeCard('fromUser', card)} />
              <div className="trade-list">
                {partnerTradeCards.fromUser.map((card) => (
                  <div className={`trade-item${card.isTraded ? ' is-traded' : ''}`} key={card.id}>
                    <CardImageButton name={card.name} thumbnail={card.image} fullImage={card.normalImage} />
                    <div className="trade-card-info">
                      <strong>{card.name}</strong>
                      <span>{card.setName} ({card.setCode.toUpperCase()}) · #{card.collectorNumber} · {card.rarity}</span>
                      <span className="trade-card-price">
                        USD {formatScryfallPrice(card.usdPrice)}
                        {card.usdPrice !== null && ` · Total ${formatScryfallPrice(Number(card.usdPrice) * card.quantity)}`}
                      </span>
                      {card.usdFoilPrice && <span className="trade-card-price">Foil {formatScryfallPrice(card.usdFoilPrice)}</span>}
                    </div>
                    <span
                      className={`trade-card-color-indicator ${getCardManaColorClass(card.colors)}`}
                      role="img"
                      aria-label={`${getCardManaColorClass(card.colors)} card color`}
                    />
                    <span className="badge">{card.colors.length ? card.colors.join('/') : 'Colorless'}</span>
                    <div className="trade-quantity" aria-label={`${card.quantity} copies`}>
                      <button type="button" aria-label={`Decrease ${card.name} quantity`} disabled={card.quantity <= 1} onClick={() => changeTradeCardQuantity('fromUser', card.id, -1)}>-</button>
                      <span>{card.quantity}</span>
                      <button type="button" aria-label={`Increase ${card.name} quantity`} onClick={() => changeTradeCardQuantity('fromUser', card.id, 1)}>+</button>
                    </div>
                    <button
                      type="button"
                      className={`trade-card-traded-button${card.isTraded ? ' selected' : ''}`}
                      aria-label={`${card.isTraded ? 'Unmark' : 'Mark'} ${card.name} as traded`}
                      aria-pressed={Boolean(card.isTraded)}
                      onClick={() => toggleTradeCardTraded('fromUser', card.id)}
                    >
                      ✓
                    </button>
                    <button type="button" aria-label={`Remove ${card.name}`} onClick={() => removeTradeCard('fromUser', card.id)}>×</button>
                  </div>
                ))}
                {partnerTradeCards.fromUser.length === 0 && <p className="trade-empty">Search for cards you can offer.</p>}
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
            <span>Multicolor</span>
          </div>
        </main>
      </div>
    )
  }

  if (screen === 'history') {
    const historyGroups = partnerCards.map((partner) => {
      const partnerLists = tradeCardsByPartner[partner.id] || { fromPartner: [], fromUser: [] }
      const records = [
        ...partnerLists.fromPartner.filter((card) => card.isTraded).map((card) => ({ ...card, direction: 'received' })),
        ...partnerLists.fromUser.filter((card) => card.isTraded).map((card) => ({ ...card, direction: 'gave-away' })),
      ].sort((left, right) => new Date(right.tradedAt || 0) - new Date(left.tradedAt || 0))

      return {
        partner,
        records,
        total: records.reduce((sum, record) => sum + (Number(record.quantity) || 0), 0),
      }
    }).filter((group) => group.records.length > 0)

    const allHistoryRecords = historyGroups.flatMap((group) => group.records)
    const totalHistoryCount = allHistoryRecords.reduce((sum, record) => sum + (Number(record.quantity) || 0), 0)
    const receivedCount = allHistoryRecords
      .filter((record) => record.direction === 'received')
      .reduce((sum, record) => sum + (Number(record.quantity) || 0), 0)
    const gaveAwayCount = allHistoryRecords
      .filter((record) => record.direction === 'gave-away')
      .reduce((sum, record) => sum + (Number(record.quantity) || 0), 0)
    const mostActiveGroup = [...historyGroups].sort((left, right) => right.total - left.total)[0]
    const mostActivePartner = mostActiveGroup?.total ? mostActiveGroup.partner.name.split(' ')[0] : '—'
    const searchTerm = historySearch.trim().toLowerCase()
    const visibleHistoryGroups = historyGroups.map((group) => {
      const partnerMatches = group.partner.name.toLowerCase().includes(searchTerm)
      const records = !searchTerm || partnerMatches
        ? group.records
        : group.records.filter((record) =>
          `${record.name} ${record.setName} ${record.setCode}`.toLowerCase().includes(searchTerm),
        )

      return { ...group, records, partnerMatches }
    }).filter((group) => !searchTerm || group.partnerMatches || group.records.length > 0)

    return (
      <div className="app-shell scene-shell dashboard-shell history-shell">
        <header className="top-bar history-top-bar">
          <img src={cardboundTop} alt="Cardbound" className="topbar-logo" />
          <button type="button" className="mini-button ghost" onClick={() => setScreen('dashboard')}>← Back</button>
        </header>

        <main className="history-page history-page-reference">
          <h2><span className="history-title-accent">T</span>RADE <span className="history-title-accent">H</span>ISTORY</h2>
          <div className="history-title-divider" aria-hidden="true">
            <span />
            <i>✦</i>
            <span />
          </div>
          <div className="summary-row">
            <div className="summary-box"><span>{totalHistoryCount}</span><small>Total Traded</small></div>
            <div className="summary-box"><span>{receivedCount}</span><small>Received</small></div>
            <div className="summary-box"><span>{gaveAwayCount}</span><small>Gave Away</small></div>
            <div className="summary-box summary-box-most-active"><span>{mostActivePartner}</span><small>Most Active</small></div>
          </div>

          <div className="history-search">
            <input
              type="search"
              value={historySearch}
              onChange={(event) => setHistorySearch(event.target.value)}
              placeholder="Filter by card or partner..."
            />
          </div>

          <div className="history-list">
            {visibleHistoryGroups.length === 0 && (
              <p className="history-empty">
                {totalHistoryCount === 0 ? 'No traded cards yet.' : 'No trades match your search.'}
              </p>
            )}
            {visibleHistoryGroups.map(({ partner, records, total }) => (
              <section className="history-group" key={partner.id}>
                <header className="history-group-heading">
                  <div className={`mini-avatar small ${partner.color}`}>{partner.initials}</div>
                  <span className="history-partner-name">{partner.name}</span>
                  <span className="history-group-total">{total} {total === 1 ? 'trade' : 'trades'}</span>
                </header>
                <div className="history-records">
                  {records.length === 0 && <p className="history-group-empty">No traded cards yet.</p>}
                  {records.map((record) => {
                    const directionLabel = record.direction === 'received' ? 'Received' : 'Gave Away'
                    const tradeDate = record.tradedAt
                      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(record.tradedAt))
                      : '—'

                    return (
                      <div className="history-row" key={`${record.id}-${record.direction}`}>
                        <span className={`history-card-color ${getCardManaColorClass(record.colors)}`} aria-hidden="true" />
                        {record.image && <img className="history-card-image" src={record.image} alt={`${record.name} card`} loading="lazy" />}
                        <div className="history-card-info">
                          <strong>{record.name}</strong>
                          <span>{record.setCode.toUpperCase()} · {record.rarity.toUpperCase()}</span>
                        </div>
                        <span className={`history-status ${record.direction}`}>
                          <i aria-hidden="true">{record.direction === 'received' ? '↑' : '↓'}</i> {directionLabel}
                          {record.quantity > 1 && ` ×${record.quantity}`}
                        </span>
                        <time className="history-date">{tradeDate}</time>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </main>

        <footer className="home-footer">
          <div className="home-footer-brand">
            <img src={cardboundFooter} alt="Cardbound" className="footer-logo" />
            <span className="home-footer-divider" aria-hidden="true" />
            <span className="home-footer-text">Your personal trading ledger</span>
          </div>

          <div className="home-footer-meta">
            <span>Not affiliated with Wizards of the Coast</span>
            <span className="home-footer-divider" aria-hidden="true" />
            <span>v1.0.0</span>
          </div>
        </footer>
      </div>
    )
  }

  if (screen === 'new-partner') {
    return (
      <div className="app-shell scene-shell new-partner-shell">
        <header className="top-bar">
          <img src={cardboundTop} alt="Cardbound" className="topbar-logo" />
          <button type="button" className="mini-button ghost new-partner-back-button" onClick={() => setScreen('dashboard')}>← Back</button>
        </header>

        <div className="overlay-backdrop" onClick={() => setScreen('dashboard')} />

        <div className="modal-card" role="dialog" aria-modal="true">
          <h3>
            <span className="title-accent">N</span>ew <span className="title-accent">T</span>rading <span className="title-accent">P</span>artner
          </h3>
          <img src={goldDivider} alt="" className="panel-divider" />

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
              <button type="submit" className="primary-button" disabled={busy}>
                {busy ? 'Saving...' : 'Save Partner'}
              </button>
              <button type="button" className="ghost-button" onClick={() => setScreen('dashboard')}>Cancel</button>
            </div>
          </form>
        </div>

        <footer className="home-footer">
          <div className="home-footer-brand">
            <img src={cardboundFooter} alt="Cardbound" className="footer-logo" />
            <span className="home-footer-divider" aria-hidden="true" />
            <span className="home-footer-text">Your personal trading ledger</span>
          </div>

          <div className="home-footer-meta">
            <span>Not affiliated with Wizards of the Coast</span>
            <span className="home-footer-divider" aria-hidden="true" />
            <span>v1.0.0</span>
          </div>
        </footer>
      </div>
    )
  }

  return null
}