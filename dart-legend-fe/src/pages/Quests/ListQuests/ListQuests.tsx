import { getSocialMission, getSocialTasks } from "@/api/social/social";
import {
  arrowRight,
  balanceLogo2,
  checkLine,
  discord,
  facebook,
  telegram,
  twitter,
  website,
  youtube,
} from "@/assets";
import Loading from "@/components/UI/Loading";
import { formatNumber } from "@/utils/fc.utils";
import type { Imission, tasks as TaskType } from "@/utils/type";
import { useRequest } from "ahooks";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ModalQuest from "../Modal/ModalQuest";

const socialIconMap: Record<string, string> = {
  twitter,
  telegram,
  youtube,
  discord,
  facebook,
  website,
};

const ListQuests = () => {
  const [taskList, setTaskList] = useState<TaskType[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Array<boolean>>([]);
  const [mission, setMission] = useState<Imission>();
  const [refresh, setRefresh] = useState(0);
  const { data: dataTasks, loading: loadingTasks } = useRequest(
    getSocialTasks,
    {
      cacheKey: "social-tasks",
      staleTime: 5 * 60 * 1000,
      refreshDeps: [refresh],
    }
  );
  const { data: dataMission, loading: loadingMission } = useRequest(
    getSocialMission,
    {
      cacheKey: "social-mission",
      staleTime: 5 * 60 * 1000,
      refreshDeps: [refresh],
    }
  );

  useEffect(() => {
    if (dataTasks) {
      setTaskList(dataTasks?.data?.data);
      setCompleted((prev) => {
        if (prev.length !== dataTasks?.data?.data.length) {
          return Array(dataTasks?.data?.data.length).fill(false);
        }
        return prev;
      });
    }
  }, [dataTasks]);

  useEffect(() => {
    if (dataMission) {
      setMission(dataMission?.data?.data);
    }
  }, [dataMission]);

  const handleOpen = (idx: number) => {
    setSelectedQuest(idx);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedQuest(null);
  };

  const handleSuccess = (idx: number) => {
    setCompleted((prev) => prev.map((v, i) => (i === idx ? true : v)));
    setRefresh((r) => r + 1);
  };

  const completedKeys: string[] = Array.isArray(mission?.socials)
    ? mission.socials
    : [];

  return (
    <>
      {loadingTasks || loadingMission ? (
        <Loading />
      ) : (
        <div className="space-y-4 w-full h-[80dvh] pb-10 overflow-y-auto scrollbar-hide">
          {taskList.map((task, index) => {
            const isCompleted =
              completedKeys.includes(task.key) || completed[index];
            return (
              <button
                key={index}
                className={`flex items-center justify-between gap-2 px-4 py-3 bg-[#0000003D] border-2 border-[#FFFFFF66] rounded-xl w-full`}
                onClick={() => handleOpen(index)}
                disabled={isCompleted}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={socialIconMap[task.social.toLowerCase()] || task.uri}
                    alt={task.social}
                  />
                  <div className="text-start">
                    <p className="text-custom-sm-bold  text-white">
                      {task.name}
                    </p>
                    <div className="flex items-center justify-start gap-2">
                      <div className="flex items-center gap-1">
                        <img
                          src={balanceLogo2}
                          alt="balanceLogo2"
                          className="w-6 h-6"
                        />
                        <p className="text-custom-sm-bold text-white">
                          {formatNumber(task.point)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className={isCompleted ? "opacity-60 cursor-not-allowed" : ""}
                >
                  <img
                    src={isCompleted ? checkLine : arrowRight}
                    alt="Right"
                    className="w-8 h-8"
                  />
                </button>
              </button>
            );
          })}
          <AnimatePresence>
            {selectedQuest !== null && taskList[selectedQuest] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="your-modal-class"
              >
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <ModalQuest
                        isOpen={open}
                        onClose={handleClose}
                        img={
                          socialIconMap[
                            taskList[selectedQuest].social?.toLowerCase()
                          ] || taskList[selectedQuest].uri
                        }
                        point={taskList[selectedQuest].point}
                        token={taskList[selectedQuest].point}
                        title={taskList[selectedQuest].name}
                        // description={taskList[selectedQuest].name}
                        link={taskList[selectedQuest].uri || ""}
                        onSuccess={() => handleSuccess(selectedQuest)}
                        questKey={taskList[selectedQuest].key}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default ListQuests;
