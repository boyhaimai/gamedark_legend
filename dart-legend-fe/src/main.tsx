import "./polyfills";
import { NextUIProvider } from "@nextui-org/react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Provider } from "jotai";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./styles/global.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import UITonProvider from "@/GlobalProvider";
import SocketListener from "@/service/socket/SocketListener";
import { Buffer } from "buffer";
window.Buffer = Buffer;

dayjs.extend(duration);

createRoot(document.getElementById("root")!).render(
  <Provider>
    <UITonProvider>
      <NextUIProvider>
        <Toaster position="top-center" duration={5000} />
        <SocketListener />
        <RouterProvider router={router} />
      </NextUIProvider>
    </UITonProvider>
  </Provider>
);
