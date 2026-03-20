'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { getDateParts, isReservaPast } = require('./shared/dateUtils');

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

  const params = event.queryStringParameters || {};
  const { fechaDesde, fechaHasta, now } = params;

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

  let reference;
  if (now) {
    if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z)?$/.test(now)) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          message: 'El parámetro now debe tener formato YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ.',
        }),
      };
    }

    const refDate = now.length === 10
        ? new Date(`${now}T23:59:59Z`)
        : new Date(now);

    if (Number.isNaN(refDate.getTime())) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          message: 'El parámetro now no es una fecha válida.',
        }),
      };
    }

    reference = getDateParts(refDate);
  } else {
    reference = getDateParts();
  }

  const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#itemType = :tipoReserva AND #fecha BETWEEN :desde AND :hasta',
        ExpressionAttributeNames: {
          '#itemType': 'itemType',
          '#fecha': 'fecha',
        },
        ExpressionAttributeValues: {
          ':tipoReserva': RESERVA_ITEM_TYPE,
          ':desde': fechaDesde,
          ':hasta': fechaHasta,
        },
      })
  );

  const pasadas = (result.Items || []).filter((item) => isReservaPast(item, reference));

  pasadas.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
    return Number(a.hora) - Number(b.hora);
  });

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      reservas: pasadas,
    }),
  };
};