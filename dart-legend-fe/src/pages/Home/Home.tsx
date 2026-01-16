/* eslint-disable @typescript-eslint/no-explicit-any */
import { banner, logoGif } from "@/assets";
import HeaderBalance from "@/components/Section/Header/HeaderBalance";
import HeaderInfo from "@/components/Section/Header/HeaderInfo";
import WrapperPage from "@/components/Section/WrapperPage";

const Home = () => {
  return (
    <WrapperPage className="p-4" showMenu homePage>
      <div className="w-full flex flex-col justify-between gap-[95px] relative">
        <div className="flex items-center justify-between">
          <HeaderInfo />
          <HeaderBalance />
        </div>
        <div className="flex flex-col items-end justify-end relative">
          <img src={banner} alt="banner" />
          <img
            src={logoGif}
            className="object-contain cursor-pointer transition-transform absolute bottom-[-100px] right-"
            alt="Dart Logo "
          />
        </div>
      </div>
    </WrapperPage>
  );
};

export default Home;
