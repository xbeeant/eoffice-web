import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { request } from 'umi';
import { TreeSelect, Form } from 'antd';
import { useEffect, useState } from 'react';

export interface FileUploadProps {
  fid: string;
  visible: boolean;
  onCancel: () => void;
  type: string;
  onOk: () => void;
  rid?: string | number;
}

const NewFileModal = ({ visible, fid, type, onCancel, onOk }: FileUploadProps) => {
  const [data, setData] = useState([]);

  // 加载群组树data
  const loadData = () => {
    request('/eoffice/api/template/tree', {
      params: { type: type },
    }).then((res) => {
      if (!res || res?.length === 0) {
      }
      setData(res);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ModalForm<{
      file: any[];
    }>
      visible={visible}
      title="新建文件"
      autoFocusFirstInput
      modalProps={{
        onCancel,
      }}
      width={380}
      onFinish={async (values) => {
        console.log(values);
        request('/eoffice/api/resource/add', {
          method: 'POST',
          requestType: 'form',
          data: {
            fid,
            type,
            ...values,
          },
        }).then((response) => {
          if (response.success) {
            onOk();
          }
        });
        return false;
      }}
    >
      {data && data.length > 0 && (
        <Form.Item
          label="模板"
          name="cid"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <TreeSelect
            treeDefaultExpandAll={true}
            showSearch
            treeNodeFilterProp="title"
            treeLine={true}
            treeData={data}
          />
        </Form.Item>
      )}
      <ProFormText label="文件名" rules={[{ required: true }]} name="name" />
    </ModalForm>
  );
};

export default NewFileModal;
