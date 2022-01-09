import type { PaginationProps } from 'antd';
import { Transfer } from 'antd';
import { useEffect, useState } from 'react';
import type { UserProps } from '@/typings';
import { request } from 'umi';

const UserTransfer = ({
  rid,
  onChange,
  value,
}: {
  rid: string;
  value?: string[];
  onChange?: (value: string[]) => void;
}) => {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);

  const triggerChange = (changedValue: any[]) => {
    onChange?.([...value, ...changedValue]);
  };

  const onValueChange = (nextTargetKeys, direction, moveKeys) => {
    console.log('targetKeys:', nextTargetKeys);
    console.log('direction:', direction);
    console.log('moveKeys:', moveKeys);
    setTargetKeys(nextTargetKeys);
  };

  const onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    console.log('sourceSelectedKeys:', sourceSelectedKeys);
    console.log('targetSelectedKeys:', targetSelectedKeys);
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
    triggerChange([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  useEffect(() => {
    request('/api/user/table').then((response) => {
      if (response.success) {
        setUsers(response.data.list);
        setPagination(response.data.pagination);
      }
    });
  }, [rid]);

  return (
    <Transfer
      oneWay={true}
      dataSource={users}
      showSearch
      targetKeys={targetKeys}
      selectedKeys={selectedKeys}
      onChange={onValueChange}
      onSelectChange={onSelectChange}
      render={(item) => item.username}
      pagination={pagination}
    />
  );
};

export default UserTransfer;
