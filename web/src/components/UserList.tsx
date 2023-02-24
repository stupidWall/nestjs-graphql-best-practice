import useHeaderToken from '@/hooks/useHeaderToken';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, message, Popconfirm, Space, Table } from 'antd';

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

const DELETE_USER = gql`
  mutation DeleteUser($_id: ID!) {
    deleteUser(_id: $_id)
  }
`;

const LOCK_UNLOCK_USER = gql`
  mutation LockOrUnLockUser($_id: ID!, $reason: String!) {
    lockAndUnlockUser(_id: $_id, reason: $reason)
  }
`;


function UsersList() {
  const tokenHeaders = useHeaderToken()
  const { loading, error, data, refetch: refreshUsers } = useQuery(GET_USERS, {
    variables: { offset: 0, limit: 10 },
    ...tokenHeaders
  });
  const [deleteUser] = useMutation(DELETE_USER, {
    // use for refrshing
    refetchQueries: [{ query: GET_USERS }],
    ...tokenHeaders
  });

  const [lockAndUnlockUser] = useMutation(LOCK_UNLOCK_USER, {
    ...tokenHeaders
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const handleDelete = (id: string) => {
    deleteUser({ variables: { _id: id } })
      .then(() => {
        message.success('User deleted successfully');
        refreshUsers()
      })
      .catch((error) => {
        console.error(error);
        message.error('Failed to delete user');
      });
  };

  const handleLockOrUnLock = (id: string) => {
    lockAndUnlockUser({ variables: { _id: id, reason: 'risk consideration' } })
      .then(() => {
        message.success('Submit successfully');
        refreshUsers()
      })
      .catch((error) => {
        console.error(error);
        message.error('Failed to submit');
      });
  };

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
      title: 'IsActive',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (text, record) => (
        <span>{record.isActive ? 'true' : 'false'}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (text, record) => (
        <span>{record.isVerified ? 'Verified' : 'Not Verified'}</span>
      ),
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => record.isActive && (
          <Space>
            <Popconfirm
                    title="Are you sure to delete this user?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleDelete(record._id)}
                >
                <Button size="small" danger>Delete</Button>
            </Popconfirm>
            <Popconfirm
                    title={`Are you sure to ${record.isLocked ? 'unlock' : 'lock'} this user?`}
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleLockOrUnLock(record._id)}
                >
                <Button size="small" danger={!record.isLocked}>{record.isLocked ? 'Un' : ''}Lock</Button>
            </Popconfirm>
          </Space>
        )
    }
  ];

  return (
    <>
        <Button type="primary" size="small" onClick={() => refreshUsers()}>
            Refresh
        </Button>
        <Table
            bordered
            showHeader
            size='small'
            columns={columns}
            dataSource={data?.users}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
        />
    </>
  );
}

export default UsersList;