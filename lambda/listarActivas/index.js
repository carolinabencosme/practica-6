'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { getDateParts, isReservaActive } = require('./shared/dateUtils');

const TABLE_NAME = process.env.TABLE_NAME || 'Reservas';
const RESERVA_ITEM_TYPE = 'RESERVA';

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

  const reference = getDateParts();
  const { todayStr } = reference;

  const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#itemType = :tipoReserva AND #fecha >= :today',
        ExpressionAttributeNames: {
          '#itemType': 'itemType',
          '#fecha': 'fecha',
        },
        ExpressionAttributeValues: {
          ':tipoReserva': RESERVA_ITEM_TYPE,
          ':today': todayStr,
        },
      })
  );

  const activas = (result.Items || []).filter((item) => isReservaActive(item, reference));

  activas.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
    return Number(a.hora) - Number(b.hora);
  });

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, reservas: activas }),
  };
};