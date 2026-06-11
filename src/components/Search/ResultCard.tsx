import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { Sample } from '../../types';
import { Camera, MapPin, Cloud, Bookmark, Plus } from 'lucide-react';

interface ResultCardProps {
  sample: Sample;
  showCheckbox?: boolean;
}

export function ResultCard({ sample, showCheckbox = false }: ResultCardProps) {
  const { isFavorite, addFavorite, removeFavorite, selectedSamples, addSelectedSample, removeSelectedSample } = useStore();
  const favorite = isFavorite(sample.id);
  const selected = selectedSamples.includes(sample.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorite) {
      removeFavorite(sample.id);
    } else {
      addFavorite(sample.id);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected) {
      removeSelectedSample(sample.id);
    } else {
      addSelectedSample(sample.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative">
        <img
          src={sample.thumbnail_url}
          alt={sample.name}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {showCheckbox && (
            <button
              onClick={handleSelect}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                selected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
              }`}
            >
              {selected && <Plus className="w-4 h-4 text-white rotate-45" />}
            </button>
          )}
          <button
            onClick={handleFavorite}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              favorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {sample.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {sample.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg">
            <Camera className="w-3 h-3" />
            {sample.sensor_type}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 text-xs rounded-lg">
            <MapPin className="w-3 h-3" />
            {sample.terrain}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg">
            <Cloud className="w-3 h-3" />
            {sample.weather}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>高度: {sample.flight_height}m</span>
          <span>目标: {sample.target_classes.split(',').length}类</span>
        </div>
        <Link
          to={`/sample/${sample.id}`}
          className="mt-4 block w-full text-center py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
}