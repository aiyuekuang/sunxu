import { useEffect, useRef, useState } from 'react';
import { ScrapPolicyService } from '../../../host/api-types';

/**
 * 报废策略预检结果（收窄后端 /scrap-policy/evaluate 的返回，后端响应当前为 any）。
 * 字段语义与后端 ScrapPolicyEvaluationResult 一致。
 */
export interface ScrapPolicyPreview {
  matched: boolean;
  policyName: string | null;
  requiresPhoto: boolean;
  requiresQualityJudgement: boolean;
  requiresRootCause: boolean;
  holdBatch: boolean;
  actionMessage: string;
}

interface ScrapPolicyEvaluationRaw {
  matched?: boolean;
  policyName?: string | null;
  requiresPhoto?: boolean;
  requiresQualityJudgement?: boolean;
  requiresRootCause?: boolean;
  holdBatch?: boolean;
  actionMessage?: string;
}

export interface UseScrapPolicyPreviewParams {
  /** 是否启用预检（如执行记录、弹窗未打开时关闭） */
  enabled: boolean;
  /** 工单产品物料ID */
  materialId?: string | null;
  /** 工单客户ID */
  customerId?: string | null;
  /** 工单工序ID（整单报工传空） */
  operationId?: string | null;
  /** 工艺路线工序ID */
  processOperationId?: string | null;
  /** 报废原因（命中维度之一，变化需重新评估） */
  scrapReason?: string | null;
  /** 本次良品数量（产品单位） */
  completedQty: number;
  /** 本次报废数量（产品单位） */
  scrappedQty: number;
  /** 计划数量（报废率分母兜底） */
  plannedQty?: number;
}

const DEBOUNCE_MS = 400;

/**
 * 报废策略实时预检：报废数量 > 0 时按当前维度调后端 evaluate（与报工拦截同源），
 * 返回是否要求照片/质量判定/根因等，用于在提交前驱动场景必填与提示。
 *
 * 预检是体验增强，失败时安全退化为 null —— 后端报工接口的 blocking 校验仍是事实底线，
 * 不会因为预检接口抖动而让用户报不上工。
 */
export function useScrapPolicyPreview(
  params: UseScrapPolicyPreviewParams,
): ScrapPolicyPreview | null {
  const {
    enabled,
    materialId,
    customerId,
    operationId,
    processOperationId,
    scrapReason,
    completedQty,
    scrappedQty,
    plannedQty,
  } = params;

  const [preview, setPreview] = useState<ScrapPolicyPreview | null>(null);
  // 竞态保护：仅接受最新一次请求的结果
  const requestSeqRef = useRef(0);

  useEffect(() => {
    // 报废数量 <= 0 不命中任何策略（与后端 evaluateWithManager 一致）
    if (!enabled || scrappedQty <= 0 || !materialId) {
      requestSeqRef.current += 1;
      setPreview(null);
      return;
    }

    const seq = ++requestSeqRef.current;
    const timer = setTimeout(() => {
      void ScrapPolicyService.scrapPolicyControllerEvaluate({
        materialId,
        customerId: customerId ?? undefined,
        operationId: operationId ?? undefined,
        processOperationId: processOperationId ?? undefined,
        scrapReason: scrapReason ?? undefined,
        completedQty,
        scrappedQty,
        plannedQty,
      })
        .then((res: ScrapPolicyEvaluationRaw) => {
          if (seq !== requestSeqRef.current) return;
          setPreview({
            matched: Boolean(res?.matched),
            policyName: res?.policyName ?? null,
            requiresPhoto: Boolean(res?.requiresPhoto),
            requiresQualityJudgement: Boolean(res?.requiresQualityJudgement),
            requiresRootCause: Boolean(res?.requiresRootCause),
            holdBatch: Boolean(res?.holdBatch),
            actionMessage: res?.actionMessage ?? '',
          });
        })
        .catch(() => {
          // 预检失败安全退化：交给后端报工接口的 blocking 校验兜底
          if (seq !== requestSeqRef.current) return;
          setPreview(null);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [
    enabled,
    materialId,
    customerId,
    operationId,
    processOperationId,
    scrapReason,
    completedQty,
    scrappedQty,
    plannedQty,
  ]);

  return preview;
}
