import { Card, Form, TreeSelect } from 'antd';
import type { MutableRefObject} from 'react';
import React, { useEffect, useState } from 'react';
import { ModalForm } from '@ant-design/pro-form';
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

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFolders = () => {
    setLoading(true);
    request(`/api/resource/folder`).then((res) => {
      setData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadFolders();
  }, []);

  return (
    <ModalForm
      title="移动位置"
      width={600}
      modalProps={{
        onCancel,
      }}
      onFinish={async (values) => {
        request(`/api/resource/move`, {
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
        <Form.Item name="fid" label="请选择新的文件夹" valuePropName="checked">
          <TreeSelect
            defaultValue={fid}
            treeDefaultExpandAll={true}
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
