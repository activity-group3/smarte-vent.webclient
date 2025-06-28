// Declarations for custom module paths without TypeScript types

declare module '@/context/user' {
  export const account: any;
  const _default: any;
  export default _default;
}

declare module '@/components/LocationMap' {
  import { ComponentType } from 'react';
  const LocationMap: ComponentType<any>;
  export default LocationMap;
}

declare module '../../../components/charts/PieChart' {
  import { ComponentType } from 'react';
  const PieChart: ComponentType<any>;
  export default PieChart;
}

declare module '../../../components/charts/BarChart' {
  import { ComponentType } from 'react';
  const BarChart: ComponentType<any>;
  export default BarChart;
}

declare module '../../../components/charts/LineChart' {
  import { ComponentType } from 'react';
  const LineChart: ComponentType<any>;
  export default LineChart;
}

declare module '../../../components/charts/StatsCard' {
  import { ComponentType } from 'react';
  const StatsCard: ComponentType<any>;
  export default StatsCard;
}

declare module '../../../components/charts/DataTable' {
  import { ComponentType } from 'react';
  const DataTable: ComponentType<any>;
  export default DataTable;
} 
