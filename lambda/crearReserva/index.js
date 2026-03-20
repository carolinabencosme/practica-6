'use strict';

const {
  ConditionalCheckFailedException,
  DynamoDBClient,
} = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');
const { validateReserva } = require('./shared/reservaValidator');

const TABLE_NAME = process.env.TABLE_NAME || 'Reservas';
const MAX_POR_SLOT = 7;
const SLOT_CONTROL_PREFIX = 'SLOT';
const RESERVA_ITEM_TYPE = 'RESERVA';
const SLOT_ITEM_TYPE = 'SLOT_CONTROL';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Content-Type': 'application/json',
};

function buildSlotKey(laboratorio, fecha, hora) {
  return `${laboratorio}#${fecha}#${hora}`;
}

function buildSlotControlId(labFechaHora) {
  return `${SLOT_CONTROL_PREFIX}#${labFechaHora}`;
}

function buildCapacityError(laboratorio, fecha, hora) {
  return {
    statusCode: 409,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: false,
      message: `Ya hay ${MAX_POR_SLOT} personas reservadas para ${laboratorio} el ${fecha} a las ${hora}:00. Intenta otro horario o laboratorio.`,
    }),
  };
}

async function createReserva(data, docClient = ddb) {
  const correo = data.correo.trim();
  const nombre = data.nombre.trim();
  const id = String(data.id).trim();
  const fecha = data.fecha.trim();
  const hora = Number(data.hora);
  const laboratorio = data.laboratorio.trim();

  const labFechaHora = buildSlotKey(laboratorio, fecha, hora);
  const slotControlId = buildSlotControlId(labFechaHora);
  const idReserva = randomUUID();
  const createdAt = new Date().toISOString();

  const reservaItem = {
    idReserva,
    itemType: RESERVA_ITEM_TYPE,
    correo,
    nombre,
    estudianteId: id,
    fecha,
    hora,
    laboratorio,
    labFechaHora,
    createdAt,
  };

  try {
    await docClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: TABLE_NAME,
                Key: { idReserva: slotControlId },
                UpdateExpression:
                    'SET #count = if_not_exists(#count, :zero) + :one, #itemType = if_not_exists(#itemType, :slotType), #labFechaHora = if_not_exists(#labFechaHora, :labFechaHora), #laboratorio = if_not_exists(#laboratorio, :laboratorio), #fecha = if_not_exists(#fecha, :fecha), #hora = if_not_exists(#hora, :hora), #updatedAt = :updatedAt, #createdAt = if_not_exists(#createdAt, :createdAt)',
                ConditionExpression:
                    'attribute_not_exists(#count) OR #count < :maxPorSlot',
                ExpressionAttributeNames: {
                  '#count': 'reservasCount',
                  '#itemType': 'itemType',
                  '#labFechaHora': 'labFechaHora',
                  '#laboratorio': 'laboratorio',
                  '#fecha': 'fecha',
                  '#hora': 'hora',
                  '#updatedAt': 'updatedAt',
                  '#createdAt': 'createdAt',
                },
                ExpressionAttributeValues: {
                  ':zero': 0,
                  ':one': 1,
                  ':maxPorSlot': MAX_POR_SLOT,
                  ':slotType': SLOT_ITEM_TYPE,
                  ':labFechaHora': labFechaHora,
                  ':laboratorio': laboratorio,
                  ':fecha': fecha,
                  ':hora': hora,
                  ':updatedAt': createdAt,
                  ':createdAt': createdAt,
                },
              },
            },
            {
              Put: {
                TableName: TABLE_NAME,
                Item: reservaItem,
                ConditionExpression: 'attribute_not_exists(idReserva)',
              },
            },
          ],
        })
    );
  } catch (error) {
    if (
        error instanceof ConditionalCheckFailedException ||
        error?.name === 'ConditionalCheckFailedException' ||
        error?.name === 'TransactionCanceledException'
    ) {
      return buildCapacityError(laboratorio, fecha, hora);
    }

    throw error;
  }

  return {
    statusCode: 201,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      message: '¡Reserva creada exitosamente!',
      reserva: reservaItem,
    }),
  };
}

exports.handler = async (event) => {
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

  const { valid, errors } = validateReserva(data);
  if (!valid) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, message: 'Datos inválidos.', errors }),
    };
  }

  return createReserva(data);
};