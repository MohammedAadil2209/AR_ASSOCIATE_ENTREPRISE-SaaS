import GenericModule from './GenericModule';
import { Users } from 'lucide-react';

export default function Customers() {
  return (
    <GenericModule 
      title="Customers" 
      subtitle="Client Relationship Management" 
      icon={Users} 
      endpoint="customers" 
    />
  );
}
