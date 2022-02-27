import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Popconfirm, Space, Tree, Result } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { request } from 'umi';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import TeamManageModal from './components/TeamManageModal';
import LinkMemberModal from './components/LinkMemberModal';
import { ApiResponse, TeamProps, UserProps } from '@/typings';

const Team = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState<TeamProps>({ gid: '', name: '', pgid: '', type: '' });
  const [groupModalVisible, setGroupModalVisible] = useState<boolean>(false);
  // 向群组添加成员的modal
  const [memberModalVisible, setMemberModalVisible] = useState<boolean>(false);

  const memberRef = useRef<ActionType>();

  // 加载群组树data
  const loadData = () => {
    setLoading(true);
    request('/eoffice/api/team/tree', {
      params: { type: 1 },
    }).then((res) => {
      if (!res || res?.length === 0) {
        setSelected({ gid: '', name: '', pgid: '', type: '' });
      }
      setData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const memberColumns: ProColumns<UserProps>[] = [
    {
      dataIndex: 'nickname',
      title: '用户',
      hideInTable: false,
      hideInSearch: false,
    },
    {
      dataIndex: 'username',
      title: '员工号',
      hideInSearch: true,
      hideInTable: false,
    },
    {
      dataIndex: 'phone',
      title: '手机号',
      hideInSearch: true,
      hideInTable: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => [
        <a
          key="remove"
          onClick={() => {
            request('/eoffice/api/team/user', {
              method: 'DELETE',
              data: { uid: record.uid, gid: selected.gid },
              requestType: 'form',
            }).then((res) => {
              if (res.success) {
                memberRef.current?.reload();
              }
            });
          }}
        >
          移除
        </a>,
      ],
    },
  ];

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      setSelected({
        pgid: info.node.pKey === '0' ? '' : info.node.pKey,
        type: '',
        gid: info.node.value,
        name: info.node.title,
      });
      memberRef?.current?.reload();
    } else {
      setSelected({ gid: '', name: '', pgid: '', type: '' });
    }
  };

  const newGroup = () => {
    setGroupModalVisible(true);
  };

  const delGroup = (gid: string | number) => {
    // 删除群组
    request(`/eoffice/api/team/${gid}`, {
      method: 'DELETE',
      requestType: 'form',
    }).then((res: ApiResponse<any>) => {
      if (res.success) {
        loadData();
      }
    });
  };

  return (
    <PageContainer title="群组" breadcrumb={undefined}>
      {data?.length > 0 ? (
        <ProCard split="vertical">
          <ProCard
            colSpan="30%"
            loading={loading}
            extra={
              <Space>
                <Button
                  type="primary"
                  onClick={() => {
                    setSelected({ gid: '', name: '', pgid: '', type: '' });
                    setGroupModalVisible(true);
                  }}
                >
                  新建群组
                </Button>
                <Button disabled={!selected.gid} onClick={() => setGroupModalVisible(true)}>
                  编辑群组
                </Button>
                <Popconfirm
                  title="确认要删除这个群组吗？"
                  onConfirm={() => delGroup(selected.gid)}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button disabled={!selected.gid}>删除群组</Button>
                </Popconfirm>
              </Space>
            }
          >
            <Tree showLine={true} defaultExpandAll={true} onSelect={onSelect} treeData={data} />
          </ProCard>
          <ProCard colSpan="70%">
            {selected && selected.gid !== '' ? (
              <ProTable
                columns={memberColumns}
                actionRef={memberRef}
                request={async (params, sorter, filter) => {
                  // 表单搜索项会从 params 传入，传递给后端接口。
                  const response = await request('/eoffice/api/team/user', {
                    params: { ...params, ...sorter, ...filter, gid: selected?.gid },
                    skipErrorHandler: true,
                  });
                  if (response.success) {
                    return {
                      data: response.data.list,
                      success: true,
                      total: response.data.pagination.total,
                    };
                  }
                  return {
                    data: [],
                    success: true,
                    total: 0,
                  };
                }}
                rowKey="member"
                toolbar={{
                  actions: [
                    <Button
                      key="addMember"
                      type="primary"
                      disabled={selected.gid === ''}
                      onClick={() => setMemberModalVisible(true)}
                    >
                      关联成员
                    </Button>,
                  ],
                }}
                options={false}
                search={false}
              />
            ) : (
              <Result title="请选择需要查看成员的群组" />
            )}
          </ProCard>
        </ProCard>
      ) : (
        <Result
          title="暂无群组信息"
          extra={
            <Button type="primary" key="newGroup" onClick={newGroup}>
              创建我的群组
            </Button>
          }
        />
      )}
      {groupModalVisible && (
        <TeamManageModal
          visible={groupModalVisible}
          type={1}
          value={selected}
          onCreate={() => {
            loadData();
            setGroupModalVisible(false);
          }}
          onCancel={() => setGroupModalVisible(false)}
        />
      )}
      {memberModalVisible && (
        <LinkMemberModal
          visible={memberModalVisible}
          gid={selected.gid}
          reload={() => {
            memberRef?.current?.reload();
          }}
          onOk={() => {
            setMemberModalVisible(false);
          }}
          onCancel={() => setMemberModalVisible(false)}
        />
      )}
    </PageContainer>
  );
};

export default Team;
