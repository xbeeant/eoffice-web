import { PaginationProps, Timeline } from 'antd';
import { useEffect, useState } from 'react';
import { request } from 'umi';
import { formatSize } from '@/utils/utils';
import type { ApiResponse, VersionHistoryProps, VersionHistoryPageProps } from '@/typings';

const VersionHistory = ({ rid }: { rid: string | number }) => {
  const [data, setData] = useState<VersionHistoryProps[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>({});

  useEffect(() => {
    request('/eoffice/api/resource/history', {
      params: { rid },
      skipErrorHandler: true,
    }).then((response: ApiResponse<VersionHistoryPageProps>) => {
      if (response.success) {
        setData(response.data.list);
        setPagination(response.data.pagination);
      }
    });
  }, [rid]);
  return (
    <Timeline mode="left">
      {data.map((item) => (
        <Timeline.Item>
          于 {item.createAt} {formatSize(item.size)} 由 {item.actor} 修改
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default VersionHistory;
