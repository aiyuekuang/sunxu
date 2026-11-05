/** Type-only MES API contracts and opt-in host service adapters. No request runs during import. */

export interface MesHostServiceImplementations {
  announcementService?: typeof import('./contracts/services/announcement.service.d.ts').announcementService;
  appUpdateService?: typeof import('./contracts/services/app-update.service.d.ts').appUpdateService;
  approvalService?: typeof import('./contracts/services/approval.service.d.ts').approvalService;
  batchService?: typeof import('./contracts/services/batch.service.d.ts').batchService;
  capaService?: typeof import('./contracts/services/capa.service.d.ts').capaService;
  cashAdvanceService?: typeof import('./contracts/services/cash-advance.service.d.ts').cashAdvanceService;
  customFieldService?: typeof import('./contracts/services/custom-field.service.d.ts').customFieldService;
  customerInboundService?: typeof import('./contracts/services/customer-inbound.service.d.ts').customerInboundService;
  customerMaterialDispositionService?: typeof import('./contracts/services/customer-material-disposition.service.d.ts').customerMaterialDispositionService;
  customerMaterialService?: typeof import('./contracts/services/customer-material.service.d.ts').customerMaterialService;
  customerService?: typeof import('./contracts/services/customer.service.d.ts').customerService;
  dictService?: typeof import('./contracts/services/dict.service.d.ts').dictService;
  disposalService?: typeof import('./contracts/services/disposal.service.d.ts').disposalService;
  equipmentFaultService?: typeof import('./contracts/services/equipment-fault.service.d.ts').equipmentFaultService;
  equipmentMaintenanceTemplateService?: typeof import('./contracts/services/equipment-maintenance-template.service.d.ts').equipmentMaintenanceTemplateService;
  equipmentSessionService?: typeof import('./contracts/services/equipment-session.service.d.ts').equipmentSessionService;
  equipmentService?: typeof import('./contracts/services/equipment.service.d.ts').equipmentService;
  financeService?: typeof import('./contracts/services/finance.service.d.ts').financeService;
  forecastService?: typeof import('./contracts/services/forecast.service.d.ts').forecastService;
  fundsService?: typeof import('./contracts/services/funds.service.d.ts').fundsService;
  internalIssueService?: typeof import('./contracts/services/internal-issue.service.d.ts').internalIssueService;
  materialCategoryService?: typeof import('./contracts/services/material-category.service.d.ts').materialCategoryService;
  materialIssueService?: typeof import('./contracts/services/material-issue.service.d.ts').materialIssueService;
  materialService?: typeof import('./contracts/services/material.service.d.ts').materialService;
  materialSupplierService?: typeof import('./contracts/services/material.service.d.ts').materialSupplierService;
  bomService?: typeof import('./contracts/services/material.service.d.ts').bomService;
  mrpService?: typeof import('./contracts/services/mrp.service.d.ts').mrpService;
  notificationService?: typeof import('./contracts/services/notification.service.d.ts').notificationService;
  oeeService?: typeof import('./contracts/services/oee.service.d.ts').oeeService;
  packageUnitService?: typeof import('./contracts/services/package-unit.service.d.ts').packageUnitService;
  permissionService?: typeof import('./contracts/services/permission.service.d.ts').permissionService;
  pieceworkService?: typeof import('./contracts/services/piecework.service.d.ts').pieceworkService;
  processRouteService?: typeof import('./contracts/services/process-route.service.d.ts').processRouteService;
  productSerialService?: typeof import('./contracts/services/product-serial.service.d.ts').productSerialService;
  productionPlanService?: typeof import('./contracts/services/production-plan.service.d.ts').productionPlanService;
  productionReceiptService?: typeof import('./contracts/services/production-receipt.service.d.ts').productionReceiptService;
  productionSupplyService?: typeof import('./contracts/services/production-supply.service.d.ts').productionSupplyService;
  purchaseLandedCostService?: typeof import('./contracts/services/purchase-landed-cost.service.d.ts').purchaseLandedCostService;
  purchaseOrderService?: typeof import('./contracts/services/purchase-order.service.d.ts').purchaseOrderService;
  purchaseReceiptService?: typeof import('./contracts/services/purchase-receipt.service.d.ts').purchaseReceiptService;
  purchaseRequisitionService?: typeof import('./contracts/services/purchase-requisition.service.d.ts').purchaseRequisitionService;
  purchaseReturnService?: typeof import('./contracts/services/purchase-return.service.d.ts').purchaseReturnService;
  qualityTemplateService?: typeof import('./contracts/services/quality-template.service.d.ts').qualityTemplateService;
  qualityService?: typeof import('./contracts/services/quality.service.d.ts').qualityService;
  quotationService?: typeof import('./contracts/services/quotation.service.d.ts').quotationService;
  reportBatchOptionService?: typeof import('./contracts/services/report-batch-option.service.d.ts').reportBatchOptionService;
  reportService?: typeof import('./contracts/services/report.service.d.ts').reportService;
  saleDeliveryService?: typeof import('./contracts/services/sale-delivery.service.d.ts').saleDeliveryService;
  saleOrderService?: typeof import('./contracts/services/sale-order.service.d.ts').saleOrderService;
  saleReturnService?: typeof import('./contracts/services/sale-return.service.d.ts').saleReturnService;
  scanService?: typeof import('./contracts/services/scan.service.d.ts').scanService;
  scheduleService?: typeof import('./contracts/services/schedule.service.d.ts').scheduleService;
  spcService?: typeof import('./contracts/services/spc.service.d.ts').spcService;
  stockCountService?: typeof import('./contracts/services/stock-count.service.d.ts').stockCountService;
  supplierService?: typeof import('./contracts/services/supplier.service.d.ts').supplierService;
  temporaryWorkerService?: typeof import('./contracts/services/temporary-worker.service.d.ts').temporaryWorkerService;
  ticketService?: typeof import('./contracts/services/ticket.service.d.ts').ticketService;
  todoService?: typeof import('./contracts/services/todo.service.d.ts').todoService;
  toolingService?: typeof import('./contracts/services/tooling.service.d.ts').toolingService;
  uploadService?: typeof import('./contracts/services/upload.service.d.ts').uploadService;
  userService?: typeof import('./contracts/services/user.service.d.ts').userService;
  warehouseLocationService?: typeof import('./contracts/services/warehouse-location.service.d.ts').warehouseLocationService;
  warehouseService?: typeof import('./contracts/services/warehouse.service.d.ts').warehouseService;
  workCenterService?: typeof import('./contracts/services/work-center.service.d.ts').workCenterService;
  workOrderService?: typeof import('./contracts/services/work-order.service.d.ts').workOrderService;
}

