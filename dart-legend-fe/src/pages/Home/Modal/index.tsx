import { Modal, ModalContent } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";

export default function ModalAddPlayer({
  isOpen,
  onClose,
}: // img,
// point,
// title,
// description,
// onSuccess,
// link,
// questKey,
{
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
  // const setUserBalance = useSetAtom(updateUserBalanceAtom);
  // const setUser = useSetAtom(atomUser);
  // const [loading, setLoading] = useState(false);
  // const [hasFollowed, setHasFollowed] = useState(false);
  // const [isClaiming, setIsClaiming] = useState(false);

  // const handleFollow = async () => {
  //   setLoading(true);
  //   try {
  //     window.open(link, "_blank");
  //     setHasFollowed(true);
  //     toast.success(
  //       "Link opened successfully! Please follow and then click CLAIM."
  //     );
  //   } catch (error) {
  //     toast.error("Failed to open link");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleClaim = async () => {
  //   setIsClaiming(true);
  //   try {
  //     await postCheckMission({ key: questKey, point: point });
  //     toast.success("Claimed successfully!");
  //     setUser((prev) => {
  //       if (!prev) return prev;
  //       const newBalance = prev.balance + point;
  //       setUserBalance(newBalance);
  //       return { ...prev, balance: newBalance };
  //     });
  //     clearCache("social-tasks");
  //     clearCache("social-mission");
  //     onSuccess();
  //     onClose();
  //   } catch (error) {
  //     toast.error("Failed to claim reward");
  //   } finally {
  //     setIsClaiming(false);
  //   }
  // };

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
              <div className="w-96 h-[600px] px-4 pt-4 pb-8 bg-gray-950 rounded-tl-2xl rounded-tr-2xl inline-flex flex-col justify-start items-start gap-5">
                <div className="self-stretch justify-start text-white text-xl font-bold font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                  Add Player
                </div>
                <div
                  data-property-1="search"
                  className="w-80 px-4 py-3.5 bg-white/20 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/20 inline-flex justify-start items-center gap-2"
                >
                  <div className="w-5 h-5 relative overflow-hidden">
                    <div className="w-1 h-1 left-[13.99px] top-[13.99px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-neutral-400" />
                    <div className="w-3.5 h-3.5 left-[1.67px] top-[1.67px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-neutral-400" />
                  </div>
                  <div className="justify-start text-zinc-400 text-sm font-normal font-['Roboto_Mono'] leading-tight">
                    Enter ID or name player
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  <div className="justify-start text-white text-sm font-normal font-['Roboto_Mono']">
                    Recently
                  </div>
                  <div className="self-stretch relative rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2">
                    <div className="w-96 h-10 left-[4.21px] top-0 absolute rounded-lg border-[3px] blur-sm" />
                    <img
                      className="w-10 h-10 rounded-lg border border-cyan-300"
                      src="https://placehold.co/40x40"
                    />
                    <div className="h-10 inline-flex flex-col justify-start items-start gap-1">
                      <div className="justify-start text-white text-sm font-medium font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        Wade Warren
                      </div>
                      <div className="justify-start text-yellow-400 text-xs font-normal font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        TOP 1920
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch relative rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2">
                    <div className="w-96 h-10 left-[4.21px] top-0 absolute rounded-lg border-[3px] blur-sm" />
                    <img
                      className="w-10 h-10 rounded-lg border border-cyan-300"
                      src="https://placehold.co/40x40"
                    />
                    <div className="h-10 inline-flex flex-col justify-start items-start gap-1">
                      <div className="justify-start text-white text-sm font-medium font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        Kristin Watson
                      </div>
                      <div className="justify-start text-yellow-400 text-xs font-normal font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        TOP 1920
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch relative rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2">
                    <div className="w-96 h-10 left-[4.21px] top-0 absolute rounded-lg border-[3px] blur-sm" />
                    <img
                      className="w-10 h-10 rounded-lg border border-cyan-300"
                      src="https://placehold.co/40x40"
                    />
                    <div className="h-10 inline-flex flex-col justify-start items-start gap-1">
                      <div className="justify-start text-white text-sm font-medium font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        Leslie Alexander
                      </div>
                      <div className="justify-start text-yellow-400 text-xs font-normal font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        TOP 1920
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch relative rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2">
                    <div className="w-96 h-10 left-[4.21px] top-0 absolute rounded-lg border-[3px] blur-sm" />
                    <img
                      className="w-10 h-10 rounded-lg border border-cyan-300"
                      src="https://placehold.co/40x40"
                    />
                    <div className="h-10 inline-flex flex-col justify-start items-start gap-1">
                      <div className="justify-start text-white text-sm font-medium font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        Robert Fox
                      </div>
                      <div className="justify-start text-yellow-400 text-xs font-normal font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        TOP 1920
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch relative rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2">
                    <div className="w-96 h-10 left-[4.21px] top-0 absolute rounded-lg border-[3px] blur-sm" />
                    <img
                      className="w-10 h-10 rounded-lg border border-cyan-300"
                      src="https://placehold.co/40x40"
                    />
                    <div className="h-10 inline-flex flex-col justify-start items-start gap-1">
                      <div className="justify-start text-white text-sm font-medium font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        Savannah Nguyen
                      </div>
                      <div className="justify-start text-yellow-400 text-xs font-normal font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        TOP 1920
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch relative rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2">
                    <div className="w-96 h-10 left-[4.21px] top-0 absolute rounded-lg border-[3px] blur-sm" />
                    <img
                      className="w-10 h-10 rounded-lg border border-cyan-300"
                      src="https://placehold.co/40x40"
                    />
                    <div className="h-10 inline-flex flex-col justify-start items-start gap-1">
                      <div className="justify-start text-white text-sm font-medium font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        Dianne Russell
                      </div>
                      <div className="justify-start text-yellow-400 text-xs font-normal font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        TOP 1920
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch relative rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2">
                    <div className="w-96 h-10 left-[4.21px] top-0 absolute rounded-lg border-[3px] blur-sm" />
                    <img
                      className="w-10 h-10 rounded-lg border border-cyan-300"
                      src="https://placehold.co/40x40"
                    />
                    <div className="h-10 inline-flex flex-col justify-start items-start gap-1">
                      <div className="justify-start text-white text-sm font-medium font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        Jacob Jones
                      </div>
                      <div className="justify-start text-yellow-400 text-xs font-normal font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        TOP 1920
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch relative rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.15)] inline-flex justify-start items-center gap-2">
                    <div className="w-96 h-10 left-[4.21px] top-0 absolute rounded-lg border-[3px] blur-sm" />
                    <img
                      className="w-10 h-10 rounded-lg border border-cyan-300"
                      src="https://placehold.co/40x40"
                    />
                    <div className="h-10 inline-flex flex-col justify-start items-start gap-1">
                      <div className="justify-start text-white text-sm font-medium font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        Cameron Williamson
                      </div>
                      <div className="justify-start text-yellow-400 text-xs font-normal font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
                        TOP 1920
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
