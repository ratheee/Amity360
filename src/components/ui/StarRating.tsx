import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const words = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

/** Interactive when `onChange` is passed; otherwise a read-only display that supports fractional values. */
export function StarRating({ value, onChange, size = 'md', label = 'Rating' }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const shown = hover || value

  if (!onChange) {
    return (
      <span className={`stars stars-${size}`} aria-label={`${value.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className="star-wrap">
            <Star className="star-empty" />
            <span className="star-fill" style={{ width: `${Math.max(0, Math.min(1, value - star + 1)) * 100}%` }}><Star /></span>
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className={`stars stars-${size} interactive`} role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          className={star <= shown ? 'on' : ''}
          onMouseEnter={() => setHover(star)}
          onClick={() => onChange(star)}
        >
          <Star />
        </button>
      ))}
      {size === 'lg' && <span className="star-word">{words[shown]}</span>}
    </div>
  )
}
