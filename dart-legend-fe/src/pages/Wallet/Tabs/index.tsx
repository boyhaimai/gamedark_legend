import { useState, startTransition, useEffect } from "react";
import WrapperPage from "@/components/Section/WrapperPage";
import { getWalletHistory } from "@/api/wallet/wallet";
import { useRequest } from "ahooks";
import { IWalletHistory } from "@/utils/type";
import { formatNumberDot2 } from "@/utils/fc.utils";
import { Loading } from "@/components/UI";
import Disconnect from "./Disconnect";
import WalletOrder from "./WalletOrder";
import EmptyState from "@/components/UI/EmptyState/EmptyState";
import SendTo from "./SendTo";

const WalletTableHeader = [
  {
    label: "TIME",
    align: "left",
  },
  {
    label: "AMOUNT",
    align: "right",
  },
  // {
  //   label: "STATUS",
  //   align: "right",
  // },
];

const tabs = ["DEPOSIT", "WITHDRAW", "WALLET", "SEND TO"];
const WalletPage = () => {
  const [activeTab, setActiveTab] = useState("DEPOSIT");
  const [tabIndicatorPosition, setTabIndicatorPosition] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletHistory, setWalletHistory] = useState<IWalletHistory[]>([]);

  const { data, loading, refresh } = useRequest(getWalletHistory, {
    cacheKey: "wallet-history",
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setWalletHistory(data.data.data);
    }
  }, [data]);

  const filteredHistory =
    activeTab === "WALLET"
      ? walletHistory
      : walletHistory.filter((item) => item.type === activeTab.toLowerCase());

  const handleTabChange = (tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
      const tabIndex = tabs.findIndex((t) => t === tab);
      setTabIndicatorPosition(tabIndex * 100);
    });
  };

  const renderTabContent = () => {
    return (
      <div>
        {activeTab === "WALLET" ? (
          <Disconnect />
        ) : activeTab === "SEND TO" ? (
          <SendTo refresh={refresh} />
        ) : (
          <WalletOrder
            type={activeTab as "DEPOSIT" | "WITHDRAW"}
            amount={activeTab === "DEPOSIT" ? depositAmount : withdrawAmount}
            setAmount={
              activeTab === "DEPOSIT" ? setDepositAmount : setWithdrawAmount
            }
            refresh={refresh}
          />
        )}
      </div>
    );
  };
  return (
    <WrapperPage showMenu={false}>
      <div className="animate-fade-in">
        <div className="m-4">
          <div className="flex bg-[#00000080] border-2 border-[#47FFFF66] rounded-lg p-[2px] w-full mx-auto relative overflow-hidden">
            <div
              className="absolute top-[2px] left-[2px] h-[calc(100%-3px)] overflow-hidden bg-[#47FFFF] rounded-lg tab-indicator transition-all duration-300"
              style={{
                width: "calc(25% - 1px)",
                transform: `translateX(${tabIndicatorPosition}%)`,
              }}
            ></div>

            {tabs.map((tab, index) => (
              <div className="relative w-full" key={index}>
                <button
                  onClick={() => handleTabChange(tab)}
                  className={`w-full transition-all rounded-lg duration-150 text-center py-[10px] relative z-10 ${
                    activeTab === tab ? "active" : ""
                  }`}
                >
                  <div
                    className={`justify-start text-black text-sm font-bold ${
                      activeTab === tab ? "text-black" : "text-white"
                    }`}
                  >
                    {tab}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {renderTabContent()}
      </div>
      {activeTab === "DEPOSIT" && (
        // || activeTab === "WITHDRAW"
        <>
          {loading ? (
            <Loading />
          ) : (
            <div className="m-4">
              <div
                className="bg-[#0000003D] rounded-[16px] p-[4px]"
                style={{
                  boxShadow: "0px 0px 1px 1px #FFFFFF59 inset",
                }}
              >
                <div className=" px-4 pb-5 rounded-xl max-h-[88dvh] overflow-y-auto scrollbar-hide">
                  <div className="flex sticky  pt-4 top-0 z-20 items-center pb-2 border-b-1 border-solid border-[#B1C7E4]">
                    {WalletTableHeader.map((item, idx) => (
                      <p
                        key={idx}
                        className={`w-full text-white text-custom-sm-bold tracking-tight ${item.align}`}
                      >
                        {item.label}
                      </p>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 pt-3 z-10">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((item, idx) => {
                        return (
                          <div
                            key={idx}
                            className="flex py-2 border-b border-[#444] last:border-b-0"
                          >
                            <p className="w-full text-white text-start text-custom-sm-bold">
                              {new Date(item.createdAt).toLocaleString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <p className="w-full text-white text-right text-custom-sm-bold">
                              {formatNumberDot2(item.amount)}
                            </p>
                            {/* <p className="w-full text-white text-custom-sm-bold text-right">
                              {item.status}
                            </p> */}
                          </div>
                        );
                      })
                    ) : (
                      <EmptyState />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </WrapperPage>
  );
};

export default WalletPage;
