import { type Equipment, equipmentService } from '../host/services';

export type EquipmentSelectionItem = Pick<Equipment, 'id' | 'name' | 'code'> & {
  unavailable?: true;
};

const DETAIL_BATCH_SIZE = 10;

/** Load equipment details in saved priority order while retaining unreadable IDs. */
export async function loadEquipmentSelectionInOrder(
  equipmentIds: string[],
): Promise<EquipmentSelectionItem[]> {
  const result: EquipmentSelectionItem[] = [];

  for (let index = 0; index < equipmentIds.length; index += DETAIL_BATCH_SIZE) {
    const batch = equipmentIds.slice(index, index + DETAIL_BATCH_SIZE);
    const items = await Promise.all(
      batch.map(async (id): Promise<EquipmentSelectionItem> => {
        try {
          const equipment = await equipmentService.mobileDetail(id);
          return { id: equipment.id, name: equipment.name, code: equipment.code };
        } catch {
          return {
            id,
            name: '设备资料不可用',
            code: id,
            unavailable: true,
          };
        }
      }),
    );
    result.push(...items);
  }

  return result;
}
