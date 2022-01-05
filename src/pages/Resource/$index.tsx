import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { FileExcelOutlined, FileOutlined, FolderOutlined } from '@ant-design/icons';
import { history, request } from 'umi';
import type { PopupProps } from './components/Popup';
import Popup from './components/Popup';
import { formatSize } from '@/utils/utils';
import type { ResourceParamsProps } from '@/typings';
import { useModel } from '@@/plugin-model/useModel';
import { layoutActionRef } from '@/app';

export type TableListItem = {
  key: number;
  name: string;
  size: number;
  extension: string;
  updateAt: number;
  rid: string;
  sid: string;
};

const iconMap = {
  folder: <FolderOutlined />,
  unknow: <FileOutlined />,
  xlsx: <FileExcelOutlined />,
  xls: <FileExcelOutlined />,
};

const Resource: React.ReactNode = ({ match }: ResourceParamsProps) => {
  const { params: matchParams } = match;

  const ref = useRef<ActionType>();

  const [pathmap, setPathmap] = useState([]);
  const { initialState, setInitialState } = useModel('@@initialState');

  const [fid, setFid] = useState<string>('');

  const [popup, setPopup] = useState<PopupProps>({
    fid: matchParams?.fid,
    actionRef: ref,
    visible: false,
    x: 0,
    y: 0,
    record: {},
  });

  const refreshBreadcrumb = async () => {
    console.log(initialState);
    if (fid === matchParams?.fid) {
      return;
    }
    // @ts-ignore
    const breadcrumbs = await initialState?.fetchBreadcrumb();
    if (breadcrumbs) {
      await setInitialState((s) => ({
        ...s,
        breadcrumbs: breadcrumbs,
      }));
    }
    layoutActionRef?.current?.reload();
  };

  const columns: ProColumns<TableListItem>[] = [
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
            onClick={() => {
              console.log(record.extension, pathmap);
              switch (record.extension) {
                case 'folder':
                  history.push({
                    pathname: `/res/${record.key}`,
                  });
                  break;
                default:
                  window.open(
                    `/${pathmap[record.extension] || 'unkown'}?rid=${record.rid}&sid=${record.sid}`,
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

  useEffect(() => {
    request('/api/config/pathmap').then((response) => {
      if (response.success) {
        setPathmap(response.data);
        ref?.current?.reload();
      }
    });
    refreshBreadcrumb();
    setFid(matchParams.fid);
  }, [matchParams]);

  return (
    <PageContainer title={false}>
      <Card
        onContextMenu={(event) => {
          event.preventDefault();
          if (!popup.visible) {
            document.addEventListener(`click`, function onClickOutside() {
              setPopup({ visible: false, actionRef: ref, fid: matchParams?.fid, record: null });
              document.removeEventListener(`click`, onClickOutside);
            });
          }
          setPopup({
            fid: matchParams?.fid,
            actionRef: ref,
            record: null,
            visible: true,
            x: event.clientX,
            y: event.clientY,
          });
        }}
      >
        <ProTable<TableListItem>
          columns={columns}
          actionRef={ref}
          request={async (params, sorter, filter) => {
            // 表单搜索项会从 params 传入，传递给后端接口。
            return await request('/api/resource', {
              params: {
                ...params,
                sorter: JSON.stringify(sorter),
                ...filter,
                fid: matchParams?.fid,
              },
            });
          }}
          pagination={false}
          onRow={(record) => {
            return {
              onContextMenu: (event) => {
                event.preventDefault();
                if (!popup.visible) {
                  document.addEventListener(`click`, function onClickOutside() {
                    setPopup({ visible: false, actionRef: ref, fid: matchParams?.fid, record });
                    document.removeEventListener(`click`, onClickOutside);
                  });
                }
                setPopup({
                  fid: matchParams?.fid,
                  actionRef: ref,
                  record,
                  visible: true,
                  x: event.clientX,
                  y: event.clientY,
                });
              },
            };
          }}
          size="small"
          toolBarRender={false}
          rowKey="key"
          search={false}
          dateFormatter="string"
        />
      </Card>
      <Popup {...popup} />
    </PageContainer>
  );
};

export default Resource;
