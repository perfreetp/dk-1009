import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { Sample } from '../../types';
import { Camera, MapPin, Cloud, Bookmark, Plus, Check, ShoppingCart } from 'lucide-react';

interface ResultCardProps {
  sample: Sample;
  showCheckbox?: boolean;
}

export function ResultCard({ sample, showCheckbox = false }: ResultCardProps) {
  const { isFavorite, addFavorite, removeFavorite, selectedSamples, addSelectedSample, removeSelectedSample } = useStore();
  const favorite = isFavorite(sample.id);
  const selected = selectedSamples.includes(sample.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) {
      removeFavorite(sample.id);
    } else {
      addFavorite(sample.id);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selected) {
      removeSelectedSample(sample.id);
    } else {
      addSelectedSample(sample.id);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={sample.thumbnail_url}
          alt={sample.name}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleSelect}
            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
              selected 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'bg-white/90 border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-400'
            }`}
            title={selected ? '已加入实验数据篮' : '加入实验数据篮'}
          >
            {selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
          <button
            onClick={handleFavorite}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              favorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-50'
            }`}
            title={favorite ? '取消收藏' : '收藏'}
          >
            <Bookmark className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>
        </div>
        {selected && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
            <ShoppingCart className="w-3 h-3" />
            已选
          </div>
        )}
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
        <div className="flex gap-2 mt-3">
          <Link
            to={`/sample/${sample.id}`}
            className="flex-1 block text-center py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
          >
            查看详情
          </Link>
          <button
            onClick={handleSelect}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              selected
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {selected ? (
              <>
                <Check className="w-4 h-4" />
                已选
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                加入
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}