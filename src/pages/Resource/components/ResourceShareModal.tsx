import type { SelectProps } from 'antd';
import { Form, Modal, Select, Spin, TreeSelect } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormCheckbox,
  ProFormDateTimePicker,
  ProFormRadio,
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
  const [data, setData] = useState([]);

  const loadTeams = () => {
    return request('/eoffice/api/team/tree', {
      params: { type: 1 },
    }).then((res) => {
      setData(res);
    });
  };

  useEffect(() => {
    loadTeams();
  }, [rid]);
  const [type, setType] = useState<string>('member');
  // ???????????? ProFormInstance ??????
  const formRef = useRef<ProFormInstance<{}>>();

  return (
    <Modal
      width={1024}
      title="??????"
      visible={visible}
      cancelText="??????"
      onCancel={onCancel}
      okButtonProps={{ style: { display: 'none' } }}
    >
      <ProForm
        formRef={formRef}
        initialValues={{ type: 'member' }}
        onFinish={async (values) => {
          // @ts-ignore
          const response: ApiResponse = await request('/eoffice/api/share', {
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
              treeData={data || []}
            />
          </Form.Item>
        )}
        <ProFormDateTimePicker name="endtime" label="????????????" extra="???????????????????????????????????????" />
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
    </Modal>
  );
};

export default ResourceShareModal;
