import React, { useEffect, useState } from 'react';

const ws = new WebSocket('ws://34.136.47.67:5000');

function OrderList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('http://34.136.47.67:5000/api/orders')
      .then(res => res.json())
      .then(setOrders);

    ws.onmessage = (msg) => {
      const order = JSON.parse(msg.data);
      setOrders(prev => [order, ...prev]);
    };
  }, []);

  return (
    <div>
      <h1>LIVE ORDERS FEED</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Items</th>
            <th>Status</th>
            <th>Time Placed</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.customer_name}</td>
              <td>{order.items.join(', ')}</td>
              <td>{order.status}</td>
              <td>{new Date(order.time_placed).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderList;
