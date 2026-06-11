import { useState } from 'react';
import { useStore } from '../../store';
import { sensorTypes, terrains, weathers, targetClasses } from '../../data/mockData';
import { ChevronDown, ChevronUp, RotateCcw, Search, Bookmark, Save, Trash2, X, Edit3, Star, Check, CheckSquare, Square } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-3 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  );
}

export function FilterPanel() {
  const { 
    filter, 
    keyword, 
    setFilter, 
    setKeyword, 
    resetFilter, 
    searchSamples, 
    savedFilters, 
    saveFilterAs, 
    loadFilter, 
    deleteSavedFilter,
    renameFilter,
    setDefaultFilter,
    getDefaultFilter,
    searchResults,
    selectAllVisibleSamples,
    selectedSamples,
    addSamplesToSelection,
    removeSamplesFromSelection,
  } = useStore();
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const defaultFilter = getDefaultFilter();

  const handleHeightChange = (type: 'min' | 'max', value: number) => {
    setFilter({
      flightHeight: {
        ...filter.flightHeight,
        [type]: value,
      },
    });
  };

  const handleMultiSelect = (category: 'sensorTypes' | 'terrains' | 'weathers' | 'targetClasses', value: string) => {
    const currentValues = filter[category];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setFilter({ [category]: newValues });
  };

  const isSelected = (category: 'sensorTypes' | 'terrains' | 'weathers' | 'targetClasses', value: string) => {
    return filter[category].includes(value);
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      saveFilterAs(filterName.trim());
      setFilterName('');
      setShowSaveModal(false);
    }
  };

  const handleLoadFilter = (savedFilter: typeof savedFilters[0]) => {
    loadFilter(savedFilter, true);
    setShowSavedList(false);
  };

  const handleRename = () => {
    if (editingId && editName.trim()) {
      renameFilter(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultFilter(id);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.sensorTypes.length > 0) count++;
    if (filter.terrains.length > 0) count++;
    if (filter.weathers.length > 0) count++;
    if (filter.targetClasses.length > 0) count++;
    if (filter.flightHeight.min > 0 || filter.flightHeight.max < 200) count++;
    if (keyword.trim()) count++;
    return count;
  };

  const getFilterSummary = () => {
    const parts: string[] = [];
    if (keyword.trim()) parts.push(`关键词: ${keyword}`);
    if (filter.sensorTypes.length > 0) parts.push(`传感器: ${filter.sensorTypes.join(', ')}`);
    if (filter.terrains.length > 0) parts.push(`地貌: ${filter.terrains.join(', ')}`);
    if (filter.weathers.length > 0) parts.push(`天气: ${filter.weathers.join(', ')}`);
    if (filter.targetClasses.length > 0) parts.push(`目标: ${filter.targetClasses.join(', ')}`);
    if (filter.flightHeight.min > 0 || filter.flightHeight.max < 200) {
      parts.push(`高度: ${filter.flightHeight.min}-${filter.flightHeight.max}m`);
    }
    return parts;
  };

  const allVisibleSelected = searchResults.samples.length > 0 && 
    searchResults.samples.every((s) => selectedSamples.includes(s.id));

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = searchResults.samples.map((s) => s.id);
      removeSamplesFromSelection(visibleIds);
    } else {
      selectAllVisibleSamples();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">筛选条件</h3>
          {getActiveFilterCount() > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSavedList(!showSavedList)}
            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
          >
            <Bookmark className="w-4 h-4" />
            {savedFilters.length}
          </button>
          <button
            onClick={resetFilter}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {showSavedList && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">已保存的方案</span>
            <button
              onClick={() => setShowSaveModal(true)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              保存当前
            </button>
          </div>
          {savedFilters.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedFilters.map((sf) => (
                <div key={sf.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex-1">
                    {editingId === sf.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        />
                        <button
                          onClick={handleRename}
                          className="p-1 text-green-600 hover:text-green-700"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleLoadFilter(sf)}
                        className="text-sm text-gray-700 hover:text-blue-600 text-left flex-1 truncate flex items-center gap-2"
                      >
                        {sf.isDefault && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        {sf.name}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingId !== sf.id && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(sf.id);
                            setEditName(sf.name);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="重命名"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSetDefault(sf.id)}
                          className={`p-1 transition-colors ${
                            sf.isDefault 
                              ? 'text-yellow-500' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          title="设为默认"
                        >
                          <Star className={`w-3 h-3 ${sf.isDefault ? 'fill-yellow-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => deleteSavedFilter(sf.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="删除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">暂无保存的方案</p>
          )}
        </div>
      )}

      {showSaveModal && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">保存当前筛选</span>
            <button onClick={() => setShowSaveModal(false)} className="text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="输入方案名称..."
              className="flex-1 px-3 py-1.5 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
            />
            <button
              onClick={handleSaveFilter}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 p-3 bg-green-50 rounded-lg">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800"
        >
          {allVisibleSelected ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          全选当前结果 ({searchResults.samples.length}个)
        </button>
      </div>

      <FilterSection title="关键词搜索">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索名称、描述、目标类别..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </FilterSection>

      <FilterSection title="飞行高度 (米)">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">最小值</span>
            <input
              type="number"
              value={filter.flightHeight.min}
              onChange={(e) => handleHeightChange('min', parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">最大值</span>
            <input
              type="number"
              value={filter.flightHeight.max}
              onChange={(e) => handleHeightChange('max', parseInt(e.target.value) || 200)}
              className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg"
            />
          </div>
          <input
            type="range"
            min={0}
            max={200}
            value={filter.flightHeight.max}
            onChange={(e) => handleHeightChange('max', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </FilterSection>

      <FilterSection title="传感器类型">
        <div className="flex flex-wrap gap-2">
          {sensorTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleMultiSelect('sensorTypes', type)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isSelected('sensorTypes', type)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="地貌类型">
        <div className="flex flex-wrap gap-2">
          {terrains.map((terrain) => (
            <button
              key={terrain}
              onClick={() => handleMultiSelect('terrains', terrain)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isSelected('terrains', terrain)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {terrain}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="天气条件">
        <div className="flex flex-wrap gap-2">
          {weathers.map((weather) => (
            <button
              key={weather}
              onClick={() => handleMultiSelect('weathers', weather)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isSelected('weathers', weather)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {weather}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="目标类别">
        <div className="flex flex-wrap gap-2">
          {targetClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => handleMultiSelect('targetClasses', cls)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isSelected('targetClasses', cls)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </FilterSection>

      {getFilterSummary().length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">当前条件摘要:</div>
          <div className="text-xs text-gray-700 space-y-1">
            {getFilterSummary().map((part, i) => (
              <div key={i}>{part}</div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={searchSamples}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Search className="w-4 h-4" />
        执行检索
      </button>
    </div>
  );
}