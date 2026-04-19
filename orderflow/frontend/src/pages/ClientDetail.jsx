import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getClient,
  getOrders,
  getInvoices,
  getPayments,
} from "../api/client";
import { Spinner, Badge, fmt } from "../components/UI";
import { printClientDetail } from '../components/PrintTemplates'

export default function ClientDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    async function load() {
      const [c, o, i, p] = await Promise.all([
        getClient(id),
        getOrders(),
        getInvoices(),
        getPayments(),
      ]);

      setClient(c);

      // filter by client
      setOrders(o.filter(x => x.clientId == id));
      setInvoices(i.filter(x => x.clientId == id));
      setPayments(p.filter(x => x.clientId == id));
    }

    load();
  }, [id]);

  if (!client) return <Spinner />;

  const totalOutstanding = invoices
    .filter(i => i.status !== "PAID")
    .reduce((s, i) => s + (i.balanceDue || 0), 0);

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-header">
        <h1 className="page-title">{client.name}</h1>
        <Badge status={client.status} />
      </div>

      {/* CLIENT INFO */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Client Info</h3>
        <p><b>Code:</b> {client.code}</p>
        <p><b>Phone:</b> {client.phone}</p>
        <p><b>GST:</b> {client.gstRate}</p>
        <p><b>Credit Limit:</b> {fmt(client.creditLimit)}</p>
      </div>

      {/* SUMMARY */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Summary</h3>
        <p><b>Total Orders:</b> {orders.length}</p>
        <p><b>Total Invoices:</b> {invoices.length}</p>
        <p><b>Total Payments:</b> {payments.length}</p>
        <p><b>Outstanding:</b> {fmt(totalOutstanding)}</p>
      </div>

      {/* ORDERS */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Orders</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {!orders.length ? (
              <tr><td colSpan="3">No orders</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} onClick={() => nav(`/orders/${o.id}`)}>
                  <td>{o.orderNo}</td>
                  <td><Badge status={o.status} /></td>
                  <td>{fmt(o.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* INVOICES */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Invoices</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Total</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!invoices.length ? (
              <tr><td colSpan="4">No invoices</td></tr>
            ) : (
              invoices.map(i => (
                <tr key={i.id} onClick={() => nav(`/invoices/${i.id}`)}>
                  <td>{i.invoiceNo}</td>
                  <td>{fmt(i.total)}</td>
                  <td>{fmt(i.balanceDue)}</td>
                  <td><Badge status={i.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAYMENTS */}
      <div className="card">
        <h3>Payments</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {!payments.length ? (
              <tr><td colSpan="3">No payments</td></tr>
            ) : (
              payments.map(p => (
                <tr key={p.id}>
                  <td>{p.paymentRef}</td>
                  <td>{p.paymentDate}</td>
                  <td>{fmt(p.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}