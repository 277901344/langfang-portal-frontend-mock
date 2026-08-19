import React from 'react';
import { Button, Empty, Modal } from 'antd';

import { UI_CONFIG } from '@/shared/constants/ui';
import { isTextPreviewFile } from '@/shared/utils/file';

interface FilePreviewModalProps {
  open: boolean;
  title: React.ReactNode;
  previewUrl: string;
  previewContentType?: string;
  textContent?: string;
  downloadUrl?: string;
  onCancel: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  open,
  title,
  previewUrl,
  previewContentType,
  textContent,
  downloadUrl,
  onCancel,
}) => {
  const lowerUrl = previewUrl.toLowerCase();
  const lowerType = (previewContentType || '').toLowerCase();
  const isPdf = lowerType.includes('pdf') || lowerUrl.endsWith('.pdf');
  const isImage = lowerType.startsWith('image/') || /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(lowerUrl);
  const isText = isTextPreviewFile(previewUrl, previewContentType);

  return (
    <Modal
      open={open}
      title={title}
      footer={null}
      onCancel={onCancel}
      width={UI_CONFIG.modal.width}
      maskClosable={UI_CONFIG.modal.maskClosable}
      centered
      styles={{ body: { maxHeight: '80vh', overflow: 'hidden' } }}
    >
      <div className="custom-scrollbar max-h-[75vh] overflow-y-auto">
        {previewUrl && isPdf ? (
          <iframe
            src={previewUrl}
            className="block h-[75vh] w-full"
            frameBorder="0"
            title="PDF Preview"
          />
        ) : null}

        {previewUrl && isImage ? (
          <img alt="preview" style={{ width: '100%', display: 'block' }} src={previewUrl} />
        ) : null}

        {isText ? (
          <pre className="m-0 whitespace-pre-wrap break-all rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {textContent || '暂无可预览内容'}
          </pre>
        ) : null}

        {!isPdf && !isImage && !isText ? (
          <div className="py-8">
            <Empty
              description="暂不支持在线预览该附件，请下载后查看"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {downloadUrl ? (
                <Button type="primary" href={downloadUrl} target="_blank" rel="noreferrer">
                  下载附件
                </Button>
              ) : null}
            </Empty>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default FilePreviewModal;
