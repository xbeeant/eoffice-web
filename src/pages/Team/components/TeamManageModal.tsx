import { useEffect, useState } from 'react';
import { Form, Input, Modal, TreeSelect } from 'antd';
import { request } from 'umi';
import { TeamProps } from '@/typings';

export type TeamManageModalProps = {
  visible: boolean;
  onCreate: () => void;
  onCancel: () => void;
  type: string | number;
  value: TeamProps;
};

const TeamManageModal = ({ visible, onCreate, onCancel, value, type }: TeamManageModalProps) => {
  const [form] = Form.useForm();
  console.log(value);
  const [folders, setFolders] = useState([]);

  const loadFolderTree = () => {
    return request('/eoffice/api/team/tree', {
      params: { type },
    }).then((response) => {
      setFolders(response);
      form.setFieldsValue({ pgid: value?.pgid });
    });
  };

  useEffect(() => {
    loadFolderTree();
  }, []);

  return (
    <Modal
      visible={visible}
      title={`${value?.gid ? '编辑群组' : '新建群组'}`}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          if (value?.gid) {
            // 更新
            request(`/eoffice/api/team/${value.gid}`, {
              method: 'PUT',
              data: {
                ...values,
                gid: value?.gid ? value.gid : '',
                pgid: values.pgid ? values.pgid : 0,
                type,
              },
              requestType: 'form',
            }).then((res) => {
              if (res.success) {
                onCreate();
              }
            });
          } else {
            request('/eoffice/api/team', {
              method: 'POST',
              data: {
                ...values,
                pgid: values.pgid ? values.pgid : 0,
                type,
              },
              requestType: 'form',
            }).then((res) => {
              if (res.success) {
                onCreate();
              }
            });
          }
        });
      }}
    >
      <Form form={form} initialValues={value} layout="vertical">
        <Form.Item
          name="pgid"
          label="上级群组"
          extra="选中上级群组后群组会创建在选中的群组下，否则创建的是根群组"
        >
          <TreeSelect
            treeLine={true}
            style={{ width: '100%' }}
            showSearch={true}
            dropdownStyle={{ overflow: 'auto' }}
            treeDefaultExpandAll
            treeData={folders}
            allowClear={true}
          />
        </Form.Item>
        <Form.Item
          name="name"
          label="群组名称"
          rules={[
            {
              required: true,
              message: `请输入群组名称!`,
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeamManageModal;
