import { useEffect, useRef, useState } from 'react';
import { LossCustomerInboundDto } from '../../../types/models/LossCustomerInboundDto';
import {
  type CustomerExternalItem,
  customerInboundService,
} from '../../../host/services';
import type { Material } from '../../../host/services';
import { materialService } from '../../../host/services';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { CUSTOMER_INBOUND_LOSS_TYPE_OPTIONS } from '../../../constants/status-configs';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import {
  type SelectedStockLocation,
  StockLocationField,
} from '../../warehouse/components/StockLocationField.tsx';
import { createClientRequestId } from '../../../utils/client-request-id';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

export type CustomerInboundSheetMode = 'convert' | 'return' | 'loss';

interface CustomerInboundActionSheetProps {
  visible: boolean;
  mode: CustomerInboundSheetMode | null;
  item: CustomerExternalItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const fetchMaterials = (params: {
  page: number;
  pageSize: number;
  keyword?: string;
  categoryId?: string;
}) => materialService.list({ ...params });

function titleOf(mode: CustomerInboundSheetMode | null): string {
  if (mode === 'convert') return '转换为客户库存';
  if (mode === 'return') return '归还客户物品';
  if (mode === 'loss') return '登记损耗/遗失';
  return '客户来料处理';
}

export function CustomerInboundActionSheet({
  visible,
  mode,
  item,
  onClose,
  onSuccess,
}: CustomerInboundActionSheetProps) {
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [activeItem, setActiveItem] = useState<CustomerExternalItem | null>(null);
  const [material, setMaterial] = useState<Material | null>(null);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SelectedStockLocation | null>(null);
  const [locationRequired, setLocationRequired] = useState(false);
  const [batchNo, setBatchNo] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [dispositionQty, setDispositionQty] = useState('');
  const [remark, setRemark] = useState('');
  const [lossType, setLossType] = useState<LossCustomerInboundDto.lossType>(
    LossCustomerInboundDto.lossType.SCRAPPED,
  );
  const [loading, setLoading] = useState(false);
  const requestContextRef = useRef<string | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const shelfLifeDays = Number(
    material?.shelfLifeDays ?? material?.family?.defaultShelfLifeDays ?? 0,
  );
  const batchRequired = Boolean(material?.hasBatchTracking || shelfLifeDays > 0);

  useEffect(() => {
    if (visible) {
      const requestContext =
        mode === 'return' || mode === 'loss' ? `${mode}:${item?.id ?? ''}` : null;
      if (requestContext && requestContextRef.current !== requestContext) {
        requestContextRef.current = requestContext;
        requestIdRef.current = createClientRequestId(`customer-inbound.${mode}`);
      }
      setActiveItem(item);
      if (mode === 'convert') {
        setBatchNo('');
        setProductionDate('');
        setExpiryDate('');
        setMaterial((item?.linkedMaterial as Material | null) ?? null);
        setWarehouse((item?.custodyWarehouse as Warehouse | null) ?? null);
        setSelectedLocation(null);
        setLocationRequired(false);
      }
      if (item && (mode === 'return' || mode === 'loss')) {
        setWarehouse(null);
        setSelectedLocation(null);
        setLocationRequired(false);
        customerInboundService
          .detail(item.id)
          .then((detail) => {
            setActiveItem(detail);
            setWarehouse((detail.warehouse as Warehouse | null) ?? null);
            setSelectedLocation(
              detail.location
                ? {
                    id: detail.location.id,
                    warehouseId: detail.location.warehouseId,
                    code: detail.location.code,
                    name: detail.location.name,
                    pathName: detail.location.pathName || detail.location.name,
                  }
                : null,
            );
            setDispositionQty(
              String(detail.processableQty ?? (!detail.stockManaged ? detail.qty : '')),
            );
          })
          .catch(() => toast.error('客户来料详情加载失败'));
      }
      return;
    }
    if (!visible) {
      setActiveItem(null);
      setMaterial(null);
      setWarehouse(null);
      setSelectedLocation(null);
      setLocationRequired(false);
      setBatchNo('');
      setProductionDate('');
      setExpiryDate('');
      setDispositionQty('');
      setRemark('');
      setLossType(LossCustomerInboundDto.lossType.SCRAPPED);
      requestContextRef.current = null;
      requestIdRef.current = null;
    }
  }, [item, mode, visible]);

  const handleConfirm = async () => {
    const target = activeItem ?? item;
    if (!target || !mode) return;
    if (mode === 'convert' && (!material || !warehouse)) {
      toast.error('请选择正式物料和入库仓库');
      return;
    }
    if (mode === 'convert' && batchRequired && !batchNo.trim()) {
      toast.error('该物料需要批号追溯，请填写客户来料批号');
      return;
    }
    if (mode === 'convert' && shelfLifeDays > 0 && !productionDate && !expiryDate) {
      toast.error('该物料设置了保质期，请填写生产日期或有效期');
      return;
    }
    if (mode === 'convert' && locationRequired && !selectedLocation) {
      toast.error('当前入库仓要求选择仓位');
      return;
    }
    const stockDisposition = (mode === 'return' || mode === 'loss') && target.stockManaged;
    if (stockDisposition && !warehouse) {
      toast.error('请选择实际出库仓');
      return;
    }
    if (stockDisposition && locationRequired && !selectedLocation) {
      toast.error('当前出库仓要求选择仓位');
      return;
    }
    const maxProcessableQty =
      target.processableQty ?? (!target.stockManaged ? target.qty : undefined);
    const qty = Number(dispositionQty);
    if (mode === 'return' || mode === 'loss') {
      if (!Number.isFinite(qty) || qty < 0.0001) {
        toast.error('请输入大于 0 的本次数量');
        return;
      }
      if (maxProcessableQty === undefined || qty > Number(maxProcessableQty)) {
        toast.error('本次数量不能超过当前可处理数量');
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === 'convert' && material && warehouse) {
        await customerInboundService.convertToStock({
          id: target.id,
          materialId: material.id,
          warehouseId: warehouse.id,
          locationId: selectedLocation?.id,
          batchNo: batchNo.trim() || undefined,
          productionDate: productionDate || undefined,
          expiryDate: expiryDate || undefined,
          remark: remark.trim() || undefined,
        });
        toast.success('已转换为客户库存');
      }
      if (mode === 'return') {
        const idempotencyKey =
          requestIdRef.current ?? createClientRequestId('customer-inbound.return');
        requestIdRef.current = idempotencyKey;
        await customerInboundService.returnItem({
          id: target.id,
          idempotencyKey,
          qty,
          warehouseId: warehouse?.id,
          locationId: selectedLocation?.id,
          remark: remark.trim() || undefined,
        });
        toast.success('已登记归还');
      }
      if (mode === 'loss') {
        const idempotencyKey =
          requestIdRef.current ?? createClientRequestId('customer-inbound.loss');
        requestIdRef.current = idempotencyKey;
        await customerInboundService.loss({
          id: target.id,
          idempotencyKey,
          qty,
          warehouseId: warehouse?.id,
          locationId: selectedLocation?.id,
          lossType,
          remark: remark.trim() || undefined,
        });
        toast.success('已登记损耗/遗失');
      }
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const processableQtyLabel = (() => {
    const target = activeItem ?? item;
    if (!target) return '';
    if (target.processableQty !== undefined && target.processableQty !== null) {
      return formatQtyWithUnit(target.processableQty, target.unit, unitLabelMap);
    }
    if (!target.stockManaged) return formatQtyWithUnit(target.qty, target.unit, unitLabelMap);
    return '按客户货主库存可用量校验';
  })();

  return (
    <BottomSheet
      visible={visible}
      title={titleOf(mode)}
      onClose={onClose}
      confirmText="确认"
      onConfirm={() => {
        void handleConfirm();
      }}
      loading={loading}
      avoidKeyboard
      dynamicHeight
    >
      {mode === 'convert' && (
        <>
          <MaterialPickerField<Material>
            label="正式物料"
            required
            value={material}
            onChange={(value) => {
              setMaterial(value);
              setSelectedLocation(null);
              setLocationRequired(false);
              setBatchNo('');
              setProductionDate('');
              setExpiryDate('');
            }}
            fetchFn={fetchMaterials}
            keyExtractor={(record) => record.id}
            labelExtractor={(record) => record.name}
            sublabelExtractor={(record) => record.spec ?? ''}
          />
          <WarehousePickerField
            label="入库仓库"
            required
            value={warehouse}
            onChange={(value) => {
              setWarehouse(value);
              setSelectedLocation(null);
              setLocationRequired(false);
            }}
            sublabelExtractor={(record) => record.type ?? ''}
          />
          <StockLocationField
            label="入库仓位"
            action="stock/in"
            warehouseId={warehouse?.id}
            value={selectedLocation}
            onChange={setSelectedLocation}
            onRequirementChange={setLocationRequired}
          />
          <ScanInput
            label="批号"
            value={batchNo}
            onChangeText={setBatchNo}
            placeholder="扫码或输入批号"
            required={batchRequired}
          />
          {batchRequired ? (
            <>
              <DatePickerField
                label="生产日期"
                value={productionDate || undefined}
                onChange={setProductionDate}
                placeholder="按客户提供的标签填写"
              />
              <DatePickerField
                label="有效期至"
                value={expiryDate || undefined}
                onChange={setExpiryDate}
                placeholder="有标签时优先填写"
                required={shelfLifeDays > 0 && !productionDate}
                minimumDate={productionDate || undefined}
              />
              {shelfLifeDays > 0 ? (
                <Text>填写客户标签有效期优先；未提供时填生产日期，系统按物料保质期计算。</Text>
              ) : null}
            </>
          ) : null}
        </>
      )}
      {mode === 'loss' && (
        <ChipSelectField
          label="异常类型"
          required
          options={CUSTOMER_INBOUND_LOSS_TYPE_OPTIONS}
          value={lossType}
          onChange={(value) => setLossType(value as LossCustomerInboundDto.lossType)}
        />
      )}
      {(mode === 'return' || mode === 'loss') && (
        <>
          <FormField label="当前可处理数量" value={processableQtyLabel} editable={false} />
          {activeItem?.stockManaged && (
            <>
              <WarehousePickerField
                label="实际出库仓"
                required
                value={warehouse}
                onChange={(value) => {
                  setWarehouse(value);
                  setSelectedLocation(null);
                  setLocationRequired(false);
                }}
                sublabelExtractor={(record) => record.type ?? ''}
              />
              <StockLocationField
                label="实际出库仓位"
                action="stock/out"
                warehouseId={warehouse?.id}
                value={selectedLocation}
                onChange={setSelectedLocation}
                onRequirementChange={setLocationRequired}
                materialId={activeItem.linkedMaterialId}
                batchNo={activeItem.batchNo}
              />
            </>
          )}
          <QuickNumInput
            label={mode === 'return' ? '本次退料数量' : '本次损耗/遗失数量'}
            required
            value={dispositionQty}
            onChangeText={setDispositionQty}
            placeholder="请输入本次数量"
            min={0.0001}
            max={
              activeItem?.processableQty ??
              (!activeItem?.stockManaged ? activeItem?.qty : undefined)
            }
            precision={4}
            unit={formatUnitLabel(activeItem?.unit, unitLabelMap) || undefined}
            hint={processableQtyLabel ? `最多 ${processableQtyLabel}` : undefined}
          />
        </>
      )}
      <FormField label="说明" value={remark} onChangeText={setRemark} multiline numberOfLines={3} />
    </BottomSheet>
  );
}
