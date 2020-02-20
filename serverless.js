const AWS = require("aws-sdk");
const AwsSdkLambda = AWS.Lambda;
const { mergeDeepRight } = require("ramda");
const { Component } = require("@serverless/core");

const defaults = {
  from: undefined,
  to: undefined,
  region: "us-east-1"
};

class AwsLambdaMapping extends Component {
  async default(inputs = {}) {
    this.context.debug(`Deploying`);
    const config = mergeDeepRight(defaults, inputs);
    const lambda = this.getLambda(config);
    if (!config.from || !config.to) {
      throw new Error(`from and to inputs required`);
    }

    var params = {
      EventSourceArn: config.from, // required
      FunctionName: config.to // required
      /*
      BatchSize: 'NUMBER_VALUE',
      BisectBatchOnFunctionError: true || false,
      DestinationConfig: {
      OnFailure: {
        Destination: 'STRING_VALUE'
      },
      OnSuccess: {
        Destination: 'STRING_VALUE'
      }
    },
    Enabled: true || false,
      MaximumBatchingWindowInSeconds: 'NUMBER_VALUE',
      MaximumRecordAgeInSeconds: 'NUMBER_VALUE',
      MaximumRetryAttempts: 'NUMBER_VALUE',
      ParallelizationFactor: 'NUMBER_VALUE',
      StartingPosition: TRIM_HORIZON | LATEST | AT_TIMESTAMP,
      StartingPositionTimestamp: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789

       */
    };

    const mapping = await lambda.createEventSourceMapping(params).promise();
    const outputs = { UUID: mapping.UUID, ...config };
    this.state = outputs;
    await this.save();
    return outputs;
  }

  async remove(inputs = {}) {
    this.context.status(`Removing`);

    if (this.state.UUID) {
      this.context.debug(`Removing ${this.state.UUID}`);
      const config = mergeDeepRight(defaults, inputs);
      const lambda = this.getLambda(config);
      await lambda.deleteEventSourceMapping({ UUID: this.state.UUID }).promise();
      this.context.debug(`Removed successfully`);
    }
  }

  getLambda(config) {
    const awsConfig = {
      region: config.region,
      credentials: this.context.credentials.aws
    };
    return new AwsSdkLambda(awsConfig);
  }
}

module.exports = AwsLambdaMapping;
