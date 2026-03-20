import type { LifecycleStep } from "./RepairLifecycleTimeline";

export function customerLifecycle(status: string): LifecycleStep[] {
  const normalized = String(status || "pending").toLowerCase();

  const stepStates = {
    intake: "completed",
    bids: "current",
    selected: "upcoming",
    scheduled: "upcoming",
    completed: "upcoming",
  } as const;

  if (["quoted", "reviewing"].includes(normalized)) {
    stepStates.intake = "completed";
    stepStates.bids = "current";
  }

  if (["accepted", "in-progress", "active"].includes(normalized)) {
    stepStates.intake = "completed";
    stepStates.bids = "completed";
    stepStates.selected = "completed";
    stepStates.scheduled = "current";
  }

  if (["completed", "resolved"].includes(normalized)) {
    stepStates.intake = "completed";
    stepStates.bids = "completed";
    stepStates.selected = "completed";
    stepStates.scheduled = "completed";
    stepStates.completed = "completed";
  }

  return [
    {
      id: "intake",
      label: "Report Submitted",
      description: "Damage details and photos were received.",
      status: stepStates.intake,
    },
    {
      id: "bids",
      label: "Shops Reviewing",
      description: "Certified shops are preparing bids.",
      status: stepStates.bids,
    },
    {
      id: "selected",
      label: "Bid Selected",
      description: "A preferred shop bid has been chosen.",
      status: stepStates.selected,
    },
    {
      id: "scheduled",
      label: "Repair Scheduled",
      description: "Repair is scheduled and in execution.",
      status: stepStates.scheduled,
    },
    {
      id: "completed",
      label: "Repair Complete",
      description: "Repair finished and job closed.",
      status: stepStates.completed,
    },
  ];
}

export function shopLifecycle(status: string): LifecycleStep[] {
  const normalized = String(status || "pending").toLowerCase();
  const submitted = ["pending", "reviewing", "quoted", "accepted", "in-progress", "completed"].includes(normalized);
  const awarded = ["accepted", "in-progress", "completed"].includes(normalized);
  const completed = ["completed"].includes(normalized);

  return [
    {
      id: "request",
      label: "Request Received",
      description: "Customer request is available for review.",
      status: submitted ? "completed" : "current",
    },
    {
      id: "bid",
      label: "Bid Submitted",
      description: "Your quote and timeline were shared.",
      status: submitted ? "completed" : "current",
    },
    {
      id: "awarded",
      label: "Job Awarded",
      description: "Customer selected your bid.",
      status: awarded ? "completed" : "upcoming",
    },
    {
      id: "execution",
      label: "Repair Execution",
      description: "Work in progress with milestone tracking.",
      status: awarded && !completed ? "current" : completed ? "completed" : "upcoming",
    },
    {
      id: "closure",
      label: "Job Closed",
      description: "Repair complete and finalized.",
      status: completed ? "completed" : "upcoming",
    },
  ];
}

export function insurerLifecycle(status: string): LifecycleStep[] {
  const normalized = String(status || "pending").toLowerCase();
  const reviewed = ["reviewing", "approved", "denied", "completed"].includes(normalized);
  const approved = ["approved", "completed"].includes(normalized);
  const denied = ["denied"].includes(normalized);

  return [
    {
      id: "claim",
      label: "Claim Submitted",
      description: "Claim entered with supporting damage data.",
      status: "completed",
    },
    {
      id: "review",
      label: "Coverage Review",
      description: "Policy and repair scope validation.",
      status: reviewed ? "completed" : "current",
    },
    {
      id: "decision",
      label: "Decision",
      description: denied ? "Claim denied with rationale." : "Claim approved and funding assigned.",
      status: denied || approved ? "completed" : "upcoming",
    },
    {
      id: "assignment",
      label: "Shop Assignment",
      description: "Partner shop selected for repair execution.",
      status: approved ? "current" : "upcoming",
    },
    {
      id: "settlement",
      label: "Settlement",
      description: "Claim settled after verified completion.",
      status: normalized === "completed" ? "completed" : "upcoming",
    },
  ];
}
