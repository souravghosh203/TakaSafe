import React, { useEffect, useRef, useState } from 'react';
import { Activity, AlertTriangle, ChevronLeft, ChevronRight, CloudLightning, Network, Pause, Play, ShieldAlert } from 'lucide-react';
import type { HistoricalRiskPoint } from './DivisionHistoricalRiskChart';
import './HistoricalEventCarousel.css';

interface HistoricalEventCarouselProps {
  events: HistoricalRiskPoint[];
  selectedIncident: HistoricalRiskPoint | null;
  selectedDivision: string;
  onSelectIncident: (event: HistoricalRiskPoint) => void;
}

const getEventIcon = (type: HistoricalRiskPoint['incidentType']) => {
  if (type === 'WEATHER' || type === 'LIQUIDITY') return CloudLightning;
  if (type === 'MULE') return Network;
  if (type === 'CRITICAL') return ShieldAlert;
  if (type === 'INFO') return Activity;
  return AlertTriangle;
};

const getEventLabel = (type: HistoricalRiskPoint['incidentType']) => {
  if (type === 'WEATHER') return 'Weather alert';
  if (type === 'LIQUIDITY') return 'Liquidity event';
  if (type === 'MULE') return 'Network anomaly';
  if (type === 'CRITICAL') return 'Critical event';
  if (type === 'INFO') return 'Regional update';
  return 'Risk milestone';
};

export const HistoricalEventCarousel: React.FC<HistoricalEventCarouselProps> = ({
  events,
  selectedIncident,
  selectedDivision,
  onSelectIncident,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = events.length;

  useEffect(() => {
    setActiveIndex((index) => count ? index % count : 0);
  }, [count, selectedDivision]);

  useEffect(() => {
    if (selectedIncident) {
      const selectedIndex = events.findIndex((event) => event.day === selectedIncident.day);
      if (selectedIndex >= 0) setActiveIndex(selectedIndex);
    }
  }, [events, selectedIncident]);

  useEffect(() => {
    if (isPaused || isHovered || count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActiveIndex((index) => {
      const nextIndex = (index + 1) % count;
      onSelectIncident(events[nextIndex]);
      return nextIndex;
    }), 5200);
    return () => window.clearInterval(timer);
  }, [count, events, isHovered, isPaused, onSelectIncident]);

  const moveTo = (index: number) => {
    if (!count) return;
    const nextIndex = (index + count) % count;
    setActiveIndex(nextIndex);
    setIsPaused(true);
    onSelectIncident(events[nextIndex]);
  };

  const moveBy = (amount: number) => moveTo(activeIndex + amount);

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) > 45) moveBy(distance < 0 ? 1 : -1);
  };

  if (!count) return null;

  const visibleCards = count > 1 ? [
    { index: (activeIndex - 1 + count) % count, position: 'left' },
    { index: activeIndex, position: 'center' },
    { index: (activeIndex + 1) % count, position: 'right' },
  ] : [{ index: activeIndex, position: 'center' }];

  return (
    <div
      className="event-carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchStartX.current = null; }}
      aria-label={`Historical events for ${selectedDivision}`}
    >
      <div className="event-carousel-stage">
        {visibleCards.map(({ index, position }) => {
          const event = events[index];
          const EventIcon = getEventIcon(event.incidentType);
          const isCenter = position === 'center';
          const eventType = (event.incidentType || 'INFO').toLowerCase();

          return (
            <button
              type="button"
              key={count === 2 ? `${position}-${event.day}` : event.day}
              className={`event-slide event-slide-${position} event-slide-${eventType}`}
              onClick={() => moveTo(index)}
              aria-label={`${event.incident}, ${event.date}, risk score ${event.riskScore}${isCenter ? ', selected' : ', show event'}`}
              aria-current={isCenter ? 'true' : undefined}
            >
              <span className="event-slide-art" aria-hidden="true">
                <span className="event-slide-orbit" />
                <span className="event-slide-grid" />
                <span className="event-slide-icon"><EventIcon size={isCenter ? 38 : 28} strokeWidth={1.5} /></span>
              </span>
              <span className="event-slide-shade" />
              <span className="event-slide-info">
                <span className="event-slide-kicker"><EventIcon size={13} /> {getEventLabel(event.incidentType)} <i /> {selectedDivision} · {event.date}</span>
                <span className="event-slide-title">{event.incident}</span>
                <span className="event-slide-score">Regional risk <strong>{event.riskScore}<small>/100</small></strong></span>
              </span>
            </button>
          );
        })}

        {count > 1 && <button
          type="button"
          className="event-carousel-toggle"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-label={isPaused ? 'Play event carousel' : 'Pause event carousel'}
          title={isPaused ? 'Play event carousel' : 'Pause event carousel'}
        >
          {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
        </button>}

        {count > 1 && <>
          <button type="button" className="event-carousel-arrow event-carousel-prev" onClick={() => moveBy(-1)} aria-label="Previous event">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="event-carousel-arrow event-carousel-next" onClick={() => moveBy(1)} aria-label="Next event">
            <ChevronRight size={20} />
          </button>
        </>}
      </div>
      <div className="event-carousel-footer" aria-live="polite">
        <span>{String(activeIndex + 1).padStart(2, '0')} <i /> {String(count).padStart(2, '0')}</span>
        <div className="event-carousel-progress" aria-hidden="true"><span style={{ width: `${((activeIndex + 1) / count) * 100}%` }} /></div>
        <span>{isPaused ? 'Paused' : 'Auto play'}</span>
      </div>
    </div>
  );
};