type ServiceName = keyof MesHostServiceImplementations;
let configuredServices: MesHostServiceImplementations = {};

export function configureMesHostServices(services: MesHostServiceImplementations): void {
  configuredServices = { ...configuredServices, ...services };
}

export function resetMesHostServices(): void {
  configuredServices = {};
}

function createServiceProxy<T extends object>(name: ServiceName): T {
  return new Proxy({}, {
    get(_target, property) {
      if (property === 'then') return undefined;
      return (...args: unknown[]) => {
        const service = configuredServices[name] as object | undefined;
        const member = service ? Reflect.get(service, property) : undefined;
        if (typeof member !== 'function') {
          return Promise.reject(new Error(`Sunxu MES host service '${String(name)}' is not configured (method '${String(property)}').`));
        }
        return Reflect.apply(member, service, args);
      };
    },
  }) as T;
}

export const announcementService = createServiceProxy<typeof import('./contracts/services/announcement.service.d.ts').announcementService>('announcementService');
export const appUpdateService = createServiceProxy<typeof import('./contracts/services/app-update.service.d.ts').appUpdateService>('appUpdateService');
export const approvalService = createServiceProxy<typeof import('./contracts/services/approval.service.d.ts').approvalService>('approvalService');
export const batchService = createServiceProxy<typeof import('./contracts/services/batch.service.d.ts').batchService>('batchService');
export const capaService = createServiceProxy<typeof import('./contracts/services/capa.service.d.ts').capaService>('capaService');
export const cashAdvanceService = createServiceProxy<typeof import('./contracts/services/cash-advance.service.d.ts').cashAdvanceService>('cashAdvanceService');
export const customFieldService = createServiceProxy<typeof import('./contracts/services/custom-field.service.d.ts').customFieldService>('customFieldService');
export const customerInboundService = createServiceProxy<typeof import('./contracts/services/customer-inbound.service.d.ts').customerInboundService>('customerInboundService');
export const customerMaterialDispositionService = createServiceProxy<typeof import('./contracts/services/customer-material-disposition.service.d.ts').customerMaterialDispositionService>('customerMaterialDispositionService');
export const customerMaterialService = createServiceProxy<typeof import('./contracts/services/customer-material.service.d.ts').customerMaterialService>('customerMaterialService');
export const customerService = createServiceProxy<typeof import('./contracts/services/customer.service.d.ts').customerService>('customerService');
export const dictService = createServiceProxy<typeof import('./contracts/services/dict.service.d.ts').dictService>('dictService');
export const disposalService = createServiceProxy<typeof import('./contracts/services/disposal.service.d.ts').disposalService>('disposalService');
export const equipmentFaultService = createServiceProxy<typeof import('./contracts/services/equipment-fault.service.d.ts').equipmentFaultService>('equipmentFaultService');
export const equipmentMaintenanceTemplateService = createServiceProxy<typeof import('./contracts/services/equipment-maintenance-template.service.d.ts').equipmentMaintenanceTemplateService>('equipmentMaintenanceTemplateService');
export const equipmentSessionService = createServiceProxy<typeof import('./contracts/services/equipment-session.service.d.ts').equipmentSessionService>('equipmentSessionService');
export const equipmentService = createServiceProxy<typeof import('./contracts/services/equipment.service.d.ts').equipmentService>('equipmentService');
export const financeService = createServiceProxy<typeof import('./contracts/services/finance.service.d.ts').financeService>('financeService');
export const forecastService = createServiceProxy<typeof import('./contracts/services/forecast.service.d.ts').forecastService>('forecastService');
export const fundsService = createServiceProxy<typeof import('./contracts/services/funds.service.d.ts').fundsService>('fundsService');
export const internalIssueService = createServiceProxy<typeof import('./contracts/services/internal-issue.service.d.ts').internalIssueService>('internalIssueService');
export const materialCategoryService = createServiceProxy<typeof import('./contracts/services/material-category.service.d.ts').materialCategoryService>('materialCategoryService');
export const materialIssueService = createServiceProxy<typeof import('./contracts/services/material-issue.service.d.ts').materialIssueService>('materialIssueService');
export const materialService = createServiceProxy<typeof import('./contracts/services/material.service.d.ts').materialService>('materialService');
export const materialSupplierService = createServiceProxy<typeof import('./contracts/services/material.service.d.ts').materialSupplierService>('materialSupplierService');
export const bomService = createServiceProxy<typeof import('./contracts/services/material.service.d.ts').bomService>('bomService');
export const mrpService = createServiceProxy<typeof import('./contracts/services/mrp.service.d.ts').mrpService>('mrpService');
export const notificationService = createServiceProxy<typeof import('./contracts/services/notification.service.d.ts').notificationService>('notificationService');
export const oeeService = createServiceProxy<typeof import('./contracts/services/oee.service.d.ts').oeeService>('oeeService');
export const packageUnitService = createServiceProxy<typeof import('./contracts/services/package-unit.service.d.ts').packageUnitService>('packageUnitService');
export const permissionService = createServiceProxy<typeof import('./contracts/services/permission.service.d.ts').permissionService>('permissionService');
export const pieceworkService = createServiceProxy<typeof import('./contracts/services/piecework.service.d.ts').pieceworkService>('pieceworkService');
export const processRouteService = createServiceProxy<typeof import('./contracts/services/process-route.service.d.ts').processRouteService>('processRouteService');
export const productSerialService = createServiceProxy<typeof import('./contracts/services/product-serial.service.d.ts').productSerialService>('productSerialService');
export const productionPlanService = createServiceProxy<typeof import('./contracts/services/production-plan.service.d.ts').productionPlanService>('productionPlanService');
export const productionReceiptService = createServiceProxy<typeof import('./contracts/services/production-receipt.service.d.ts').productionReceiptService>('productionReceiptService');
export const productionSupplyService = createServiceProxy<typeof import('./contracts/services/production-supply.service.d.ts').productionSupplyService>('productionSupplyService');
export const purchaseLandedCostService = createServiceProxy<typeof import('./contracts/services/purchase-landed-cost.service.d.ts').purchaseLandedCostService>('purchaseLandedCostService');
export const purchaseOrderService = createServiceProxy<typeof import('./contracts/services/purchase-order.service.d.ts').purchaseOrderService>('purchaseOrderService');
export const purchaseReceiptService = createServiceProxy<typeof import('./contracts/services/purchase-receipt.service.d.ts').purchaseReceiptService>('purchaseReceiptService');
export const purchaseRequisitionService = createServiceProxy<typeof import('./contracts/services/purchase-requisition.service.d.ts').purchaseRequisitionService>('purchaseRequisitionService');
export const purchaseReturnService = createServiceProxy<typeof import('./contracts/services/purchase-return.service.d.ts').purchaseReturnService>('purchaseReturnService');
export const qualityTemplateService = createServiceProxy<typeof import('./contracts/services/quality-template.service.d.ts').qualityTemplateService>('qualityTemplateService');
export const qualityService = createServiceProxy<typeof import('./contracts/services/quality.service.d.ts').qualityService>('qualityService');
export const quotationService = createServiceProxy<typeof import('./contracts/services/quotation.service.d.ts').quotationService>('quotationService');
export const reportBatchOptionService = createServiceProxy<typeof import('./contracts/services/report-batch-option.service.d.ts').reportBatchOptionService>('reportBatchOptionService');
export const reportService = createServiceProxy<typeof import('./contracts/services/report.service.d.ts').reportService>('reportService');
export const saleDeliveryService = createServiceProxy<typeof import('./contracts/services/sale-delivery.service.d.ts').saleDeliveryService>('saleDeliveryService');
export const saleOrderService = createServiceProxy<typeof import('./contracts/services/sale-order.service.d.ts').saleOrderService>('saleOrderService');
export const saleReturnService = createServiceProxy<typeof import('./contracts/services/sale-return.service.d.ts').saleReturnService>('saleReturnService');
export const scanService = createServiceProxy<typeof import('./contracts/services/scan.service.d.ts').scanService>('scanService');
export const scheduleService = createServiceProxy<typeof import('./contracts/services/schedule.service.d.ts').scheduleService>('scheduleService');
export const spcService = createServiceProxy<typeof import('./contracts/services/spc.service.d.ts').spcService>('spcService');
export const stockCountService = createServiceProxy<typeof import('./contracts/services/stock-count.service.d.ts').stockCountService>('stockCountService');
export const supplierService = createServiceProxy<typeof import('./contracts/services/supplier.service.d.ts').supplierService>('supplierService');
export const temporaryWorkerService = createServiceProxy<typeof import('./contracts/services/temporary-worker.service.d.ts').temporaryWorkerService>('temporaryWorkerService');
export const ticketService = createServiceProxy<typeof import('./contracts/services/ticket.service.d.ts').ticketService>('ticketService');
export const todoService = createServiceProxy<typeof import('./contracts/services/todo.service.d.ts').todoService>('todoService');
export const toolingService = createServiceProxy<typeof import('./contracts/services/tooling.service.d.ts').toolingService>('toolingService');
export const uploadService = createServiceProxy<typeof import('./contracts/services/upload.service.d.ts').uploadService>('uploadService');
export const userService = createServiceProxy<typeof import('./contracts/services/user.service.d.ts').userService>('userService');
export const warehouseLocationService = createServiceProxy<typeof import('./contracts/services/warehouse-location.service.d.ts').warehouseLocationService>('warehouseLocationService');
export const warehouseService = createServiceProxy<typeof import('./contracts/services/warehouse.service.d.ts').warehouseService>('warehouseService');
export const workCenterService = createServiceProxy<typeof import('./contracts/services/work-center.service.d.ts').workCenterService>('workCenterService');
export const workOrderService = createServiceProxy<typeof import('./contracts/services/work-order.service.d.ts').workOrderService>('workOrderService');

