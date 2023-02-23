import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { gql, useMutation } from '@apollo/client';
import { useLocalStorageState } from 'ahooks';
import { STORAGE_ACCESS_TOKEN_KEY, STORAGE_REFRESH_TOKEN_KEY } from '../constants';
import { useNavigate } from 'umi';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginUserInput!) {
    login(input: $input) {
      accessToken,
      refreshToken
    }
  }
`;

const LoginForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [, setAccessToken] = useLocalStorageState<string>(STORAGE_ACCESS_TOKEN_KEY, {
    defaultValue: '',
  });
  const [, setRefreshToken] = useLocalStorageState<string>(STORAGE_REFRESH_TOKEN_KEY, {
    defaultValue: '',
  });
  const [login, { loading, data: submitResult }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (values: any) => {
    try {
      await login({
        variables: {
          input: {
            email: values.email,
            password: values.password,
          }
        },
      });
      const { accessToken, refreshToken } = submitResult?.login || {}
      setAccessToken(accessToken)
      setRefreshToken(refreshToken)
      message.success('Login successfully');
      setTimeout(() => {
        navigate('/')
      })
    } catch (error: any) {
      message.error(error.message);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Login</h1>
        <Form form={form} onFinish={handleSubmit}>
        <Form.Item
            name="email"
            rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please input a valid email!' },
            ]}
        >
            <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
        >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
            Log in
            </Button>
        </Form.Item>
        </Form>
    </div>
  );
};

export default LoginForm;
