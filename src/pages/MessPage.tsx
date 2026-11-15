import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MessageSquareText, Send, Star, UtensilsCrossed } from 'lucide-react'
import type { MealType, MessFeedback } from '../types'
import { mealLabels, mealOrder, mealTimes } from '../data/labels'
import { useCurrentUser } from '../context/auth'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../hooks/useAsync'
import { api } from '../services/api'
import { Button, Chips, EmptyState, Field, PageHeader, Panel, StarRating, StatCard, Tabs } from '../components/ui'
import { dayKey, initials, timeAgo } from '../utils/format'

const average = (items: MessFeedback[], key: 'rating' | 'taste' | 'hygiene' | 'quantity' = 'rating') =>
  items.length ? items.reduce((sum, item) => sum + item[key], 0) / items.length : 0

const COMMENT_LIMIT = 300

export function MessPage() {
  const feedback = useAsync(() => api.mess.listFeedback())
  const menu = api.mess.menu()
  const todayIndex = (new Date().getDay() + 6) % 7
  const [day, setDay] = useState(todayIndex)
  const [filter, setFilter] = useState<MealType | 'all'>('all')

  const items = feedback.data ?? []
  const todays = items.filter(item => item.date === dayKey())
  const shown = filter === 'all' ? items : items.filter(item => item.meal === filter)

  return (
    <>
      <PageHeader module="mess" subtitle="Check the weekly menu and tell the mess committee how each meal was." />

      <div className="stat-grid">
        <StatCard label="Today’s rating" value={todays.length ? `${average(todays).toFixed(1)} / 5` : '—'} detail={`${todays.length} review${todays.length === 1 ? '' : 's'} today`} icon={<Star />} tone={1} />
        <StatCard label="Overall average" value={items.length ? `${average(items).toFixed(1)} / 5` : '—'} detail={`${items.length} total reviews`} icon={<UtensilsCrossed />} tone={2} />
        <StatCard label="Hygiene score" value={items.length ? `${average(items, 'hygiene').toFixed(1)} / 5` : '—'} detail="Averaged across all meals" icon={<MessageSquareText />} tone={0} />
      </div>

      <div className="two-col">
        <Panel eyebrow="WEEKLY MENU" title={`${menu[day].day}${day === todayIndex ? ' (today)' : ''}`}>
          <Tabs tabs={menu.map((item, index) => ({ key: String(index), label: item.day.slice(0, 3) }))} active={String(day)} onChange={key => setDay(Number(key))} />
          <div className="meal-grid">
            {mealOrder.map(meal => (
              <div className="meal-card" key={meal}>
                <div className="meal-head"><strong>{mealLabels[meal]}</strong><small>{mealTimes[meal]}</small></div>
                <ul>{menu[day].meals[meal].map(dish => <li key={dish}>{dish}</li>)}</ul>
              </div>
            ))}
          </div>
        </Panel>
        <FeedbackForm existing={todays} onSubmitted={feedback.reload} />
      </div>

      <div className="two-col">
        <Panel eyebrow="BREAKDOWN" title="Ratings by meal">
          <div className="bar-list">
            {mealOrder.map(meal => {
              const mealItems = items.filter(item => item.meal === meal)
              const avg = average(mealItems)
              return (
                <div className="bar-row" key={meal}>
                  <span>{mealLabels[meal]}</span>
                  <div className="bar"><span style={{ width: `${(avg / 5) * 100}%` }} /></div>
                  <strong>{mealItems.length ? avg.toFixed(1) : '—'}</strong>
                </div>
              )
            })}
          </div>
          <div className="aspect-grid">
            {(['taste', 'hygiene', 'quantity'] as const).map(key => (
              <div key={key}><span>{key[0].toUpperCase() + key.slice(1)}</span><StarRating value={average(items, key)} size="sm" /></div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="COMMUNITY" title="Recent reviews">
          <Chips options={[{ key: 'all' as const, label: 'All' }, ...mealOrder.map(meal => ({ key: meal, label: mealLabels[meal] }))]} active={filter} onChange={setFilter} />
          <div className="review-list">
            {shown.length ? shown.slice(0, 8).map(item => (
              <article className="review" key={item.id}>
                <div className="avatar small">{initials(item.userName)}</div>
                <div>
                  <div className="review-head"><strong>{item.userName}</strong><small>{mealLabels[item.meal]} · {timeAgo(item.createdAt)}</small></div>
                  <StarRating value={item.rating} size="sm" />
                  {item.comment && <p>{item.comment}</p>}
                </div>
              </article>
            )) : <EmptyState title={feedback.loading ? 'Loading reviews…' : 'No reviews yet'} />}
          </div>
        </Panel>
      </div>
    </>
  )
}

function FeedbackForm({ existing, onSubmitted }: { existing: MessFeedback[]; onSubmitted: () => void }) {
  const user = useCurrentUser()
  const toast = useToast()
  const [meal, setMeal] = useState<MealType>('lunch')
  const [scores, setScores] = useState({ rating: 0, taste: 0, hygiene: 0, quantity: 0 })
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const alreadyRated = useMemo(() => new Set(existing.filter(item => item.userId === user.id).map(item => item.meal)), [existing, user.id])

  // Move off a meal once it has been rated, to the next one still open today.
  useEffect(() => {
    if (!alreadyRated.has(meal)) return
    const open = mealOrder.find(item => !alreadyRated.has(item))
    if (open) setMeal(open)
  }, [alreadyRated, meal])

  if (user.role !== 'student') {
    return (
      <Panel eyebrow="FEEDBACK" title="Share your feedback">
        <EmptyState icon={<MessageSquareText />} title="Feedback is submitted by students" message="Faculty and administrators can view all ratings and reviews on this page." />
      </Panel>
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!scores.rating) return setError('Please give an overall rating.')
    if (!scores.taste || !scores.hygiene || !scores.quantity) return setError('Please rate taste, hygiene and quantity.')
    if (comment.length > COMMENT_LIMIT) return setError(`Comment must be under ${COMMENT_LIMIT} characters.`)
    setError('')
    setSubmitting(true)
    try {
      await api.mess.submitFeedback(user, { meal, ...scores, comment })
      toast.success(`Thanks! Your ${mealLabels[meal].toLowerCase()} feedback was recorded.`)
      setScores({ rating: 0, taste: 0, hygiene: 0, quantity: 0 })
      setComment('')
      onSubmitted()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Panel eyebrow="FEEDBACK" title="Rate today’s meal">
      <form className="form-stack" onSubmit={submit} noValidate>
        <Field label="Meal" htmlFor="meal">
          <div className="segmented" id="meal">
            {mealOrder.map(item => (
              <button type="button" key={item} className={meal === item ? 'active' : ''} onClick={() => setMeal(item)} disabled={alreadyRated.has(item)} title={alreadyRated.has(item) ? 'Already rated today' : undefined}>
                {mealLabels[item].replace('Evening ', '')}
              </button>
            ))}
          </div>
        </Field>
        {alreadyRated.has(meal) ? (
          <p className="notice">You’ve already rated today’s {mealLabels[meal].toLowerCase()}. Pick another meal.</p>
        ) : (
          <>
            <div className="field">
              <label>Overall</label>
              <StarRating value={scores.rating} onChange={rating => setScores(s => ({ ...s, rating }))} size="lg" label="Overall rating" />
            </div>
            <div className="aspect-inputs">
              {(['taste', 'hygiene', 'quantity'] as const).map(key => (
                <div key={key}>
                  <span>{key[0].toUpperCase() + key.slice(1)}</span>
                  <StarRating value={scores[key]} onChange={value => setScores(s => ({ ...s, [key]: value }))} size="sm" label={`${key} rating`} />
                </div>
              ))}
            </div>
            <Field label="Comments" htmlFor="comment" hint={`${comment.length}/${COMMENT_LIMIT}`} error={comment.length > COMMENT_LIMIT ? `${comment.length}/${COMMENT_LIMIT} – too long` : undefined}>
              <textarea id="comment" className="input" rows={3} placeholder="What did you like? What could be better?" value={comment} onChange={event => setComment(event.target.value)} />
            </Field>
            {error && <p className="field-error" role="alert">{error}</p>}
            <Button type="submit" loading={submitting} icon={<Send />}>Submit feedback</Button>
          </>
        )}
      </form>
    </Panel>
  )
}
