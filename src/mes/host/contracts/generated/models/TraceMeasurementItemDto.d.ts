export type TraceMeasurementItemDto = {
    conclusion?: string;
    inspectorName?: string;
    label: string;
    measuredValue?: string;
    occurredAt?: string;
    passed?: boolean | null;
    standard?: string;
    unit?: string;
};
