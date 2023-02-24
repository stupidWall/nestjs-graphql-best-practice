import { STORAGE_ACCESS_TOKEN_KEY, STORAGE_REFRESH_TOKEN_KEY } from "@/constants";
import { useLocalStorageState } from "ahooks";
import { Tabs, Button, message, Input } from 'antd';
import { gql, useMutation, useQuery } from '@apollo/client';
import JsonData from "@/components/JsonData";
import { useState } from "react";
import UsersList from "@/components/UserList";


const REFRESH_GQL = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(refreshToken: $token) {
      accessToken
    }
  }
`

const CURRENT_USER = gql`
  query {
    me {
      _id,
      fullName,
      gender,
      firstName,
      lastName,
      type,
      createdAt,
      updatedAt,
      local {
        email
      }
    }
  }
`

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(_id: $id, input: $input)
  }
`

const HomePage = () => {
  const [accessToken, setAccessToken] = useLocalStorageState<string>(STORAGE_ACCESS_TOKEN_KEY, {
    defaultValue: '',
  });
  const [refreshToken, setRefreshToken] = useLocalStorageState<string>(STORAGE_REFRESH_TOKEN_KEY, {
    defaultValue: '',
  });
  const tokenHeaders = {
    context: {
      headers: {
        token: accessToken
      }
    }
  }
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [refreshTokenAction, { loading: refreshingToken, data: refreshTokenResult }] = useMutation(REFRESH_GQL)
  const [updateUser, { loading: updatingUser, data: updateUserResult }] = useMutation(UPDATE_USER, {...tokenHeaders})
  const { data: currentUser, refetch: refetchUserInfo } = useQuery(CURRENT_USER, {
   ...tokenHeaders
  })
  
  return <>
    <Tabs 
      tabPosition="left"
      destroyInactiveTabPane
      items={[
        {
          key: "logout",
          label: "Logout",
          children: <>
             <Button type="primary" size="small" onClick={() => {
              setAccessToken('')
              setRefreshToken('')
              window.location.reload()
            }}>Logout</Button>
          </>
        },
        {
          key: "refreshToken",
          label: "Refresh Token",
          children: <>
            <Button type="primary" size="small"
              loading={refreshingToken}
              onClick={async () => {
                try {
                  await refreshTokenAction({
                    variables: {
                      token: refreshToken
                    },
                  })
                  refreshTokenResult?.refreshToken && setAccessToken(refreshTokenResult?.refreshToken?.accessToken)
                } catch (error: any) {
                  message.error(error.message)
                }
              }}
            >Refresh</Button>
            <JsonData info={refreshTokenResult} />
          </>
        },
        {
          key: "currentUserInfo",
          label: "Current User Info",
          children: <>
            {currentUser && <JsonData info={currentUser} />}
            <Button type="primary" size="small"
              loading={refreshingToken}
              onClick={async () => {
                try {
                  refetchUserInfo()
                } catch (error: any) {
                  message.error(error.message)
                }
              }}
            >Refresh</Button>
          </>
        },
        {
          key: "updateUser",
          label: "Modify User Info",
          children: <>
            <Input addonBefore="firstName" onChange={(e) => setFirstName(e.target.value)} value={firstName} defaultValue={currentUser?.firstName} />
            <Input addonBefore="lastName" onChange={(e) => setLastName(e.target.value)} value={lastName} defaultValue={currentUser?.lastName} />
            <Button type="primary" size="small"
              loading={updatingUser}
              onClick={async () => {
                try {
                  firstName && lastName && updateUser({
                    variables: {
                      id: currentUser?.me?.['_id'],
                      input: {
                        firstName,
                        lastName,
                        gender: "MALE",
                        password: "123456"
                      }
                    }
                  })
                } catch (error: any) {
                  message.error(error.message)
                }
              }}
            >Submit</Button>
            <JsonData info={updateUserResult} />
          </>
        },
        {
          key: "users",
          label: "Users",
          children: <>
            <UsersList />
          </>
        }
      ]}
    />
  </>;
}
 
export default HomePage;