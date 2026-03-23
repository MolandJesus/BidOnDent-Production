import { AnimatePresence } from "motion/react";

import DashboardStandaloneScreens from "./DashboardStandaloneScreens";
import DashboardTabScreens from "./DashboardTabScreens";
import type { DashboardRouterProps } from "./dashboard-router-types";

export default function DashboardRouterScreens(props: DashboardRouterProps) {
  const activeScreen =
    props.viewMode === "dashboard" ? (
      <DashboardTabScreens {...props} />
    ) : (
      <DashboardStandaloneScreens {...props} />
    );

  return <AnimatePresence mode="wait">{activeScreen}</AnimatePresence>;
}
