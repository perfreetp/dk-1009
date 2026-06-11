import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ClipboardList, Download, Calendar, CheckCircle, Clock, XCircle, FileText, Copy, ChevronRight, Quote, Check, Package, Hash, CalendarDays, ExternalLink, FileDown, RefreshCw, FlaskConical, Plus, Trash2, Edit3, Play, CheckCircle2, XCircle2 } from 'lucide-react';

type CitationFormat = 'gbt' | 'apa' | 'bibtex';
type ExportOption = 'citation' | 'samples' | 'full';

interface ExperimentFormData {
  name: string;
  algorithm_version: string;
  training_config: string;
  metrics: { name: string; value: string; unit?: string }[];
  notes: string;
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
  });
  const [editingExperiment, setEditingExperiment] = useState<string | null>(null);

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
    setEditingExperiment(null);
    setExperimentForm({
      name: '',
      algorithm_version: '',
      training_config: '',
      metrics: [{ name: '', value: '', unit: '' }],
      notes: '',
    });
    setShowExperimentModal(appId);
  };

  const handleCloseExperimentModal = () => {
    setShowExperimentModal(null);
    setEditingExperiment(null);
  };

  const handleSaveExperiment = () => {
    if (!showExperimentModal) return;

    const data = {
      application_id: showExperimentModal,
      name: experimentForm.name,
      sample_ids: applications.find((a) => a.id === showExperimentModal)?.sample_ids || [],
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
      });
      setEditingExperiment(experimentId);
      setShowExperimentModal(appId);
    }
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

  const handleExport = (app: typeof applications[0]) => {
    const sampleNames = getSampleNames(app.sample_ids);
    const downloadPackage = getDownloadPackage(app.id);
    
    const content = `低空数据集申请导出
====================

申请信息
--------
申请ID: ${app.id}
申请时间: ${formatDate(app.submitted_at)}
审核状态: ${getStatusInfo(app.status).label}
使用说明: ${app.purpose}

样本清单
--------
${sampleNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

下载包信息
----------
文件数量: ${downloadPackage.files.length}
有效期至: ${downloadPackage.expiresAt ? formatDate(downloadPackage.expiresAt) : '未生成'}

文件详情
--------
${downloadPackage.files.map((file, i) => 
  `${i + 1}. ${file.name}
   大小: ${file.size}
   校验码(MD5): ${file.checksum}`
).join('\n\n')}

引用格式 (GB/T)
---------------
${generateCitation(app)}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `application_${app.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                                {checkPackageExpired(application.id) && ' (已过期)'}
                              </div>
                            </div>
                            <div className="bg-white rounded p-3">
                              <div className="text-gray-500">已下载</div>
                              <div className="font-medium text-gray-900">{downloads.length} 次</div>
                            </div>
                          </div>
                          
                          {downloadPackage.files.length > 0 && (
                            <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                              {downloadPackage.files.map((file, i) => (
                                <div key={i} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                                  <div>
                                    <div className="font-medium text-gray-900">{file.name}</div>
                                    <div className="text-gray-500 flex items-center gap-4">
                                      <span>{file.size}</span>
                                      <span className="flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        {file.checksum}
                                      </span>
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
                              <div className="flex items-center gap-2 mb-3">
                                <FlaskConical className="w-5 h-5 text-teal-600" />
                                <h3 className="font-semibold text-teal-800">复现实验 ({experiments.length})</h3>
                              </div>
                              <div className="space-y-3">
                                {experiments.map((exp) => {
                                  const expStatus = getExperimentStatusInfo(exp.status);
                                  const ExpIcon = expStatus.icon;
                                  return (
                                    <div key={exp.id} className="bg-white rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${expStatus.color}`}>
                                            <ExpIcon className="w-3 h-3" />
                                            {expStatus.label}
                                          </span>
                                          <span className="font-medium text-gray-900">{exp.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
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
                                        {exp.metrics.length > 0 && (
                                          <div>
                                            指标: {exp.metrics.map((m) => `${m.name}=${m.value}${m.unit ? m.unit : ''}`).join(', ')}
                                          </div>
                                        )}
                                        <div>创建时间: {formatDate(exp.created_at)}</div>
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