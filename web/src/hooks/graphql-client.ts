import { ApolloClient, InMemoryCache } from '@apollo/client'
import { useRef } from 'react'

const useClient = () => {
	const clientRef = useRef<ApolloClient<any>>(
		new ApolloClient({
			uri: 'http://localhost:14047/graphql',
			cache: new InMemoryCache()
		})
	)

	return {
		client: clientRef.current
	}
}

export default useClient
