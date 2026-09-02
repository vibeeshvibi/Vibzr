import { motion } from 'framer-motion';
import type { Artist } from '../../types/music';

interface ArtistCardProps {
  artist: Artist;
  index?: number;
  onClick?: (artist: Artist) => void;
}

export function ArtistCard({ artist, index = 0, onClick }: ArtistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2 }}
      onClick={() => onClick?.(artist)}
      className="flex-shrink-0 cursor-pointer flex flex-col items-center gap-2 w-20"
    >
      <div className="relative">
        <img
          src={artist.image}
          alt={artist.name}
          loading="lazy"
          className="w-16 h-16 rounded-full object-cover border-2 border-white/10 hover:border-brand-pink/50 transition-colors duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/1C1C1E/FC3C44?text=%E2%99%AA';
          }}
        />
      </div>
      <p className="text-white/80 text-xs text-center font-medium leading-tight truncate w-full">
        {artist.name}
      </p>
    </motion.div>
  );
}
