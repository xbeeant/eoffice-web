import type { PaginationProps, SelectProps } from 'antd';
import { Button, Form, Select, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ModalForm, ProFormCheckbox } from '@ant-design/pro-form';
import debounce from 'lodash/debounce';
import { request } from 'umi';
import type { ApiResponse, UserProps } from '@/typings';

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

const ResourceAuthModal = ({
  rid,
}: {
  rid: string;
  value?: string[];
  onChange?: (value: string[]) => void;
}) => {
  const [pagination, setPagination] = useState<PaginationProps>();

  useEffect(() => {}, [rid]);

  return (
    <ModalForm
      title="成员管理"
      autoFocusFirstInput
      trigger={<Button type="text">管理</Button>}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => console.log('run'),
      }}
      onFinish={async (values) => {
        // @ts-ignore
        const response: ApiResponse = request('/api/resource/perm', {
          data: { rid, ...values },
          method: 'POST',
          requestType: 'form',
        });

        return response.success;
      }}
    >
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
      <ProFormCheckbox.Group
        name="perm"
        label="权限"
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
    </ModalForm>
  );
};

export default ResourceAuthModal;
