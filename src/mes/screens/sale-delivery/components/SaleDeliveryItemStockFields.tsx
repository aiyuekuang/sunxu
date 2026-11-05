import { useCallback } from 'react';
import { FormField } from '../../../../core/components/FormField.tsx';
import { StockBalancePreview } from '../../warehouse/components/StockBalancePreview.tsx';
import {
  StockLocationField,
  type SelectedStockLocation,
} from '../../warehouse/components/StockLocationField.tsx';
import type { DraftItem } from '../../../types/draft-item';

interface SaleDeliveryItemStockFieldsProps {
  item: DraftItem;
  warehouseId?: string | null;
  selectedLocation: SelectedStockLocation | null;
  onLocationChange: (itemKey: string, location: SelectedStockLocation | null) => void;
  onStorageLocationChange: (itemKey: string, value: string) => void;
  /** 整箱出库时仓位由包装箱明细带出，不允许在明细行单独改仓位。 */
  packageUnitSelected?: boolean;
}

function parsePositiveQty(value?: string): number | undefined {
  const parsed = Number(value);
  return value?.trim() && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function SaleDeliveryItemStockFields({
  item,
  warehouseId,
  selectedLocation,
  onLocationChange,
  onStorageLocationChange,
  packageUnitSelected = false,
}: SaleDeliveryItemStockFieldsProps) {
  const handleLocationChange = useCallback(
    (location: SelectedStockLocation | null) => {
      onLocationChange(item.key, location);
    },
    [item.key, onLocationChange],
  );

  const handleStorageLocationChange = useCallback(
    (value: string) => {
      onStorageLocationChange(item.key, value);
    },
    [item.key, onStorageLocationChange],
  );

  const requiredQty = parsePositiveQty(item.quantity);

  return (
    <>
      {packageUnitSelected ? (
        <FormField
          label="出库仓位"
          value={selectedLocation?.pathName || item.storageLocation || '由包装箱带出'}
          editable={false}
        />
      ) : (
        <StockLocationField
          label="出库仓位"
          action="stock/out"
          warehouseId={warehouseId}
          value={selectedLocation}
          onChange={handleLocationChange}
          storageLocation={item.storageLocation ?? ''}
          onStorageLocationChange={handleStorageLocationChange}
          showStorageLocationText
          materialId={item.material?.id}
          batchNo={item.batchNo}
          minAvailableQty={requiredQty}
        />
      )}
      <StockBalancePreview
        warehouseId={warehouseId}
        materialId={item.material?.id}
        locationId={item.locationId}
        storageLocation={item.storageLocation}
        batchNo={item.batchNo}
        requiredQty={requiredQty}
      />
    </>
  );
}
