import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Popconfirm, Space, Tooltip } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { DownloadOutlined, EditOutlined, FileOutlined } from '@ant-design/icons';
import { history, request } from 'umi';
import type { PopupProps } from './components/Popup';
import Popup from './components/Popup';
import { formatSize } from '@/utils/utils';
import type { ApiResponse, ResourceParamsProps, ResourceProps } from '@/typings';
import { useModel } from '@@/plugin-model/useModel';
import InfoDrawerProps from './components/InfoDrawer';
import MoveFolderModal from './components/MoveFolderModal';
import { iconMap } from '@/utils/icons';
import { layoutActionRef } from '@/app';

const Resource: React.ReactNode = ({ match }: ResourceParamsProps) => {
  const { params: matchParams } = match;

  const ref = useRef<ActionType>();

  const [pathmap, setPathmap] = useState([]);
  const { initialState, setInitialState } = useModel('@@initialState');

  const [fid, setFid] = useState<string>('');
  const [selected, setSelected] = useState<ResourceProps>();
  const [moveModalVisible, setMoveModalVisible] = useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const [popup, setPopup] = useState<PopupProps>({
    fid: matchParams?.fid,
    actionRef: ref,
    visible: false,
    x: 0,
    y: 0,
    record: {},
  });

  const refreshBreadcrumb = async () => {
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
    // layoutActionRef?.current?.reload();
  };

  const view = (mode: string, value: ResourceProps) => {
    window.open(
      `/${pathmap[value.extension] || 'unkown'}?rid=${value.rid}&sid=${value.sid}&k=${
        initialState?.currentUser?.userid
      }&mode=${mode}`,
    );
  };

  const columns: ProColumns<ResourceProps>[] = [
    {
      title: '操作',
      width: 100,
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
                  window.open(`/api/resource/s?rid=${record.rid}&sid=${record.sid}`);
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

  // @ts-ignore
  return (
    <PageContainer title={false}>
      <Card
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
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
          return false;
        }}
      >
        <ProTable<ResourceProps>
          columns={columns}
          actionRef={ref}
          rowSelection={{
            onChange: (selectedRowKeys: React.Key[]) => {
              console.log(selectedRowKeys);
              setSelectedKeys(selectedRowKeys);
            },
          }}
          // @ts-ignore
          toolBarRender={() => {
            return selectedKeys && selectedKeys.length === 0 ? (
              false
            ) : (
              <Space>
                <Button onClick={() => setMoveModalVisible(true)}>批量移动</Button>
                <Popconfirm
                  style={{ backgroundColor: 'red' }}
                  title="您确定要删除所选的文件（夹）吗？"
                  disabled={selectedKeys && selectedKeys.length === 0}
                  onConfirm={() => {
                    request('/api/resource', {
                      method: 'DELETE',
                      data: {
                        rid: selectedKeys,
                      },
                      requestType: 'form',
                    }).then((response: ApiResponse) => {
                      if (response.success) {
                        setSelectedKeys([]);
                        layoutActionRef?.current?.reload();
                        ref.current?.reload();
                      }
                    });
                  }}
                >
                  批量删除
                </Popconfirm>
              </Space>
            );
          }}
          tableAlertRender={false}
          tableAlertOptionRender={false}
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
                event.stopPropagation();
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
                return false;
              },
              onClick: (event) => {
                event.stopPropagation();
                setSelected(record);
              },
            };
          }}
          size="small"
          rowKey="rid"
          search={false}
          dateFormatter="string"
        />
      </Card>
      {selected && (
        <InfoDrawerProps
          action={ref}
          visible={selected !== undefined}
          // @ts-ignore
          value={selected}
          onClose={() => setSelected(undefined)}
        />
      )}
      {moveModalVisible && (
        <MoveFolderModal
          visible={moveModalVisible}
          rids={selectedKeys}
          actionRef={ref}
          fid={fid}
          onCancel={() => setMoveModalVisible(false)}
        />
      )}
      <Popup {...popup} />
    </PageContainer>
  );
};

export default Resource;
