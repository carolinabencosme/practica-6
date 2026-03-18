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

  const params = event.queryStringParameters || {};
  const { fechaDesde, fechaHasta } = params;

  // Both dates are required
  if (!fechaDesde || !fechaHasta) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        message: 'Se requieren los parámetros fechaDesde y fechaHasta.',
      }),
    };
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDesde) || !/^\d{4}-\d{2}-\d{2}$/.test(fechaHasta)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        message: 'Las fechas deben tener el formato YYYY-MM-DD.',
      }),
    };
  }

  if (fechaDesde > fechaHasta) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        message: 'fechaDesde no puede ser posterior a fechaHasta.',
      }),
    };
  }

  // Scan with date range filter
  const result = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#fecha BETWEEN :desde AND :hasta',
      ExpressionAttributeNames: { '#fecha': 'fecha' },
      ExpressionAttributeValues: {
        ':desde': fechaDesde,
        ':hasta': fechaHasta,
      },
    })
  );

  const items = result.Items || [];

  // Sort by fecha ASC, then hora ASC
  items.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
    return a.hora - b.hora;
  });

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, reservas: items }),
  };
};