export type { AddWorkOrderOperationDto } from './contracts/services/work-order.service.d.ts';
export type { AgingRow } from './contracts/services/finance.service.d.ts';
export type { AllocationExecuteResponse } from './contracts/services/finance.service.d.ts';
export type { Announcement } from './contracts/services/announcement.service.d.ts';
export type { AnnouncementListParams } from './contracts/services/announcement.service.d.ts';
export type { AnnouncementPriority } from './contracts/services/announcement.service.d.ts';
export type { AnnouncementStatus } from './contracts/services/announcement.service.d.ts';
export type { AnnouncementTarget } from './contracts/services/announcement.service.d.ts';
export type { AnnouncementTargetType } from './contracts/services/announcement.service.d.ts';
export type { AppDownloadInfo } from './contracts/services/app-update.service.d.ts';
export type { AppReleaseHistory } from './contracts/services/app-update.service.d.ts';
export type { AppReleaseHistoryItem } from './contracts/services/app-update.service.d.ts';
export type { AppUpdateInfo } from './contracts/services/app-update.service.d.ts';
export type { ApprovalStepDetail } from './contracts/services/approval.service.d.ts';
export type { BatchConvertResult } from './contracts/services/sale-order.service.d.ts';
export type { BatchConvertToProductionDto } from './contracts/services/sale-order.service.d.ts';
export type { BatchProductSerialListItem } from './contracts/services/product-serial.service.d.ts';
export type { BatchProductSerialPage } from './contracts/services/product-serial.service.d.ts';
export type { BatchRelatedDocs } from './contracts/services/batch.service.d.ts';
export type { BatchStatus } from './contracts/services/batch.service.d.ts';
export type { BomScope } from './contracts/services/material.service.d.ts';
export type { BomStatus } from './contracts/services/material.service.d.ts';
export type { CalendarExceptionType } from './contracts/services/schedule.service.d.ts';
export type { CashAdvanceCounterpartyType } from './contracts/services/cash-advance.service.d.ts';
export type { CashAdvanceStatus } from './contracts/services/cash-advance.service.d.ts';
export type { ConvertInfoItem } from './contracts/services/sale-order.service.d.ts';
export type { ConvertInfoResult } from './contracts/services/sale-order.service.d.ts';
export type { ConvertItemInputDto } from './contracts/services/sale-order.service.d.ts';
export type { ConvertPrToOrdersResult } from './contracts/services/purchase-requisition.service.d.ts';
export type { ConvertedPurchaseOrder } from './contracts/services/purchase-requisition.service.d.ts';
export type { CreateAnnouncementDto } from './contracts/services/announcement.service.d.ts';
export type { CreateMaterialCategoryDto } from './contracts/services/material-category.service.d.ts';
export type { CreatePaymentParams } from './contracts/services/finance.service.d.ts';
export type { CreateQuotationDto } from './contracts/services/quotation.service.d.ts';
export type { CreateSaleDeliveryDto } from './contracts/services/sale-delivery.service.d.ts';
export type { CreateSaleOrderDto } from './contracts/services/sale-order.service.d.ts';
export type { CustomerLevel } from './contracts/services/customer.service.d.ts';
export type { CustomerMaterialsService } from './contracts/services/customer-material.service.d.ts';
export type { CustomerStatus } from './contracts/services/customer.service.d.ts';
export type { DashboardLargeScreen } from './contracts/services/report.service.d.ts';
export type { DashboardSnapshotResponse } from './contracts/services/report.service.d.ts';
export type { DefectSeverity } from './contracts/services/quality.service.d.ts';
export type { DictTypeDefinition } from './contracts/services/dict.service.d.ts';
export type { Equipment } from './contracts/services/equipment.service.d.ts';
export type { EquipmentInspection } from './contracts/services/equipment.service.d.ts';
export type { EquipmentInspectionTemplateItem } from './contracts/services/equipment.service.d.ts';
export type { EquipmentMaintenance } from './contracts/services/equipment.service.d.ts';
export type { EquipmentStatus } from './contracts/services/equipment.service.d.ts';
export type { ExecuteDisposalRequestDto } from './contracts/services/disposal.service.d.ts';
export type { ExpenseBillScene } from './contracts/services/funds.service.d.ts';
export type { ExpenseBillStatus } from './contracts/services/funds.service.d.ts';
export type { FaultStatus } from './contracts/services/equipment-fault.service.d.ts';
export type { FileDisplayInfo } from './contracts/services/upload.service.d.ts';
export type { FinanceInvoice } from './contracts/services/finance.service.d.ts';
export type { FinanceInvoiceCategory } from './contracts/services/finance.service.d.ts';
export type { FinanceInvoiceListItem } from './contracts/services/finance.service.d.ts';
export type { FinanceInvoiceStatus } from './contracts/services/finance.service.d.ts';
export type { FinanceInvoiceType } from './contracts/services/finance.service.d.ts';
export type { FinancePayment } from './contracts/services/finance.service.d.ts';
export type { FinancePaymentStatus } from './contracts/services/finance.service.d.ts';
export type { FinancePaymentType } from './contracts/services/finance.service.d.ts';
export type { ForecastGenerateParams } from './contracts/services/forecast.service.d.ts';
export type { ForecastListParams } from './contracts/services/forecast.service.d.ts';
export type { ForecastListResult } from './contracts/services/forecast.service.d.ts';
export type { ForecastResult } from './contracts/services/forecast.service.d.ts';
export type { GanttData } from './contracts/services/schedule.service.d.ts';
export type { GanttEntry } from './contracts/services/schedule.service.d.ts';
export type { GanttWorkCenter } from './contracts/services/schedule.service.d.ts';
export type { InspectionItem } from './contracts/services/equipment.service.d.ts';
export type { InspectionStatus } from './contracts/services/quality.service.d.ts';
export type { InspectionType } from './contracts/services/quality-template.service.d.ts';
export type { InternalIssueListParams } from './contracts/services/internal-issue.service.d.ts';
export type { InvestigationSeverity } from './contracts/services/capa.service.d.ts';
export type { InvestigationStatus } from './contracts/services/capa.service.d.ts';
export type { InvoiceListParams } from './contracts/services/finance.service.d.ts';
export type { ListPurchaseReceiptDto } from './contracts/services/purchase-receipt.service.d.ts';
export type { LossCustomerInboundInput } from './contracts/services/customer-inbound.service.d.ts';
export type { MaintenanceStatus } from './contracts/services/equipment.service.d.ts';
export type { MaintenanceStep } from './contracts/services/equipment.service.d.ts';
export type { MaterialCategory } from './contracts/services/material-category.service.d.ts';
export type { MaterialCategoryListItem } from './contracts/services/material-category.service.d.ts';
export type { MaterialCategoryListParams } from './contracts/services/material-category.service.d.ts';
export type { MaterialCategorySelectable } from './contracts/services/material-category.service.d.ts';
export type { MaterialCategorySelectableParams } from './contracts/services/material-category.service.d.ts';
export type { MaterialCategoryTreeNode } from './contracts/services/material-category.service.d.ts';
export type { MaterialCategoryTreeParams } from './contracts/services/material-category.service.d.ts';
export type { MaterialIssueListParams } from './contracts/services/material-issue.service.d.ts';
export type { MaterialIssueStatus } from './contracts/services/material-issue.service.d.ts';
export type { MaterialIssueType } from './contracts/services/material-issue.service.d.ts';
export type { MaterialListParams } from './contracts/services/material.service.d.ts';
export type { MaterialReqStatus } from './contracts/services/material-issue.service.d.ts';
export type { MaterialSupplierWithDefaultPrice } from './contracts/services/material.service.d.ts';
export type { MrpBomExplosionMode } from './contracts/services/mrp.service.d.ts';
export type { MrpCalculationMode } from './contracts/services/mrp.service.d.ts';
export type { MrpItem } from './contracts/services/mrp.service.d.ts';
export type { MrpItemSource } from './contracts/services/mrp.service.d.ts';
export type { MrpResult } from './contracts/services/mrp.service.d.ts';
export type { MrpSuggestion } from './contracts/services/mrp.service.d.ts';
export type { MyAnnouncementListParams } from './contracts/services/announcement.service.d.ts';
export type { NotificationLevel } from './contracts/services/notification.service.d.ts';
export type { NotificationListParams } from './contracts/services/notification.service.d.ts';
export type { NotificationListResult } from './contracts/services/notification.service.d.ts';
export type { NotificationPreference } from './contracts/services/notification.service.d.ts';
export type { NotificationType } from './contracts/services/notification.service.d.ts';
export type { OeeDashboard } from './contracts/services/oee.service.d.ts';
export type { OpenCreditListParams } from './contracts/services/finance.service.d.ts';
export type { OpenCreditRow } from './contracts/services/finance.service.d.ts';
export type { OpenCreditSourceType } from './contracts/services/finance.service.d.ts';
export type { PartnerSummary } from './contracts/services/finance.service.d.ts';
export type { PaymentAllocation } from './contracts/services/finance.service.d.ts';
export type { PaymentListParams } from './contracts/services/finance.service.d.ts';
export type { PendingApprovalItem } from './contracts/services/approval.service.d.ts';
export type { PlanListParams } from './contracts/services/production-plan.service.d.ts';
export type { PlanStatus } from './contracts/services/production-plan.service.d.ts';
export type { PrListParams } from './contracts/services/purchase-requisition.service.d.ts';
export type { PrStatus } from './contracts/services/purchase-requisition.service.d.ts';
export type { ProductionOutputBufferStatus } from './contracts/services/production-receipt.service.d.ts';
export type { ProductionReceiptStatus } from './contracts/services/production-receipt.service.d.ts';
export type { ProductionSupplyBizType } from './contracts/services/production-supply.service.d.ts';
export type { ProductionSupplyDetail } from './contracts/services/production-supply.service.d.ts';
export type { ProductionSupplyListParams } from './contracts/services/production-supply.service.d.ts';
export type { ProductionSupplyStatus } from './contracts/services/production-supply.service.d.ts';
export type { ProfitabilityTrialItem } from './contracts/services/finance.service.d.ts';
export type { ProfitabilityTrialParams } from './contracts/services/finance.service.d.ts';
export type { ProfitabilityTrialResponse } from './contracts/services/finance.service.d.ts';
export type { ProfitabilityTrialSummary } from './contracts/services/finance.service.d.ts';
export type { PurchaseOrder } from './contracts/services/purchase-order.service.d.ts';
export type { PurchaseOrderActionHint } from './contracts/services/purchase-order.service.d.ts';
export type { PurchaseOrderListParams } from './contracts/services/purchase-order.service.d.ts';
export type { PurchaseOrderListResult } from './contracts/services/purchase-order.service.d.ts';
export type { PurchaseOrderStatus } from './contracts/services/purchase-order.service.d.ts';
export type { PurchaseReceipt } from './contracts/services/purchase-receipt.service.d.ts';
export type { PurchaseReceiptDetail } from './contracts/services/purchase-receipt.service.d.ts';
export type { PurchaseReceiptPriceDiffItem } from './contracts/services/purchase-receipt.service.d.ts';
export type { PurchaseReceiptPriceSyncPreview } from './contracts/services/purchase-receipt.service.d.ts';
export type { PurchaseSourcingBaseItem } from './contracts/services/purchase-requisition.service.d.ts';
export type { PurchaseSourcingPreview } from './contracts/services/purchase-requisition.service.d.ts';
export type { PurchaseSourcingResolvedItem } from './contracts/services/purchase-requisition.service.d.ts';
export type { PurchaseSourcingUnresolvedItem } from './contracts/services/purchase-requisition.service.d.ts';
export type { QualityTemplate } from './contracts/services/quality-template.service.d.ts';
export type { Quotation } from './contracts/services/quotation.service.d.ts';
export type { QuotationItem } from './contracts/services/quotation.service.d.ts';
export type { QuotationItemDto } from './contracts/services/quotation.service.d.ts';
export type { QuotationStatus } from './contracts/services/quotation.service.d.ts';
export type { ReadStatsResult } from './contracts/services/announcement.service.d.ts';
export type { ReadStatsUser } from './contracts/services/announcement.service.d.ts';
export type { RealtimeDashboard } from './contracts/services/report.service.d.ts';
export type { ReceiptPackageMode } from './contracts/services/production-receipt.service.d.ts';
export type { ReportBatchOption } from './contracts/services/report-batch-option.service.d.ts';
export type { ReportBatchOptionSource } from './contracts/services/report-batch-option.service.d.ts';
export type { ReportBatchOptions } from './contracts/services/report-batch-option.service.d.ts';
export type { ReportBatchTraceabilityMode } from './contracts/services/report-batch-option.service.d.ts';
export type { ReportCatalogItem } from './contracts/services/report.service.d.ts';
export type { ReportCatalogResponse } from './contracts/services/report.service.d.ts';
export type { ReportDetailCode } from './contracts/services/report.service.d.ts';
export type { ReportDetailParams } from './contracts/services/report.service.d.ts';
export type { ReportDetailResult } from './contracts/services/report.service.d.ts';
export type { ReportDetailRow } from './contracts/services/report.service.d.ts';
export type { ReportDetailSummary } from './contracts/services/report.service.d.ts';
export type { ReportLogListResult } from './contracts/services/work-order.service.d.ts';
export type { ReportSummaryMetric } from './contracts/services/report.service.d.ts';
export type { ReportTabKey } from './contracts/services/report.service.d.ts';
export type { ReturnCustomerInboundInput } from './contracts/services/customer-inbound.service.d.ts';
export type { RouteStatus } from './contracts/services/process-route.service.d.ts';
export type { SaleDelivery } from './contracts/services/sale-delivery.service.d.ts';
export type { SaleDeliveryDetail } from './contracts/services/sale-delivery.service.d.ts';
export type { SaleDeliveryExecutionItemDto } from './contracts/services/sale-delivery.service.d.ts';
export type { SaleDeliveryItem } from './contracts/services/sale-delivery.service.d.ts';
export type { SaleDeliveryItemDto } from './contracts/services/sale-delivery.service.d.ts';
export type { SaleDeliveryStatus } from './contracts/services/sale-delivery.service.d.ts';
export type { SaleOrder } from './contracts/services/sale-order.service.d.ts';
export type { SaleOrderItem } from './contracts/services/sale-order.service.d.ts';
export type { SaleOrderItemDto } from './contracts/services/sale-order.service.d.ts';
export type { SaleOrderListParams } from './contracts/services/sale-order.service.d.ts';
export type { SaleOrderListResult } from './contracts/services/sale-order.service.d.ts';
export type { SaleOrderStatus } from './contracts/services/sale-order.service.d.ts';
export type { ScheduleDependencyFields } from './contracts/services/schedule.service.d.ts';
export type { ScheduleEntry } from './contracts/services/schedule.service.d.ts';
export type { ScheduleEntryUpdateResult } from './contracts/services/schedule.service.d.ts';
export type { ScheduleStatus } from './contracts/services/schedule.service.d.ts';
export type { SendStatementDto } from './contracts/services/finance.service.d.ts';
export type { SessionStatus } from './contracts/services/equipment-session.service.d.ts';
export type { ShipSaleDeliveryDto } from './contracts/services/sale-delivery.service.d.ts';
export type { ShipSaleDeliveryResponse } from './contracts/services/sale-delivery.service.d.ts';
export type { SpcAlertListParams } from './contracts/services/spc.service.d.ts';
export type { SpcAlertSeverity } from './contracts/services/spc.service.d.ts';
export type { SpcAlertStatus } from './contracts/services/spc.service.d.ts';
export type { SpcAlertType } from './contracts/services/spc.service.d.ts';
export type { StatementParams } from './contracts/services/finance.service.d.ts';
export type { StatementResult } from './contracts/services/finance.service.d.ts';
export type { StatementSendOptionDto } from './contracts/services/finance.service.d.ts';
export type { StatementSendOptionsResponseDto } from './contracts/services/finance.service.d.ts';
export type { StatementSendResultDto } from './contracts/services/finance.service.d.ts';
export type { StockCountListParams } from './contracts/services/stock-count.service.d.ts';
export type { StockCountStatus } from './contracts/services/stock-count.service.d.ts';
export type { StockInOperationType } from './contracts/services/warehouse.service.d.ts';
export type { StockOutOperationType } from './contracts/services/warehouse.service.d.ts';
export type { SupplierRating } from './contracts/services/supplier.service.d.ts';
export type { SupplierStatus } from './contracts/services/supplier.service.d.ts';
export type { Ticket } from './contracts/services/ticket.service.d.ts';
export type { TicketDetail } from './contracts/services/ticket.service.d.ts';
export type { TicketListResult } from './contracts/services/ticket.service.d.ts';
export type { TicketReply } from './contracts/services/ticket.service.d.ts';
export type { TicketStatus } from './contracts/services/ticket.service.d.ts';
export type { TodoCount } from './contracts/services/todo.service.d.ts';
export type { TodoListItem } from './contracts/services/todo.service.d.ts';
export type { TodoPriority } from './contracts/services/todo.service.d.ts';
export type { TodoStatus } from './contracts/services/todo.service.d.ts';
export type { TodoType } from './contracts/services/todo.service.d.ts';
export type { ToolingSessionStatus } from './contracts/services/tooling.service.d.ts';
export type { ToolingStatus } from './contracts/services/tooling.service.d.ts';
export type { TraceBatchLookup } from './contracts/services/batch.service.d.ts';
export type { TraceDirection } from './contracts/services/batch.service.d.ts';
export type { TraceGraph } from './contracts/services/batch.service.d.ts';
export type { TraceNode } from './contracts/services/batch.service.d.ts';
export type { TrendPoint } from './contracts/services/report.service.d.ts';
export type { UpdateAnnouncementDto } from './contracts/services/announcement.service.d.ts';
export type { UpdateDisposalDto } from './contracts/services/disposal.service.d.ts';
export type { UpdateMaterialCategoryDto } from './contracts/services/material-category.service.d.ts';
export type { UpdatePurchaseReceiptDto } from './contracts/services/purchase-receipt.service.d.ts';
export type { UpdateQuotationDto } from './contracts/services/quotation.service.d.ts';
export type { UpdateSaleDeliveryDto } from './contracts/services/sale-delivery.service.d.ts';
export type { UpdateSaleDeliveryExecutionDto } from './contracts/services/sale-delivery.service.d.ts';
export type { UpdateSaleOrderDto } from './contracts/services/sale-order.service.d.ts';
export type { UploadFileInput } from './contracts/services/upload.service.d.ts';
export type { WarehouseCandidateOrder } from './contracts/services/warehouse.service.d.ts';
export type { WarehousePickerOptions } from './contracts/services/warehouse.service.d.ts';
export type { WarehousePickerParams } from './contracts/services/warehouse.service.d.ts';
export type { WorkCenterBrief } from './contracts/services/work-center.service.d.ts';
export type { WorkOrderExecutionState } from './contracts/services/work-order.service.d.ts';
export type { WorkOrderListParams } from './contracts/services/work-order.service.d.ts';
export type { WorkOrderOperationStatus } from './contracts/services/work-order.service.d.ts';
export type { WorkOrderStatus } from './contracts/services/work-order.service.d.ts';
export type { WorkOrderType } from './contracts/services/work-order.service.d.ts';
export type { WorkOrderWithProgress } from './contracts/services/work-order.service.d.ts';

