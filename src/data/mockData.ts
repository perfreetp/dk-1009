import { Sample, Annotation, Trajectory, Favorite, Application, Download } from '../types';

export const mockSamples: Sample[] = [
  {
    id: '1',
    name: '城市低空航线A-001',
    scene_type: '城市',
    flight_height: 50,
    sensor_type: 'RGB相机',
    terrain: '城区',
    weather: '晴朗',
    target_classes: '建筑物,道路,车辆',
    thumbnail_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=urban%20aerial%20view%20city%20buildings%20drone%20photography&image_size=landscape_16_9',
    description: '城市中心区域低空采集，包含密集建筑群和交通道路',
    captured_at: '2024-01-15T10:30:00Z',
    created_at: '2024-01-15T12:00:00Z',
  },
  {
    id: '2',
    name: '山区森林B-002',
    scene_type: '山区',
    flight_height: 100,
    sensor_type: '多光谱相机',
    terrain: '山地',
    weather: '多云',
    target_classes: '树木,植被,地形',
    thumbnail_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20forest%20aerial%20view%20drone%20photography%20landscape&image_size=landscape_16_9',
    description: '山区森林生态环境监测，包含丰富植被覆盖',
    captured_at: '2024-01-14T09:00:00Z',
    created_at: '2024-01-14T11:30:00Z',
  },
  {
    id: '3',
    name: '农田监测C-003',
    scene_type: '农田',
    flight_height: 80,
    sensor_type: '热红外相机',
    terrain: '平原',
    weather: '晴朗',
    target_classes: '农作物,田地,灌溉设施',
    thumbnail_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=agricultural%20fields%20aerial%20view%20farmland%20drone%20photography&image_size=landscape_16_9',
    description: '农田作物生长状态监测，包含多种农作物',
    captured_at: '2024-01-13T08:00:00Z',
    created_at: '2024-01-13T10:00:00Z',
  },
  {
    id: '4',
    name: '海岸线监测D-004',
    scene_type: '海岸',
    flight_height: 120,
    sensor_type: '高光谱相机',
    terrain: '海岸',
    weather: '海风',
    target_classes: '海洋,沙滩,海岸线',
    thumbnail_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coastal%20line%20aerial%20view%20ocean%20beach%20drone%20photography&image_size=landscape_16_9',
    description: '海岸线生态环境监测，包含海洋和沙滩',
    captured_at: '2024-01-12T14:00:00Z',
    created_at: '2024-01-12T16:00:00Z',
  },
  {
    id: '5',
    name: '工业区监测E-005',
    scene_type: '工业区',
    flight_height: 60,
    sensor_type: 'RGB相机',
    terrain: '平原',
    weather: '雾霾',
    target_classes: '厂房,设备,管道',
    thumbnail_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=industrial%20zone%20factory%20aerial%20view%20drone%20photography&image_size=landscape_16_9',
    description: '工业园区设施监测，包含厂房和设备',
    captured_at: '2024-01-11T10:00:00Z',
    created_at: '2024-01-11T12:00:00Z',
  },
  {
    id: '6',
    name: '湖泊湿地F-006',
    scene_type: '湿地',
    flight_height: 90,
    sensor_type: '多光谱相机',
    terrain: '湿地',
    weather: '阴天',
    target_classes: '水体,湿地植物,鸟类',
    thumbnail_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wetland%20lake%20nature%20reserve%20aerial%20view%20drone%20photography&image_size=landscape_16_9',
    description: '湖泊湿地生态保护监测',
    captured_at: '2024-01-10T07:30:00Z',
    created_at: '2024-01-10T09:30:00Z',
  },
];

export const mockAnnotations: Annotation[] = [
  { id: 'a1', sample_id: '1', type: '建筑物', coordinates: [{ x: 100, y: 80, width: 50, height: 60 }], label: '办公楼' },
  { id: 'a2', sample_id: '1', type: '道路', coordinates: [{ x: 0, y: 150, width: 300, height: 20 }], label: '主干道' },
  { id: 'a3', sample_id: '1', type: '车辆', coordinates: [{ x: 180, y: 155, width: 15, height: 8 }], label: '汽车' },
  { id: 'a4', sample_id: '2', type: '树木', coordinates: [{ x: 50, y: 50, width: 30, height: 40 }], label: '松树' },
  { id: 'a5', sample_id: '2', type: '地形', coordinates: [{ x: 0, y: 0, width: 400, height: 300 }], label: '山地' },
];

export const mockTrajectories: Trajectory[] = [
  {
    id: 't1',
    sample_id: '1',
    path: [
      { lat: 39.9042, lng: 116.4074 },
      { lat: 39.9045, lng: 116.4080 },
      { lat: 39.9050, lng: 116.4085 },
      { lat: 39.9055, lng: 116.4090 },
    ],
    start_latitude: 39.9042,
    start_longitude: 116.4074,
    end_latitude: 39.9055,
    end_longitude: 116.4090,
  },
];

export const mockFavorites: Favorite[] = [
  { id: 'f1', user_id: 'user1', sample_id: '1', note: '用于城市目标检测研究', created_at: '2024-01-16T08:00:00Z' },
  { id: 'f2', user_id: 'user1', sample_id: '3', note: '农业监测项目', created_at: '2024-01-17T10:00:00Z' },
];

export const mockApplications: Application[] = [
  {
    id: 'app1',
    user_id: 'user1',
    sample_ids: ['1', '3'],
    purpose: '用于CVPR 2024论文实验，研究低空场景目标检测算法',
    status: 'approved',
    submitted_at: '2024-01-15T09:00:00Z',
    reviewed_at: '2024-01-15T14:00:00Z',
    review_comment: '符合使用条件，已批准',
  },
  {
    id: 'app2',
    user_id: 'user1',
    sample_ids: ['2', '4'],
    purpose: '生态环境监测项目数据补充',
    status: 'pending',
    submitted_at: '2024-01-18T11:00:00Z',
  },
  {
    id: 'app3',
    user_id: 'user1',
    sample_ids: ['5'],
    purpose: '工业安全检测算法测试',
    status: 'rejected',
    submitted_at: '2024-01-10T10:00:00Z',
    reviewed_at: '2024-01-11T10:00:00Z',
    review_comment: '数据涉及敏感区域，暂不提供',
  },
];

export const mockDownloads: Download[] = [
  { id: 'd1', application_id: 'app1', downloaded_at: '2024-01-15T15:00:00Z' },
  { id: 'd2', application_id: 'app1', downloaded_at: '2024-01-16T09:00:00Z' },
];

export const sensorTypes = ['RGB相机', '多光谱相机', '热红外相机', '高光谱相机', 'LiDAR'];
export const terrains = ['城区', '山地', '平原', '海岸', '湿地', '森林'];
export const weathers = ['晴朗', '多云', '阴天', '雨天', '雾霾', '海风'];
export const targetClasses = ['建筑物', '道路', '车辆', '树木', '植被', '农作物', '水体', '沙滩', '厂房', '设备'];
export const sceneTypes = ['城市', '山区', '农田', '海岸', '工业区', '湿地'];