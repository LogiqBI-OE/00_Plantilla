/**
 * BackgroundCarousel — fade entre imagenes a fullscreen.
 *
 * Si no hay fotos del brand (lista vacia), no renderiza nada y deja
 * que el caller use su fondo por defecto. El intervalo viene del
 * brand.carrusel_segundos.
 */
import { useEffect, useState } from 'react';

interface BackgroundCarouselProps {
  fotos: string[];
  intervalSeconds?: number;
  className?: string;
}

export function BackgroundCarousel({
  fotos,
  intervalSeconds = 4.5,
  className = '',
}: BackgroundCarouselProps): React.ReactElement | null {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (fotos.length < 2) return;
    const ms = Math.max(1, intervalSeconds) * 1000;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % fotos.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [fotos.length, intervalSeconds]);

  if (fotos.length === 0) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {fotos.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === idx ? 1 : 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
