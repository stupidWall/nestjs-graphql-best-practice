import useHeaderToken from '@/hooks/useHeaderToken';
import { gql, useQuery } from '@apollo/client';
import { Button, Input } from 'antd';
import { useState } from 'react';
const USER_FIELDS = gql`
  fragment UserFields on User {
    _id
    firstName
    lastName
    avatar
    gender
    fullName
    isVerified
    isActivated
    isOnline
    isLocked
    reason
    isActive
    stripeId
    ccLast4
    createdAt
    updatedAt
  }
`;

const GET_USER_BY_ID = gql`
  ${USER_FIELDS}

  query GetUserById($_id: ID!) {
    user(_id: $_id) {
      ...UserFields
      local {
        email
      }
      google {
        email
      }
      facebook {
        email
      }
    }
  }
`;


function GetUserById() {
    const [userId, setUserId] = useState('');
    const tokenHeaders = useHeaderToken()
    const { loading, error, data, refetch } = useQuery(GET_USER_BY_ID, {
      variables: { _id: userId },
      ...tokenHeaders
    });
    const handleIdChange = (e) => {
        setUserId(e.target.value);
    };
    const handleSubmit = (e) => {
      e.preventDefault();
      setUserId(e.target.value);
      refetch()
    };
  
    const user = data?.user;
  
    return (
        <div>
          <form onSubmit={handleSubmit}>
            <Input placeholder="Enter User ID" value={userId} onChange={handleIdChange} />
            <Button type="primary" htmlType="submit">
            Get User
            </Button>
          </form>
          {loading && <p>Loading...</p>}
          {error && <p>Error:(</p>}
          {user && (
            <div>
              <h1>{user.fullName}</h1>
              <p>Email: {user.local?.email || user.google?.email || user.facebook?.email}</p>
              <p>Gender: {user.gender}</p>
              <p>Status: {user.isVerified ? 'Verified' : 'Not Verified'}</p>
              <p>Locked: {user.isLocked ? 'Yes' : 'No'}</p>
              <p>Reason: {user.reason}</p>
              <p>Created At: {new Date(user.createdAt).toLocaleString()}</p>
              <p>Updated At: {new Date(user.updatedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
    );
  }
  
export default GetUserById