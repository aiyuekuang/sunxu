import type { RouteTopologyDependencyDto } from './RouteTopologyDependencyDto.d.ts';
import type { RouteTopologyOperationDto } from './RouteTopologyOperationDto.d.ts';
export type UpdateRouteTopologyDto = {
    dependencies: Array<RouteTopologyDependencyDto>;
    operations: Array<RouteTopologyOperationDto>;
    /**
     * 工艺路线ID
     */
    routeId: string;
};
