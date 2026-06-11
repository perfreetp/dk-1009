import { StatsCard } from '../components/Home/StatsCard';
import { SceneCategory } from '../components/Home/SceneCategory';
import { RecentUpdates } from '../components/Home/RecentUpdates';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Sparkles } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              低空数据集检索平台
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              为研究人员提供高质量的低空场景数据检索服务，支持多维度筛选，助力机器学习模型训练和评测
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                <Search className="w-5 h-5" />
                开始检索
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                高级筛选
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard icon="database" value="559+" label="数据集数量" />
          <StatsCard icon="image" value="12.5K+" label="样本总数" />
          <StatsCard icon="map" value="32+" label="覆盖区域" />
          <StatsCard icon="clock" value="2024" label="数据年份" />
        </div>

        <SceneCategory />

        <div className="mt-8">
          <RecentUpdates />
        </div>
      </div>
    </div>
  );
}