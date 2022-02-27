import { ModalForm, ProFormUploadButton } from '@ant-design/pro-form';
import { request } from 'umi';

export interface FileUploadProps {
  cid: string | number;
  accept: string;
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

const FileUploadModal = ({ visible, accept, cid, onCancel, onOk }: FileUploadProps) => {
  return (
    <ModalForm<{
      file: any[];
    }>
      visible={visible}
      title="上传模板"
      autoFocusFirstInput
      modalProps={{
        onCancel,
      }}
      width={380}
      onFinish={async (values) => {
        const files = values.file.map((file: { response: { data: any } }) => {
          return file.response.data;
        });
        request('/eoffice/api/template', {
          method: 'POST',
          requestType: 'form',
          data: {
            cid,
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
        accept={accept}
        fieldProps={{
          multiple: !cid,
          maxCount: cid ? 1 : undefined,
        }}
        label="选择文件（夹）"
        name="file"
        action={`/eoffice/api/resource/upload`}
      />
    </ModalForm>
  );
};

export default FileUploadModal;
