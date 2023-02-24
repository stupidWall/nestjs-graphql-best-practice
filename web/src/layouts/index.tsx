import { Link, Outlet } from 'umi';
import {  ApolloProvider } from '@apollo/client';
import useClient from '@/hooks/graphql-client';

export default function Layout() {
  const {client} = useClient()
  return (
    <div>
      <ApolloProvider client={client}>
        <Outlet />
      </ApolloProvider>
    </div>
  );
}
