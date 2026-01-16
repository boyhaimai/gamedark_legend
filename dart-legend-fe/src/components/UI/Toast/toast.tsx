import clsx from "clsx";
import { toast as t } from "sonner";

export const toast = {
  success: (message: string) => {
    t.custom(() => (
      <div className="w-full justify-center flex items-center ">
        <div
          className={clsx(
            "flex items-center gap-3 justify-center bg-[#0000003D] w-fit px-3 py-2 rounded-lg shadow-toast "
          )}
        >
          <p className="text-white text-xs font-bold">{message}</p>
        </div>
      </div>
    ));
  },

  error: (message: string) => {
    t.custom(() => (
      <div className="w-full justify-center flex items-center ">
        <div className="flex items-center gap-3 justify-center bg-[#FF6C65] w-fit px-3 py-2 rounded-lg shadow-toast ">
          <p className="text-white text-xs font-bold">{message}</p>
        </div>
      </div>
    ));
  },
};
