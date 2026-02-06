import { motion } from 'framer-motion';

interface HeartsProps {
  total: number;
  remaining: number;
}

export function Hearts({ total, remaining }: HeartsProps) {
  return (
    <div className="flex gap-1" dir="ltr">
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          animate={i >= remaining ? { scale: [1, 0.5, 0], opacity: [1, 0.5, 0] } : {}}
          className="text-2xl"
        >
          {i < remaining ? '❤️' : '🖤'}
        </motion.span>
      ))}
    </div>
  );
}