export type { AppliedSchedulePolicyDto } from './contracts/services/schedule.service.d.ts';
export type { ApprovalRecord } from './contracts/services/approval.service.d.ts';
export type { BatchListDto } from './contracts/services/batch.service.d.ts';
export type { BomHeader } from './contracts/services/material.service.d.ts';
export type { CalendarException } from './contracts/services/schedule.service.d.ts';
export type { CashAdvance } from './contracts/services/cash-advance.service.d.ts';
export type { ChildOrderSummary } from './contracts/services/work-order.service.d.ts';
export type { ControlChartData } from './contracts/services/spc.service.d.ts';
export type { CpkResult } from './contracts/services/spc.service.d.ts';
export type { CustomFieldDefinition } from './contracts/services/custom-field.service.d.ts';
export type { CustomFieldSchema } from './contracts/services/custom-field.service.d.ts';
export type { CustomFieldValues } from './contracts/services/custom-field.service.d.ts';
export type { Customer } from './contracts/services/customer.service.d.ts';
export type { CustomerExternalItem } from './contracts/services/customer-inbound.service.d.ts';
export type { CustomerMaterial } from './contracts/services/customer-material.service.d.ts';
export type { CustomerMaterialDispositionAvailableSourceDto } from './contracts/services/customer-material-disposition.service.d.ts';
export type { DashboardData } from './contracts/services/report.service.d.ts';
export type { DictItem } from './contracts/services/dict.service.d.ts';
export type { DisposalOrder } from './contracts/services/disposal.service.d.ts';
export type { EquipmentMaintenanceTemplate } from './contracts/services/equipment-maintenance-template.service.d.ts';
export type { EquipmentSession } from './contracts/services/equipment-session.service.d.ts';
export type { ExpenseBill } from './contracts/services/funds.service.d.ts';
export type { GenerateForecastResponseDto } from './contracts/services/forecast.service.d.ts';
export type { IndustryPack } from './contracts/services/dict.service.d.ts';
export type { IndustryPackPreview } from './contracts/services/dict.service.d.ts';
export type { InternalIssueItem } from './contracts/services/internal-issue.service.d.ts';
export type { InternalIssueOrder } from './contracts/services/internal-issue.service.d.ts';
export type { Material } from './contracts/services/material.service.d.ts';
export type { MaterialBatch } from './contracts/services/batch.service.d.ts';
export type { MaterialEffectiveProfileDto } from './contracts/services/material.service.d.ts';
export type { MaterialReadiness } from './contracts/services/material-issue.service.d.ts';
export type { MaterialReq } from './contracts/services/material-issue.service.d.ts';
export type { Notification } from './contracts/services/notification.service.d.ts';
export type { OeeRecord } from './contracts/services/oee.service.d.ts';
export type { OutboundPurchaseReturnDto } from './contracts/services/purchase-return.service.d.ts';
export type { OutboundPurchaseReturnItemDto } from './contracts/services/purchase-return.service.d.ts';
export type { PieceworkSummary } from './contracts/services/piecework.service.d.ts';
export type { PieceworkSummaryItem } from './contracts/services/piecework.service.d.ts';
export type { PlanWorkOrderItemDto } from './contracts/services/production-plan.service.d.ts';
export type { ProcessOperation } from './contracts/services/process-route.service.d.ts';
export type { ProcessRoute } from './contracts/services/process-route.service.d.ts';
export type { ProcessRouteApplicability } from './contracts/services/process-route.service.d.ts';
export type { ProductionOutputBuffer } from './contracts/services/production-receipt.service.d.ts';
export type { ProductionPlan } from './contracts/services/production-plan.service.d.ts';
export type { ProductionPlanNetDemandPreviewResponseDto } from './contracts/services/production-plan.service.d.ts';
export type { ProductionReceiptOrder } from './contracts/services/production-receipt.service.d.ts';
export type { ProductionReceiptReportSummary } from './contracts/services/production-receipt.service.d.ts';
export type { ProductionSupplyOrder } from './contracts/services/production-supply.service.d.ts';
export type { PurchaseLandedCost } from './contracts/services/purchase-landed-cost.service.d.ts';
export type { PurchaseOrderSendOptionDto } from './contracts/services/purchase-order.service.d.ts';
export type { PurchaseOrderSendOptionsResponseDto } from './contracts/services/purchase-order.service.d.ts';
export type { PurchaseRequisition } from './contracts/services/purchase-requisition.service.d.ts';
export type { PurchaseReturn } from './contracts/services/purchase-return.service.d.ts';
export type { PurchaseReturnDetail } from './contracts/services/purchase-return.service.d.ts';
export type { PurchaseReturnItem } from './contracts/services/purchase-return.service.d.ts';
export type { PurchaseReturnReturnableLineDto } from './contracts/services/purchase-return.service.d.ts';
export type { QualityDefect } from './contracts/services/quality.service.d.ts';
export type { QualityInspection } from './contracts/services/quality.service.d.ts';
export type { QualityInvestigation } from './contracts/services/capa.service.d.ts';
export type { QualitySummary } from './contracts/services/report.service.d.ts';
export type { QuotationSendOptionDto } from './contracts/services/quotation.service.d.ts';
export type { QuotationSendOptionsResponseDto } from './contracts/services/quotation.service.d.ts';
export type { ReportLogItem } from './contracts/services/work-order.service.d.ts';
export type { SaleReturn } from './contracts/services/sale-return.service.d.ts';
export type { SaleReturnItem } from './contracts/services/sale-return.service.d.ts';
export type { ScanEntityInfo } from './contracts/services/scan.service.d.ts';
export type { ScanParseResult } from './contracts/services/scan.service.d.ts';
export type { SchedulePolicyDto } from './contracts/services/schedule.service.d.ts';
export type { ShiftCalendar } from './contracts/services/schedule.service.d.ts';
export type { SpcAlert } from './contracts/services/spc.service.d.ts';
export type { SpcCharacteristicOption } from './contracts/services/spc.service.d.ts';
export type { StockBalancePreviewResponseDto } from './contracts/services/warehouse.service.d.ts';
export type { StockCountLine } from './contracts/services/stock-count.service.d.ts';
export type { StockCountListItemDto } from './contracts/services/stock-count.service.d.ts';
export type { StockLocationPrecheckResponseDto } from './contracts/services/warehouse.service.d.ts';
export type { StockTransaction } from './contracts/services/warehouse.service.d.ts';
export type { Supplier } from './contracts/services/supplier.service.d.ts';
export type { TemplateItem } from './contracts/services/quality-template.service.d.ts';
export type { TemporaryWorker } from './contracts/services/temporary-worker.service.d.ts';
export type { Tooling } from './contracts/services/tooling.service.d.ts';
export type { ToolingGateDto } from './contracts/services/tooling.service.d.ts';
export type { ToolingSession } from './contracts/services/tooling.service.d.ts';
export type { ToolingUsageRecord } from './contracts/services/tooling.service.d.ts';
export type { UpdateRequisitionArrivalDateItemDto } from './contracts/services/purchase-requisition.service.d.ts';
export type { WarehouseLocation } from './contracts/services/warehouse-location.service.d.ts';
export type { WarehouseLocationTreeNodeDto } from './contracts/services/warehouse-location.service.d.ts';
export type { WorkCenter } from './contracts/services/work-center.service.d.ts';
export type { WorkOrder } from './contracts/services/work-order.service.d.ts';
export type { WorkOrderDetail } from './contracts/services/work-order.service.d.ts';
export type { WorkOrderOperation } from './contracts/services/work-order.service.d.ts';

