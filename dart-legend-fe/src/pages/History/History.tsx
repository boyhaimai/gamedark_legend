import { getGame } from "@/api/game/game";
import { getHistoryTransaction } from "@/api/wallet/wallet";
import { balanceLogo } from "@/assets";
import HeaderNormalPage from "@/components/Section/Header/HeaderNormalPage";
import WrapperPage from "@/components/Section/WrapperPage";
import { Loading } from "@/components/UI";
import EmptyState from "@/components/UI/EmptyState/EmptyState";
import { useUserInfo } from "@/hooks/useUserInfo";
import { getAvatarUrl, getOpponentAvatar } from "@/utils/avatar";
import { formatNumber } from "@/utils/fc.utils";
import { IHistory, IWalletHistory, TransactionType } from "@/utils/type";
import { useRequest } from "ahooks";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type TabType = "game" | "nft";

const TABLE_HEADERS = [
  { label: "TIME", align: "text-left" },
  { label: "OPPONENT", align: "text-left" },
  { label: "RESULT", align: "text-right" },
  { label: "POINT", align: "text-right" },
] as const;

const getOpponentUsername = (game: IHistory, userId?: string): string => {
  if (!userId) return "Unknown";

  if (game.user_1 === userId) {
    return game.detail.user_2.username;
  }

  if (game.user_2 === userId) {
    return game.detail.user_1.username;
  }

  return "Unknown";
};

const getGameStats = (game: IHistory, userId?: string) => {
  if (!userId) return { totalPoint: 0, totalOpponentPoint: 0, isWin: false };

  const isUser1 = game.user_1 === userId;
  const totalPoint = isUser1
    ? game.total_point_user_1
    : game.total_point_user_2;
  const totalOpponentPoint = isUser1
    ? game.total_point_user_2
    : game.total_point_user_1;
  const isWin = userId === game.winner?._id;

  return { totalPoint, totalOpponentPoint, isWin };
};

const TableHeader = () => (
  <div className="flex sticky px-4 pt-4 top-0 z-20 items-center pb-2 border-b-1 border-solid border-[#FFFFFF66]">
    {TABLE_HEADERS.map((item, index) => (
      <p
        key={index}
        className={`w-full text-white text-sm font-bold ${item.align}`}
      >
        {item.label}
      </p>
    ))}
  </div>
);

