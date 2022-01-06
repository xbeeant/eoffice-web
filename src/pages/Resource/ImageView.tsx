import { useEffect, useState } from 'react';
import { request } from 'umi';
import { Image, Skeleton } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';

interface LocationProps extends Location {
  query: { rid: string; sid: string };
}

const ImageView: ({ location }: { location: LocationProps }) => JSX.Element = ({ location }) => {
  const {
    query: { rid },
  } = location;
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{ url?: string; name?: string }>({});

  const loadData = async () => {
    setLoading(true);
    if (rid) {
      const response = await request('/api/resource/detail', {
        params: {
          rid,
        },
      });
      if (response.success) {
        // load content from url
        setData(response.data);
      }
    }
  };

  useEffect(() => {
    loadData().then(() => setLoading(false));
  }, [rid]);

  return (
    <PageContainer title={false} pageHeaderRender={false}>
      {loading && <Skeleton />}
      {!loading &&
        (rid ? (
          <div
            style={{
              textAlign: 'center',
              height: '100%',
            }}
          >
            <Image src={data.url} alt={data.name} />
          </div>
        ) : (
          <div>参数不全</div>
        ))}
    </PageContainer>
  );
};

export default ImageView;
