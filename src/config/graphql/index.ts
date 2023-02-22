import { Injectable, Logger } from '@nestjs/common'
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql'
import { MemcachedCache } from 'apollo-server-cache-memcached'
import { PubSub } from 'graphql-subscriptions'
import { GraphQLExtension, AuthenticationError } from 'apollo-server-core'
import { MockList } from 'graphql-tools'
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'
import * as depthLimit from 'graphql-depth-limit'

import { getMongoRepository } from 'typeorm'
import * as chalk from 'chalk'

import schemaDirectives from './schemaDirectives'
import directiveResolvers from './directiveResolvers'
import { verifyToken } from '@auth'
import { User } from '@entities'

import {
	NODE_ENV,
	PRIMARY_COLOR,
	END_POINT,
	FE_URL,
	GRAPHQL_DEPTH_LIMIT,
	ACCESS_TOKEN
} from '@environments'

const pubsub = new PubSub()
@Injectable()
export class GraphqlService implements GqlOptionsFactory {
	async createGqlOptions(): Promise<any> {
		return {
			typePaths: ['./**/*.graphql'],
			resolvers: {
				JSON: GraphQLJSON,
				JSONObject: GraphQLJSONObject
			},
			mocks: NODE_ENV === 'testing' && {
				// String: () => 'Chnirt',
				Query: () => ({
					users: () => new MockList([2, 6])
				})
			},
			path: `/${END_POINT!}`,
			cors:
				NODE_ENV === 'production'
					? {
							origin: FE_URL!,
							credentials: true // <-- REQUIRED backend setting
					  }
					: true,
			bodyParserConfig: { limit: '50mb' },
			onHealthCheck: () => {
				return new Promise((resolve, reject) => {
					// Replace the `true` in this conditional with more specific checks!
					if (true) {
						resolve(true)
					} else {
						reject()
					}
				})
			},
			schemaDirectives,
			directiveResolvers,
			validationRules: [
				depthLimit(
					GRAPHQL_DEPTH_LIMIT!,
					{ ignore: [/_trusted$/, 'idontcare'] },
					depths => {
						if (depths[''] === GRAPHQL_DEPTH_LIMIT! - 1) {
							Logger.warn(
								`⚠️  You can only descend ${chalk
									.hex(PRIMARY_COLOR!)
									.bold(`${GRAPHQL_DEPTH_LIMIT!}`)} levels.`,
								'GraphQL',
								false
							)
						}
					}
				)
			],
			introspection: true,
			playground: NODE_ENV !== 'production' && {
				settings: {
					'editor.cursorShape': 'line', // possible values: 'line', 'block', 'underline'
					'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
					'editor.fontSize': 14,
					'editor.reuseHeaders': true, // new tab reuses headers from last tab
					'editor.theme': 'dark', // possible values: 'dark', 'light'
					'general.betaUpdates': false,
					'queryPlan.hideQueryPlanResponse': false,
					'request.credentials': 'include', // possible values: 'omit', 'include', 'same-origin'
					'tracing.hideTracingResponse': true
				}
			},
			tracing: NODE_ENV !== 'production',
			cacheControl: NODE_ENV === 'production' && {
				defaultMaxAge: 5,
				stripFormattedExtensions: false,
				calculateHttpHeaders: false
			},
			// plugins: [responseCachePlugin()],
			context: async ({ req, res, connection }) => {
				if (connection) {
					const { currentUser } = connection.context

					return {
						pubsub,
						currentUser
					}
				}

				let currentUser

				// console.log(ACCESS_TOKEN, req.headers)

				const token = req.headers[ACCESS_TOKEN!] || ''

				// console.log('token', token)
				if (token) {
					currentUser = await verifyToken(token, 'accessToken')
				}

				// console.log(currentUser);

				return {
					req,
					res,
					pubsub,
					currentUser,
					trackErrors(errors) {
						// Track the errors
						// console.log(errors)
					}
				}
			},
			formatError: error => {
				return {
					message: error.message,
					code: error.extensions && error.extensions.code,
					locations: error.locations,
					path: error.path
				}
			},
			formatResponse: response => {
				// console.log(response)
				return response
			},
			subscriptions: {
				path: `/${END_POINT!}`,
				keepAlive: 1000,
				onConnect: async (connectionParams, webSocket, context) => {
					NODE_ENV !== 'production' &&
						Logger.debug(`🔗  Connected to websocket`, 'GraphQL')

					let currentUser
					const token = connectionParams[ACCESS_TOKEN!]

					if (token) {
						currentUser = await verifyToken(token, 'accessToken')

						await getMongoRepository(User).updateOne(
							{ _id: currentUser._id },
							{
								$set: { isOnline: true }
							},
							{
								upsert: true
							}
						)

						return { currentUser }
					}

					throw new AuthenticationError(
						'Authentication token is invalid, please try again.'
					)
				},
				onDisconnect: async (webSocket, context) => {
					NODE_ENV !== 'production' &&
						Logger.error(`❌  Disconnected to websocket`, '', 'GraphQL', false)

					const { initPromise } = context
					const { currentUser } = await initPromise

					await getMongoRepository(User).updateOne(
						{ _id: currentUser._id },
						{
							$set: { isOnline: false }
						},
						{
							upsert: true
						}
					)
				}
			},
			persistedQueries: {
				cache: new MemcachedCache(
					['memcached-server-1', 'memcached-server-2', 'memcached-server-3'],
					{ retries: 10, retry: 10000 } // Options
				)
			},
			installSubscriptionHandlers: true,
			uploads: {
				maxFieldSize: 2, // 1mb
				maxFileSize: 20, // 20mb
				maxFiles: 5
			}
		}
	}
}
