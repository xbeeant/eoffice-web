import { useState } from 'react';
import { request } from 'umi';
import { Card } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { useModel } from '@@/plugin-model/useModel';
import ProForm, { ProFormText } from '@ant-design/pro-form';

interface LocationProps extends Location {
  query: { id: string };
}

const View: ({ location }: { location: LocationProps }) => JSX.Element = ({ location }) => {
  const {
    query: { id },
  } = location;
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{ url?: string; name?: string }>({});
  const { initialState } = useModel('@@initialState');

  const loadData = async () => {
    setLoading(true);
    if (id) {
      const response = await request('/api/resource/share', {
        params: {
          shareId: id,
        },
      });
      if (response.success) {
        // load content from url
        setData(response.data);
      }
    }
  };

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
            }).then((res) => {
              if (res.success) {
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
