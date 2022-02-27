import { Space } from 'antd';
import React from 'react';
import { useModel, SelectLang, history } from 'umi';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
// @ts-ignore
import styles from './index.less';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <Space className={className}>
      <HeaderSearch
        visible={true}
        className={`${styles.action} ${styles.search}`}
        placeholder="输入文档名称,回车后进行文件搜索"
        options={[]}
        onSearch={(value) => {
          if (value) {
            history.push({
              pathname: '/search',
              query: {
                s: value,
              },
            });
          }
        }}
      />
      <Avatar />
      <SelectLang className={styles.action} />
    </Space>
  );
};
export default GlobalHeaderRight;
