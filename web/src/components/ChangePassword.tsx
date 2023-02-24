import { Form, Input, Button, notification } from 'antd';
import { useMutation, gql } from '@apollo/client';
import useHeaderToken from '@/hooks/useHeaderToken';
import { useNavigate } from 'umi';
import { useLocalStorageState } from 'ahooks';
import { STORAGE_ACCESS_TOKEN_KEY, STORAGE_REFRESH_TOKEN_KEY } from '@/constants';

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($_id: ID!, $currentPassword: String!, $password: String!) {
    changePassword(_id: $_id, currentPassword: $currentPassword, password: $password)
  }
`

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const tailLayout = {
  wrapperCol: { offset: 3, span: 12 },
};

const ChangePassword = ({userId}: {
    userId: string
}) => {
  const navigate = useNavigate()
  const [form] = Form.useForm();
  const tokenHeaders = useHeaderToken()
  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD, {
    ...tokenHeaders
  });
  const [, setAccessToken] = useLocalStorageState<string>(STORAGE_ACCESS_TOKEN_KEY, {
    defaultValue: '',
  });
  const [refreshToken, setRefreshToken] = useLocalStorageState<string>(STORAGE_REFRESH_TOKEN_KEY, {
    defaultValue: '',
  });

  const handleSubmit = async (values) => {
    try {
      const result = await changePassword({ variables: {
        ...values,
        _id: userId
      } });
      if (result.data.changePassword) {
        notification.success({
          message: 'Success',
          description: 'Password changed successfully',
        });
        form.resetFields();
        setAccessToken('')
        setRefreshToken('')
        navigate('/login')
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to change password',
        });
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Error',
        description: 'Failed to change password',
      });
    }
  };

  return (
    <Form
      {...layout}
      form={form}
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Current Password"
        name="currentPassword"
        rules={[{ required: true, message: 'Please enter current password' }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="New Password"
        name="password"
        rules={[
          { required: true, message: 'Please enter new password' },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm new password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Change Password
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChangePassword;
