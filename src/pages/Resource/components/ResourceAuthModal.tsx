import type { SelectProps } from 'antd';
import {
  Form,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tabs,
  TreeSelect,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ProForm, { ProFormCheckbox, ProFormInstance, ProFormRadio } from '@ant-design/pro-form';
import debounce from 'lodash/debounce';
import { request } from 'umi';
import type { ApiResponse, UserProps } from '@/typings';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  UserOutlined,
  TeamOutlined,
  ShareAltOutlined,
  FileOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { PermTargetProps } from '@/typings';
import { DefaultOptionType } from 'antd/es/select';

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

const { TabPane } = Tabs;

const IconMap = {
  0: <UserOutlined />,
  1: <TeamOutlined />,
  10: <FolderOutlined />,
  11: (
    <>
      <FolderOutlined />
      <ShareAltOutlined />
    </>
  ),
  20: <FileOutlined />,
  21: (
    <>
      <FileOutlined />
      <ShareAltOutlined />
    </>
  ),
};

export interface FormProps {
  type: 'member' | 'team';
  users?: string[];
  team?: string[];
}

function DebounceSelect<
  ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
>({ fetchOptions, debounceTimeout = 500, ...props }: DebounceSelectProps) {
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

const ResourceAuthModal = ({
  rid,
  visible,
  onCancel,
  reload,
}: {
  rid: string;
  visible: boolean;
  onCancel: () => void;
  reload: () => void;
}) => {
  const [groupList, setGroupList] = useState<DefaultOptionType[]>([]);

  useEffect(() => {
    request('/eoffice/api/team/tree-all').then((response: DefaultOptionType[]) =>
      setGroupList(response),
    );
  }, [rid]);
  const ref = useRef<ActionType>();
  const formRef = useRef<ProFormInstance<FormProps>>();
  const [type, setType] = useState<string>('member');

  const trueOrFalse = (value: boolean) => {
    return value ? (
      <CheckCircleTwoTone twoToneColor="red" />
    ) : (
      <CloseCircleTwoTone twoToneColor="gray" />
    );
  };

  const columns: ProColumns<PermTargetProps>[] = [
    {
      title: '??????/??????',
      dataIndex: 'targetName',
      render: (_, value) => {
        return (
          <Space>
            {IconMap[value.targetType]}
            {IconMap[value.type]}
            {value.targetName}
          </Space>
        );
      },
    },
    {
      title: '??????',
      width: 80,
      dataIndex: 'view',
      render: (_, value) => trueOrFalse(value.view),
    },
    {
      title: '??????',
      width: 80,
      dataIndex: 'edit',
      render: (_, value) => trueOrFalse(value.edit),
    },
    {
      title: '??????',
      width: 80,
      dataIndex: 'download',
      render: (_, value) => trueOrFalse(value.download),
    },
    {
      title: '??????',
      width: 80,
      dataIndex: 'print',
      render: (_, value) => trueOrFalse(value.print),
    },
    {
      title: '??????',
      width: 80,
      dataIndex: 'share',
      render: (_, value) => trueOrFalse(value.view),
    },
    {
      title: '??????',
      width: 180,
      key: 'option',
      valueType: 'option',
      render: (_, value) => [
        <Popconfirm
          title="?????????????????????????????????????"
          onConfirm={() => {
            request('/eoffice/api/resource/perm', {
              method: 'DELETE',
              requestType: 'form',
              data: {
                pid: value.pid,
              },
            }).then((response: ApiResponse<any>) => {
              if (response.success) {
                ref.current?.reload();
                reload();
              }
            });
          }}
          okText="??????"
          cancelText="??????"
        >
          <a href="#">??????</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <Modal
      width={1024}
      title="????????????"
      visible={visible}
      cancelText="??????"
      onCancel={onCancel}
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="????????????" key="1">
          <ProForm
            formRef={formRef}
            initialValues={{ type: 'member' }}
            onFinish={async (values) => {
              // @ts-ignore
              const response = await request<ApiResponse>('/eoffice/api/resource/perm', {
                data: { rid, ...values },
                method: 'POST',
                requestType: 'form',
              });
              if (response.success) {
                reload();
                // @ts-ignore
                formRef.current?.resetFields();
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
              label="????????????"
              name="type"
              options={[
                {
                  label: '??????',
                  value: 'member',
                },
                {
                  label: '??????',
                  value: 'team',
                },
              ]}
            />
            {type === 'member' && (
              <Form.Item
                name="users"
                label="??????"
                rules={[{ required: true, message: '????????????????????????????????????!' }]}
              >
                <DebounceSelect
                  mode="multiple"
                  fetchOptions={(search) => {
                    return request('/eoffice/api/user/search', {
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
                  placeholder="????????????????????????????????????"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
            {type === 'team' && (
              <Form.Item
                name="team"
                label="??????"
                valuePropName="checked"
                rules={[{ required: true, message: '???????????????????????????!' }]}
              >
                <TreeSelect
                  treeDefaultExpandAll={true}
                  showSearch
                  treeNodeFilterProp="title"
                  treeLine={true}
                  style={{ width: '100%' }}
                  placeholder="???????????????????????????"
                  treeData={groupList}
                />
              </Form.Item>
            )}
            <ProFormCheckbox.Group
              name="perm"
              label="??????"
              rules={[{ required: true, message: '??????????????????????????????!' }]}
              options={[
                {
                  label: '??????',
                  value: 'view',
                },
                {
                  label: '??????',
                  value: 'edit',
                },
                {
                  label: '??????',
                  value: 'print',
                },
                {
                  label: '??????',
                  value: 'download',
                },
                {
                  label: '??????',
                  value: 'share',
                },
              ]}
            />
          </ProForm>
        </TabPane>
        <TabPane tab="???????????????/??????" key="2">
          <ProTable<PermTargetProps>
            actionRef={ref}
            columns={columns}
            request={async (params, sorter, filter) => {
              // ????????????????????? params ?????????????????????????????????
              console.log(params, sorter, filter);
              const response = await request('/eoffice/api/resource/perm', {
                params: { rid, ...sorter, ...filter, ...params },
              });
              if (!response.success) {
                return {
                  data: [],
                  // success ????????? true???
                  // ?????? table ???????????????????????????????????????
                  success: false,
                  // ??????????????? data ???????????????????????????????????????
                  total: 0,
                };
              }
              return {
                data: response.data.list,
                // success ????????? true???
                // ?????? table ???????????????????????????????????????
                success: true,
                // ??????????????? data ???????????????????????????????????????
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
