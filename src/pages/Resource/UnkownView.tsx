import { useEffect, useState } from 'react';
import { request } from 'umi';
import { Result, Skeleton } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';

interface LocationProps extends Location {
  query: { rid: string; share: string };
}

const UnkownView: ({ location }: { location: LocationProps }) => JSX.Element = ({ location }) => {
  const {
    query: { rid, share },
  } = location;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();
  const [data, setData] = useState<{ url?: string; name?: string }>({});

  const loadData = async () => {
    setLoading(true);
    if (rid || share) {
      const response = await request('/eoffice/api/resource/detail', {
        params: {
          rid,
          share,
        },
        skipErrorHandler: true,
      });
      if (response.success) {
        // load content from url
        setData(response.data);
      } else {
        setError(response.msg);
      }
    }
  };

  useEffect(() => {
    loadData().then(() => setLoading(false));
  }, [rid]);

  const renderResult = () => {
    if (error) {
      return <Result status="error" title={error} />;
    }

    return (
      <Result
        status="warning"
        title={'暂不支持该类型文件的在线预览，您可以下载到本地进行查看'}
        extra={<a href={data.url}>下载</a>}
      />
    );
  };

  return (
    <PageContainer title={false} pageHeaderRender={false}>
      {loading && <Skeleton />}
      {!loading && (rid || share ? renderResult() : <div>参数不全</div>)}
    </PageContainer>
  );
};

export default UnkownView;
