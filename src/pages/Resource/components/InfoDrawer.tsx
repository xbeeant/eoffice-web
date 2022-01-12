import {
  Button,
  Collapse,
  Descriptions,
  Drawer,
  Input,
  Popconfirm,
  Skeleton,
  Space,
  Tag,
} from 'antd';
import type { ApiResponse, ResourceProps, UserProps } from '@/typings';
import { formatSize } from '@/utils/utils';
import type { MutableRefObject } from 'react';
import { useEffect, useState } from 'react';
import { request } from 'umi';
import ResourceAuthModal from '@/pages/Resource/components/ResourceAuthModal';
import { DeleteTwoTone, EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import ResourceShareModal from '@/pages/Resource/components/ResourceShareModal';

export type InfoDrawerProps = {
  visible: boolean;
  onClose: () => void;
  value: ResourceProps;
  action: MutableRefObject<ActionType | undefined>;
};

export interface ResourceDetailProps extends ResourceProps {
  users?: UserProps[];
}

const { Panel } = Collapse;

const InfoDrawer = ({ visible, value, onClose, action }: InfoDrawerProps) => {
  const [editTitleMode, setEditTitleMode] = useState<boolean>(false);
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

  const [permModalVisible, setPermModalVisible] = useState<boolean>(false);
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);

  const loadData = async () => {
    const json = await request('/api/resource/info', {
      params: {
        rid: value.rid,
      },
    });

    setData(json.data || {});
  };

  useEffect(() => {
    setLoading(true);
    loadData().then(() => setLoading(false));
  }, [value.rid]);

  return (
    <Drawer
      title={
        <>
          {editTitleMode ? (
            <Input
              autoFocus={true}
              defaultValue={data.name}
              onBlur={(event) => {
                const name = event.target.value;
                request('/api/resource/rename', {
                  method: 'POST',
                  requestType: 'form',
                  data: {
                    rid: data.rid,
                    name: name,
                  },
                }).then((json: ApiResponse) => {
                  if (json.success) {
                    setData({ ...data, ...{ name } });
                    action?.current?.reload();
                  }
                  setEditTitleMode(false);
                });
              }}
            />
          ) : (
            <>
              <Space>
                <span>{data.name}</span>
                <EditOutlined
                  onClick={() => {
                    setEditTitleMode(true);
                  }}
                />
                <ShareAltOutlined
                  onClick={() => {
                    setShareModalVisible(true);
                  }}
                />
                <Popconfirm
                  title="确定删除此文件（夹）嘛?"
                  onConfirm={() => {
                    request('/api/resource', {
                      method: 'DELETE',
                      requestType: 'form',
                      data: {
                        rid: value.rid,
                      },
                    }).then((json: ApiResponse) => {
                      if (json.success) {
                        action?.current?.reload();
                        onClose();
                      }
                    });
                  }}
                  okText="确认"
                  cancelText="取消"
                >
                  <DeleteTwoTone twoToneColor="red" />
                </Popconfirm>
              </Space>
            </>
          )}
        </>
      }
      placement="right"
      onClose={onClose}
      visible={visible}
    >
      {loading ? (
        <Skeleton />
      ) : (
        <>
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
                <Button
                  type="text"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPermModalVisible(true);
                  }}
                >
                  管理
                </Button>
              }
            >
              {data.users?.map((user) => (
                <Tag>{user.nickname}</Tag>
              ))}
            </Panel>
          </Collapse>
          {permModalVisible && (
            <ResourceAuthModal
              rid={value.rid}
              visible={permModalVisible}
              onCancel={() => {
                setPermModalVisible(false);
              }}
            />
          )}
          {shareModalVisible && (
            <ResourceShareModal
              rid={value.rid}
              visible={shareModalVisible}
              onCancel={() => {
                setShareModalVisible(false);
              }}
            />
          )}
        </>
      )}
    </Drawer>
  );
};

export default InfoDrawer;