export interface FundsAccountServiceAdapter {
  fundsAccountControllerList(params: { isActive?: boolean; page?: number; pageSize?: number }): Promise<{ list?: unknown[]; total?: number }>;
}
export interface ScrapPolicyServiceAdapter {
  scrapPolicyControllerEvaluate(params: {
    materialId: string;
    customerId?: string;
    operationId?: string;
    processOperationId?: string;
    scrapReason?: string;
    completedQty: number;
    scrappedQty: number;
    plannedQty?: number;
  }): Promise<{
    matched?: boolean;
    policyName?: string | null;
    requiresPhoto?: boolean;
    requiresQualityJudgement?: boolean;
    requiresRootCause?: boolean;
    holdBatch?: boolean;
    actionMessage?: string;
  }>;
}
export interface MesHostGeneratedServices {
  FundsAccountService?: FundsAccountServiceAdapter;
  ScrapPolicyService?: ScrapPolicyServiceAdapter;
}
export interface MesHostServiceHelpers {
  fetchWarehousePickerOptions?: typeof import('./contracts/services/warehouse.service').fetchWarehousePickerOptions;
}
let generatedServices: MesHostGeneratedServices = {};
let hostHelpers: MesHostServiceHelpers = {};
export function configureMesHostGeneratedServices(value: MesHostGeneratedServices): void {
  generatedServices = { ...generatedServices, ...value };
}
export function configureMesHostServiceHelpers(value: MesHostServiceHelpers): void {
  hostHelpers = { ...hostHelpers, ...value };
}

