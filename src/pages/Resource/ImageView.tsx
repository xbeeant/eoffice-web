import { useEffect, useState } from 'react';
import { request } from 'umi';
import { Image, Skeleton } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { LocationProps } from '@/typings';

const ImageView: ({ location }: { location: LocationProps }) => JSX.Element = ({ location }) => {
  const {
    query: { rid, share, vid, shareId },
  } = location;
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{ url?: string; name?: string }>({});

  const loadData = async () => {
    setLoading(true);
    if (rid || share) {
      const response = await request('/eoffice/api/resource/detail', {
        params: {
          rid,
          share,
          shareId,
          vid,
        },
        skipErrorHandler: true,
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
      {!loading && (
        <div
          style={{
            textAlign: 'center',
            height: '100%',
          }}
        >
          <Image src={data.url} alt={data.name} />
        </div>
      )}
    </PageContainer>
  );
};

export default ImageView;
