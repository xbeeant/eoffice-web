import { Pagination, PaginationProps, Space, Timeline } from 'antd';
import React, { useEffect, useState } from 'react';
import { request } from 'umi';
import { formatSize } from '@/utils/utils';
import type { ApiResponse, VersionHistoryProps, VersionHistoryPageProps } from '@/typings';
import defaultSettings from '../../../../config/defaultSettings';
import { useModel } from '@@/plugin-model/useModel';

const VersionHistory = ({ rid }: { rid: string | number }) => {
  const [data, setData] = useState<VersionHistoryProps[]>([]);
  const [pathmap, setPathmap] = useState([]);
  const [pagination, setPagination] = useState<PaginationProps>({});
  const { initialState } = useModel('@@initialState');
  const loadHistory = (page: number | undefined, pageSize: number | undefined) => {
    request('/eoffice/api/resource/history', {
      params: { rid, current: page, pageSize: pageSize },
      skipErrorHandler: true,
    }).then((res: ApiResponse<VersionHistoryPageProps>) => {
      if (res.success) {
        setData(res.data.list);
        setPagination(res.data.pagination);
      }
    });
  };

  useEffect(() => {
    request('/eoffice/api/config/pathmap').then(
      (response: { success: boolean; data: React.SetStateAction<never[]> }) => {
        if (response.success) {
          setPathmap(response.data);
        }
        loadHistory(pagination.current, pagination.pageSize);
      },
    );
  }, [rid]);

  return (
    <Space direction="vertical">
      <Pagination
        onChange={(page, pageSize) => {
          loadHistory(page, pageSize);
        }}
        hideOnSinglePage
        showSizeChanger={false}
        showQuickJumper
        size="small"
        defaultCurrent={1}
        total={pagination.total}
        current={pagination.current}
      />
      <Timeline mode="left">
        {data.map((item) => (
          <Timeline.Item>
            于 {item.createAt} {formatSize(item.size)} 由 {item.actor} 修改{' '}
            <Space>
              <a
                href={`${defaultSettings.basepath}/${pathmap[item.extension] || 'unkown'}?rid=${
                  item.rid
                }&vid=${item.vid}&k=${initialState?.currentUser?.userid}&mode=view`}
                target="_blank"
                rel="noreferrer"
              >
                查看
              </a>
              <a
                href={`/eoffice/api/resource/s?rid=${item.rid}&sid=${item.sid}`}
                target="_blank"
                rel="noreferrer"
              >
                下载
              </a>
            </Space>
          </Timeline.Item>
        ))}
      </Timeline>
    </Space>
  );
};

export default VersionHistory;
