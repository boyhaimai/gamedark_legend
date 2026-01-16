/* eslint-disable react-refresh/only-export-components */
import AuthGlobalLayout from "@/layout/AuthGlobalLayout";
import Dart from "@/pages/Dart/Dart";
import Friends from "@/pages/Friends/Friends";
import GameTransition from "@/pages/game/GameTransition";
import History from "@/pages/History/History";
import InventoryPage from "@/pages/Inventory";
import Quests from "@/pages/Quests/Quests";
import Rank from "@/pages/Rank/Rank";
import Store from "@/pages/Store";
import Wallet from "@/pages/Wallet/Wallet";
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ROUTE_PATH } from "./route-path";
// import CreateRoom from "@/pages/Home/CreateGame";
// import InvitationList from "@/pages/InvitationList";
// import Chat from "@/pages/Chat/index";
const HomeLazy = lazy(() => import("@/pages/Home/Home"));

export const router = createBrowserRouter([
  {
    path: ROUTE_PATH.HOME,
    element: <AuthGlobalLayout />,
    children: [
      {
        path: ROUTE_PATH.HOME,
        element: (
          <Suspense>
            <HomeLazy />
          </Suspense>
        ),
      },
      {
        path: ROUTE_PATH.FRIENDS,
        element: (
          <>
            <Friends />
          </>
        ),
      },
      {
        path: ROUTE_PATH.RANK,
        element: (
          <>
            <Rank />
          </>
        ),
      },
      {
        path: ROUTE_PATH.QUESTS,
        element: (
          <>
            <Quests />
          </>
        ),
      },

      {
        path: ROUTE_PATH.LOADING_GAME,
        element: (
          <>
            <GameTransition />
          </>
        ),
      },
      {
        path: ROUTE_PATH.DART,
        element: (
          <>
            <Dart />
          </>
        ),
      },
      {
        path: ROUTE_PATH.WALLET,
        element: (
          <>
            <Wallet />
          </>
        ),
      },
      {
        path: ROUTE_PATH.NFT,
        element: (
          <>
            <Store />
          </>
        ),
      },

      {
        path: ROUTE_PATH.INVENTORY,
        element: (
          <>
            <InventoryPage />
          </>
        ),
      },
      {
        path: ROUTE_PATH.HISTORY,
        element: (
          <>
            <History />
          </>
        ),
      },
      // {
      //   path: ROUTE_PATH.CREATE_ROOM,
      //   element: (
      //     <>
      //       <CreateRoom />
      //     </>
      //   ),
      // },
      // {
      //   path: ROUTE_PATH.INVITATION_LIST,
      //   element: (
      //     <>
      //       <InvitationList />
      //     </>
      //   ),
      // },
      // {
      //   path: ROUTE_PATH.CHAT,
      //   element: (
      //     <>
      //       <Chat />
      //     </>
      //   ),
      // },
    ],
  },
]);
