 `NestInterceptor` is a middleware that intercepts both incoming requests and outgoing responses. Its `intercept()` method will be executed before a request is handled by the controller method, and after the controller method returns a response. Therefore, you can use it to perform pre-processing and post-processing tasks related to the request/response.

##### `logging.interceptor`

```ts
# logging.interceptor.ts
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
	Logger
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import * as chalk from 'chalk'

import { PRIMARY_COLOR } from '../../environments'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		if (context.getArgs()[3]) {
			const parentType = context.getArgs()[3]['parentType']
			const fieldName = chalk
				.hex(PRIMARY_COLOR)
				.bold(`${context.getArgs()[3]['fieldName']}`)
			return next.handle().pipe(
				tap(() => {
					Logger.debug(`⛩  ${parentType} » ${fieldName}`, 'GraphQL')
				})
			)
		} else {
			const parentType = chalk
				.hex(PRIMARY_COLOR)
				.bold(`${context.getArgs()[0].route.path}`)
			const fieldName = chalk
				.hex(PRIMARY_COLOR)
				.bold(`${context.getArgs()[0].route.stack[0].method}`)
			return next.handle().pipe(
				tap(() => {
					Logger.debug(`⛩  ${parentType} » ${fieldName}`, 'GraphQL')
				})
			)
		}
	}
}

# main.ts
app.useGlobalInterceptors(new LoggingInterceptor())
```


Suppose you have a GraphQL resolver that looks like this:

```ts
import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class CatsResolver {
  @Query(() => String)
  async hello() {
    return 'world';
  }
}
```
When a request is made to the `/graphql` endpoint with the following GraphQL query:

```graphql
{
  hello
}
```

The `LoggingInterceptor` intercepts the request and logs the following message to the console:

```
⛩  Query » hello
```

If the request is an HTTP request, the LoggingInterceptor will log the request and response information in the console

```
[2023-02-24T08:28:05.152Z] [INFO] HTTP - Request: GET /api/users?name=john&age=30
[2023-02-24T08:28:05.186Z] [INFO] HTTP - Response: 200 OK {"data":[{"id":1,"name":"John","age":30},{"id":2,"name":"Jane","age":25}]}
```

In this example, the `LoggingInterceptor` intercepts an HTTP GET request to the `/api/users` endpoint with query parameters `name=john` and `age=30`. The server returns a response with status code 200 and a JSON payload containing an array of user objects. The `LoggingInterceptor` logs the request and response information in the console with a timestamp and a log level of `INFO`.


##### `timeout-interceptor`

```TS
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { timeout } from 'rxjs/operators'

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(timeout(100000))
	}
}
```

This is an implementation of a NestJS interceptor called `TimeoutInterceptor`. It intercepts incoming requests and applies a timeout of 100,000 milliseconds (i.e., 100 seconds) to the request using the `timeout` operator from the `rxjs` library.

In other words, if the incoming request takes more than 100 seconds to complete, the request will be timed out and an error will be thrown. This can be useful in preventing long-running requests from affecting the overall performance of the application.