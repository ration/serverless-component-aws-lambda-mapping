# AWS Lambda mapping

Map e.g. SQS into AWS Lambda function [Serverless Components](https://github.com/serverless/components).

&nbsp;

- [AWS Lambda Mapping](#aws-lambda-mappping)
    - [1. Install](#1-install)
    - [2. Create](#2-create)
    - [3. Configure](#3-configure)
    - [4. Deploy](#4-deploy)
    - [New to Components?](#new-to-components)

&nbsp;


### 1. Install

```console
$ npm install -g @serverless/components
```

### 2. Create

Just create a `serverless.yml` file

```shell
$ touch serverless.yml
$ touch .env      # your development AWS api keys
$ touch .env.prod # your production AWS api keys
```

the `.env` files are not required if you have the aws keys set globally and you want to use a single stage, but they should look like this.

```
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
```

### 3. Configure

```yml
# serverless.yml

lambdaMapping:
  component: "../"
  inputs:
    from: arn:aws:sqs:us-east-1:00000000:purchasing-queue
    to: arn:aws:lambda:us-east-1:1231234:function:my-function

```

### 4. Deploy

```console
  lambdaMapping: 
    UUID:   c3d57548-f226-4901-b9de-e5893cf53ef6
    from:   arn:aws:sqs:us-east-1:00000000:purchasing-queue
    to:     arn:aws:lambda:us-east-1:1231234:function:my-function

  1s › lambdaMapping › done

```

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
