import useHeaderToken from '@/hooks/useHeaderToken';
import { gql, useQuery } from '@apollo/client';
import { Table } from 'antd';

const USER_FIELDS = gql`
  fragment UserFields on User {
    _id
    firstName
    lastName
    avatar
    gender
    fullName
    isVerified
    isOnline
    isLocked
    reason
    isActive
    createdAt
    updatedAt
  }
`;

const GET_USERS = gql`
  ${USER_FIELDS}

  query GetUsers($offset: Int, $limit: Int) {
    users(offset: $offset, limit: $limit) {
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


function UsersList() {
  const tokenHeaders = useHeaderToken()
  const { loading, error, data } = useQuery(GET_USERS, {
    variables: { offset: 0, limit: 10 },
    ...tokenHeaders
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: 'id',
      render: (text, record) => (
        <span>
          {record._id}
        </span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <span>
          {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text, record) => (
        <span>
          {record.local?.email || record.google?.email || record.facebook?.email}
        </span>
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (text, record) => (
        <span>{record.isVerified ? 'Verified' : 'Not Verified'}</span>
      ),
    },
  ];

  return (
    <Table
      size='small'
      columns={columns}
      dataSource={data?.users}
      rowKey="_id"
      pagination={{ pageSize: 10 }}
    />
  );
}

export default UsersList;