import {
  Button,
  Collapse,
  Descriptions,
  Divider,
  Drawer,
  Input,
  Popconfirm,
  Skeleton,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import type { ApiResponse, ResourceProps, PermTargetProps } from '@/typings';
import { formatSize } from '@/utils/utils';
import type { MutableRefObject } from 'react';
import { useEffect, useState } from 'react';
import { request } from 'umi';
import ResourceAuthModal from './ResourceAuthModal';
import {
  DeleteTwoTone,
  DownloadOutlined,
  EditOutlined,
  ShareAltOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import ResourceShareModal from './ResourceShareModal';
import VersionHistory from './VersionHistory';

export type InfoDrawerProps = {
  visible: boolean;
  onClose: () => void;
  value: ResourceProps;
  action: MutableRefObject<ActionType | undefined>;
};

export interface ResourceDetailProps extends ResourceProps {
  permed?: PermTargetProps[];
}

const IconMap = {
  0: <UserOutlined />,
  1: <TeamOutlined />,
};

const { Panel } = Collapse;

const PermInfo = (value: PermTargetProps) => {
  return (
    <Space>
      <span>已授予：</span>
      {value.edit && <span>编辑</span>}
      {value.download && <span>下载</span>}
      {value.view && <span>查看</span>}
      {value.print && <span>打印</span>}
    </Space>
  );
};

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
    const json = await request('/eoffice/api/resource/info', {
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
      width={600}
      title={
        <>
          {editTitleMode ? (
            <Input
              autoFocus={true}
              defaultValue={data.name}
              onBlur={(event) => {
                const name = event.target.value;
                request('/eoffice/api/resource/rename', {
                  method: 'POST',
                  requestType: 'form',
                  data: {
                    rid: data.rid,
                    name: name,
                  },
                }).then((json: ApiResponse<any>) => {
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
                <Tooltip title="重命名">
                  <EditOutlined
                    onClick={() => {
                      setEditTitleMode(true);
                    }}
                  />
                </Tooltip>
                <Divider />
                {value.extension !== 'folder' && [
                  <Tooltip title="分享">
                    <ShareAltOutlined
                      onClick={() => {
                        setShareModalVisible(true);
                      }}
                    />
                  </Tooltip>,
                  <Divider />,
                  <Tooltip title="下载">
                    <DownloadOutlined
                      onClick={() => {
                        window.open(`/eoffice/api/resource/s?rid=${value.rid}&sid=${value.sid}`);
                      }}
                    />
                  </Tooltip>,
                  <Divider />,
                ]}
                <Tooltip title="删除">
                  <Popconfirm
                    title="确定删除此文件（夹）嘛?"
                    onConfirm={() => {
                      request('/eoffice/api/resource', {
                        method: 'DELETE',
                        requestType: 'form',
                        data: {
                          rid: value.rid,
                        },
                      }).then((json: ApiResponse<any>) => {
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
                </Tooltip>
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
            {value.extension === 'folder' && (
              <Panel
                key="auth"
                header="授权"
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
                <Space style={{ flexWrap: 'wrap' }}>
                  {data.permed?.map((item) => (
                    <Tooltip title={PermInfo(item)}>
                      <Tag icon={IconMap[item.targetType]}>{item.targetName}</Tag>
                    </Tooltip>
                  ))}
                </Space>
              </Panel>
            )}
            <Panel key="history" header="历史信息">
              <VersionHistory rid={value.rid} />
            </Panel>
          </Collapse>
          {permModalVisible && (
            <ResourceAuthModal
              rid={value.rid}
              visible={permModalVisible}
              reload={() => loadData()}
              onCancel={() => {
                setPermModalVisible(false);
              }}
            />
          )}
          {shareModalVisible && (
            <ResourceShareModal
              rid={value.rid}
              visible={shareModalVisible}
              reload={() => loadData()}
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
