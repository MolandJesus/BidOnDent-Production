import ShopDetailSheet from "./ShopDetailSheet";
import EstimateRequestSheet from "./EstimateRequestSheet";
import MapBidSheet from "../maps/MapBidSheet";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { useShopDirectoryActions } from "../../hooks/useShopDirectoryActions";

type ShopDirectorySheetsProps = {
  actions: ReturnType<typeof useShopDirectoryActions>;
  isDark: boolean;
  isDetailShopSaved: boolean;
  onGetDirections: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  onToggleSave: (shop: ShopMapListing) => void;
};

export default function ShopDirectorySheets({
  actions,
  isDark,
  isDetailShopSaved,
  onGetDirections,
  onRequestEstimate,
  onToggleSave,
}: ShopDirectorySheetsProps) {
  return (
    <>
      <ShopDetailSheet
        shop={actions.detailShop}
        onClose={() => actions.setDetailShop(null)}
        onGetDirections={onGetDirections}
        onRequestEstimate={onRequestEstimate}
        isSaved={isDetailShopSaved}
        onToggleSave={onToggleSave}
        isDark={isDark}
      />
      <EstimateRequestSheet
        shop={actions.estimateShop}
        onClose={() => actions.setEstimateShop(null)}
        onSubmit={actions.handleSubmitEstimate}
        isSubmitting={actions.estimateSubmitting}
        error={actions.estimateError}
        isDark={isDark}
      />
      <MapBidSheet
        report={actions.bidReport}
        onClose={() => actions.setBidReport(null)}
        onSubmit={actions.handleSubmitBid}
        isSubmitting={actions.bidSubmitting}
        error={actions.bidError}
        isDark={isDark}
      />
    </>
  );
}
