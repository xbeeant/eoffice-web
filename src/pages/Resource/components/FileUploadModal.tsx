import { ModalForm } from '@ant-design/pro-form';
import Uploader from '@/components/Uploader';
import { MutableRefObject } from 'react';
import { ActionType } from '@ant-design/pro-table';

export interface FileUploadProps {
  fid: number;
  actionRef?: MutableRefObject<ActionType | undefined>;
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

const FileUploadModal = ({ visible, actionRef, fid, onCancel, onOk }: FileUploadProps) => {
  return (
    <ModalForm<{
      name: string;
    }>
      visible={visible}
      title="上传文件"
      autoFocusFirstInput
      modalProps={{
        onCancel,
      }}
      width={380}
      onFinish={async () => {
        onOk();
        return false;
      }}
    >
      <Uploader
        key="upload"
        action={`/api/resource/upload?fid=${fid || ''}`}
        afterUpload={() => actionRef?.current?.reload()}
        text="选择文件"
      />
    </ModalForm>
  );
};

export default FileUploadModal;
