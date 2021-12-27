import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Dropdown, Menu, Tooltip } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  FileExcelOutlined,
  FileMarkdownOutlined,
  FileOutlined,
  FilePptOutlined,
  FileWordOutlined,
  FolderOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { request } from 'umi';
import FolderModal from '@/pages/Resource/components/FolderModal';
import { layoutActionRef } from '@/app';

const { SubMenu } = Menu;

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

  const menu = (
    <Menu>
      <SubMenu title="新建/上传" icon={<UploadOutlined />}>
        <Menu.Item icon={<FolderOutlined />} onClick={() => setFolderModalVisible(true)}>
          新建文件夹
        </Menu.Item>
        <Menu.Item icon={<UploadOutlined />}>上传文件</Menu.Item>
        <Menu.Divider />
        <Menu.Item icon={<FileWordOutlined />}>Word文档</Menu.Item>
        <Menu.Item icon={<FileExcelOutlined />}>Excel文档</Menu.Item>
        <Menu.Item icon={<FilePptOutlined />}>PPT文档</Menu.Item>
        <Menu.Item icon={<FileMarkdownOutlined />}>Markdown</Menu.Item>
      </SubMenu>
      <Menu.Item
        key="2"
        icon={<ReloadOutlined />}
        onClick={() => {
          ref?.current?.reload();
          layoutActionRef?.current?.reload();
        }}
      >
        刷新
      </Menu.Item>
    </Menu>
  );
  console.log(ref);
  return (
    <PageContainer>
      {folderModalVisible && (
        <FolderModal
          pfid={0}
          visible={folderModalVisible}
          onCancel={() => setFolderModalVisible(false)}
          onOk={() => {
            ref?.current?.reload();
            setFolderModalVisible(false);
          }}
        />
      )}
      <Dropdown overlay={menu} trigger={['contextMenu']}>
        <Card>
          <ProTable<TableListItem>
            columns={columns}
            actionRef={ref}
            request={async (params, sorter, filter) => {
              // 表单搜索项会从 params 传入，传递给后端接口。
              return await request('/api/resource', {
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
      </Dropdown>
    </PageContainer>
  );
};
