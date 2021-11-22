import type {RcFile} from 'antd/lib/upload/interface';

export const getFileType = (filename: string) => {
  const startIndex = filename.lastIndexOf('.');
  if (startIndex !== -1) {
    return filename.substring(startIndex + 1, filename.length).toLowerCase();
  }
  return '';
};

export const isXmind = (file: RcFile) => {
  return file.type === 'application/vnd.xmind.workbook' || getFileType(file.name) === 'xmind';
};

/**
 * 格式化文件大小, 输出成带单位的字符串
 * @param {Number} size 文件大小
 * @param {Number} [pointLength=2] 精确到的小数点数。
 *    如果单位数组里面只指定了到了K(千字节)，同时文件大小大于M, 此方法的输出将还是显示成多少K.
 */
export const formatSize = (size: number, pointLength?: number) => {
  let unit: string | undefined = 'B';
  let fsize = size;
  const units = ['B', 'K', 'M', 'G', 'TB'];
  while ((unit = units.shift()) && fsize > 1024) {
    fsize = fsize / 1024;
  }
  return (
    (unit === 'B' ? fsize : fsize.toFixed(pointLength === undefined ? 2 : pointLength)) +
    (unit || '')
  );
};
