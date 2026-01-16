const CardAdd = () => {
  return (
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
  );
};

export default CardAdd;
