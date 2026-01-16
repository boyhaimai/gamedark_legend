import LoadingGame from "@/pages/game/Loading/LoadingGame";
import { AnimatePresence, motion } from "framer-motion";

const transitionVariants = {
  initial: { opacity: 0, scale: 0.95, y: 40 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.95, y: -40, transition: { duration: 0.4 } },
};

const GameTransition = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="loading"
        variants={transitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="absolute w-full h-full top-0 left-0"
      >
        <LoadingGame />
      </motion.div>
    </AnimatePresence>
  );
};

export default GameTransition;
