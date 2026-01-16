const Invitation = () => {
  return (
    <div className="self-stretch p-4 bg-black/25 rounded-xl outline outline-1 outline-offset-[-1px] outline-cyan-300/40 backdrop-blur-sm inline-flex flex-col justify-center items-start gap-4">
      <div className="self-stretch inline-flex justify-between items-start">
        <div className="flex-1 relative rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,0.15)] flex justify-start items-center gap-2">
          <div className="w-52 h-10 left-[2.43px] top-0 absolute rounded-lg" />
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
        <div className="justify-start text-white text-xs font-normal font-['Roboto_Mono'] [text-shadow:_0px_2px_0px_rgb(0_0_0_/_0.15)]">
          12/12/2022, 08:23
        </div>
      </div>
      <div
        className="w-full
       inline-flex justify-start items-center gap-4"
      >
        <div className="flex-1 px-6 py-2 relative bg-cyan-300 rounded-lg  flex justify-center items-center gap-2.5">
          <div className="justify-start text-black text-lg font-normal font-['Squada_One'] uppercase leading-normal">
            Accept
          </div>
        </div>
        <div className="flex-1 px-6 py-2 relative bg-black/40 rounded-lg outline outline-2 outline-offset-[-2px] outline-cyan-300 flex justify-center items-center gap-2.5">
          <div className="justify-start text-cyan-300 text-lg font-normal font-['Squada_One'] uppercase leading-normal">
            Accept
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invitation;
