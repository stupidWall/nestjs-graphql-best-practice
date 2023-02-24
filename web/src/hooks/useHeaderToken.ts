import { STORAGE_ACCESS_TOKEN_KEY } from '@/constants'
import { useLocalStorageState } from 'ahooks'

export default function useHeaderToken() {
	const [accessToken] = useLocalStorageState<string>(STORAGE_ACCESS_TOKEN_KEY, {
		defaultValue: ''
	})
	const tokenHeaders = {
		context: {
			headers: {
				token: accessToken
			}
		}
	}
	return tokenHeaders
}
