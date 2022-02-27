import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Tooltip } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  FileExcelOutlined,
  FileOutlined,
  FolderOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { request } from 'umi';
import FolderModal from '@/pages/Resource/components/FolderModal';

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

const columns: ProColumns<TableListItem>[] = [
  {
    title: '文件名',
    dataIndex: 'name',
    render: (_, record) => (
      <>
        {iconMap[record.extension] || <FileOutlined />}
        <a>{_}</a>
      </>
    ),
  },
  {
    title: '大小',
    width: 100,
    dataIndex: 'size',
  },
  {
    title: '类型',
    width: 200,
    dataIndex: 'extension',
  },
  {
    title: (
      <>
        更新时间
        <Tooltip placement="top" title="更新时间">
          <QuestionCircleOutlined style={{ marginLeft: 4 }} />
        </Tooltip>
      </>
    ),
    width: 140,
    key: 'since',
    dataIndex: 'createdAt',
    valueType: 'date',
    sorter: (a, b) => a.updateAt - b.updateAt,
  },
];

export default (): React.ReactNode => {
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const ref = useRef<ActionType>();

  return (
    <PageContainer>
      {folderModalVisible && (
        <FolderModal
          pfid="0"
          visible={folderModalVisible}
          onCancel={() => setFolderModalVisible(false)}
          onOk={() => {
            ref?.current?.reload();
            setFolderModalVisible(false);
          }}
        />
      )}
      <Card>
        <ProTable<TableListItem>
          columns={columns}
          actionRef={ref}
          request={async (params, sorter, filter) => {
            // 表单搜索项会从 params 传入，传递给后端接口。
            return await request('/eoffice/api/resource', {
              params: { ...params, ...sorter, ...filter },
            });
          }}
          size="small"
          toolBarRender={false}
          rowKey="key"
          search={false}
          dateFormatter="string"
        />
      </Card>
    </PageContainer>
  );
};
