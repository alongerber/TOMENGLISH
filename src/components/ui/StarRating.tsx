import { motion } from 'framer-motion';

interface StarRatingProps {
  stars: number; // 0-3
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ stars, size = 'md' }: StarRatingProps) {
  const sizeMap = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl' };

  return (
    <div className="flex gap-1 justify-center" dir="ltr">
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.2, type: 'spring', stiffness: 200 }}
          className={sizeMap[size]}
        >
          {i <= stars ? '⭐' : '☆'}
        </motion.span>
      ))}
    </div>
  );
}
