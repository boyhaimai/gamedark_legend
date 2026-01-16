import { telegram } from "@/assets";

const NoData = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <img src={telegram} alt="No Data" className="w-16 h-16 opacity-60 mb-2" />
      <p className="text-white text-lg font-normal text-center">
        No friends invited yet
      </p>
    </div>
  );
};

export default NoData;
