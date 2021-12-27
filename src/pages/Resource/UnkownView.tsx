import { useEffect, useState } from 'react';
import { request } from 'umi';
import type { ResourceParamsProps, ResourceProps } from '@/typings';

const ImageView = ({ match }: ResourceParamsProps) => {
  const { params: matchParams } = match;

  const [data, setData] = useState<ResourceProps>();

  const loadData = (rid: string | undefined) => {
    if (rid) {
      request('/api/resource/detail', {
        params: { rid },
      }).then((response) => {
        setData(response.data);
      });
    }
  };

  useEffect(() => {
    loadData(matchParams?.rid);
  }, [matchParams]);
  return (
    <div>
      <a href={data?.url}>下载</a>
    </div>
  );
};

export default ImageView;