const HistoryRow = ({ game, userId }: { game: IHistory; userId?: string }) => {
  const opponentUsername = getOpponentUsername(game, userId);
  const opponentAvatar = getOpponentAvatar(game, userId);
  const { totalPoint, totalOpponentPoint, isWin } = getGameStats(game, userId);

  const pointClass = `w-full text-custom-sm-bold flex items-center justify-end gap-1 text-right ${
    isWin ? "text-[#04FF05]" : "text-[#FF2D55]"
  }`;

  const formattedTime = useMemo(() => {
    return new Date(game.createdAt).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [game.createdAt]);

  return (
    <div className="flex items-center py-2">
      <p className="w-full text-white text-start text-sm font-bold">
        {formattedTime}
      </p>
      <p className="w-full flex items-center gap-2">
        <img
          src={getAvatarUrl(opponentAvatar)}
          alt="opponent"
          className="w-7 h-7 rounded-full border border-white object-cover"
        />
        <p className="text-white text-sm font-bold truncate max-w-[110px]">
          {opponentUsername}
        </p>
      </p>
      <p className={pointClass}>
        {formatNumber(totalPoint)}/{formatNumber(totalOpponentPoint)}
      </p>
      <p className={pointClass}>
        {isWin ? formatNumber(game.winner.point) : 0}
        <img src={balanceLogo} className="w-6 h-6 " />
      </p>
    </div>
  );
};

const HistoryTable = ({
  history,
  userId,
}: {
  history: IHistory[];
  userId?: string;
}) => (
  <div className="pb-5 rounded-xl max-h-[89dvh] overflow-y-auto scrollbar-hide">
    <TableHeader />
    <div className="flex flex-col gap-3 pt-3 z-10 px-4">
      {history.length > 0 ? (
        history.map((game, idx) => (
          <HistoryRow key={`${game._id}-${idx}`} game={game} userId={userId} />
        ))
      ) : (
        <EmptyState />
      )}
    </div>
  </div>
);

const WALLET_HISTORY_HEADERS = [
  { label: "TIME", align: "text-left" },
  { label: "TYPE", align: "text-left" },
  { label: "AMOUNT", align: "text-right" },
] as const;

const WalletHistoryTableHeader = () => (
  <div className="flex sticky px-4 pt-4 top-0 z-20 items-center pb-2 border-b-1 border-solid border-[#FFFFFF66]">
    {WALLET_HISTORY_HEADERS.map((item, index) => (
      <p
        key={index}
        className={`w-full text-white text-sm font-bold ${item.align}`}
      >
        {item.label}
      </p>
    ))}
  </div>
);

const WalletRow = ({
  transaction,
}: {
  transaction: IWalletHistory;
}) => {

  const { dateStr, timeStr } = useMemo(() => {
    const dateObj = new Date(transaction.createdAt);
    return {
      dateStr: dateObj.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      }),
      timeStr: dateObj.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, [transaction.createdAt]);

  const isPositive = useMemo(() => {
    switch (transaction.type) {
      // Positive types
      case TransactionType.WIN_GAME:
      case TransactionType.REFERRAL:
      case TransactionType.MISSION:
      case TransactionType.COMMISSION_REWARD:
      case TransactionType.NFT_REWARD:
      case TransactionType.NFT_REWARD_SGC:
        return true;

      // Negative types
      case TransactionType.GAME:
      case TransactionType.BUY_NFT:
      case TransactionType.BUY_NFT_REWARD:
        return false;

      default:
        return Number(transaction.amount) > 0;
    }
  }, [transaction]);

  const getTypeLabel = () => {
    switch (transaction.type) {
      case TransactionType.GAME:
        return "Game Fee";
      case TransactionType.WIN_GAME:
        return "Win Game";
      case TransactionType.REFERRAL:
        return "Referral Bonus";
      case TransactionType.MISSION:
        return "Mission Reward";
      case TransactionType.BUY_NFT:
        return "Buy NFT";
      case TransactionType.COMMISSION_REWARD:
        return "Commission";
      case TransactionType.BUY_NFT_REWARD:
        return "Buy NFT Reward";
      case TransactionType.NFT_REWARD:
        return "NFT Reward";
      case TransactionType.NFT_REWARD_SGC:
        return "NFT Reward SGC";

      default:
        return transaction.type;
    }
  };

  const typeLabel = getTypeLabel();

  return (
    <div className="flex items-center py-2 h-auto min-h-[50px]">
      <div className="w-full text-white text-start text-sm font-bold flex flex-col">
        <span>{dateStr}</span>
        <span>{timeStr}</span>
      </div>
      <div
        className="w-full text-white text-sm font-bold flex flex-col whitespace-normal break-words pr-2"
        title={typeLabel}
      >
        <span>{typeLabel}</span>
      </div>
      <p
        className={`w-full text-custom-sm-bold flex items-center justify-end gap-1 text-right ${
          isPositive ? "text-[#04FF05]" : "text-[#FF2D55]"
        }`}
      >
        {isPositive ? "+" : "-"}
        {formatNumber(Math.abs(transaction.amount))}{" "}
        <img src={balanceLogo} alt="icon" />
      </p>
    </div>
  );
};

const WalletHistoryTable = ({
  historyData,
  loading,
  page,
  totalPages,
  onPageChange,
}: {
  historyData: IWalletHistory[];
  loading: boolean;
  currentUsername?: string;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}) => {
  return (
    <div className="rounded-xl max-h-[89dvh] flex flex-col h-full">
      <WalletHistoryTableHeader />
      <div className="flex flex-col gap-3 pt-3 z-10 px-4 flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-white text-sm">Loading...</div>
          </div>
        ) : historyData?.length > 0 ? (
          historyData?.map((tx, idx) => (
            <WalletRow
              key={`${tx._id}-${idx}`}
              transaction={tx}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-2 mt-auto border-t border-[#FFFFFF33]">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className={`px-3 py-1 rounded bg-[#ffffff1a] text-white text-sm font-bold ${
              page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#ffffff33]"
            }`}
          >
            Prev
          </button>
          <span className="text-white text-sm font-bold">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className={`px-3 py-1 rounded bg-[#ffffff1a] text-white text-sm font-bold ${
              page >= totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#ffffff33]"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const History = () => {
  const navigate = useNavigate();
  const { user } = useUserInfo();
  const [activeTab, setActiveTab] = useState<TabType>("game");
  const [tabIndicatorPosition, setTabIndicatorPosition] = useState(0);

  // Pagination state for Wallet History
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const { data, loading } = useRequest(getGame, {
    cacheKey: "history",
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: walletData,
    loading: loadingWallet,
  } = useRequest(
    () => getHistoryTransaction({ page, limit: LIMIT }),
    {
      refreshDeps: [page],
      cacheKey: `wallet-history-${page}`,
      staleTime: 5 * 60 * 1000,
    }
  );

  const history = useMemo(() => data?.data?.data ?? [], [data]);
  const walletHistory = useMemo(
    () => walletData?.data?.data ?? [],
    [walletData]
  );
  const totalWalletPages = useMemo(
    () => walletHistory?.totalPages || 1, // Assuming API returns totalPage
    [walletHistory]
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const tabIndex = tab === "game" ? 0 : 1;
    setTabIndicatorPosition(tabIndex * 100);
  };

  return (
    <WrapperPage showMenu={false} animationType="fade-up" show={true}>
      <HeaderNormalPage title="HISTORY" onBack={handleBack} />
      {/* Tab Buttons - Rank Style */}
      <div className="mb-4 p-2">
        <div className="flex bg-[#00000080] border-2 border-[#47FFFF66] rounded-lg p-[2px] w-full mx-auto relative overflow-hidden">
          <div
            className="absolute top-[2px] left-[2px] h-[calc(100%-3px)] overflow-hidden bg-[#47FFFF] rounded-lg tab-indicator transition-all duration-300"
            style={{
              width: "calc(50% - 1px)",
              transform: `translateX(${tabIndicatorPosition}%)`,
            }}
          ></div>
          <button
            onClick={() => handleTabChange("game")}
            className={`w-full transition-all rounded-lg duration-150 text-center py-[10px] relative z-10 ${
              activeTab === "game" ? "active" : ""
            }`}
          >
            <div
              className={`justify-start text-sm font-bold ${
                activeTab === "game" ? "text-black" : "text-white"
              }`}
            >
              GAME HISTORY
            </div>
          </button>
          <button
            onClick={() => handleTabChange("nft")}
            className={`w-full transition-all rounded-lg duration-150 text-center py-[10px] relative z-10 ${
              activeTab === "nft" ? "active" : ""
            }`}
          >
            <div
              className={`justify-start text-sm font-bold ${
                activeTab === "nft" ? "text-black" : "text-white"
              }`}
            >
              HISTORY TRANSACTION
            </div>
          </button>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-hidden flex flex-col">
        <div
          className="bg-[#00000080] rounded-[16px] p-[4px] flex-1 flex flex-col overflow-hidden"
          style={{
            boxShadow: "0px 0px 1px 1px #FFFFFF59 inset",
          }}
        >
          {/* Tab Content */}
          {loading ? (
            <Loading />
          ) : (
            <>
              {activeTab === "game" && (
                <HistoryTable history={history} userId={user?._id} />
              )}
              {activeTab === "nft" && (
                <WalletHistoryTable
                  historyData={walletHistory.data || []}
                  loading={loadingWallet}
                  page={page}
                  totalPages={totalWalletPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </WrapperPage>
  );
};


export default History;
