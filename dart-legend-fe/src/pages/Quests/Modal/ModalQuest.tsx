import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { close, balanceLogo2, BGGame } from "@/assets";
import { postCheckMission } from "@/api/social/social";
import { toast } from "@/components/UI/Toast/toast";
import { clearCache } from "ahooks";
import { motion, AnimatePresence } from "framer-motion";
import { useSetAtom } from "jotai";
import { updateUserBalanceAtom, atomUser } from "@/store/user.store";
import { useState } from "react";
import { formatNumber } from "@/utils/fc.utils";

export default function ModalQuest({
  isOpen,
  onClose,
  img,
  point,
  title,
  description,
  onSuccess,
  link,
  questKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  img: string;
  point: number;
  token: number;
  title: string;
  description?: string;
  onSuccess: () => void;
  link: string;
  questKey: string;
}) {
  const setUserBalance = useSetAtom(updateUserBalanceAtom);
  const setUser = useSetAtom(atomUser);
  const [loading, setLoading] = useState(false);
  const [hasFollowed, setHasFollowed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      window.open(link, "_blank");
      setHasFollowed(true);
      toast.success(
        "Link opened successfully! Please follow and then click CLAIM."
      );
    } catch (error) {
      toast.error("Failed to open link");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await postCheckMission({ key: questKey, point: point });
      toast.success("Claimed successfully!");
      setUser((prev) => {
        if (!prev) return prev;
        const newBalance = prev.point + point;
        setUserBalance(newBalance);
        return { ...prev, point: newBalance };
      });
      clearCache("social-tasks");
      clearCache("social-mission");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to claim reward");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton
      classNames={{
        base: "rounded-2xl p-0 mx-4",
        body: "p-0",
        header: "p-0",
        footer: "p-0",
      }}
      size="md"
      placement="center"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, rotate: 10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <ModalContent>
              {/* Background Image Container */}
              <div
                className="relative w-full h-full rounded-2xl overflow-hidden outline outline-2 outline-offset-[-2px] outline-cyan-300"
                style={{
                  backgroundImage: `url(${BGGame})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <ModalHeader className="flex items-center justify-between px-4 pt-4 pb-2">
                  <span className="text-[#FEFEFE] font-bold text-2xl">
                    QUEST
                  </span>
                  <button onClick={onClose}>
                    <img src={close} alt="close" />
                  </button>
                </ModalHeader>

                <ModalBody className="flex flex-col items-center px-6 pb-0">
                  <img
                    src={img}
                    alt="icon"
                    className="w-[100px] h-[100px] mt-10 mb-4"
                  />
                  <div className="text-white text-xl font-bold text-center mb-1">
                    {title}
                  </div>
                  {description && (
                    <div className="text-white text-sm font-normal text-center mb-4">
                      {description}
                    </div>
                  )}
                  <div className="w-full flex items-center justify-center mb-4">
                    <div className="bg-[#FFFFFF3D] rounded-lg w-full flex items-center justify-center py-3 gap-2">
                      <img src={balanceLogo2} alt="coin" className="w-7 h-7" />
                      <p className="text-white text-xl font-bold">
                        {formatNumber(point)}
                      </p>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter className="flex items-center justify-between px-6 pb-6 pt-2 gap-3">
                  <Button
                    className="flex-1 bg-[#47FFFF] border-2 border-[#47FFFF] rounded-lg h-14 "
                    onClick={hasFollowed ? handleClaim : handleFollow}
                    disabled={loading || isClaiming}
                  >
                    <p className="justify-start text-gray-800 text-xl font-normal font-['Squada_One'] uppercase leading-normal">
                      {loading
                        ? "PROCESSING..."
                        : isClaiming
                        ? "CLAIMING..."
                        : hasFollowed
                        ? "CLAIM"
                        : "FOLLOW NOW"}
                    </p>
                  </Button>
                </ModalFooter>
              </div>
            </ModalContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
