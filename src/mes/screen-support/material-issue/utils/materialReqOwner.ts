import { InventoryOwnerType } from '../../../host/api-types';
import type { MaterialReq } from '../../../host/services';

export function getMaterialReqOwnerType(req: MaterialReq | null | undefined): InventoryOwnerType {
  const ownerType = req?.ownerType;
  if (ownerType === InventoryOwnerType.CUSTOMER) return InventoryOwnerType.CUSTOMER;
  if (ownerType === InventoryOwnerType.SUPPLIER) return InventoryOwnerType.SUPPLIER;
  return InventoryOwnerType.COMPANY;
}

export function getMaterialReqOwnerRefId(req: MaterialReq | null | undefined): string | undefined {
  return req?.ownerRefId ?? undefined;
}

export function getMaterialReqOwnerLabel(req: MaterialReq | null | undefined): string {
  const ownerType = getMaterialReqOwnerType(req);
  if (ownerType === InventoryOwnerType.CUSTOMER) return '客户供料';
  if (ownerType === InventoryOwnerType.SUPPLIER) return '供应商货主';
  return '公司库存';
}

export function getMaterialReqStockKey(
  req: MaterialReq,
  materialId: string = req.materialId,
): string {
  return [materialId, getMaterialReqOwnerType(req), getMaterialReqOwnerRefId(req) ?? ''].join(':');
}
