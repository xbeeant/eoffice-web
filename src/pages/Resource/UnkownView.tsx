import { useEffect, useState } from 'react';
import { request } from 'umi';
import { Image } from 'antd';

interface ResourceProps {
  match: { params: { rid: number } };
}

const ImageView = ({ match }: ResourceProps) => {
  const { params: matchParams } = match;

  const [data, setData] = useState();

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
