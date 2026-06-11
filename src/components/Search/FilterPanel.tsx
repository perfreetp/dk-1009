import { useState } from 'react';
import { useStore } from '../../store';
import { sensorTypes, terrains, weathers, targetClasses } from '../../data/mockData';
import { ChevronDown, ChevronUp, RotateCcw, Search } from 'lucide-react';

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
  const { filter, setFilter, resetFilter, searchSamples } = useStore();

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">筛选条件</h3>
        <button
          onClick={resetFilter}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>

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