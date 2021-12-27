import type { MutableRefObject } from 'react';
import { useState } from 'react';
import { Menu } from 'antd';
import {
  FileExcelOutlined,
  FileMarkdownOutlined,
  FilePptOutlined,
  FileWordOutlined,
  FolderOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { layoutActionRef } from '@/app';
import FolderModal from '../FolderModal';

import type { ActionType } from '@ant-design/pro-table';
import FileUploadModal from '@/pages/Resource/components/FileUploadModal';

// @ts-ignore
import styles from './index.less';

const { SubMenu } = Menu;

export interface PopupProps {
  fid?: string;
  actionRef?: MutableRefObject<ActionType | undefined>;
  visible: boolean;
  record?: unknown;
  x?: number;
  y?: number;
}

const Popup = ({ fid, actionRef, visible, x, y }: PopupProps) => {
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [fileModalVisible, setFileModalVisible] = useState(false);

  return (
    <div className={styles.popup} style={{ left: `${x}px`, top: `${y}px` }}>
      {folderModalVisible && (
        <FolderModal
          pfid={fid || '0'}
          visible={folderModalVisible}
          onCancel={() => setFolderModalVisible(false)}
          onOk={() => {
            actionRef?.current?.reload();
            setFolderModalVisible(false);
          }}
        />
      )}
      {fileModalVisible && (
        <FileUploadModal
          fid={fid || '0'}
          visible={fileModalVisible}
          onCancel={() => setFileModalVisible(false)}
          onOk={() => {
            actionRef?.current?.reload();
            setFileModalVisible(false);
          }}
        />
      )}
      {visible && (
        <Menu>
          <SubMenu title="新建/上传" icon={<UploadOutlined />}>
            <Menu.Item
              icon={<FolderOutlined />}
              onClick={() => {
                setFolderModalVisible(true);
              }}
            >
              新建文件夹
            </Menu.Item>
            <Menu.Item
              icon={<UploadOutlined />}
              onClick={() => {
                setFileModalVisible(true);
              }}
            >
              上传文件
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item icon={<FileWordOutlined />}>Word文档</Menu.Item>
            <Menu.Item icon={<FileExcelOutlined />}>Excel文档</Menu.Item>
            <Menu.Item icon={<FilePptOutlined />}>PPT文档</Menu.Item>
            <Menu.Item icon={<FileMarkdownOutlined />}>Markdown</Menu.Item>
          </SubMenu>
          <Menu.Item
            key="2"
            icon={<ReloadOutlined />}
            onClick={() => {
              actionRef?.current?.reload();
              layoutActionRef?.current?.reload();
            }}
          >
            刷新
          </Menu.Item>
        </Menu>
      )}
    </div>
  );
};

export default Popup;
