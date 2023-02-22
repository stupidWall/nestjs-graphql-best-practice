`class-validator` and `class-transformer` are popular libraries for validating and transforming data in Node.js and NestJS. Here is an example of how to use these libraries to validate fields in NestJS:

1. First, you need to install the required dependencies:
   ```shell
    npm install --save class-validator class-transformer
   ```

2. Then, create a DTO (Data Transfer Object) class for your request or response data, and add validation decorators from class-validator to the properties you want to validate. For example:
   ```ts
    import { IsString, IsInt, Min, Max } from 'class-validator';
    import { Transform } from 'class-transformer';

    export class CreateProductDto {
        @IsString()
        name: string;

        @IsInt()
        @Min(0)
        price: number;

        @IsInt()
        @Min(0)
        @Max(100)
        @Transform(({ value }) => parseInt(value))
        discount: number;
    }
   ```
   In this example, the `CreateProductDto` class defines three properties: `name`, `price`, and `discount`. The `@IsString()` decorator ensures that the name property is a string, while the `@IsInt()`, `@Min(0)`, and `@Max(100)` decorators ensure that the `price` and `   ` properties are integers between 0 and 100. The `@Transform()` decorator is used to convert the `discount` property from a string to an integer.

3. In your NestJS controller or service, import the ValidateNested() and Type() decorators from class-validator, and use them to validate the DTO. For example:
   ```ts
    import { Body, Controller, Post } from '@nestjs/common';
    import { ValidateNested, Type } from 'class-validator';
    import { plainToClass } from 'class-transformer';
    import { CreateProductDto } from './create-product.dto';

    @Controller('products')
    export class ProductsController {
        @Post()
        @ValidateNested()
        @Type(() => CreateProductDto)
        create(@Body() createProductDto: CreateProductDto) {
            // create product logic
        }
    }
   ```

In this example, the `create()` method uses the `@Body()` decorator to extract the request body, and the `@ValidateNested()` and `@Type()` decorators to validate the `CreateProductDto` class. The `plainToClass()` function from `class-transformer` is used to transform the request body into an instance of the DTO class.

That's it! Now you have a validated and transformed DTO that you can use in your NestJS application.


##### use pipe

NestJS provides a convenient way to apply validation and transformation to all incoming requests using global pipes. To use global pipes with `class-validator` and `class-transformer`, follow these steps:


1. First, you need to install the required dependencies:
   ```shell
    npm install --save class-validator class-transformer
   ```

2. Then, create a `ValidationPipe` class that extends the built-in `ValidationPipe` from NestJS, and use `class-validator` and `class-transformer` to validate and transform the request body. For example:
   ```ts
    import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
    import { plainToClass } from 'class-transformer';
    import { validate } from 'class-validator';

    @Injectable()
    export class ValidationPipe implements PipeTransform<any> {
        async transform(value: any) {
            const object = plainToClass(this.metatype, value);
            const errors = await validate(object);

            if (errors.length > 0) {
                throw new BadRequestException('Validation failed');
            }

            return object;
        }
    }
   ```
   In this example, the `ValidationPipe` class transforms the request body into an instance of the class using `plainToClass()` from `class-transformer`, and then validates it using `validate()` from `class-validator`. If there are any validation errors, the pipe throws a `BadRequestException`. Otherwise, it returns the validated object.

3. In your NestJS application, add the `ValidationPipe` as a global pipe in your `main.ts` file, like this:
    ```ts
    import { ValidationPipe } from './validation.pipe';

    async function bootstrap() {
        const app = await NestFactory.create(AppModule);
        app.useGlobalPipes(new ValidationPipe());
        await app.listen(3000);
    }
    bootstrap();
    ```
In this example, the `ValidationPipe` is added as a global pipe using `useGlobalPipes()` on the application instance.

That's it! Now all incoming requests will be validated and transformed using `class-validator` and `class-transformer` before being processed by your NestJS application.


When you use global pipes with `class-validator` and `class-transformer`, you don't need to use the validation decorators like `@IsString`, `@IsInt`, etc. Instead, you define the shape of the object you want to validate as a plain TypeScript class, and `class-validator` will infer the validation rules based on the class properties.