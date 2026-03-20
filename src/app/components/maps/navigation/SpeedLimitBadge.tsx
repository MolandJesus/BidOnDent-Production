import { cn } from "../../ui/utils";

type SpeedLimitBadgeProps = {
  postedSpeedLimitMph?: number | null;
};

export default function SpeedLimitBadge({ postedSpeedLimitMph }: SpeedLimitBadgeProps) {
  return (
    <div className="grid h-[104px] w-[104px] place-items-center rounded-full border-[8px] border-rose-500 bg-white text-slate-950 shadow-[0_22px_52px_rgba(15,23,42,0.18)]">
      <div className="text-center leading-none">
        <div className="text-[9px] font-bold uppercase tracking-[0.22em]">Speed</div>
        <div className="mt-1 text-4xl font-black leading-none">
          {Number.isFinite(postedSpeedLimitMph) ? Math.round(Number(postedSpeedLimitMph)) : "--"}
        </div>
        <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em]">Limit</div>
      </div>
    </div>
  );
}
