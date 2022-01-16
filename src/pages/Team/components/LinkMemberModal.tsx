import { Modal } from 'antd';
import { useRef } from 'react';
import { request } from 'umi';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { UserProps } from '@/typings';

export type LinkMemberModalProps = {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  type?: string | number;
  reload: () => void;
  gid: number | string;
};

const LinkMemberModal = ({ visible, onOk, reload, onCancel, gid }: LinkMemberModalProps) => {
  const ref = useRef<ActionType>();

  const columns: ProColumns<UserProps>[] = [
    {
      title: '昵称',
      dataIndex: 'nickname',
      ellipsis: true,
      width: 200,
    },
    {
      title: '帐号',
      dataIndex: 'username',
      ellipsis: true,
      width: 200,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="add"
          onClick={() => {
            request('/api/team/user', {
              method: 'POST',
              data: { gid, userId: record.uid },
              requestType: 'form',
            }).then((res) => {
              if (res.success) {
                ref.current?.reload();
                reload();
              }
            });
          }}
        >
          添加
        </a>,
      ],
    },
  ];

  return (
    <Modal title="添加成员到群组" visible={visible} onCancel={onCancel} width={1024} onOk={onOk}>
      <ProTable
        actionRef={ref}
        tableAlertRender={false}
        columns={columns}
        request={async (params, sorter, filter) => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          const response = await request('/api/team/user/unlink', {
            params: { ...params, ...sorter, ...filter, gid },
            skipErrorHandler: true,
          });
          if (response.success) {
            return {
              data: response.data.list,
              // success 请返回 true，
              // 不然 table 会停止解析数据，即使有数据
              success: true,
              // 不传会使用 data 的长度，如果是分页一定要传
              total: response.data.pagination.total,
            };
          }
          return {
            data: [],
            success: true,
            total: 0,
          };
        }}
        rowKey="key"
        options={false}
        pagination={{
          showQuickJumper: true,
        }}
      />
    </Modal>
  );
};

export default LinkMemberModal;
