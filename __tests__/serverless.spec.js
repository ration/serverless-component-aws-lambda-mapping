const AwsLambdaMapping = require("../serverless");
const { Lambda } = require("aws-sdk");
const { Component, Context } = require("@serverless/core");

jest.mock("aws-sdk");

describe("Life cycle of mapping functions", () => {
  const from = "fromValue";
  const to = "toValue";
  const input = { from: from, to: to };
  const uuid = { promise: () => Promise.resolve({ UUID: "123" }) };

  let eventSourceMappingMock;
  let deleteEventSourceMappingMock;
  const save = (Component.prototype.save = jest.fn());
  let mapping;

  beforeEach(async () => {
    eventSourceMappingMock = jest.fn().mockReturnValue(uuid);
    deleteEventSourceMappingMock = jest.fn().mockReturnValue(uuid);
    mapping = new AwsLambdaMapping();
    await mapping.init();
    Lambda.mockImplementation(() => ({
      createEventSourceMapping: eventSourceMappingMock,
      deleteEventSourceMapping: deleteEventSourceMappingMock
    }));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it("From and to required", async () => {
    await expect(mapping.default({})).rejects.toThrow(Error);
  });

  it("From and to required passed to output", async () => {
    expect(await mapping.default(input)).toMatchObject(expect.objectContaining(input));
  });

  it("Calls eventsourcemapping", async () => {
    await mapping.default(input);
    const params = { EventSourceArn: from, FunctionName: to };
    expect(eventSourceMappingMock).toHaveBeenCalledWith(expect.objectContaining(params));
  });

  it("The mapping is returned", async () => {
    const output = await mapping.default(input);
    expect(output.UUID).toEqual("123");
  });

  it("The mapping doesnt succeed", async () => {
    eventSourceMappingMock.mockReturnValue({});
    await expect(mapping.default(input)).rejects.toThrow(Error);
  });

  it("should save the state", async () => {
    await mapping.default(input);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("should do nothing on remove if no state", async () => {
    await mapping.remove();
    expect(deleteEventSourceMappingMock).toHaveBeenCalledTimes(0);
  });

  it("should delete the mapping", async () => {
    Context.prototype.readState = jest.fn().mockReturnValue(uuid.promise());
    // Reinit and set state
    await mapping.init();
    await mapping.remove();
    expect(deleteEventSourceMappingMock).toHaveBeenCalledWith(
      expect.objectContaining(uuid.promise())
    );
  });
});
