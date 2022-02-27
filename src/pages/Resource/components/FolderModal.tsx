import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { request } from 'umi';
import type { MutableRefObject } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import { layoutActionRef } from '@/app';

export interface FolderModalProps {
  pfid?: string;
  actionRef?: MutableRefObject<ActionType | undefined>;
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

const FolderModal = ({ visible, pfid, onCancel, onOk }: FolderModalProps) => {
  return (
    <ModalForm<{
      name: string;
    }>
      visible={visible}
      title="新建文件夹"
      autoFocusFirstInput
      modalProps={{
        onCancel,
      }}
      width={380}
      onFinish={async (values) => {
        const response = await request('/eoffice/api/folder', {
          data: { pfid, ...values },
          requestType: 'form',
          method: 'post',
        });

        if (response.success) {
          layoutActionRef?.current?.reload();
          onOk();
          return true;
        }

        return false;
      }}
    >
      <ProFormText
        width="md"
        name="name"
        label="文件夹名称"
        tooltip="最长为 24 位"
        placeholder="请输入文件夹名称"
      />
    </ModalForm>
  );
};

export default FolderModal;
