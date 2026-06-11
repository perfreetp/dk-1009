import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ClipboardList, Download, Calendar, CheckCircle, Clock, XCircle, FileText, Copy, ChevronRight, Quote, Check, Package, Hash, CalendarDays, ExternalLink, FileDown, RefreshCw, FlaskConical, Plus, Trash2, Edit3, Play, CheckCircle2, X } from 'lucide-react';

type CitationFormat = 'gbt' | 'apa' | 'bibtex';
type ExportOption = 'citation' | 'samples' | 'full';

interface ExperimentFormData {
  name: string;
  algorithm_version: string;
  training_config: string;
  metrics: { name: string; value: string; unit?: string }[];
  notes: string;
  selectedSamples: string[];
}

export function Records() {
  const { applications, samples, recordDownload, getDownloadsForApplication, getDownloadPackage, regenerateDownloadPackage, checkPackageExpired, highlightedAppId, setHighlightedAppId, createExperiment, updateExperiment, deleteExperiment, getExperimentsForApplication } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [citationFormat, setCitationFormat] = useState<CitationFormat>('gbt');
  const [exportOption, setExportOption] = useState<ExportOption>('full');
  const [showExportModal, setShowExportModal] = useState<string | null>(null);
  const [showExperimentModal, setShowExperimentModal] = useState<string | null>(null);
  const [experimentForm, setExperimentForm] = useState<ExperimentFormData>({
    name: '',
    algorithm_version: '',
    training_config: '',
    metrics: [{ name: '', value: '', unit: '' }],
    notes: '',
    selectedSamples: [],
  });
  const [editingExperiment, setEditingExperiment] = useState<string | null>(null);
  const [showCompareModal, setShowCompareModal] = useState<string | null>(null);

  useEffect(() => {
    if (highlightedAppId) {
      const element = document.getElementById(`app-${highlightedAppId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          setHighlightedAppId(null);
        }, 5000);
      }
    }
  }, [highlightedAppId, setHighlightedAppId]);

  const getSampleNames = (sampleIds: string[]) => {
    return sampleIds.map((id) => samples.find((s) => s.id === id)?.name).filter(Boolean) as string[];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待审核', color: 'bg-orange-100 text-orange-600', icon: Clock };
      case 'approved':
        return { label: '已通过', color: 'bg-green-100 text-green-600', icon: CheckCircle };
      case 'rejected':
        return { label: '已拒绝', color: 'bg-red-100 text-red-600', icon: XCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-600', icon: FileText };
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (applicationId: string) => {
    recordDownload(applicationId);
  };

  const handleRegeneratePackage = (applicationId: string) => {
    regenerateDownloadPackage(applicationId);
  };

  const handleCopyChecksumList = (downloadPackage: ReturnType<typeof getDownloadPackage>) => {
    const list = downloadPackage.files.map((file) => `${file.name}\t${file.checksum}`).join('\n');
    handleCopy(list);
  };

  const handleOpenExportModal = (appId: string) => {
    setShowExportModal(appId);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(null);
  };

  const handleExport = (app: typeof applications[0]) => {
    const sampleNames = getSampleNames(app.sample_ids);
    const downloadPackage = getDownloadPackage(app.id);
    const citation = generateCitation(app);
    const formatLabel = citationFormat === 'gbt' ? 'GB/T' : citationFormat.toUpperCase();

    let content = '';

    if (exportOption === 'citation' || exportOption === 'full') {
      content += `引用格式 (${formatLabel})
${'='.repeat(40)}
${citation}

`;
    }

    if (exportOption === 'samples' || exportOption === 'full') {
      content += `样本清单
${'='.repeat(40)}
申请ID: ${app.id}
申请时间: ${formatDate(app.submitted_at)}
审核状态: ${getStatusInfo(app.status).label}
样本数量: ${sampleNames.length}

${sampleNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

`;
    }

    if (exportOption === 'full') {
      content += `下载包信息
${'='.repeat(40)}
文件数量: ${downloadPackage.files.length}
总大小: ${getFileTotalSize(downloadPackage.files)}
有效期至: ${downloadPackage.expiresAt ? formatDate(downloadPackage.expiresAt) : '未生成'}

文件校验清单:
${downloadPackage.files.map((file) => `${file.name}\t${file.checksum}`).join('\n')}
`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `application_${app.id}_${exportOption}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(null);
  };

  const handleOpenExperimentModal = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    const defaultSamples = app?.sample_ids || [];
    setEditingExperiment(null);
    setExperimentForm({
      name: '',
      algorithm_version: '',
      training_config: '',
      metrics: [{ name: '', value: '', unit: '' }],
      notes: '',
      selectedSamples: [...defaultSamples],
    });
    setShowExperimentModal(appId);
  };

  const handleCloseExperimentModal = () => {
    setShowExperimentModal(null);
    setEditingExperiment(null);
  };

  const handleSaveExperiment = () => {
    if (!showExperimentModal) return;
    if (experimentForm.selectedSamples.length === 0) {
      alert('请至少选择一个样本');
      return;
    }

    const data = {
      application_id: showExperimentModal,
      name: experimentForm.name,
      sample_ids: experimentForm.selectedSamples,
      algorithm_version: experimentForm.algorithm_version,
      training_config: experimentForm.training_config,
      metrics: experimentForm.metrics.filter((m) => m.name && m.value),
      status: 'running' as const,
      notes: experimentForm.notes,
    };

    if (editingExperiment) {
      updateExperiment(editingExperiment, data);
    } else {
      createExperiment(data);
    }

    handleCloseExperimentModal();
  };

  const handleEditExperiment = (experimentId: string, appId: string) => {
    const experiments = getExperimentsForApplication(appId);
    const experiment = experiments.find((e) => e.id === experimentId);
    if (experiment) {
      setExperimentForm({
        name: experiment.name,
        algorithm_version: experiment.algorithm_version,
        training_config: experiment.training_config,
        metrics: experiment.metrics.length > 0 ? experiment.metrics : [{ name: '', value: '', unit: '' }],
        notes: experiment.notes || '',
        selectedSamples: [...experiment.sample_ids],
      });
      setEditingExperiment(experimentId);
      setShowExperimentModal(appId);
    }
  };

  const handleUpdateExperimentStatus = (experimentId: string, newStatus: 'running' | 'completed' | 'failed') => {
    updateExperiment(experimentId, { status: newStatus });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expire = new Date(expiresAt);
    const diff = expire.getTime() - now.getTime();
    
    if (diff <= 0) return '已过期';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}天${hours}小时`;
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
  };

  const handleDeleteExperiment = (experimentId: string) => {
    if (confirm('确定要删除这个复现实验记录吗？')) {
      deleteExperiment(experimentId);
    }
  };

  const addMetricField = () => {
    setExperimentForm((prev) => ({
      ...prev,
      metrics: [...prev.metrics, { name: '', value: '', unit: '' }],
    }));
  };

  const removeMetricField = (index: number) => {
    setExperimentForm((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index),
    }));
  };

  const updateMetricField = (index: number, field: 'name' | 'value' | 'unit', value: string) => {
    setExperimentForm((prev) => ({
      ...prev,
      metrics: prev.metrics.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const getExperimentStatusInfo = (status: string) => {
    switch (status) {
      case 'running':
        return { label: '运行中', color: 'bg-blue-100 text-blue-600', icon: Play };
      case 'completed':
        return { label: '已完成', color: 'bg-green-100 text-green-600', icon: CheckCircle2 };
      case 'failed':
        return { label: '失败', color: 'bg-red-100 text-red-600', icon: XCircle2 };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-600', icon: FileText };
    }
  };

  const generateCitation = (app: typeof applications[0]) => {
    const sampleNames = getSampleNames(app.sample_ids);
    const date = new Date(app.submitted_at);
    const year = date.getFullYear();

    switch (citationFormat) {
      case 'apa':
        return `Low Altitude Dataset Platform. (${year}). Low-altitude dataset samples [${sampleNames.join('; ')}]. Retrieved from https://lowaltitude.edu/dataset/${app.id}`;
      
      case 'bibtex':
        const citeKey = `lowaltitude-${app.id.slice(-8)}`;
        return `@dataset{${citeKey},
  author = {Low Altitude Dataset Platform},
  title = {{Low-altitude dataset samples: ${sampleNames.join('; ')}}},
  year = {${year}},
  url = {https://lowaltitude.edu/dataset/${app.id}},
}`;
      
      default: // GB/T
        return `低空数据集平台. 低空数据集样本 [${sampleNames.join('; ')}][EB/OL]. https://lowaltitude.edu/dataset/${app.id}, ${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.`;
    }
  };

  const getDownloadHistory = (applicationId: string) => {
    return getDownloadsForApplication(applicationId);
  };

  const getFileTotalSize = (files: { size: string }[]) => {
    let total = 0;
    files.forEach(file => {
      const match = file.size.match(/([\d.]+)/);
      if (match) {
        total += parseFloat(match[1]);
      }
    });
    return `${total.toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-900">申请记录</h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-sm rounded-full">
              {applications.length}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusInfo = getStatusInfo(application.status);
              const StatusIcon = statusInfo.icon;
              const sampleNames = getSampleNames(application.sample_ids);
              const downloads = getDownloadHistory(application.id);
              const downloadPackage = getDownloadPackage(application.id);
              const isExpanded = expandedApp === application.id;
              const isHighlighted = highlightedAppId === application.id;

              return (
                <div
                  key={application.id}
                  id={`app-${application.id}`}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-500 ${
                    isHighlighted 
                      ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                      : 'border-gray-100 hover:shadow-md'
                  }`}
                >
                  {isHighlighted && (
                    <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
                      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        新提交的申请
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(application.submitted_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenExportModal(application.id)}
                          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                        >
                          <FileDown className="w-4 h-4" />
                          导出
                        </button>
                        {application.status === 'approved' && (
                          <button
                            onClick={() => handleOpenExperimentModal(application.id)}
                            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                          >
                            <FlaskConical className="w-4 h-4" />
                            复现实验
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedApp(isExpanded ? null : application.id)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {isExpanded ? '收起详情' : '查看详情'}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">申请数据 ({application.sample_ids.length}个)</h3>
                      <div className="flex flex-wrap gap-2">
                        {sampleNames.slice(0, 3).map((name, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg truncate max-w-[200px]"
                          >
                            {name}
                          </span>
                        ))}
                        {sampleNames.length > 3 && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-lg">
                            +{sampleNames.length - 3} 更多
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">使用说明</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{application.purpose}</p>
                    </div>

                    {application.status === 'approved' && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Package className="w-5 h-5 text-blue-600" />
                              <h3 className="font-semibold text-blue-800">下载包清单</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyChecksumList(downloadPackage)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-white px-2 py-1 rounded"
                              >
                                <Copy className="w-3 h-3" />
                                复制校验清单
                              </button>
                              <button
                                onClick={() => handleRegeneratePackage(application.id)}
                                className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 bg-white px-2 py-1 rounded"
                              >
                                <RefreshCw className="w-3 h-3" />
                                重新生成
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-white rounded p-3">
                              <div className="text-gray-500">文件数量</div>
                              <div className="font-medium text-gray-900">{downloadPackage.files.length} 个</div>
                            </div>
                            <div className="bg-white rounded p-3">
                              <div className="text-gray-500">总大小</div>
                              <div className="font-medium text-gray-900">{getFileTotalSize(downloadPackage.files)}</div>
                            </div>
                            <div className={`bg-white rounded p-3 ${checkPackageExpired(application.id) ? 'ring-2 ring-red-200' : ''}`}>
                              <div className="text-gray-500">有效期至</div>
                              <div className={`font-medium ${checkPackageExpired(application.id) ? 'text-red-600' : 'text-gray-900'}`}>
                                {downloadPackage.expiresAt ? formatDate(downloadPackage.expiresAt) : '--'}
                              </div>
                              <div className={`text-xs mt-1 ${checkPackageExpired(application.id) ? 'text-red-500' : 'text-green-600'}`}>
                                {checkPackageExpired(application.id) ? '已过期' : `剩余 ${getTimeRemaining(downloadPackage.expiresAt)}`}
                              </div>
                            </div>
                            <div className="bg-white rounded p-3">
                              <div className="text-gray-500">已下载</div>
                              <div className="font-medium text-gray-900">{downloads.length} 次</div>
                            </div>
                          </div>
                          
                          {downloadPackage.files.length > 0 && (
                            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                              {downloadPackage.files.map((file, i) => (
                                <div key={i} className="bg-white rounded p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-gray-900 text-sm">{file.name}</div>
                                    <button
                                      onClick={() => handleCopy(file.downloadUrl)}
                                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                      <Copy className="w-3 h-3" />
                                      复制链接
                                    </button>
                                  </div>
                                  <div className="text-xs text-gray-500 space-y-1">
                                    <div className="flex items-center gap-4">
                                      <span>{file.size}</span>
                                      <span className="flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        {file.checksum}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-500">
                                      <ExternalLink className="w-3 h-3" />
                                      <span className="truncate">{file.downloadUrl}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            下载次数: {downloads.length}
                          </span>
                          <button
                            onClick={() => handleDownload(application.id)}
                            className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            下载数据
                          </button>
                        </div>

                        {downloads.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              下载记录:
                            </div>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {downloads.map((d, i) => (
                                <div key={d.id} className="text-xs text-gray-600 flex items-center gap-2">
                                  <Check className="w-3 h-3 text-green-500" />
                                  {formatDate(d.downloaded_at)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-purple-800 font-medium">
                              <Quote className="w-4 h-4" />
                              引用信息
                            </div>
                            <div className="flex items-center gap-1">
                              {(['gbt', 'apa', 'bibtex'] as CitationFormat[]).map((format) => (
                                <button
                                  key={format}
                                  onClick={() => setCitationFormat(format)}
                                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                    citationFormat === format
                                      ? 'bg-purple-500 text-white'
                                      : 'bg-white text-purple-600 hover:bg-purple-100'
                                  }`}
                                >
                                  {format === 'gbt' ? 'GB/T' : format.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="relative">
                            <pre className="text-xs text-purple-700 bg-white/50 rounded p-3 font-mono whitespace-pre-wrap break-all">
                              {generateCitation(application)}
                            </pre>
                            <button
                              onClick={() => handleCopy(generateCitation(application))}
                              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                            >
                              {copiedId === generateCitation(application) ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  已复制
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  复制
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {(() => {
                          const experiments = getExperimentsForApplication(application.id);
                          if (experiments.length === 0) return null;
                          return (
                            <div className="bg-teal-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <FlaskConical className="w-5 h-5 text-teal-600" />
                                  <h3 className="font-semibold text-teal-800">复现实验 ({experiments.length})</h3>
                                </div>
                                {experiments.length >= 2 && (
                                  <button
                                    onClick={() => setShowCompareModal(application.id)}
                                    className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 bg-white px-2 py-1 rounded"
                                  >
                                    <div className="w-4 h-4 flex items-center justify-center">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                      </svg>
                                    </div>
                                    对比分析
                                  </button>
                                )}
                              </div>
                              <div className="space-y-3">
                                {experiments.map((exp) => {
                                  const expStatus = getExperimentStatusInfo(exp.status);
                                  const ExpIcon = expStatus.icon;
                                  const expSampleNames = getSampleNames(exp.sample_ids);
                                  return (
                                    <div key={exp.id} className="bg-white rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${expStatus.color}`}>
                                            <ExpIcon className="w-3 h-3" />
                                            {expStatus.label}
                                          </span>
                                          <span className="font-medium text-gray-900">{exp.name}</span>
                                          <span className="text-xs text-gray-400">({exp.sample_ids.length}个样本)</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <select
                                            value={exp.status}
                                            onChange={(e) => handleUpdateExperimentStatus(exp.id, e.target.value as 'running' | 'completed' | 'failed')}
                                            className="text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                          >
                                            <option value="running">运行中</option>
                                            <option value="completed">已完成</option>
                                            <option value="failed">失败</option>
                                          </select>
                                          <button
                                            onClick={() => handleEditExperiment(exp.id, application.id)}
                                            className="p-1 text-gray-400 hover:text-blue-600"
                                            title="编辑"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteExperiment(exp.id)}
                                            className="p-1 text-gray-400 hover:text-red-600"
                                            title="删除"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500 space-y-1">
                                        <div>算法版本: {exp.algorithm_version}</div>
                                        <div>样本: {expSampleNames.slice(0, 3).join(', ')}{expSampleNames.length > 3 ? ` +${expSampleNames.length - 3}` : ''}</div>
                                        {exp.metrics.length > 0 && (
                                          <div>
                                            指标: {exp.metrics.map((m) => `${m.name}=${m.value}${m.unit ? m.unit : ''}`).join(', ')}
                                          </div>
                                        )}
                                        <div>创建时间: {formatDate(exp.created_at)}</div>
                                        {exp.status_history && exp.status_history.length > 0 && (
                                          <div className="mt-2 pt-2 border-t border-gray-100">
                                            <div className="text-gray-400 mb-1">状态变更记录:</div>
                                            {exp.status_history.map((h, i) => (
                                              <div key={i} className="text-gray-500">
                                                {formatDate(h.changed_at)}: {h.status === 'running' ? '运行中' : h.status === 'completed' ? '已完成' : '失败'}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {application.status === 'rejected' && application.review_comment && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-sm font-medium text-red-800 mb-1">拒绝原因</div>
                        <p className="text-sm text-red-600">{application.review_comment}</p>
                      </div>
                    )}

                    {application.status === 'pending' && (
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm text-orange-600">
                          您的申请正在审核中，请耐心等待。我们会在1-3个工作日内完成审核并通过邮件通知您结果。
                        </div>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">申请ID</div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-gray-600 bg-white px-2 py-1 rounded">{application.id}</code>
                          <button
                            onClick={() => handleCopy(application.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">申请时间</div>
                        <div className="text-sm text-gray-600">{formatDate(application.submitted_at)}</div>
                      </div>

                      {application.reviewed_at && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">审核时间</div>
                          <div className="text-sm text-gray-600">{formatDate(application.reviewed_at)}</div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">完整样本列表</div>
                        <div className="space-y-2">
                          {sampleNames.map((name, index) => (
                            <div key={index} className="text-sm text-gray-600 bg-white px-3 py-2 rounded">
                              {name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无申请记录</h3>
            <p className="text-gray-500 mb-6">您还没有提交任何数据申请</p>
          </div>
        )}
      </div>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">导出选项</h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">引用格式</div>
                <div className="flex gap-2">
                  {(['gbt', 'apa', 'bibtex'] as CitationFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => setCitationFormat(format)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                        citationFormat === format
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {format === 'gbt' ? 'GB/T' : format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">导出内容</div>
                <div className="space-y-2">
                  {([
                    { value: 'citation', label: '仅引用', desc: '只导出引用格式' },
                    { value: 'samples', label: '仅样本清单', desc: '只导出样本列表' },
                    { value: 'full', label: '完整交付说明', desc: '包含引用、样本清单和下载包信息' },
                  ] as { value: ExportOption; label: string; desc: string }[]).map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        exportOption === option.value
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="exportOption"
                        value={option.value}
                        checked={exportOption === option.value}
                        onChange={(e) => setExportOption(e.target.value as ExportOption)}
                        className="w-4 h-4 text-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseExportModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    const app = applications.find((a) => a.id === showExportModal);
                    if (app) handleExport(app);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  导出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCompareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">复现实验对比分析</h3>
              <button
                onClick={() => setShowCompareModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {showCompareModal && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium text-gray-600">对比项</th>
                        {getExperimentsForApplication(showCompareModal).map((exp) => (
                          <th key={exp.id} className="px-4 py-3 text-center font-medium text-gray-600">
                            <div className="flex flex-col items-center">
                              <span>{exp.name}</span>
                              <span className={`mt-1 px-2 py-0.5 rounded text-xs ${getExperimentStatusInfo(exp.status).color}`}>
                                {getExperimentStatusInfo(exp.status).label}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-700">算法版本</td>
                        {getExperimentsForApplication(showCompareModal).map((exp) => (
                          <td key={exp.id} className="px-4 py-3 text-center text-gray-900">
                            {exp.algorithm_version || '-'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-700">样本数量</td>
                        {getExperimentsForApplication(showCompareModal).map((exp) => (
                          <td key={exp.id} className="px-4 py-3 text-center text-gray-900">
                            {exp.sample_ids.length}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-700">训练配置</td>
                        {getExperimentsForApplication(showCompareModal).map((exp) => (
                          <td key={exp.id} className="px-4 py-3 text-center text-gray-900">
                            <div className="max-w-[200px] truncate" title={exp.training_config}>
                              {exp.training_config || '-'}
                            </div>
                          </td>
                        ))}
                      </tr>
                      {(() => {
                        const allMetrics = new Set<string>();
                        getExperimentsForApplication(showCompareModal).forEach((exp) => {
                          exp.metrics.forEach((m) => allMetrics.add(m.name));
                        });
                        return Array.from(allMetrics).map((metricName) => (
                          <tr key={metricName} className="border-t border-gray-100">
                            <td className="px-4 py-3 font-medium text-gray-700">{metricName}</td>
                            {getExperimentsForApplication(showCompareModal).map((exp) => {
                              const metric = exp.metrics.find((m) => m.name === metricName);
                              return (
                                <td key={exp.id} className="px-4 py-3 text-center">
                                  {metric ? (
                                    <span className={`font-medium ${!Number.isNaN(parseFloat(metric.value)) ? 'text-green-600' : 'text-gray-900'}`}>
                                      {metric.value}{metric.unit || ''}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}
                      <tr className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-700">创建时间</td>
                        {getExperimentsForApplication(showCompareModal).map((exp) => (
                          <td key={exp.id} className="px-4 py-3 text-center text-gray-900">
                            {formatDate(exp.created_at)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showExperimentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editingExperiment ? '编辑复现实验' : '创建复现实验'}</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">实验名称</label>
                <input
                  type="text"
                  value={experimentForm.name}
                  onChange={(e) => setExperimentForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入实验名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">算法版本</label>
                <input
                  type="text"
                  value={experimentForm.algorithm_version}
                  onChange={(e) => setExperimentForm((prev) => ({ ...prev, algorithm_version: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如: YOLOv8-v1.0"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">选择样本</label>
                  <button
                    onClick={() => {
                      const app = applications.find((a) => a.id === showExperimentModal);
                      if (app) {
                        setExperimentForm((prev) => ({ ...prev, selectedSamples: [...app.sample_ids] }));
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    全选
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                  {showExperimentModal && applications.find((a) => a.id === showExperimentModal)?.sample_ids.map((sampleId) => {
                    const sample = samples.find((s) => s.id === sampleId);
                    const isSelected = experimentForm.selectedSamples.includes(sampleId);
                    return (
                      <label key={sampleId} className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setExperimentForm((prev) => ({
                              ...prev,
                              selectedSamples: e.target.checked
                                ? [...prev.selectedSamples, sampleId]
                                : prev.selectedSamples.filter((id) => id !== sampleId)
                            }));
                          }}
                          className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-sm text-gray-700">{sample?.name || sampleId}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  已选择 {experimentForm.selectedSamples.length} 个样本
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">训练配置</label>
                <textarea
                  value={experimentForm.training_config}
                  onChange={(e) => setExperimentForm((prev) => ({ ...prev, training_config: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="输入训练配置参数..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">指标结果</label>
                <div className="space-y-2">
                  {experimentForm.metrics.map((metric, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={metric.name}
                        onChange={(e) => updateMetricField(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="指标名称"
                      />
                      <input
                        type="text"
                        value={metric.value}
                        onChange={(e) => updateMetricField(index, 'value', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="值"
                      />
                      <input
                        type="text"
                        value={metric.unit || ''}
                        onChange={(e) => updateMetricField(index, 'unit', e.target.value)}
                        className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="单位"
                      />
                      {experimentForm.metrics.length > 1 && (
                        <button
                          onClick={() => removeMetricField(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addMetricField}
                  className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  添加指标
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={experimentForm.notes}
                  onChange={(e) => setExperimentForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder="其他备注信息..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCloseExperimentModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveExperiment}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingExperiment ? '保存修改' : '创建实验'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}