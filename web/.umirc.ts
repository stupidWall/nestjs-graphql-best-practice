import { defineConfig } from 'umi'

export default defineConfig({
	routes: [
		{ path: '/', component: 'index', wrappers: ['@/wrappers/auth'] },
		{ path: '/logout', component: 'Logout', wrappers: ['@/wrappers/auth'] },
		{ path: '/register', component: 'Register' },
		{ path: '/login', component: 'Login' }
	],
	npmClient: 'yarn',
	alias: {
		['@']: '/src'
	},
	mfsu: {}
})
