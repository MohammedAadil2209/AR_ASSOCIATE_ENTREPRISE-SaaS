import GenericModule from './GenericModule';
import { Warehouse } from 'lucide-react';

export default function Warehouses() {
  return (
    <GenericModule 
      title="Warehouses" 
      subtitle="Multi-Node Storage Management" 
      icon={Warehouse} 
      endpoint="warehouses" 
    />
  );
}
