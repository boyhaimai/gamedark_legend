import { balanceLogo2 } from "@/assets";
import { Loading } from "@/components/UI";
import { IReferral } from "@/utils/type";

const tableHeader = [
  {
    label: "Your friends",
    align: "text-left",
  },
  {
    label: "You have earned",
    align: "text-right",
  },
];

export default function Invited({
  data,
  loading,
}: {
  data: IReferral[];
  loading: boolean;
}) {
  return (
    <div className="mt-6 bg-[#00000080] border-1 border-solid border-[#47FFFF] rounded-[16px] p-[4px]">
      <div className="p-[18px] pb-[20px] rounded-[12px]">
        <div className="flex items-center justify-between pb-2 border-b-1 border-solid border-[#47FFFF]">
          {tableHeader.map((item, index) => (
            <p
              key={index}
              className={`text-sm font-bold text-white ${item.align}`}
            >
              {item.label}
            </p>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-3 scrollable overflow-auto overflow-x-hidden max-h-[330px]">
            {data?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-white">
                    {item.params.username}
                  </p>
                </div>
                <div className="flex items-center gap-[2px]">
                  <img src={balanceLogo2} className="w-5 h-5" />
                  <p className=" text-[#04FF05] text-sm font-bold text-center">
                    {item.reward}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
