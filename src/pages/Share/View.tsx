import { useEffect, useState } from 'react';
import { request } from 'umi';
import { Card } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { useModel } from '@@/plugin-model/useModel';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import defaultSettings from '../../../config/defaultSettings';
import { ApiResponse } from '@/typings';

interface LocationProps extends Location {
  query: { id: string };
}

type ShareProps = {
  extension: string;
  share: string;
};

const View: ({ location }: { location: LocationProps }) => JSX.Element = ({ location }) => {
  const {
    query: { id },
  } = location;

  const [pathmap, setPathmap] = useState([]);

  const { initialState } = useModel('@@initialState');

  const view = (data: ShareProps) => {
    console.log(data);
    window.open(
      `${defaultSettings.basepath}/${
        pathmap[data.extension] || 'unkown'
      }?share=${encodeURIComponent(data.share)}&shareId=${id}&k=${
        initialState?.currentUser?.userid
      }&mode='view'`,
    );
  };

  useEffect(() => {
    request('/api/config/pathmap').then((response) => {
      if (response.success) {
        setPathmap(response.data);
      }
    });
  }, [id]);

  return (
    <PageContainer title={false} pageHeaderRender={false}>
      <Card title={false}>
        <ProForm
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          onFinish={async (values) => {
            request('/api/resource/share', {
              requestType: 'form',
              method: 'POST',
              data: {
                shareId: id,
                ...values,
              },
            }).then((res: ApiResponse<ShareProps>) => {
              if (res.success) {
                view(res.data);
              }
            });
          }}
        >
          <ProFormText
            name="authCode"
            label="提取码"
            rules={[{ required: true }]}
            placeholder="请输入提取码"
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default View;
