import { STORAGE_ACCESS_TOKEN_KEY } from '@/constants'
import { useLocalStorageState } from 'ahooks'

export default function useAuth() {
	const [token] = useLocalStorageState<string>(STORAGE_ACCESS_TOKEN_KEY, {
		defaultValue: ''
	})
	return {
		isLogin: Boolean(token)
	}
}
