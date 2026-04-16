import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";
import { BadgeCheck, DollarSign, Clock } from "lucide-react";

export type PendingAcceptBid = {
  id: string | number;
  shopName: string;
  price: number;
  timeframe: string;
  estimatedDays: number;
};

type BidAcceptConfirmationDialogProps = {
  bid: PendingAcceptBid | null;
  isLight?: boolean;
  primaryColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function BidAcceptConfirmationDialog({
  bid,
  isLight = false,
  primaryColor = "#003d82",
  onConfirm,
  onCancel,
}: BidAcceptConfirmationDialogProps) {
  return (
    <AlertDialog open={bid !== null} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent
        className={`rounded-2xl border ${
          isLight
            ? "border-slate-200 bg-white text-slate-900"
            : "border-blue-200/15 bg-[#0f1d2e] text-slate-100"
        }`}
      >
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: `${primaryColor}20` }}
          >
            <BadgeCheck className="h-6 w-6" style={{ color: primaryColor }} />
          </div>
          <AlertDialogTitle
            className={`text-center text-lg font-semibold ${
              isLight ? "text-slate-900" : "text-slate-100"
            }`}
          >
            Accept this bid?
          </AlertDialogTitle>
          <AlertDialogDescription
            className={`text-center text-sm ${
              isLight ? "text-slate-500" : "text-blue-100/70"
            }`}
          >
            You are about to accept a bid from{" "}
            <span className="font-semibold">{bid?.shopName}</span>. Other
            pending bids on this report will be automatically rejected.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {bid && (
          <div
            className={`mx-auto flex w-full max-w-xs items-center justify-center gap-6 rounded-xl px-4 py-3 ${
              isLight ? "bg-slate-50" : "bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <DollarSign
                className={`h-4 w-4 ${isLight ? "text-emerald-600" : "text-emerald-400"}`}
              />
              <span className="text-sm font-semibold">
                ${bid.price.toLocaleString()}
              </span>
            </div>
            <div
              className={`h-4 w-px ${isLight ? "bg-slate-200" : "bg-white/10"}`}
            />
            <div className="flex items-center gap-1.5">
              <Clock
                className={`h-4 w-4 ${isLight ? "text-blue-600" : "text-blue-400"}`}
              />
              <span className="text-sm">{bid.timeframe}</span>
            </div>
          </div>
        )}

        <AlertDialogFooter className="mt-2 gap-2 sm:gap-2">
          <AlertDialogCancel
            className={`min-h-[44px] rounded-xl border font-medium ${
              isLight
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "border-blue-200/15 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="min-h-[44px] rounded-xl border-0 font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)`,
            }}
          >
            Accept Bid
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
