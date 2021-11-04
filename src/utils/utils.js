export const getFileType = (filename) => {
  const startIndex = filename.lastIndexOf('.');
  if (startIndex !== -1) {
    return filename.substring(startIndex + 1, filename.length).toLowerCase();
  }
  return '';
};

export const isXmind = (file) => {
  return file.type === 'application/vnd.xmind.workbook' || getFileType(file.name) === 'xmind';
};
