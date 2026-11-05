import { PolicyDisclosure, type PolicyDisclosureProps } from '../../../components/common/PolicyDisclosure.tsx';

export type { PolicyDisclosureProps } from '../../../components/common/PolicyDisclosure.tsx';

export function ReportPolicyDisclosure(props: PolicyDisclosureProps) {
  return (
    <PolicyDisclosure
      {...props}
      title={props.title ?? '报表口径说明'}
      subtitle={props.subtitle ?? '用于解释当前数据的范围和计算方式，不影响筛选条件'}
      accessibilityLabel={props.accessibilityLabel ?? '查看报表口径说明'}
      accessibilityHint={props.accessibilityHint ?? '打开当前报表的数据范围和计算方式说明'}
    />
  );
}
