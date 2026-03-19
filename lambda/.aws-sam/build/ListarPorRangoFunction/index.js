'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { getDateParts, isReservaPast } = require('../shared/dateUtils');

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
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const params = event.queryStringParameters || {};
  const { fechaDesde, fechaHasta } = params;

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

  const reference = getDateParts();

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

  const pasadas = (result.Items || []).filter((item) => isReservaPast(item, reference));

  pasadas.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
    return a.hora - b.hora;
  });

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, reservas: pasadas }),
  };
};
