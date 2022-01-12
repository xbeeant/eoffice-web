import type { ResourceProps } from '@/typings';
import { request } from '@@/plugin-request/request';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { FileOutlined } from '@ant-design/icons';
import { history } from '@@/core/history';
import { formatSize } from '@/utils/utils';
import { iconMap } from '@/utils/icons';
import { useEffect, useRef, useState } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Tabs } from 'antd';

const { TabPane } = Tabs;

const Share = () => {
  const [pathmap, setPathmap] = useState([]);
  const { initialState } = useModel('@@initialState');
  const ref = useRef<ActionType>();
  const [activeKey, setActiveKey] = useState<string>();

  useEffect(() => {
    request('/api/config/pathmap').then((response) => {
      if (response.success) {
        setPathmap(response.data);
        ref?.current?.reload();
      }
    });
  }, []);
  const columns: ProColumns<ResourceProps>[] = [
    {
      title: '文件名',
      dataIndex: 'name',
      sorter: {
        multiple: 1,
      },
      render: (_, record) => (
        <>
          {iconMap[record.extension] || <FileOutlined />}
          <a
            onClick={(event) => {
              event.stopPropagation();
              switch (record.extension) {
                case 'folder':
                  history.push({
                    pathname: `/res/${record.key}`,
                  });
                  break;
                default:
                  window.open(
                    `/${pathmap[record.extension] || 'unkown'}?rid=${record.rid}&sid=${
                      record.sid
                    }&k=${initialState?.currentUser?.userid}`,
                  );
                  break;
              }
            }}
          >
            {_}
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
      renderText: (text) => formatSize(text),
    },
    {
      title: '类型',
      width: 100,
      sorter: {
        multiple: 3,
      },
      dataIndex: 'extension',
    },
    {
      title: '更新时间',
      width: 200,
      key: 'since',
      dataIndex: 'updateAt',
      sorter: {
        multiple: 4,
      },
    },
  ];

  return (
    <PageContainer title={false}>
      <Card title={false}>
        <Tabs defaultActiveKey="tome" onChange={(value) => setActiveKey(value)}>
          <TabPane tab="分享给我" key="tome">
            {activeKey === 'tome' && (
              <ProTable<ResourceProps>
                actionRef={ref}
                columns={columns}
                request={async (params, sorter, filter) => {
                  // 表单搜索项会从 params 传入，传递给后端接口。
                  return await request('/api/share', {
                    skipErrorHandler: true,
                    params: {
                      ...params,
                      sorter: JSON.stringify(sorter),
                      ...filter,
                    },
                  });
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
            <ProTable<ResourceProps>
              actionRef={ref}
              columns={columns}
              request={async (params, sorter, filter) => {
                // 表单搜索项会从 params 传入，传递给后端接口。
                return await request('/api/share/myshare', {
                  skipErrorHandler: true,
                  params: {
                    ...params,
                    sorter: JSON.stringify(sorter),
                    ...filter,
                  },
                });
              }}
              pagination={false}
              size="small"
              toolBarRender={false}
              rowKey="key"
              search={false}
              dateFormatter="string"
            />
          </TabPane>
        </Tabs>
      </Card>
    </PageContainer>
  );
};

export default Share;
