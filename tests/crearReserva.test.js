'use strict';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-reserva-123'),
}));

const mockSend = jest.fn();
const mockFrom = jest.fn(() => ({ send: mockSend }));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: (...args) => mockFrom(...args),
  },
}), { virtual: true });

class MockTransactWriteItemsCommand {
  constructor(input) {
    this.input = input;
  }
}

class MockConditionalCheckFailedException extends Error {
  constructor(message = 'Conditional check failed') {
    super(message);
    this.name = 'ConditionalCheckFailedException';
  }
}

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({ mocked: true })),
  TransactWriteItemsCommand: MockTransactWriteItemsCommand,
  ConditionalCheckFailedException: MockConditionalCheckFailedException,
}), { virtual: true });

const { handler, _internal } = require('../lambda/crearReserva/index');

function buildEvent(body) {
  return {
    httpMethod: 'POST',
    body: JSON.stringify({
      correo: 'estudiante@universidad.edu',
      nombre: 'María López',
      id: 'A00123456',
      fecha: '2099-06-15',
      hora: 10,
      laboratorio: 'Lab 1',
      ...body,
    }),
  };
}

describe('crearReserva handler', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  test('crea reserva y contador del slot en una sola transacción', async () => {
    mockSend.mockResolvedValueOnce({});

    const response = await handler(buildEvent());
    const payload = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(payload.success).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(1);

    const command = mockSend.mock.calls[0][0];
    expect(command.input.TransactItems).toHaveLength(2);

    const [updateSlot, putReserva] = command.input.TransactItems;
    expect(updateSlot.Update.TableName).toBe(_internal.constants.TABLE_NAME);
    expect(updateSlot.Update.Key).toEqual({
      idReserva: 'SLOT#Lab 1#2099-06-15#10',
    });
    expect(updateSlot.Update.ConditionExpression).toContain('#count < :maxPorSlot');
    expect(updateSlot.Update.ExpressionAttributeValues[':maxPorSlot']).toBe(7);
    expect(updateSlot.Update.ExpressionAttributeValues[':labFechaHora']).toBe('Lab 1#2099-06-15#10');

    expect(putReserva.Put.Item).toMatchObject({
      idReserva: 'uuid-reserva-123',
      itemType: 'RESERVA',
      laboratorio: 'Lab 1',
      fecha: '2099-06-15',
      hora: 10,
      labFechaHora: 'Lab 1#2099-06-15#10',
    });
    expect(payload.reserva).toMatchObject({
      idReserva: 'uuid-reserva-123',
      itemType: 'RESERVA',
    });
  });

  test('devuelve 409 con el mismo mensaje cuando el slot ya alcanzó 7 reservas', async () => {
    mockSend.mockRejectedValueOnce(new MockConditionalCheckFailedException());

    const response = await handler(buildEvent());
    const payload = JSON.parse(response.body);

    expect(response.statusCode).toBe(409);
    expect(payload).toEqual({
      success: false,
      message: 'Ya hay 7 personas reservadas para Lab 1 el 2099-06-15 a las 10:00. Intenta otro horario o laboratorio.',
    });
  });

  test('traduce TransactionCanceledException a 409 para conflictos transaccionales por cupo', async () => {
    const error = new Error('Transaction cancelled');
    error.name = 'TransactionCanceledException';
    mockSend.mockRejectedValueOnce(error);

    const response = await handler(buildEvent());

    expect(response.statusCode).toBe(409);
  });
});
