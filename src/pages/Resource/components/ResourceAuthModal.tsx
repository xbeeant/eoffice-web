import type { SelectProps } from 'antd';
import { Form, Modal, Popconfirm, Select, Spin, Tabs } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import ProForm, { ProFormCheckbox, ProFormRadio, ProFormSelect } from '@ant-design/pro-form';
import debounce from 'lodash/debounce';
import { request } from 'umi';
import type { UserProps } from '@/typings';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

export type TableListItem = {
  pid: string;
  name: string;
  download: number;
  print: string;
  edit: string;
  view: string;
  comment: string;
};

const { TabPane } = Tabs;

function DebounceSelect<
  ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
>({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);

  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select<ValueType>
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
}

const trueOrFalse = {
  true: <CheckCircleTwoTone twoToneColor="red" />,
  false: <CloseCircleTwoTone twoToneColor="gray" />,
};

const ResourceAuthModal = ({
  rid,
  visible,
  onCancel,
}: {
  rid: string;
  visible: boolean;
  onCancel: () => void;
}) => {
  useEffect(() => {}, [rid]);
  const ref = useRef<ActionType>();
  const [type, setType] = useState<string>('member');

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '昵称',
      dataIndex: 'nickname',
    },
    {
      title: '查看',
      width: 80,
      dataIndex: 'view',
      render: (_, value) => trueOrFalse[value.view],
    },
    {
      title: '编辑',
      width: 80,
      dataIndex: 'edit',
      render: (_, value) => trueOrFalse[value.edit],
    },
    {
      title: '下载',
      width: 80,
      dataIndex: 'download',
      render: (_, value) => trueOrFalse[value.download],
    },
    {
      title: '打印',
      width: 80,
      dataIndex: 'print',
      render: (_, value) => trueOrFalse[value.print],
    },
    {
      title: '分享',
      width: 80,
      dataIndex: 'share',
      render: (_, value) => trueOrFalse[value.view],
    },
    {
      title: '操作',
      width: 180,
      key: 'option',
      valueType: 'option',
      render: (_, value) => [
        <Popconfirm
          title="确定要移除该用户的授权嘛?"
          onConfirm={() => {
            request('/api/resource/perm', {
              method: 'DELETE',
              requestType: 'form',
              data: {
                pid: value.pid,
              },
            });
          }}
          okText="确定"
          cancelText="取消"
        >
          <a href="#">移除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <Modal
      width={1024}
      title="授权管理"
      visible={visible}
      cancelText="关闭"
      onCancel={onCancel}
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="新增授权" key="1">
          <ProForm
            onFinish={async (values) => {
              // @ts-ignore
              const response: ApiResponse = await request('/api/resource/perm', {
                data: { rid, ...values },
                method: 'POST',
                requestType: 'form',
              });
              if (response.success) {
                ref.current?.reload();
              }
            }}
          >
            <ProFormRadio.Group
              fieldProps={{
                onChange: (e) => {
                  setType(e.target.value);
                },
              }}
              label="授权类型"
              name="type"
              options={[
                {
                  label: '成员',
                  value: 'member',
                },
                {
                  label: '团队',
                  value: 'team',
                },
              ]}
            />
            {type === 'member' && (
              <Form.Item
                name="users"
                label="用户"
                rules={[{ required: true, message: '请选择需要添加权限的用户!' }]}
              >
                <DebounceSelect
                  mode="multiple"
                  fetchOptions={(search) => {
                    return request('/api/user/search', {
                      params: {
                        s: search,
                      },
                    }).then((response) => {
                      if (response.success) {
                        return response.data.map((user: UserProps) => ({
                          label: `${user.nickname}`,
                          value: user.uid,
                        }));
                      }
                      return [];
                    });
                  }}
                  placeholder="请选择需要添加权限的用户"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
            {type === 'team' && (
              <ProFormSelect
                name="team"
                label="群组"
                request={() => {
                  return request('/api/team/tree', {
                    params: { type: 1 },
                  });
                }}
                placeholder="请选择至少一个群组"
                rules={[{ required: true, message: '请选择至少一个群组!' }]}
              />
            )}
            <ProFormCheckbox.Group
              name="perm"
              label="权限"
              rules={[{ required: true, message: '请选择需要授予的权限!' }]}
              options={[
                {
                  label: '查看',
                  value: 'view',
                },
                {
                  label: '编辑',
                  value: 'edit',
                },
                {
                  label: '打印',
                  value: 'print',
                },
                {
                  label: '下载',
                  value: 'download',
                },
                {
                  label: '分享',
                  value: 'share',
                },
              ]}
            />
          </ProForm>
        </TabPane>
        <TabPane tab="已授权成员" key="2">
          <ProTable<TableListItem>
            actionRef={ref}
            columns={columns}
            request={async (params, sorter, filter) => {
              // 表单搜索项会从 params 传入，传递给后端接口。
              console.log(params, sorter, filter);
              const response = await request('/api/resource/perm', {
                params: { rid },
              });
              if (!response.success) {
                return {
                  data: [],
                  // success 请返回 true，
                  // 不然 table 会停止解析数据，即使有数据
                  success: false,
                  // 不传会使用 data 的长度，如果是分页一定要传
                  total: 0,
                };
              }
              return {
                data: response.data.list,
                // success 请返回 true，
                // 不然 table 会停止解析数据，即使有数据
                success: true,
                // 不传会使用 data 的长度，如果是分页一定要传
                total: response.data.pagination.total,
              };
            }}
            rowKey="pid"
            pagination={{
              showQuickJumper: true,
            }}
            search={false}
            dateFormatter="string"
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ResourceAuthModal;
