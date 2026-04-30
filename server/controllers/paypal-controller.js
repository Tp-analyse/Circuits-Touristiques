const { Client, Environment, OrdersController, LogLevel } = require("@paypal/paypal-server-sdk");
const { query } = require('../util/bd');


const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: "AV_0RDXxdbOI343Ab1dperxL-zzQMICucSJOIVxymFrBHyq9USETsTNtqiaf9qhpUZ0TPvZ8YPMF_HQR",
    oAuthClientSecret: "EItJ60f3s-kQJEoqEyDpyarlZ-xQ8blcaJbw5JluuN5wB_BF83gfzuuNGI4_SiWI-PnTi1Ww9NxqqB9k",
  },
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

const ordersController = new OrdersController(client);

const createOrder = async (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

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
    
    // In SDK v2+, body is already a string if it's the raw response, or an object if parsed.
    // The latest SDK usually returns an object.
    const responseData = typeof body === 'string' ? JSON.parse(body) : body;
    
    // The frontend expects { orderId } or { id }
    res.status(httpResponse.statusCode).json({ orderId: responseData.id, ...responseData });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order", message: error.message });
  }
};

const captureOrder = async (req, res, next) => {
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
            // We still return success for the payment, but log the error
        }
    }

    res.status(httpResponse.statusCode).json(responseData);

  } catch (error) {
    console.error("Error capturing order:", error);
    res.status(500).json({ error: "Failed to capture order", message: error.message });
  }
};

module.exports = { createOrder, captureOrder };
