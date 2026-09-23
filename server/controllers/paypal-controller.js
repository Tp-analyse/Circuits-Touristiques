const { Client, Environment, OrdersController, LogLevel } = require("@paypal/paypal-server-sdk");
const { validationResult } = require('express-validator');
const { query } = require('../util/bd');


// PayPal is optional: without keys the server runs and the payment routes return 503
const paypalConfigured = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

let ordersController = null;
if (paypalConfigured) {
  const client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    },
    environment: Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  });
  ordersController = new OrdersController(client);
} else {
  console.warn("PayPal not configured: set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in server/.env to enable payments.");
}

const paypalNotConfigured = (res) =>
  res.status(503).json({ error: "PayPal not configured" });

const createOrder = async (req, res, next) => {
  if (!ordersController) {
    return paypalNotConfigured(res);
  }

  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  const { amount } = req.body;

  try {
    const collect = {
      body: {
        intent: "CAPTURE",
        purchaseUnits: [
          {
            amount: {
              currencyCode: "CAD",
              value: amount.toString(),
            },
          },
        ],
      },
      prefer: "return=representation",
    };

    const { body, ...httpResponse } = await ordersController.createOrder(collect);
    
    const responseData = typeof body === 'string' ? JSON.parse(body) : body;
    
    res.status(httpResponse.statusCode).json({ orderId: responseData.id, ...responseData });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order", message: error.message });
  }
};

const captureOrder = async (req, res, next) => {
  if (!ordersController) {
    return paypalNotConfigured(res);
  }

  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ error: "Invalid circuitId" });
  }

  const { orderId } = req.params;
  const { circuitId } = req.body;
  const userId = req.userData ? req.userData.userId : null;

  try {
    const collect = {
      id: orderId,
      prefer: "return=representation",
    };

    const { body, ...httpResponse } = await ordersController.captureOrder(collect);
    const responseData = typeof body === 'string' ? JSON.parse(body) : body;
    
    if ((httpResponse.statusCode === 201 || httpResponse.statusCode === 200) && userId && circuitId) {
        try {
            await query(
                'INSERT INTO client_circuit (client_id, circuit_id) VALUES (?, ?)',
                [userId, circuitId]
            );
        } catch (dbError) {
            console.error("Error saving circuit purchase:", dbError);
        }
    }

    res.status(httpResponse.statusCode).json(responseData);

  } catch (error) {
    console.error("Error capturing order:", error);
    res.status(500).json({ error: "Failed to capture order", message: error.message });
  }
};

module.exports = { createOrder, captureOrder };