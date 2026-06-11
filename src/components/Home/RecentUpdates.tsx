import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Camera, MapPin, Cloud } from 'lucide-react';
import { mockSamples } from '../../data/mockData';

export function RecentUpdates() {
  const recentSamples = [...mockSamples].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 4);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">最近更新</h2>
        <Link
          to="/search"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          查看全部 <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="space-y-4">
        {recentSamples.map((sample) => (
          <Link
            key={sample.id}
            to={`/sample/${sample.id}`}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <img
              src={sample.thumbnail_url}
              alt={sample.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 truncate">
                {sample.name}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {sample.sensor_type}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {sample.terrain}
                </span>
                <span className="flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  {sample.weather}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {formatDate(sample.created_at)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}