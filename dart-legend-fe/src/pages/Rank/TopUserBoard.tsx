import { balanceLogo, Rank1, Rank2, Rank3, User } from "@/assets";
import GradientNineSliceBox from "@/components/Section/Gradient";
import EmptyState from "@/components/UI/EmptyState/EmptyState";
import Loading from "@/components/UI/Loading";
import { formatNumber } from "@/utils/fc.utils";

export const topUsers = [
  {
    bg: "linear-gradient(180deg, #00FCFF 0%, #FC1CFF 100%)",
    img: Rank1,
  },
  {
    bg: "linear-gradient(90deg, #FF5858 0%, #F09819 100%)",
    img: Rank2,
  },
  {
    bg: "linear-gradient(90deg, #6A85B6 0%, #BAC8E0 100%)",
    img: Rank3,
  },
];

type UserBoardType = "pnl" | "referral";
type UserBoardData = {
  _id: string;
  username: string;
  value: number;
};

interface TopUserBoardProps {
  data: UserBoardData[];
  loading: boolean;
  type: UserBoardType;
}

const TopUserBoard = ({ data, loading, type }: TopUserBoardProps) => {
  const topThreeUsers = data.slice(0, 3);
  const remainingUsers = data.slice(3);

  return (
    <div>
      {loading ? (
        <Loading className="min-h-[75vh]" />
      ) : (
        <div className="mt-4">
          {data.length > 0 ? (
            <div className="pt-2 pb-20 px-2 scrollable overflow-y-auto h-[60dvh]">
              <div className="w-full space-y-4">
                {topThreeUsers.map((user, index) => (
                  <GradientNineSliceBox
                    key={user._id}
                    className="bg-[#0000003D]"
                    radius={12}
                    color={topUsers[index].bg}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={topUsers[index].img}
                        alt="img"
                        className="w-10 h-10"
                        style={{ minWidth: 40, minHeight: 40 }}
                      />
                      <span
                        className="text-white font-bold text-[14px] tracking-tight"
                        style={{ fontFamily: '"Roboto Mono", monospace' }}
                      >
                        {user.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className="text-white font-bold text-[14px] tracking-tight"
                        style={{ fontFamily: '"Roboto Mono", monospace' }}
                      >
                        {formatNumber(user.value ?? 0)}
                      </span>
                      <img
                        src={type === "pnl" ? balanceLogo : User}
                        className="w-6 h-6"
                        alt={type === "pnl" ? "balanceLogo" : "User"}
                      />
                    </div>
                  </GradientNineSliceBox>
                ))}
              </div>

              <div className="w-full mt-4 space-y-4">
                {remainingUsers.map((user, index) => (
                  <div
                    key={user._id}
                    className="bg-[#0000003D] border-2 border-[#FFFFFF3D] rounded-[12px] p-[10px] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 text-white rounded-lg flex justify-center items-center font-bold text-[14px] text-center shadow-[0px_1px_0px_0px_rgba(0,0,0,1.00)] outline outline-1 outline-offset-[-1px] outline-black"
                        style={{
                          background:
                            "linear-gradient(180deg, #5ACBF5 0%, #3AA8F7 100%)",
                        }}
                      >
                        {index + 4}
                      </div>
                      <div className="text-white text-sm font-bold">
                        {user.username}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <img
                        src={type === "pnl" ? balanceLogo : User}
                        className="w-6 h-6"
                        alt={type === "pnl" ? "balanceLogo" : "User"}
                      />
                      <div className="text-white text-sm font-bold">
                        {formatNumber(user.value ?? 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </div>
  );
};

export default TopUserBoard;
