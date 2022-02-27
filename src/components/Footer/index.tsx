import { useIntl } from 'umi';
import { DefaultFooter } from '@ant-design/pro-layout';

export default () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '小标办公室',
  });

  return <DefaultFooter copyright={`2022 ${defaultMessage}`} links={false} />;
};
