Suppose we have a simple NestJS controller with a POST endpoint that accepts JSON data in the request body:

```ts
import { Controller, Post, Body } from '@nestjs/common';

@Controller('example')
export class ExampleController {

  @Post()
  create(@Body() data: any) {
    console.log(data);
  }
}
```
To handle incoming JSON data, we use the `body-parser` middleware. In this case, we use the `json()` and `urlencoded()` methods provided by body-parser to parse JSON and URL-encoded data respectively.

`json() `is used to parse JSON data, and `urlencoded()` is used to parse URL-encoded data.

Here's how we would use these methods in our NestJS application:


```ts
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use body-parser middleware to parse incoming requests
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  await app.listen(3000);
}
bootstrap();
```

In this example, we're setting a limit of 50mb for JSON requests. When a request comes in with JSON data, body-parser will parse the JSON and set it as the req.body property.

Similarly, for URL-encoded requests, body-parser will parse the data and set it as the req.body property.

Now, when a request is made to our POST endpoint, the data parameter in the create method will contain the parsed JSON or URL-encoded data from the request body.
