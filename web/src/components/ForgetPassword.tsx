import { Button, Form, Input, message, Steps } from "antd";
import { useMutation, gql } from '@apollo/client';
import useHeaderToken from '@/hooks/useHeaderToken';
import JsonData from "./JsonData";
import { useState } from "react";
import { useNavigate } from "umi";

const FORGET_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
        resetPasswordToken
    }
  }
`

const RESET_PASSWORD = gql`
  mutation ResetPassword($resetPasswordToken: String!, $password: String!) {
    resetPassword(resetPasswordToken: $resetPasswordToken, password: $password)
  }
`

const ForgetPassword = ({
    currentUserEmail
}: {
    currentUserEmail: string
}) => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const tokenHeaders = useHeaderToken()
    const [forgetPassword, { loading, data: forgetPasswordResult }] = useMutation(FORGET_PASSWORD, {
        ...tokenHeaders
      });
    const [resetPassword, { loading: reseting, data: resetPasswordResult }] = useMutation(RESET_PASSWORD, {
        ...tokenHeaders
      });

    const [form] = Form.useForm();

    const handleSubmit = async (values: any) => {
        // Call API to update password here
        try {
            await resetPassword({
                variables: {
                    resetPasswordToken: forgetPasswordResult?.forgotPassword?.resetPasswordToken,
                    password: values.password
                }
            })
            message.success("Reset Password Successfully")
            setStep(1)
            navigate('/login')
        } catch (error: any) {
            message.error(error.message)
        }
    };

    return <>
        <Steps
            current={step}
            items={[
                {
                  title: 'Set Email',
                  description: '',
                },
                {
                  title: 'Verify Token From Email',
                },
            ]}
        />
        <div style={{height: 50}} />
        {step === 1 && <>
            <Button
                loading={loading}
                onClick={async () => {
                    try {
                        await forgetPassword({
                            variables: {
                                email: currentUserEmail
                            }
                        })
                        setStep(2)
                    } catch (error) {
                        console.log(error)
                    }
                }}
            >Send me an email</Button>
            <JsonData info={forgetPasswordResult || {}} />
        </>}
        {step === 2 && <>
            <Form form={form} onFinish={handleSubmit}>
                <Form.Item
                    name="password"
                    label="New Password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your new password!',
                        },
                    ]}
                    hasFeedback
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <Button loading={reseting} type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
            <JsonData info={resetPasswordResult || {}} />
        </>}
    </>;
}
 
export default ForgetPassword;