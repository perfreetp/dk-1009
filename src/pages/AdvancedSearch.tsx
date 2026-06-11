import { useStore } from '../store';
import { FilterPanel } from '../components/Search/FilterPanel';
import { ResultCard } from '../components/Search/ResultCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export function AdvancedSearch() {
  const { searchResults } = useStore();
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900">高级检索</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              筛选
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-72 flex-shrink-0`}>
            <div className="sticky top-28">
              <FilterPanel />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  共找到 <span className="font-semibold text-gray-900">{searchResults.total}</span> 个结果
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg">
                  <option>最新更新</option>
                  <option>飞行高度</option>
                  <option>场景类型</option>
                </select>
              </div>
            </div>

            {searchResults.samples.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.samples.map((sample) => (
                  <ResultCard key={sample.id} sample={sample} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的结果</h3>
                <p className="text-gray-500">尝试调整筛选条件或使用其他关键词</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}