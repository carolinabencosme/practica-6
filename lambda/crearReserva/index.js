'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');
const { validateReserva } = require('../shared/reservaValidator');

const TABLE_NAME = process.env.TABLE_NAME || 'Reservas';
const MAX_POR_SLOT = 7;

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, message: 'Cuerpo de la solicitud inválido.' }),
    };
  }

  // Validate input
  const { valid, errors } = validateReserva(data);
  if (!valid) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, message: 'Datos inválidos.', errors }),
    };
  }

  const correo = data.correo.trim();
  const nombre = data.nombre.trim();
  const id = String(data.id).trim();
  const fecha = data.fecha.trim();
  const hora = Number(data.hora);
  const laboratorio = data.laboratorio.trim();

  // Composite key for counting reservations per lab/date/hour slot
  const labFechaHora = `${laboratorio}#${fecha}#${hora}`;

  // Check current capacity for this slot
  const countResult = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'LabSlotIndex',
      KeyConditionExpression: 'labFechaHora = :lf',
      ExpressionAttributeValues: { ':lf': labFechaHora },
      Select: 'COUNT',
    })
  );

  if ((countResult.Count || 0) >= MAX_POR_SLOT) {
    return {
      statusCode: 409,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        message: `Ya hay ${MAX_POR_SLOT} personas reservadas para ${laboratorio} el ${fecha} a las ${hora}:00. Intenta otro horario o laboratorio.`,
      }),
    };
  }

  // Create the reservation item
  const idReserva = randomUUID();
  const createdAt = new Date().toISOString();

  const item = {
    idReserva,
    correo,
    nombre,
    estudianteId: id,
    fecha,
    hora,
    laboratorio,
    labFechaHora,
    createdAt,
  };

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return {
    statusCode: 201,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      message: '¡Reserva creada exitosamente!',
      reserva: item,
    }),
  };
};
