import type { SelectProps } from 'antd';
import { Form, Modal, Select, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormCheckbox,
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-form';
import debounce from 'lodash/debounce';
import { request } from 'umi';
import type { UserProps } from '@/typings';

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

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

const ResourceShareModal = ({
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
  useEffect(() => {}, [rid]);
  const [type, setType] = useState<string>('member');
  // 绑定一个 ProFormInstance 实例
  const formRef = useRef<ProFormInstance<{}>>();

  return (
    <Modal
      width={1024}
      title="分享"
      visible={visible}
      cancelText="关闭"
      onCancel={onCancel}
      okButtonProps={{ style: { display: 'none' } }}
    >
      <ProForm
        formRef={formRef}
        initialValues={{ type: 'member' }}
        onFinish={async (values) => {
          // @ts-ignore
          const response: ApiResponse = await request('/api/share', {
            data: { rid, ...values },
            method: 'POST',
            requestType: 'form',
          });
          if (response.success) {
            formRef.current?.resetFields();
            reload();
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
              label: '群组',
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
        <ProFormDateTimePicker name="endtime" label="截止日期" extra="未设置截止日期视为永不过期" />
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
    </Modal>
  );
};

export default ResourceShareModal;
