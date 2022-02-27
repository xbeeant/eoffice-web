import { ModalForm, ProFormUploadButton } from '@ant-design/pro-form';
import { request } from 'umi';

export interface FileUploadProps {
  fid: string;
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  rid?: string | number;
  action: string;
}

const FileUploadModal = ({ visible, fid, rid, onCancel, action, onOk }: FileUploadProps) => {
  return (
    <ModalForm<{
      file: any[];
    }>
      visible={visible}
      title="上传文件"
      autoFocusFirstInput
      modalProps={{
        onCancel,
      }}
      width={380}
      onFinish={async (values) => {
        const files = values.file.map((file: { response: { data: any } }) => {
          return file.response.data;
        });
        request(action, {
          method: 'POST',
          requestType: 'form',
          data: {
            fid,
            rid,
            files: JSON.stringify(files),
          },
        }).then((response) => {
          if (response.success) {
            onOk();
          }
        });
        return false;
      }}
    >
      <ProFormUploadButton
        fieldProps={{
          multiple: !rid,
          maxCount: rid ? 1 : undefined,
        }}
        label="选择文件（夹）"
        name="file"
        action={`/eoffice/api/resource/upload?fid=${fid || ''}`}
      />
    </ModalForm>
  );
};

export default FileUploadModal;
