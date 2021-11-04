import { useState } from 'react';
import { Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
// @ts-ignore
import XmindParser from 'xmindparser';
import { isXmind } from '@/utils/utils';
import { ButtonType } from 'antd/lib/button/button';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';

export interface UploaderProps {
  action: string;
  afterUpload: any;
  text?: string;
  type?: ButtonType;
  icon?: string;
  accept?: string;
}

const Uploader = (props: UploaderProps) => {
  const { action, afterUpload, text, type, icon, accept } = props;
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const uploadProps = {
    name: 'file',
    action,
    accept,
    beforeUpload: (file: RcFile) => {
      console.log('before upload');
      return new Promise<File>((resolve) => {
        if (isXmind(file)) {
          console.log('xmind文件解析');
          // 脑图的上传
          const parser = new XmindParser();
          // xmind转脑图 json 支持二进制文件或url和本地目录
          parser.xmindToJSON(file).then((json: string) => {
            const naotuFile = new File(
              [JSON.stringify(json)],
              file.name.replace('.xmind', '.minder'),
              { type: 'text/plain' },
            );
            resolve(naotuFile);
          });
        } else {
          resolve(file);
        }
      });
    },
    onChange: (info: UploadChangeParam) => {
      if (info.file.status === 'uploading') {
        setUploading(true);
        setFiles(info.fileList);
      }
      if (info.file.status === 'done') {
        setFiles([]);
        const names = info.fileList.map((value) => value.name);
        message.success(`${names.join(',')} 上传成功`);
        setUploading(false);
        afterUpload(info.fileList);
      } else if (info.file.status === 'error') {
        setFiles([]);
        setUploading(false);
        const names = info.fileList.map((value) => value.name);
        message.error(`${names.join(',')} 上传失败.`);
      }
    },
  };
  const buttonProps = {
    icon: icon === undefined ? <UploadOutlined /> : icon,
  };

  return (
    <Upload multiple={true} key="upload" {...uploadProps} fileList={files} showUploadList={false}>
      <Button type={type} {...buttonProps} loading={uploading}>
        {text || '上传文件'}
      </Button>
    </Upload>
  );
};

export default Uploader;
