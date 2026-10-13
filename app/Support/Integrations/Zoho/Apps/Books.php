<?php

namespace App\Support\Integrations\Zoho\Apps;

use App\Support\Integrations\Zoho\ZohoClient;
use App\Support\Integrations\Zoho\ZohoConfig;
use App\Support\Integrations\Zoho\ZohoException;

/**
 * Zoho Books: customers, invoices, customer payments, and the bank-statement
 * import that bookkeeping automation builds on. Books owns invoice numbers,
 * tax and reconciliation; Laravel only sends what an order needs.
 */
class Books
{
    public function __construct(private ZohoClient $client) {}

    public function findCustomerByEmail(string $email): ?string
    {
        $body = $this->get('/contacts', ['email' => $email, 'contact_type' => 'customer']);

        return isset($body['contacts'][0]['contact_id']) ? (string) $body['contacts'][0]['contact_id'] : null;
    }

    public function createCustomer(array $contact): string
    {
        $body = $this->post('/contacts', ['contact_type' => 'customer', ...$contact]);

        return (string) ($body['contact']['contact_id'] ?? throw new ZohoException('Books did not return a contact id.', retryable: false));
    }

    /** An invoice whose reference_number is the TBCA order reference, if one exists already. */
    public function findInvoiceByReference(string $reference): ?array
    {
        $body = $this->get('/invoices', ['reference_number' => $reference]);

        return $body['invoices'][0] ?? null;
    }

    /** @return array{invoice_id: string, invoice_number: ?string} */
    public function createInvoice(array $invoice): array
    {
        $body = $this->post('/invoices', $invoice);
        $id = $body['invoice']['invoice_id'] ?? throw new ZohoException('Books did not return an invoice id.', retryable: false);

        return ['invoice_id' => (string) $id, 'invoice_number' => $body['invoice']['invoice_number'] ?? null];
    }

    public function getInvoice(string $invoiceId): array
    {
        return $this->get("/invoices/{$invoiceId}")['invoice'] ?? [];
    }

    public function recordPayment(array $payment): string
    {
        $body = $this->post('/customerpayments', $payment);

        return (string) ($body['payment']['payment_id'] ?? throw new ZohoException('Books did not return a payment id.', retryable: false));
    }

    /**
     * Connector point for bookkeeping automation: import one bank statement
     * into a Books bank account so Books matching and categorisation rules
     * can run. Each transaction: transaction_id, date (Y-m-d), debit_or_credit,
     * amount, payee, description, reference_number. The statement file
     * comes from the bank or a licensed bank-feed provider; nothing here
     * logs in to a bank.
     */
    public function importBankStatement(string $startDate, string $endDate, array $transactions, ?string $accountId = null): string
    {
        $account = $accountId ?? ZohoConfig::org('books', 'bank_account_id') ?? throw new ZohoException('ZOHO_BOOKS_BANK_ACCOUNT_ID is not set.', retryable: false);

        $body = $this->post('/bankstatements', [
            'account_id' => $account,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'transactions' => $transactions,
        ]);

        return (string) ($body['statement_id'] ?? $body['message'] ?? 'imported');
    }

    private function get(string $path, array $query = []): array
    {
        return $this->client->request('GET', $this->base().$path, ['query' => [...$query, 'organization_id' => $this->org()]]);
    }

    private function post(string $path, array $json): array
    {
        return $this->client->request('POST', $this->base().$path, ['query' => ['organization_id' => $this->org()], 'json' => $json]);
    }

    private function base(): string
    {
        return ZohoConfig::host('api').'/books/v3';
    }

    private function org(): string
    {
        return ZohoConfig::org('books', 'organization_id') ?? throw new ZohoException('ZOHO_BOOKS_ORG_ID is not set.', retryable: false);
    }
}
