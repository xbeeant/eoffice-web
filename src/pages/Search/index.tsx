import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { ResourceProps } from '@/typings';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, Space, Tooltip, Skeleton } from 'antd';
import { request } from '@@/plugin-request/request';
import { DownloadOutlined, EditOutlined, FileOutlined } from '@ant-design/icons';
import { history } from '@@/core/history';
import { iconMap } from '@/utils/icons';
import { formatSize } from '@/utils/utils';
import defaultSettings from '../../../config/defaultSettings';
import { useModel } from '@@/plugin-model/useModel';

// @ts-ignore
const Search = ({ location }) => {
  const [pathmap, setPathmap] = useState([]);
  const ref = useRef<ActionType>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    request('/eoffice/api/config/pathmap').then((response) => {
      if (response.success) {
        setPathmap(response.data);
        ref?.current?.reload();
      }
      setLoading(false);
    });
  }, []);

  const { initialState } = useModel('@@initialState');

  const view = (mode: string, value: ResourceProps) => {
    window.open(
      `${defaultSettings.basepath}/${pathmap[value.extension] || 'unkown'}?rid=${value.rid}&sid=${
        value.sid
      }&k=${initialState?.currentUser?.userid}&mode=${mode}`,
    );
  };

  const columns: ProColumns<ResourceProps>[] = [
    {
      width: 80,
      fixed: 'left',
      dataIndex: 'option',
      render: (_, record) => {
        return (
          <>
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation();
                  view('edit', record);
                }}
              />
            </Tooltip>
            <Tooltip title="下载">
              <Button
                type="text"
                icon={<DownloadOutlined />}
                disabled={record.extension === 'folder'}
                onClick={(event) => {
                  event.stopPropagation();
                  window.open(`/eoffice/api/resource/s?rid=${record.rid}&sid=${record.sid}`);
                }}
              />
            </Tooltip>
          </>
        );
      },
    },
    {
      title: '文件名',
      dataIndex: 'name',
      sorter: {
        multiple: 1,
      },
      render: (_, record) => (
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
                view('view', record);
                break;
            }
          }}
        >
          <Space>
            {iconMap[record.extension] || <FileOutlined />}
            {_}
          </Space>
        </a>
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
  console.log(location);
  return (
    <PageContainer title={false}>
      <Card>
        {loading ? (
          <Skeleton />
        ) : (
          <ProTable<ResourceProps>
            actionRef={ref}
            columns={columns}
            tableAlertRender={false}
            tableAlertOptionRender={false}
            params={{
              key: location.query.s,
            }}
            request={async (params, sorter, filter) => {
              // 表单搜索项会从 params 传入，传递给后端接口。
              return await request('/eoffice/api/resource', {
                params: {
                  ...params,
                  sorter: JSON.stringify(sorter),
                  ...filter,
                },
              });
            }}
            pagination={false}
            size="small"
            rowKey="rid"
            search={false}
            dateFormatter="string"
          />
        )}
      </Card>
    </PageContainer>
  );
};

export default Search;
