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
import FolderModal from '../FolderModal';

import type { ActionType } from '@ant-design/pro-table';
import FileUploadModal from '@/pages/Resource/components/FileUploadModal';

// @ts-ignore
import styles from './index.less';
import { layoutActionRef } from '@/app';
import NewFileModal from '@/pages/Resource/components/NewFileModal';

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
  const [newFileModalVisible, setNewFileFileModalVisible] = useState(false);
  const [newFileType, setNewFileType] = useState<string>('');

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
      {newFileModalVisible && (
        <NewFileModal
          fid={fid || '0'}
          visible={newFileModalVisible}
          type={newFileType}
          onCancel={() => setNewFileFileModalVisible(false)}
          onOk={() => {
            setNewFileFileModalVisible(false);
            actionRef?.current?.reload();
          }}
        />
      )}
      {fileModalVisible && (
        <FileUploadModal
          action={'/eoffice/api/resource/upload/save'}
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
        <Menu
          onClick={(e) => {
            switch (e.key) {
              case 'newFolder':
                setFolderModalVisible(true);
                break;
              case 'upload':
                setFileModalVisible(true);
                break;
              case 'reload':
                actionRef?.current?.reload();
                layoutActionRef?.current?.reload();
                break;
              default:
                const type = e.key.substring(4);
                setNewFileType(type);
                setNewFileFileModalVisible(true);
                break;
            }
          }}
        >
          <SubMenu key="newOrUpload" title="新建/上传" icon={<UploadOutlined />}>
            <Menu.Item key="newFolder" icon={<FolderOutlined />}>
              新建文件夹
            </Menu.Item>
            <Menu.Item key="upload" icon={<UploadOutlined />}>
              上传文件
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="add-docx" icon={<FileWordOutlined />}>
              Word文档
            </Menu.Item>
            <Menu.Item key="add-xlsx" icon={<FileExcelOutlined />}>
              Excel文档
            </Menu.Item>
            <Menu.Item key="add-pptx" icon={<FilePptOutlined />}>
              PPT文档
            </Menu.Item>
            <Menu.Item key="add-md" icon={<FileMarkdownOutlined />}>
              Markdown
            </Menu.Item>
            <Menu.Item key="add-sheet" icon={<FileExcelOutlined />}>
              在线表格
            </Menu.Item>
            <Menu.Item key="add-minder" icon={<FileExcelOutlined />}>
              在线脑图
            </Menu.Item>
            <Menu.Item key="add-drawio" icon={<FileExcelOutlined />}>
              UML图（drawio)
            </Menu.Item>
          </SubMenu>
          <Menu.Item key="reload" icon={<ReloadOutlined />}>
            刷新
          </Menu.Item>
        </Menu>
      )}
    </div>
  );
};

export default Popup;
