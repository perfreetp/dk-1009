export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-lg font-bold text-gray-900">低空数据集平台</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              为研究人员提供高质量的低空场景数据集检索服务，助力机器学习模型训练和评测。
              平台收录了丰富的低空采集数据，涵盖城市、山区、农田、海岸等多种场景。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">首页</a></li>
              <li><a href="/search" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">高级检索</a></li>
              <li><a href="/favorites" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">我的收藏</a></li>
              <li><a href="/records" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">申请记录</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">联系我们</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>邮箱: data@lowaltitude.edu</li>
              <li>电话: 010-12345678</li>
              <li>地址: 北京市海淀区</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2024 低空数据集平台. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}