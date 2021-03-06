import { request } from '@@/plugin-request/request';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { FileOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { formatSize } from '@/utils/utils';
import { iconMap } from '@/utils/icons';
import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Tabs } from 'antd';
import type { ShareProps, ShareResourceProps } from '@/typings';
import { ApiResponse } from '@/typings';
import defaultSettings from '../../../config/defaultSettings';
import { useModel } from '@@/plugin-model/useModel';

const { TabPane } = Tabs;

const Share = () => {
  const ref = useRef<ActionType>();
  const [activeKey, setActiveKey] = useState<string>('tome');

  const [pathmap, setPathmap] = useState([]);
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    request('/eoffice/api/config/pathmap').then((response) => {
      if (response.success) {
        setPathmap(response.data);
        ref?.current?.reload();
      }
    });
  }, []);

  const view = (shareId: string, data: ShareProps) => {
    window.open(
      `${defaultSettings.basepath}/${
        pathmap[data.extension] || 'unkown'
      }?share=${encodeURIComponent(data.share)}&shareId=${shareId}&k=${
        initialState?.currentUser?.userid
      }&mode='view'`,
    );
  };

  const columns: ProColumns<ShareResourceProps>[] = [
    {
      title: '文件名',
      dataIndex: 'name',
      sorter: {
        multiple: 1,
      },
      render: (_, record) => (
        <>
          {iconMap[record.resource.extension] || <FileOutlined />}
          <a
            onClick={(event) => {
              event.stopPropagation();
              const { resource } = record;
              switch (resource.extension) {
                case 'folder':
                  history.push({
                    pathname: `/res/${resource.key}`,
                  });
                  break;
                default:
                  request('/eoffice/api/resource/share', {
                    requestType: 'form',
                    method: 'POST',
                    data: {
                      shareId: record.shareId,
                      authCode: record.authCode,
                    },
                  }).then((res: ApiResponse<ShareProps>) => {
                    if (res.success) {
                      view(record.shareId, res.data);
                    }
                  });
                  break;
              }
            }}
          >
            {record.resource.name}
          </a>
        </>
      ),
    },
    {
      title: '大小',
      width: 100,
      sorter: {
        multiple: 2,
      },
      dataIndex: 'size',
      renderText: (_, record) => formatSize(record.resource.size),
    },
    {
      title: '提取码',
      width: 100,
      copyable: true,
      dataIndex: 'authCode',
    },
    {
      title: '类型',
      width: 60,
      sorter: {
        multiple: 3,
      },
      dataIndex: 'extension',
      renderText: (_, record) => record.resource.extension,
    },
    {
      title: '更新时间',
      width: 150,
      dataIndex: 'updateAt',
      renderText: (_, record) => record.resource.updateAt,
      sorter: {
        multiple: 4,
      },
    },
    {
      title: '过期时间',
      width: 150,
      dataIndex: 'endtime',
      renderText: (_, record) => record.endtime || '永不过期',
      sorter: {
        multiple: 4,
      },
    },
  ];

  return (
    <PageContainer title={false} breadcrumb={undefined}>
      <Card title={false}>
        <Tabs defaultActiveKey="tome" onChange={(value) => setActiveKey(value)}>
          <TabPane tab="分享给我" key="tome">
            {activeKey === 'tome' && (
              <ProTable<ShareResourceProps>
                actionRef={ref}
                columns={columns}
                request={async (params, sorter, filter) => {
                  // 表单搜索项会从 params 传入，传递给后端接口。
                  const response = await request('/eoffice/api/share', {
                    skipErrorHandler: true,
                    params: {
                      ...params,
                      sorter: JSON.stringify(sorter),
                      ...filter,
                    },
                  });

                  if (!response.success) {
                    return {
                      data: [],
                      // success 请返回 true，
                      // 不然 table 会停止解析数据，即使有数据
                      success: true,
                      // 不传会使用 data 的长度，如果是分页一定要传
                      total: 0,
                    };
                  }
                  return {
                    data: response.data.list,
                    // success 请返回 true，
                    // 不然 table 会停止解析数据，即使有数据
                    success: true,
                    // 不传会使用 data 的长度，如果是分页一定要传
                    total: response.data.pagination.total,
                  };
                }}
                pagination={false}
                size="small"
                toolBarRender={false}
                rowKey="key"
                search={false}
                dateFormatter="string"
              />
            )}
          </TabPane>
          <TabPane tab="我分享的" key="mine">
            {activeKey === 'mine' && (
              <ProTable<ShareResourceProps>
                actionRef={ref}
                columns={columns}
                request={async (params, sorter, filter) => {
                  // 表单搜索项会从 params 传入，传递给后端接口。
                  const response = await request('/eoffice/api/share/myshare', {
                    skipErrorHandler: true,
                    params: {
                      ...params,
                      sorter: JSON.stringify(sorter),
                      ...filter,
                    },
                  });
                  console.log(response);
                  if (!response.success) {
                    return {
                      data: [],
                      // success 请返回 true，
                      // 不然 table 会停止解析数据，即使有数据
                      success: true,
                      // 不传会使用 data 的长度，如果是分页一定要传
                      total: 0,
                    };
                  }

                  return {
                    data: response.data.list,
                    // success 请返回 true，
                    // 不然 table 会停止解析数据，即使有数据
                    success: true,
                    // 不传会使用 data 的长度，如果是分页一定要传
                    total: response.data.pagination.total,
                  };
                }}
                pagination={false}
                size="small"
                toolBarRender={false}
                rowKey="key"
                search={false}
                dateFormatter="string"
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </PageContainer>
  );
};

export default Share;