function generatedServiceProxy<T extends object>(name: keyof MesHostGeneratedServices): T {
  return new Proxy({}, {
    get(_target, property) {
      return (...args: unknown[]) => {
        const service = generatedServices[name] as object | undefined;
        const member = service ? Reflect.get(service, property) : undefined;
        if (typeof member !== 'function') {
          return Promise.reject(new Error(`Sunxu host generated service '${String(name)}' is not configured.`));
        }
        return Reflect.apply(member, service, args);
      };
    },
  }) as T;
}

export const FundsAccountService = generatedServiceProxy<MesHostGeneratedServices['FundsAccountService'] & object>('FundsAccountService');
export const ScrapPolicyService = generatedServiceProxy<MesHostGeneratedServices['ScrapPolicyService'] & object>('ScrapPolicyService');

export class AppUpdateRequestInvalidatedError extends Error {
  constructor() {
    super('The app update request was invalidated by a newer server configuration.');
    this.name = 'AppUpdateRequestInvalidatedError';
  }
}
export type { AppUpdateSource } from './contracts/services/app-update.logic';

export { StatementSendChannel } from '../types/models/StatementSendChannel';
export type { StatementSendChannel as StatementSendChannelType } from '../types/models/StatementSendChannel';
export { PurchaseOrderSendChannel } from '../types/models/PurchaseOrderSendChannel';
export { QuotationSendChannel } from '../types/models/QuotationSendChannel';
export { WarehouseLocationControlMode } from '../types/models/WarehouseLocationControlMode';
export const StockTransactionType = {
  IN_OTHER: 'in_other',
  IN_RETURN: 'in_return',
  OUT_OTHER: 'out_other',
  OUT_SCRAP: 'out_scrap',
} as const;
export type StockTransactionType = (typeof StockTransactionType)[keyof typeof StockTransactionType];

