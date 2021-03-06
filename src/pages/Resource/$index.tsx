import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Popconfirm, Space, Tooltip } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { DownloadOutlined, EditOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import { history, request, useModel } from 'umi';
import type { PopupProps } from './components/Popup';
import Popup from './components/Popup';
import { formatSize } from '@/utils/utils';
import type { ApiResponse, ResourceParamsProps, ResourceProps } from '@/typings';
import InfoDrawerProps from './components/InfoDrawer';
import MoveFolderModal from './components/MoveFolderModal';
import { iconMap } from '@/utils/icons';
import { layoutActionRef } from '@/app';
import FileUploadModal from '@/pages/Resource/components/FileUploadModal';
import defaultSettings from '../../../config/defaultSettings';
import ResourceAuthModal from '@/pages/Resource/components/ResourceAuthModal';
import ResourceShareModal from '@/pages/Resource/components/ResourceShareModal';

const key = defaultSettings.version;
const hashViewer = {
  unkown: true,
  image: true,
};
const Resource: React.ReactNode = ({ match }: ResourceParamsProps) => {
  const { params: matchParams } = match;

  const ref = useRef<ActionType>();

  const [pathmap, setPathmap] = useState([]);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [fid, setFid] = useState<string>('');
  const [selected, setSelected] = useState<ResourceProps>();
  const [moveModalVisible, setMoveModalVisible] = useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [overwriteFileModalVisible, setOverwriteFileModalVisible] = useState(false);
  const [permModalVisible, setPermModalVisible] = useState<boolean>(false);
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);

  const [fileModalVisible, setFileModalVisible] = useState(false);

  useEffect(() => {
    const isViewed = localStorage.getItem(key);
    if (!isViewed) {
      // setShowIntroduction(true);
    }
  }, []);

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
      await setInitialState((s: any) => ({
        ...s,
        breadcrumbs: breadcrumbs,
      }));
    }
    // layoutActionRef?.current?.reload();
  };

  const view = (mode: string, value: ResourceProps) => {
    const viewer = pathmap[value.extension] || 'unkown';
    if (hashViewer[viewer]) {
      window.open(
        `${defaultSettings.basepath}/#/eoffice/${viewer}?rid=${value.rid}&sid=&k=${initialState?.currentUser?.userid}&mode=${mode}`,
      );
    } else {
      window.open(
        `${defaultSettings.basepath}/${viewer}?rid=${value.rid}&sid=&k=${initialState?.currentUser?.userid}&mode=${mode}`,
      );
    }
  };

  const columns: ProColumns<ResourceProps>[] = [
    {
      title: (
        <Space direction="horizontal">
          <span>??????</span>
        </Space>
      ),
      width: 120,
      fixed: 'left',
      dataIndex: 'option',
      render: (_, record) => {
        return (
          <>
            <Tooltip title="??????">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation();
                  view('edit', record);
                }}
              />
            </Tooltip>
            <Tooltip title="??????">
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
            <Tooltip title="??????">
              <Button
                type="text"
                icon={<UploadOutlined />}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected(record);
                  setOverwriteFileModalVisible(true);
                }}
              />
            </Tooltip>
          </>
        );
      },
    },
    {
      title: '?????????',
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
      title: '??????',
      width: 100,
      sorter: {
        multiple: 2,
      },
      dataIndex: 'size',
      renderText: (text) => formatSize(text),
    },
    {
      title: '??????',
      width: 100,
      sorter: {
        multiple: 3,
      },
      dataIndex: 'extension',
    },
    {
      title: '????????????',
      width: 200,
      key: 'since',
      dataIndex: 'updateAt',
      sorter: {
        multiple: 4,
      },
    },
  ];

  useEffect(() => {
    request('/eoffice/api/config/pathmap').then(
      (response: { success: boolean; data: React.SetStateAction<never[]> }) => {
        if (response.success) {
          setPathmap(response.data);
          ref?.current?.reload();
        }
      },
    );
    refreshBreadcrumb();
    setFid(matchParams.fid);
  }, [matchParams]);

  const renderExtra = () => {
    if (matchParams.fid) {
      return (
        <>
          <Button
            onClick={(event) => {
              event.stopPropagation();
              setFileModalVisible(true);
            }}
          >
            ????????????
          </Button>
          <Button
            onClick={(event) => {
              event.stopPropagation();
              setPermModalVisible(true);
            }}
          >
            ????????????
          </Button>
        </>
      );
    }

    return <></>;
  };

  // @ts-ignore
  return (
    <PageContainer extra={renderExtra()} title={false}>
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
                <Button type="text" onClick={() => setMoveModalVisible(true)}>
                  ????????????
                </Button>
                <Popconfirm
                  style={{ backgroundColor: 'red' }}
                  title="????????????????????????????????????????????????"
                  disabled={selectedKeys && selectedKeys.length === 0}
                  onConfirm={() => {
                    request('/eoffice/api/resource', {
                      method: 'DELETE',
                      data: {
                        rid: selectedKeys,
                      },
                      requestType: 'form',
                    }).then((response: ApiResponse<any>) => {
                      if (response.success) {
                        setSelectedKeys([]);
                        layoutActionRef?.current?.reload();
                        ref.current?.reload();
                      }
                    });
                  }}
                >
                  ????????????
                </Popconfirm>
              </Space>
            );
          }}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={async (params, sorter, filter) => {
            // ????????????????????? params ?????????????????????????????????
            return await request('/eoffice/api/resource', {
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
      {permModalVisible && (
        <ResourceAuthModal
          rid={matchParams.fid}
          visible={permModalVisible}
          reload={() => {}}
          onCancel={() => {
            setPermModalVisible(false);
          }}
        />
      )}
      {shareModalVisible && (
        <ResourceShareModal
          rid={matchParams.fid}
          visible={shareModalVisible}
          reload={() => {}}
          onCancel={() => {
            setShareModalVisible(false);
          }}
        />
      )}
      {selected && !overwriteFileModalVisible && (
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
      {overwriteFileModalVisible && (
        <FileUploadModal
          action={'/eoffice/api/resource/upload/overwrite'}
          fid={fid || '0'}
          rid={selected?.rid}
          visible={overwriteFileModalVisible}
          onCancel={() => {
            setSelected(undefined);
            setOverwriteFileModalVisible(false);
          }}
          onOk={() => {
            setSelected(undefined);
            ref?.current?.reload();
            setOverwriteFileModalVisible(false);
          }}
        />
      )}
      <Popup {...popup} />
      {fileModalVisible && (
        <FileUploadModal
          action={'/eoffice/api/resource/upload/save'}
          fid={fid || '0'}
          visible={fileModalVisible}
          onCancel={() => setFileModalVisible(false)}
          onOk={() => {
            ref?.current?.reload();
            setFileModalVisible(false);
          }}
        />
      )}
    </PageContainer>
  );
};

export default Resource;
