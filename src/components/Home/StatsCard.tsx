import { Database, Image, MapPin, Clock } from 'lucide-react';

interface StatsCardProps {
  icon: 'database' | 'image' | 'map' | 'clock';
  value: string;
  label: string;
}

const iconMap = {
  database: Database,
  image: Image,
  map: MapPin,
  clock: Clock,
};

const colorMap = {
  database: 'from-blue-500 to-blue-600',
  image: 'from-green-500 to-green-600',
  map: 'from-purple-500 to-purple-600',
  clock: 'from-orange-500 to-orange-600',
};

export function StatsCard({ icon, value, label }: StatsCardProps) {
  const Icon = iconMap[icon];
  const colors = colorMap[icon];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <div className={`w-12 h-12 bg-gradient-to-br ${colors} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}