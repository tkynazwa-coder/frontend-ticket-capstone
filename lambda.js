const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const orderId = crypto.randomUUID();
        
        const params = {
            TableName: "TicketOrders",
            Item: {
                orderId: orderId,
                nama: body.nama,
                email: body.email,
                status: "PENDING",
                ticketUrl: ""
            }
        };

        await docClient.send(new PutCommand(params));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: "Pesanan diterima", orderId: orderId })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Gagal memproses pesanan", error: error.message })
        };
    }
};