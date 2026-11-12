import { motion } from "motion/react";

export default function WakingNotice() {
  return (
    <motion.p
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      className="text-center text-sm text-muted"
    >
      Waking up the free server. This can take up to a minute, thanks for waiting.
    </motion.p>
  );
}