export type Warehouse = import('./contracts/services/warehouse.service').Warehouse;
export type Stock = import('./contracts/services/warehouse.service').Stock;
export function compareWarehousesByDisplayOrder(left: Warehouse, right: Warehouse): number {
  return left.sortOrder - right.sortOrder ||
    left.code.localeCompare(right.code, 'zh-CN') ||
    left.name.localeCompare(right.name, 'zh-CN') ||
    left.createdAt.localeCompare(right.createdAt);
}
export function fetchWarehouseCandidateOptions(
  params: Parameters<typeof import('./contracts/services/warehouse.service').fetchWarehouseCandidateOptions>[0],
  candidates: readonly Warehouse[],
  order: Parameters<typeof import('./contracts/services/warehouse.service').fetchWarehouseCandidateOptions>[2] = 'display',
): Promise<{ list: Warehouse[]; total: number }> {
  const unique = new Map<string, Warehouse>();
  for (const warehouse of candidates) if (!unique.has(warehouse.id)) unique.set(warehouse.id, warehouse);
  const keyword = params.keyword?.trim().toLocaleLowerCase('zh-CN');
  const filtered = [...unique.values()].filter((warehouse) => !keyword ||
    warehouse.name.toLocaleLowerCase('zh-CN').includes(keyword) ||
    warehouse.code.toLocaleLowerCase('zh-CN').includes(keyword));
  const ordered = order === 'business-priority' ? filtered : filtered.sort(compareWarehousesByDisplayOrder);
  const page = Math.max(params.page, 1);
  const pageSize = Math.max(params.pageSize, 1);
  const start = (page - 1) * pageSize;
  return Promise.resolve({ list: ordered.slice(start, start + pageSize), total: ordered.length });
}
export function fetchWarehousePickerOptions(
  params: Parameters<typeof import('./contracts/services/warehouse.service').fetchWarehousePickerOptions>[0],
  options?: Parameters<typeof import('./contracts/services/warehouse.service').fetchWarehousePickerOptions>[1],
): Promise<{ list: Warehouse[]; total: number }> {
  const helper = hostHelpers.fetchWarehousePickerOptions;
  if (!helper) return Promise.reject(new Error('The host app must configure fetchWarehousePickerOptions.'));
  return helper(params, options);
}
export function getPurchaseReturnItemUnit(item: import('./contracts/services/purchase-return.service').PurchaseReturnItem): string {
  return item.material?.unit ?? item.sourceReceiptItem?.material?.unit ?? '';
}
export function getSaleReturnItemUnit(item: import('./contracts/services/sale-return.service').SaleReturnItem): string {
  return item.material?.unit ?? item.sourceDeliveryItem?.material?.unit ?? '';
}
export function getToolingLifePercent(tooling: import('./contracts/services/tooling.service').Tooling): number {
  if (typeof tooling.lifePercent === 'number') return Math.min(Math.max(Math.round(tooling.lifePercent), 0), 100);
  let percent = 0;
  if (tooling.maxUseCount && tooling.currentUseCount) {
    percent = Math.max(percent, Math.round((Number(tooling.currentUseCount) / tooling.maxUseCount) * 100));
  }
  if (tooling.maxUseHours && tooling.currentUseHours) {
    percent = Math.max(percent, Math.round((Number(tooling.currentUseHours) / Number(tooling.maxUseHours)) * 100));
  }
  return Math.min(percent, 100);
}
export function extractProductionReceiptSummary(
  result: import('./contracts/generated/models/WorkOrderReportResultVo').WorkOrderReportResultVo,
): import('./contracts/generated/models/ProductionReceiptSummaryDto').ProductionReceiptSummaryDto | null {
  return result.productionReceiptSummary ?? null;
}

export function normalizeSha256(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && /^[a-f0-9]{64}$/.test(normalized) ? normalized : null;
}
