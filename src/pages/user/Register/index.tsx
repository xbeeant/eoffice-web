// @ts-ignore
import ProForm, { ProFormText } from '@ant-design/pro-form';

// @ts-ignore
import styles from './index.less';
import { request } from '@@/plugin-request/request';
import { useState } from 'react';
import { Button, Card, Result } from 'antd';
import { Link } from 'umi';

const Register = () => {
  const [finished, setFinished] = useState<boolean>(false);
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Card extra={<Link to="/login">返回登录</Link>}>
          {!finished && (
            <ProForm<{
              name: string;
              company?: string;
              useMode?: string;
            }>
              onFinish={async (values) => {
                request('/eoffice/api/user/register', {
                  data: values,
                  requestType: 'form',
                  method: 'POST',
                }).then((response) => {
                  if (response.success) {
                    setFinished(true);
                  }
                });
              }}
              autoFocusFirstInput
            >
              <ProFormText
                name="username"
                required
                label="账号"
                tooltip="最长为 24 位"
                placeholder="请输入账号"
                rules={[{ required: true, message: '这是必填项' }]}
              />
              <ProFormText
                name="nickname"
                required
                label="昵称"
                placeholder="请输入昵称"
                rules={[{ required: true, message: '这是必填项' }]}
              />
              <ProFormText.Password
                name="password"
                required
                label="密码"
                placeholder="请输入密码"
                rules={[{ required: true, message: '这是必填项' }]}
              />
              <ProFormText.Password
                name="password2"
                required
                label="再次输入密码"
                placeholder="请再次输入密码"
                rules={[{ required: true, message: '这是必填项' }]}
              />
              <ProFormText
                name="phone"
                required
                label="手机号"
                placeholder="请输入手机号"
                rules={[
                  { required: true, message: '这是必填项' },
                  {
                    pattern:
                      /^1(3[0-9]|4[01456879]|5[0-3,5-9]|6[2567]|7[0-8]|8[0-9]|9[0-3,5-9])\d{8}$/,
                    message: '请输入正确的手机号',
                  },
                ]}
              />
              <ProFormText
                name="email"
                required
                label="邮箱"
                placeholder="请输入邮箱"
                rules={[
                  { required: true, message: '这是必填项' },
                  {
                    pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
                    message: '邮箱格式不正确',
                  },
                ]}
              />
            </ProForm>
          )}
        </Card>
        {finished && (
          <Result
            status="success"
            title="注册成功!"
            extra={[
              <Button type="primary" key="console">
                <Link to="/user/login">返回登录</Link>
              </Button>,
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default Register;
