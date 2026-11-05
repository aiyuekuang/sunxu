import type { TemporaryWorker } from '../../host/services';
import { today } from '../../../core/utils/date';

export type TemporaryWorkerStatus = 'active' | 'inactive' | 'expired' | 'pending_setup';

export function getTemporaryWorkerStatus(
  worker: TemporaryWorker,
  currentDate = today(),
): TemporaryWorkerStatus {
  if (!worker.validUntil) return 'pending_setup';
  if (worker.validUntil < currentDate) return 'expired';
  return worker.isActive ? 'active' : 'inactive';
}
