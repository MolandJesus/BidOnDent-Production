import { useEffect } from "react";

import DashboardRouterScreens from "./DashboardRouterScreens";
import type { DashboardRouterProps } from "./dashboard-router-types";

export type { DashboardRouterProps } from "./dashboard-router-types";

export default function DashboardRouter(props: DashboardRouterProps) {
  const { viewMode, currentTab } = props;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode, currentTab]);

  return (
    <div className="w-full">
      <DashboardRouterScreens {...props} />
    </div>
  );
}
