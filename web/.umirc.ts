import { defineConfig } from 'umi'

export default defineConfig({
	routes: [
		{ path: '/', component: 'index' },
		{ path: '/register', component: 'Register' },
		{ path: '/login', component: 'Login' }
	],
	npmClient: 'yarn'
})
