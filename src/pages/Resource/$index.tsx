import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Breadcrumb, Card } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { FileExcelOutlined, FileOutlined, FolderOutlined } from '@ant-design/icons';
import { history, request } from 'umi';
import type { PopupProps } from './components/Popup';
import Popup from './components/Popup';
import { formatSize } from '@/utils/utils';
import { useModel } from '@@/plugin-model/useModel';

export type TableListItem = {
  key: number;
  name: string;
  size: number;
  extension: string;
  updateAt: number;
};

const iconMap = {
  folder: <FolderOutlined />,
  unknow: <FileOutlined />,
  xlsx: <FileExcelOutlined />,
  xls: <FileExcelOutlined />,
};

interface MenuProps {
  name: string;
  path: string;
  children?: MenuProps[];
}

interface ResourceProps {
  match: { params: { fid: number } };
}

const Resource: React.ReactNode = ({ match }: ResourceProps) => {
  const { params: matchParams } = match;

  const { initialState } = useModel('@@initialState');
  console.log(initialState?.pathmap);
  const ref = useRef<ActionType>();

  const [menu, setMenu] = useState<MenuProps>();

  const [popup, setPopup] = useState<PopupProps>({
    fid: matchParams?.fid,
    actionRef: ref,
    visible: false,
    x: 0,
    y: 0,
    record: {},
  });

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
              console.log(record.extension);
              console.log(initialState?.pathmap);
              switch (record.extension) {
                case 'folder':
                  history.push({
                    pathname: `/res/${record.key}`,
                  });
                  break;
                default:
                  window.open(
                    `/view/${initialState?.pathmap[record.extension] || 'unkown'}/?rid=${
                      record.rid
                    }&aid=${record.aid}`,
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

  const getBreadcrumbs = async (fid: number) => {
    if (fid) {
      const response = await request('/api/folder/parents?fid=' + fid);
      setMenu(response.data || {});
    }
  };

  // @ts-ignore
  const renderSubBreadcrumb = (item: MenuProps) => {
    return (
      <>
        <Breadcrumb.Item
          key={item.path}
          onClick={(e) => {
            e.stopPropagation();
            history.push({
              pathname: item.path,
            });
          }}
        >
          <a href="javascript:void (0);">{item.name}</a>
        </Breadcrumb.Item>
        {item.children && item.children.map((sub) => renderSubBreadcrumb(sub))}
      </>
    );
  };

  const renderBreadcrumb = () => {
    return (
      <Breadcrumb>
        <Breadcrumb.Item
          key={'/'}
          onClick={(e) => {
            e.stopPropagation();
            history.push({
              pathname: '/',
            });
          }}
        >
          <a href="javascript:void (0);">我的</a>
        </Breadcrumb.Item>
        {menu && renderSubBreadcrumb(menu)}
      </Breadcrumb>
    );
  };

  useEffect(() => {
    console.log(matchParams);
    ref?.current?.reload();
    getBreadcrumbs(matchParams?.fid);
  }, [matchParams]);

  return (
    <PageContainer
      title={false}
      header={{
        breadcrumbRender: (_, originBreadcrumb) => {
          const fid = matchParams?.fid;
          if (fid) {
            return renderBreadcrumb();
          }

          return originBreadcrumb;
        },
      }}
    >
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
