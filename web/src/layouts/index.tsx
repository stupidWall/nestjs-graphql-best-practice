import { Link, Outlet } from 'umi';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import useClient from '@/models/graphql-client';

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
