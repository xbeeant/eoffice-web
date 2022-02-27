import React, { useState, useRef } from 'react';
import { request } from '@@/plugin-request/request';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Card, Popconfirm } from 'antd';
import FileUploadModal from './components/FileUploadModal';
import { ApiResponse } from '@/typings';

type TableListItem = {
  title: string;
  createAt: string;
  tid: number | string;
};

type DetailListProps = {
  category: CategoryProps;
};

const DetailList: React.FC<DetailListProps> = (props) => {
  const { category } = props;
  const actionRef = useRef<ActionType>();

  const [uploaderModalVisible, setUploaderModalVisible] = useState<boolean>(false);

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '名称',
      key: 'title',
      dataIndex: 'title',
    },
    {
      title: '创建时间',
      key: 'createAt',
      dataIndex: 'createAt',
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      valueType: 'option',
      render: (_, record) => [
        <Popconfirm
          title="您确定要删除所选的模板吗？"
          onConfirm={() => {
            request(`/eoffice/api/template/${record.tid}`, {
              method: 'DELETE',
              requestType: 'form',
            }).then((response: ApiResponse<any>) => {
              if (response.success) {
                actionRef.current?.reload();
              }
            });
          }}
        >
          <span style={{ color: 'red' }}>移除</span>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable<TableListItem>
        actionRef={actionRef}
        columns={columns}
        params={{
          cid: category?.cid,
        }}
        toolbar={{
          actions: [
            <Button key="list" type="primary" onClick={() => setUploaderModalVisible(true)}>
              上传模板
            </Button>,
          ],
        }}
        request={async (params, sorter, filter) => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          const response = await request('/eoffice/api/template/table', {
            params: { ...params, ...sorter, ...filter, cid: category.cid },
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
        rowKey="tid"
        search={false}
      />
      {uploaderModalVisible && (
        <FileUploadModal
          visible={uploaderModalVisible}
          onCancel={() => setUploaderModalVisible(false)}
          cid={category.cid}
          accept={category.extension}
          onOk={() => {
            setUploaderModalVisible(false);
            actionRef.current?.reload();
          }}
        />
      )}
    </>
  );
};

export type CategoryProps = {
  cid: number | string;
  name: string;
  extension: string;
};

type IPListProps = {
  onChange: (category: CategoryProps) => void;
};

const CategoryList: React.FC<IPListProps> = (props) => {
  const { onChange } = props;

  const columns: ProColumns<CategoryProps>[] = [
    {
      title: '文档类型',
      key: 'name',
      dataIndex: 'name',
    },
  ];
  return (
    <ProTable<CategoryProps>
      columns={columns}
      request={async (params, sorter, filter) => {
        // 表单搜索项会从 params 传入，传递给后端接口。
        const response = await request('/eoffice/api/template/category/table', {
          params: { ...params, ...sorter, ...filter },
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
      rowKey="cid"
      options={false}
      search={false}
      onRow={(record) => {
        return {
          onClick: () => {
            if (record.cid) {
              onChange(record);
            }
          },
        };
      }}
    />
  );
};

const Template = () => {
  const [category, setCategory] = useState<CategoryProps>();

  return (
    <PageContainer title={false}>
      <Card>
        <ProCard split="vertical">
          <ProCard colSpan="384px" ghost className="left-card">
            <CategoryList onChange={(value) => setCategory(value)} />
          </ProCard>
          {category && (
            <ProCard title={category.name}>
              <DetailList category={category} />
            </ProCard>
          )}
        </ProCard>
      </Card>
    </PageContainer>
  );
};

export default Template;
