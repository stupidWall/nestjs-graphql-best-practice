import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useRef } from 'react'

const useClient = () => {
	const httpLink = createHttpLink({
		uri: 'http://localhost:14047/graphql'
	})
	const authLink = setContext((_, { headers }) => {
		return {
			headers: {
				...headers
			}
		}
	})
	const clientRef = useRef<ApolloClient<any>>(
		new ApolloClient({
			link: authLink.concat(httpLink),
			cache: new InMemoryCache()
		})
	)

	return {
		client: clientRef.current
	}
}

export default useClient
