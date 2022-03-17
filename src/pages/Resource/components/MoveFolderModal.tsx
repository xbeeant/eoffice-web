import { Card, Form, TreeSelect } from 'antd';
import type { MutableRefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { ModalForm, ProFormInstance } from '@ant-design/pro-form';
import { request } from 'umi';
import type { ActionType } from '@ant-design/pro-table';
import { layoutActionRef } from '@/app';

export type MoveFolderProps = {
  visible: boolean;
  onCancel: () => void;
  fid: string | number;
  rids: string[] | number[] | React.Key[];
  actionRef: MutableRefObject<ActionType | undefined>;
};
const MoveFolderModal = (props: MoveFolderProps) => {
  const { visible, onCancel, fid, rids, actionRef } = props;
  const formRef = useRef<ProFormInstance>();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFolders = () => {
    setLoading(true);
    request(`/eoffice/api/resource/folder`).then((res) => {
      setData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadFolders();
  }, []);

  return (
    <ModalForm
      formRef={formRef}
      title="移动位置"
      width={600}
      modalProps={{
        onCancel,
      }}
      initialValues={{ fid }}
      onFinish={async (values) => {
        request(`/eoffice/api/resource/move`, {
          method: 'post',
          requestType: 'form',
          data: {
            ...values,
            rid: rids,
            fromFid: fid,
          },
        }).then((res) => {
          if (res.success) {
            actionRef?.current?.reload();
            layoutActionRef?.current?.reload();
            onCancel();
            return;
          }
        });
      }}
      visible={visible}
    >
      <Card loading={loading} bordered={false} title={false}>
        <Form.Item name="fid" label="请选择新的文件夹">
          <TreeSelect
            treeDefaultExpandAll={true}
            showSearch
            treeNodeFilterProp="title"
            treeLine={true}
            defaultValue={fid}
            style={{ width: '100%' }}
            placeholder="请选择新的文件夹"
            treeData={data || []}
          />
        </Form.Item>
      </Card>
    </ModalForm>
  );
};

export default MoveFolderModal;
