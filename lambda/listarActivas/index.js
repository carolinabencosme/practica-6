'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = process.env.TABLE_NAME || 'Reservas';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  // Determine "today" in YYYY-MM-DD
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentHour = now.getUTCHours();

  // Scan all reservations where fecha >= today
  const result = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#fecha >= :today',
      ExpressionAttributeNames: { '#fecha': 'fecha' },
      ExpressionAttributeValues: { ':today': todayStr },
    })
  );

  const items = result.Items || [];

  // For today's reservations, only include slots whose end time has not passed.
  // A slot for hora H covers H:00–(H+1):00 UTC; it is still active while current time < H+1.
  const activas = items.filter((item) => {
    if (item.fecha === todayStr) {
      // The slot ends at hora + 1; keep it if that hour hasn't passed yet
      return item.hora + 1 > currentHour;
    }
    return true;
  });

  // Sort by fecha ASC, then hora ASC
  activas.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
    return a.hora - b.hora;
  });

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, reservas: activas }),
  };
};
