import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { Album } from '../../types/music';

interface AlbumCardProps {
  album: Album;
  index?: number;
  onClick?: (album: Album) => void;
}

export function AlbumCard({ album, index = 0, onClick }: AlbumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2 }}
      onClick={() => onClick?.(album)}
      className="group cursor-pointer"
    >
      <div className="relative mb-3 rounded-xl overflow-hidden">
        <img
          src={album.image}
          alt={album.title}
          loading="lazy"
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/1C1C1E/FC3C44?text=%E2%99%AA';
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <Play size={15} fill="#000" color="#000" className="ml-0.5" />
        </div>
      </div>
      <p className="text-white font-semibold text-sm truncate">{album.title}</p>
      <p className="text-white/50 text-xs truncate mt-0.5">
        {album.artist} {album.year ? `• ${album.year}` : ''}
      </p>
    </motion.div>
  );
}
