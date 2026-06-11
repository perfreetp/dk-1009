import { useState } from 'react';
import { useStore } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, Edit2, Save, X, ShoppingCart, FileText } from 'lucide-react';
import { Favorite } from '../types';

interface FavoriteItemProps {
  favorite: Favorite;
  sampleName: string;
  sampleThumbnail: string;
  onRemove: () => void;
  onUpdateNote: (note: string) => void;
}

function FavoriteItem({ favorite, sampleName, sampleThumbnail, onRemove, onUpdateNote }: FavoriteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(favorite.note);

  const handleSave = () => {
    onUpdateNote(editNote);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex gap-4">
        <img
          src={sampleThumbnail}
          alt={sampleName}
          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{sampleName}</h3>
          <div className="mt-2">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="添加备注..."
                />
                <button
                  onClick={handleSave}
                  className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 truncate flex-1">
                  {favorite.note || '暂无备注'}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Link
              to={`/sample/${favorite.sample_id}`}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              查看详情
            </Link>
            <button
              onClick={onRemove}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              移除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Favorites() {
  const { favorites, removeFavorite, updateFavoriteNote, samples, addSelectedSample } = useStore();
  const navigate = useNavigate();

  const getSampleInfo = (sampleId: string) => {
    return samples.find((s) => s.id === sampleId);
  };

  const handleBatchRemove = () => {
    favorites.forEach((f) => removeFavorite(f.sample_id));
  };

  const handleApply = () => {
    favorites.forEach((f) => addSelectedSample(f.sample_id));
    navigate('/apply');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-900">我的收藏</h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-sm rounded-full">
              {favorites.length}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {favorites.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                您已收藏 {favorites.length} 个样本
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBatchRemove}
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  批量移除
                </button>
                <button
                  onClick={handleApply}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  申请下载
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {favorites.map((favorite) => {
                const sample = getSampleInfo(favorite.sample_id);
                if (!sample) return null;
                return (
                  <FavoriteItem
                    key={favorite.id}
                    favorite={favorite}
                    sampleName={sample.name}
                    sampleThumbnail={sample.thumbnail_url}
                    onRemove={() => removeFavorite(favorite.sample_id)}
                    onUpdateNote={(note) => updateFavoriteNote(favorite.sample_id, note)}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">收藏为空</h3>
            <p className="text-gray-500 mb-6">快去检索并收藏感兴趣的样本吧</p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Bookmark className="w-5 h-5" />
              开始收藏
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}