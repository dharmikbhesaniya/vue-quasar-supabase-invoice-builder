<template>
  <div class="modern-invoice">
    <!-- Header Section -->
    <header class="invoice-header">
      <div class="header-content">
        <div class="brand-section">
          <div class="brand-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
                stroke="#6366f1"
                stroke-width="2"
              />
              <path d="M3 10h18" stroke="#6366f1" stroke-width="2" />
              <path d="M8 14h8" stroke="#6366f1" stroke-width="2" />
            </svg>
          </div>
          <div class="brand-info">
            <h1 class="company-name">{{ invoice.company_name }}</h1>
            <p class="company-tagline">Professional Services</p>
          </div>
        </div>

        <div class="invoice-meta">
          <div class="invoice-badge">
            <span class="badge-label">INVOICE</span>
            <span class="badge-number">#{{ invoice.invoice_number }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Info Cards -->
    <section class="info-cards">
      <div class="card client-card">
        <div class="card-header">
          <h3>Bill To</h3>
        </div>
        <div class="card-content">
          <p class="client-name">{{ invoice.customer_name }}</p>
          <div class="meta-info">
            <div class="meta-item">
              <span class="meta-label">Customer ID:</span>
              <span class="meta-value"
                >#{{ generateCustomerId(invoice.customer_name) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="card invoice-info-card">
        <div class="card-header">
          <h3>Invoice Information</h3>
        </div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Issue Date</span>
              <span class="info-value">{{
                formatDate(invoice.invoice_date)
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Due Date</span>
              <span class="info-value">{{
                calculateDueDate(invoice.invoice_date)
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Invoice Type</span>
              <span class="info-value">
                <span :class="getTypeClass(invoice.invoice_type)">
                  {{ formatInvoiceType(invoice.invoice_type) }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Items Table -->
    <section class="items-section">
      <div class="section-header">
        <h3>Invoice Items</h3>
        <div class="items-summary">{{ invoice.items.length }} item(s)</div>
      </div>

      <div class="items-table-container">
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-desc">Description</th>
              <th class="item-qty">Qty</th>
              <th class="item-price">Unit Price</th>
              <th class="item-total">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in invoice.items"
              :key="index"
              class="item-row"
            >
              <td class="item-desc">
                <div class="item-name">{{ item.name }}</div>
              </td>
              <td class="item-qty">{{ item.quantity }}</td>
              <td class="item-price">{{ formatCurrency(item.price) }}</td>
              <td class="item-total">{{ formatCurrency(item.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Summary Section -->
    <section class="summary-section">
      <div class="summary-container">
        <div class="summary-row">
          <span class="summary-label">Subtotal</span>
          <span class="summary-value">{{
            formatCurrency(invoice.total_amount)
          }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Tax (0%)</span>
          <span class="summary-value">{{ formatCurrency(0) }}</span>
        </div>
        <div class="summary-row discount-row">
          <span class="summary-label">Discount</span>
          <span class="summary-value">{{ formatCurrency(0) }}</span>
        </div>
        <div class="summary-row total-row">
          <span class="summary-label">Total Amount</span>
          <span class="summary-value">{{
            formatCurrency(invoice.total_amount)
          }}</span>
        </div>
      </div>
    </section>

    <!-- Additional Content -->
    <section
      v-if="invoice.additional_notes || invoice.terms_conditions"
      class="additional-content"
    >
      <div v-if="invoice.additional_notes" class="notes-card">
        <h4>Additional Notes</h4>
        <p>{{ invoice.additional_notes }}</p>
      </div>

      <div v-if="invoice.terms_conditions" class="terms-card">
        <h4>Terms & Conditions</h4>
        <p>{{ invoice.terms_conditions }}</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="invoice-footer">
      <div class="footer-content">
        <div class="payment-info">
          <h4>Payment Information</h4>
          <p>Please remit payment within 30 days of invoice date.</p>
          <p>Thank you for your business!</p>
        </div>
        <div class="contact-info">
          <p>Generated on {{ formatDate(new Date().toISOString()) }}</p>
          <p>Invoice #{{ invoice.invoice_number }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Invoice } from "@/types/invoice";

interface Props {
  invoice: Invoice;
}

const props = defineProps<Props>();

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatInvoiceType = (type: string): string => {
  return type.replace("_", " ").toUpperCase();
};

const getTypeClass = (type: string): string => {
  const classes = {
    product_selling: "type-selling",
    product_purchase: "type-purchase",
    employee_salary: "type-salary",
  };
  return `invoice-type ${
    classes[type as keyof typeof classes] || "type-default"
  }`;
};

const generateCustomerId = (customerName: string): string => {
  return (
    customerName.replace(/\s+/g, "").substring(0, 8).toUpperCase() +
    Math.floor(Math.random() * 1000)
  );
};

const calculateDueDate = (invoiceDate: string): string => {
  const date = new Date(invoiceDate);
  date.setDate(date.getDate() + 30);
  return formatDate(date.toISOString());
};
</script>

<style scoped>
.modern-invoice {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.invoice-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon svg {
  fill: #6366f1;
}

.company-name {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.company-tagline {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

.invoice-badge {
  text-align: right;
}

.badge-label {
  display: block;
  font-size: 2.5rem;
  font-weight: 300;
  color: #374151;
  margin-bottom: 0.5rem;
}

.badge-number {
  display: inline-block;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
}

.info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.card-content {
  padding: 1.5rem;
}

.client-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.meta-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.meta-value {
  font-weight: 500;
  color: #374151;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.info-value {
  font-weight: 500;
  color: #374151;
}

.invoice-type {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-selling {
  background: #d1fae5;
  color: #065f46;
}

.type-purchase {
  background: #fef3c7;
  color: #92400e;
}

.type-salary {
  background: #dbeafe;
  color: #1e40af;
}

.items-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.items-summary {
  color: #6b7280;
  font-size: 0.9rem;
}

.items-table-container {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.items-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.item-row:hover {
  background: #f9fafb;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
}

.item-qty,
.item-price,
.item-total {
  text-align: right;
}

.summary-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.summary-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 350px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-row:last-child {
  border-bottom: none;
}

.total-row {
  background: linear-gradient(135deg, #1f2937, #374151);
  margin: 1rem -1.5rem -1.5rem -1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 0 0 12px 12px;
}

.total-row .summary-label,
.total-row .summary-value {
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
}

.summary-label {
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  color: #1f2937;
  font-weight: 600;
}

.additional-content {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
}

.notes-card,
.terms-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.notes-card h4,
.terms-card h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}

.notes-card p,
.terms-card p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.invoice-footer {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.payment-info h4,
.contact-info h4 {
  margin: 0 0 0.75rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.payment-info p,
.contact-info p {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .modern-invoice {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .items-table {
    font-size: 0.85rem;
  }

  .items-table th,
  .items-table td {
    padding: 0.75rem 0.5rem;
  }
}

@media print {
  .modern-invoice {
    background: white;
    padding: 1rem;
  }

  .card,
  .items-section,
  .summary-container,
  .notes-card,
  .terms-card,
  .invoice-footer {
    box-shadow: none;
    border: 1px solid #e5e7eb;
  }
}
</style>
