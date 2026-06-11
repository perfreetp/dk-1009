import { Building2, Mountain, Wheat, Waves, Factory, Trees } from 'lucide-react';
import { sceneTypes } from '../../data/mockData';

const iconMap: Record<string, typeof Building2> = {
  '城市': Building2,
  '山区': Mountain,
  '农田': Wheat,
  '海岸': Waves,
  '工业区': Factory,
  '湿地': Trees,
};

const colorMap: Record<string, string> = {
  '城市': 'from-blue-500 to-blue-600',
  '山区': 'from-green-500 to-green-600',
  '农田': 'from-yellow-500 to-yellow-600',
  '海岸': 'from-cyan-500 to-cyan-600',
  '工业区': 'from-gray-500 to-gray-600',
  '湿地': 'from-teal-500 to-teal-600',
};

const countMap: Record<string, number> = {
  '城市': 156,
  '山区': 89,
  '农田': 124,
  '海岸': 67,
  '工业区': 45,
  '湿地': 78,
};

export function SceneCategory() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">热门场景分类</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {sceneTypes.map((type) => {
          const Icon = iconMap[type];
          const colors = colorMap[type];
          const count = countMap[type];
          return (
            <div
              key={type}
              className="group relative bg-gray-50 rounded-xl p-4 hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-100"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${colors} rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">{type}</div>
                <div className="text-xs text-gray-500 mt-1">{count} 个样本</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}