import {
  getCheckIn,
  getDailyAttendance,
  postCheckIn,
} from "@/api/social/social";
import {
  balanceLogo2,
  CoinStack,
  CoinStack2,
  CoinStack3,
  Like,
  Rewards,
  Rewards7,
} from "@/assets";
import Loading from "@/components/UI/Loading";
import { toast } from "@/components/UI/Toast/toast";
import { atomUser, updateUserBalanceAtom } from "@/store/user.store";
import { ICheckIn, IDailyAttendance } from "@/utils/type";
import { clearCache, useRequest } from "ahooks";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";

const DailyQuest = () => {
  const {
    data: checkInData,
    refresh,
    loading,
  } = useRequest(getCheckIn, {
    cacheKey: "check-in",
    staleTime: 5 * 60 * 1000,
  });
  const [checkingDay, setCheckingDay] = useState<number | null>(null);
  const setUserBalance = useSetAtom(updateUserBalanceAtom);
  const setUser = useSetAtom(atomUser);
  const checkIn: ICheckIn | null = checkInData?.data?.data || null;
  const { data: dailyAttendanceData } = useRequest(getDailyAttendance, {
    cacheKey: "daily-attendance",
    staleTime: 5 * 60 * 1000,
  });

  const [dailyAttendance, setDailyAttendance] = useState<IDailyAttendance>();

  useEffect(() => {
    setDailyAttendance(dailyAttendanceData?.data?.data);
  }, [dailyAttendanceData]);

  const initialQuests = [
    { day: 1, coin: dailyAttendance?.day_1, img: CoinStack },
    { day: 2, coin: dailyAttendance?.day_2, img: CoinStack },
    { day: 3, coin: dailyAttendance?.day_3, img: CoinStack2 },
    { day: 4, coin: dailyAttendance?.day_4, img: CoinStack3 },
    { day: 5, coin: dailyAttendance?.day_5, img: CoinStack3 },
    { day: 6, coin: dailyAttendance?.day_6, img: Rewards },
    { day: 7, coin: dailyAttendance?.day_7, img: Rewards7 },
  ];

  type Quest = (typeof initialQuests)[number];

  const handleClick = async (idx: number) => {
    if (!checkIn || checkingDay !== null) return;
    const dayNumber = idx + 1;
    const isToday = dayNumber === Number(checkIn.nextCheckinDay);
    const canCheckIn = isToday && checkIn.currentCheckin === false;

    if (canCheckIn) {
      setCheckingDay(dayNumber);
      try {
        await postCheckIn();
        const reward = Number(initialQuests[idx].coin);
        setUser((prev) => {
          if (!prev) return prev;
          const newBalance = prev.point + reward;
          setUserBalance(newBalance);
          return { ...prev, point: newBalance };
        });
        clearCache("check-in");
        refresh();
        toast.success("Check-in successfully!");
      } catch (err) {
        toast.error("Check-in failed!");
        console.log(err);
      } finally {
        setCheckingDay(null);
      }
    }
  };

  return (
    <>
      {loading ? (
        <Loading className="min-h-[75vh]" />
      ) : (
        <div className="grid grid-cols-3 gap-4 justify-center h-[80dvh] pb-10 overflow-y-auto scrollbar-hide ">
          {initialQuests.map((quest: Quest, idx: number) => {
            const dayNumber = idx + 1;
            const isChecked =
              checkIn && dayNumber < Number(checkIn.nextCheckinDay);
            const canCheckIn =
              checkIn &&
              dayNumber === Number(checkIn.nextCheckinDay) &&
              !checkIn.currentCheckin;
            const isThisDayChecking = checkingDay === dayNumber;

            if (quest.day === 7) {
              const rewardImg7 = isChecked ? Like : Rewards7;
              const nextDay = Number(checkIn?.nextCheckinDay);

              return (
                <div
                  key={quest.day}
                  className="col-span-3 h-[200px] max-sm:h-[180px] flex justify-center"
                >
                  <div
                    className={`relative w-[50%] h-full overflow-hidden ${
                      nextDay === quest.day && !checkIn?.currentCheckin
                        ? "bg-[#0000003D] border-2 border-[#47FFFF] rounded-xl"
                        : "bg-[#0000003D] border-2 border-[#47FFFF66] rounded-xl"
                    }`}
                    style={{
                      cursor:
                        canCheckIn && !isThisDayChecking
                          ? "pointer"
                          : "not-allowed",
                      opacity: loading || isThisDayChecking ? 0.5 : 1,
                      pointerEvents:
                        loading || isThisDayChecking ? "none" : "auto",
                    }}
                    onClick={() => handleClick(idx)}
                  >
                    {isThisDayChecking && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-[14px]">
                        <div className="bg-white bg-opacity-90 rounded-lg p-3 flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <p className="text-xs font-medium text-gray-700">
                            Checking...
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="w-full text-left text-white text-custom-sm-bold px-2 pt-2 drop-shadow">
                        DAY {quest.day}
                      </div>

                      <div className="flex-1 flex items-center justify-center relative">
                        <div
                          className="w-20 h-20 absolute inset-0 m-auto opacity-30 bg-cyan-300 rounded-full blur-[20px] z-0"
                          style={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        />
                        <img
                          src={rewardImg7}
                          alt="Reward"
                          className="w-14 h-14 z-10 relative"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-1 pb-3">
                        <img
                          src={balanceLogo2}
                          alt="Coin"
                          className="w-6 h-6"
                        />
                        <span className="text-white font-bold text-lg drop-shadow">
                          {Number(quest.coin ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const rewardImgOther = isChecked ? Like : quest.img;
            const nextDay = Number(checkIn?.nextCheckinDay);

            return (
              <div
                key={quest.day}
                className={`relative w-full h-[200px] max-sm:h-[180px] shadow-lg cursor-pointer overflow-hidden ${
                  nextDay === quest.day && !checkIn?.currentCheckin
                    ? "bg-[#0000003D] border-2 border-[#47FFFF] rounded-xl"
                    : "bg-[#0000003D] border-2 border-[#47FFFF66] rounded-xl"
                }`}
                style={{
                  cursor:
                    canCheckIn && !isThisDayChecking
                      ? "pointer"
                      : "not-allowed",
                  opacity: loading || isThisDayChecking ? 0.5 : 1,
                  pointerEvents: loading || isThisDayChecking ? "none" : "auto",
                }}
                onClick={() => handleClick(idx)}
              >
                {isThisDayChecking && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-[14px]">
                    <div className="bg-white bg-opacity-90 rounded-lg p-3 flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="text-xs font-medium text-gray-700">
                        Checking...
                      </p>
                    </div>
                  </div>
                )}
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="w-full text-left text-white text-custom-sm-bold px-2 pt-2 drop-shadow">
                    DAY {quest.day}
                  </div>

                  <div className="flex-1 flex items-center justify-center relative">
                    <div
                      className="w-20 h-20 absolute inset-0 m-auto opacity-30 bg-cyan-300 rounded-full blur-[20px] z-0"
                      style={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    />
                    <img
                      src={rewardImgOther}
                      alt="Reward"
                      className="w-14 h-14 z-10 relative"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1 pb-3">
                    <img src={balanceLogo2} alt="Coin" className="w-6 h-6" />
                    <span className="text-white font-bold text-lg drop-shadow">
                      {Number(quest.coin ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default DailyQuest;
