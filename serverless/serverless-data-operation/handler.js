const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const docClient = new DynamoDBClient({ region: "us-west-2" });

const dynamo = DynamoDBDocumentClient.from(docClient);

const tableName = "data-form";

module.exports.dataoperations = async (event, context) => {
  try {
    console.log("event.method ", context);
    console.log(event.body);

    let m = "";
    let key = "";
    let usernameKey = "";
    let feelKey = "";
    if (event.method === undefined) {
      const req = JSON.parse(event.body);
      m = req.method;
      key = req.key2;
      usernameKey = req.key1;
      feelKey = req.key3;
    } else {
      m = event.method;
    }

    switch (m) {
      case "POST":
        const postParams = {
					TableName: tableName,
					Item: {
						date: Date.now(),
						message: event.key2 === undefined ? key : event.key2,
						userName: event.key1 === undefined ? usernameKey : event.key1,
            feel: event.key3 === undefined ? feelKey : event.key3,
          },
				};

        await dynamo.send(new PutCommand(postParams));

        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
          },
          body: JSON.stringify("Item inserted successfully"),
        };

      case "GET":
        const scanParams = {
          TableName: tableName,
        };

        const result = await dynamo.send(new ScanCommand(scanParams));

        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
          },
          body: JSON.stringify(result.Items),
        };

      default:
        return {
          statusCode: 405,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
          },
          body: JSON.stringify(`Some error ${event.body}`),
        };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify("An error occurred"),
    };
  }
};
