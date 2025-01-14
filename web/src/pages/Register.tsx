import React, { useState } from "react";
import { Form, Input, Button, Radio, message, Row } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { gql, useMutation } from '@apollo/client'
import { useNavigate } from 'umi';

const REGISTER_ACTION = gql`
    mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
            _id
            firstName
            lastName
            fullName
            local {
                email
            }
            gender,
            emailToken
        }
    }
`

const VERIFY_EMAIL_TOKEN = gql`
    mutation VerifyEmailToken($token: String!) {
      verifyEmail(emailToken: $token)
    }
`

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const RegisterPage: React.FC = () => {
  const naviagte = useNavigate()
  const [createUser, {data: submitResult, loading: submiting, error}] = useMutation(REGISTER_ACTION)
  const [verifyEmail, {data: verifyResult, loading: verifing}] = useMutation(VERIFY_EMAIL_TOKEN)
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
        await createUser({ variables: { input: values }})
        form.resetFields()
        message.success('Registered Successfully! Please verfiy email!', 5)
    } catch (error) {
      console.log(error)  
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  console.log('submitResult', submitResult)

  if (submitResult?.createUser?.emailToken) {
    return (
      <Row justify="center" align="middle" style={{ maxWidth: "500px", margin: "0 auto", height: 100 }}>
        <Button type="primary" onClick={async () => {
          try {
            await verifyEmail({ variables: { token: submitResult.createUser.emailToken } })
            message.success('Verify email Successfully!', 5)
            naviagte('/login')
          } catch (error) {
            console.log(error)
          }
        }}>Verify Email</Button>
      </Row>
    )
  }

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Register</h1>
      <Form
        {...layout}
        form={form}
        name="register"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "Please input your first name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="First Name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Please input your last name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Last Name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please input a valid email!" },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item
          label="Gender"
          name="gender"
          rules={[{ required: true, message: "Please select your gender!" }]}
        >
          <Radio.Group>
            <Radio value="MALE">Male</Radio>
            <Radio value="FEMALE">Female</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit" loading={submiting}>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterPage;
