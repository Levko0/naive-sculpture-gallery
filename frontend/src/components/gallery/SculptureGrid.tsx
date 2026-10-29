import React from 'react';
import { motion } from 'framer-motion';
import { Sculpture } from '../../types';
import { SculptureCard } from './SculptureCard';

interface SculptureGridProps {
  sculptures: Sculpture[];
  isLoading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const SculptureGrid: React.FC<SculptureGridProps> = ({
  sculptures,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="gallery-card-border p-4 bg-gallery-stone/30 animate-pulse space-y-4"
          >
            <div className="aspect-[4/5] bg-gallery-stone rounded" />
            <div className="h-6 bg-gallery-stone w-3/4 rounded" />
            <div className="h-4 bg-gallery-stone w-1/2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (sculptures.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl text-gallery-muted mb-2">
          У цій категорії наразі немає скульптур.
        </p>
        <p className="text-xs text-gallery-muted">
          Спробуйте скинути фільтри або переглянути загальну експозицію.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
    >
      {sculptures.map((sculpture) => (
        <motion.div key={sculpture.id} variants={itemVariants}>
          <SculptureCard sculpture={sculpture} />
        </motion.div>
      ))}
    </motion.div>
  );
};
