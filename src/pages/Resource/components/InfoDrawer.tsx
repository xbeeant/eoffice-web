import { Button, Collapse, Descriptions, Drawer, Form, Skeleton, Tag } from 'antd';
import type { ResourceProps, UserProps } from '@/typings';
import { formatSize } from '@/utils/utils';
import { useEffect, useState } from 'react';
import { request } from 'umi';
import ProForm, { ModalForm } from '@ant-design/pro-form';
import { PlusOutlined } from '@ant-design/icons';
import UserTransfer from '@/pages/Resource/components/UserTransfer';

export type InfoDrawerProps = {
  visible: boolean;
  onClose: () => void;
  value: ResourceProps;
};

export interface ResourceDetailProps extends ResourceProps {
  users?: UserProps[];
}

const { Panel } = Collapse;

const InfoDrawer = ({ visible, value, onClose }: InfoDrawerProps) => {
  const [data, setData] = useState<ResourceDetailProps>({
    createAt: '',
    createBy: '',
    deleted: false,
    displayOrder: 0,
    extension: '',
    fid: '',
    key: '',
    name: '',
    path: '',
    perm: '',
    rid: '',
    sid: '',
    size: 0,
    updateAt: '',
    updateBy: '',
    url: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    const response = await request('/api/resource/info', {
      params: {
        rid: value.rid,
      },
    });

    setData(response.data || {});
  };

  useEffect(() => {
    setLoading(true);
    loadData().then(() => setLoading(false));
  }, [value.rid]);

  return (
    <Drawer title={data.name} placement="right" onClose={onClose} visible={visible}>
      {loading ? (
        <Skeleton />
      ) : (
        <Collapse defaultActiveKey={['info', 'auth']}>
          <Panel key="info" header="基础信息">
            <Descriptions title={false} layout={'horizontal'} column={1}>
              <Descriptions.Item label="类型">{data.extension}</Descriptions.Item>
              <Descriptions.Item label="所有者">{data.createBy}</Descriptions.Item>
              <Descriptions.Item label="位置">{data.path}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{data.createAt}</Descriptions.Item>
              <Descriptions.Item label="大小">{formatSize(data.size)}</Descriptions.Item>
            </Descriptions>
          </Panel>
          <Panel
            key="auth"
            header="成员"
            extra={
              <ModalForm<{
                name: string;
                company: string;
              }>
                title="成员管理"
                trigger={
                  <Button type="text">
                    <PlusOutlined />
                    管理
                  </Button>
                }
                autoFocusFirstInput
                modalProps={{
                  destroyOnClose: true,
                  onCancel: () => console.log('run'),
                }}
                onFinish={async (values) => {
                  return true;
                }}
              >
                <ProForm.Group>
                  <Form.Item name="users" style={{ width: '100%' }}>
                    <UserTransfer rid={value.rid} />
                  </Form.Item>
                </ProForm.Group>
              </ModalForm>
            }
          >
            {data.users?.map((user) => (
              <Tag>{user.nickname}</Tag>
            ))}
          </Panel>
        </Collapse>
      )}
    </Drawer>
  );
};

export default InfoDrawer;
