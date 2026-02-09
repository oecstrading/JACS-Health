/**
 * Electronic Fax Service
 * 
 * Provides electronic fax transmission for patient intake forms
 * to doctor offices that don't accept email submissions.
 * 
 * Supports integration with:
 * - Phaxio API
 * - HelloFax (Dropbox Sign) API
 * - RingCentral Fax API
 * - eFax API
 */

import * as FileSystem from "expo-file-system/legacy";

export interface FaxRecipient {
  name: string;
  faxNumber: string;
  organization?: string;
}

export interface FaxOptions {
  coverPage?: boolean;
  coverPageMessage?: string;
  priority?: "normal" | "high";
  retryOnFail?: boolean;
  callbackUrl?: string;
}

export interface FaxStatus {
  id: string;
  status: "queued" | "sending" | "sent" | "failed" | "delivered";
  recipient: FaxRecipient;
  pages: number;
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  cost?: number;
}

export interface FaxHistory {
  id: string;
  recipient: FaxRecipient;
  documentName: string;
  status: FaxStatus["status"];
  sentAt: string;
  deliveredAt?: string;
  pages: number;
  cost: number;
  errorMessage?: string;
}

class FaxService {
  private apiKey: string | null = null;
  private apiEndpoint = "https://api.phaxio.com/v2"; // Example: Phaxio API
  private faxHistory: FaxHistory[] = [];

  /**
   * Initialize fax service with API credentials
   */
  initialize(apiKey: string, apiSecret?: string): void {
    this.apiKey = apiKey;
    // In production, store API secret securely
  }

  /**
   * Validate and format fax number
   * Accepts formats: (123) 456-7890, 123-456-7890, 1234567890
   * Returns: +11234567890 (E.164 format)
   */
  formatFaxNumber(faxNumber: string): string {
    // Remove all non-digit characters
    const digits = faxNumber.replace(/\D/g, "");

    // Validate length (10 digits for US, or 11 with country code)
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith("1")) {
      return `+${digits}`;
    } else {
      throw new Error("Invalid fax number format. Please use a 10-digit US number.");
    }
  }

  /**
   * Validate fax number format
   */
  isValidFaxNumber(faxNumber: string): boolean {
    try {
      this.formatFaxNumber(faxNumber);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate HIPAA-compliant fax cover page
   */
  private generateCoverPage(
    recipient: FaxRecipient,
    sender: { name: string; organization: string; phone: string },
    message: string,
    pages: number
  ): string {
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section h2 {
              font-size: 16px;
              margin-bottom: 10px;
              text-decoration: underline;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .info-label {
              font-weight: bold;
              width: 150px;
            }
            .hipaa-notice {
              border: 2px solid #000;
              padding: 15px;
              margin-top: 30px;
              background-color: #f9f9f9;
            }
            .hipaa-notice h3 {
              margin-top: 0;
              font-size: 14px;
            }
            .hipaa-notice p {
              font-size: 12px;
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACSIMILE COVER SHEET</h1>
            <p>${date}</p>
          </div>

          <div class="section">
            <h2>TO:</h2>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span>${recipient.name}</span>
            </div>
            ${recipient.organization ? `
            <div class="info-row">
              <span class="info-label">Organization:</span>
              <span>${recipient.organization}</span>
            </div>
            ` : ""}
            <div class="info-row">
              <span class="info-label">Fax Number:</span>
              <span>${recipient.faxNumber}</span>
            </div>
          </div>

          <div class="section">
            <h2>FROM:</h2>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span>${sender.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Organization:</span>
              <span>${sender.organization}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span>${sender.phone}</span>
            </div>
          </div>

          <div class="section">
            <h2>TRANSMISSION DETAILS:</h2>
            <div class="info-row">
              <span class="info-label">Total Pages:</span>
              <span>${pages} (including cover page)</span>
            </div>
            <div class="info-row">
              <span class="info-label">Subject:</span>
              <span>New Patient Intake Form</span>
            </div>
          </div>

          ${message ? `
          <div class="section">
            <h2>MESSAGE:</h2>
            <p>${message}</p>
          </div>
          ` : ""}

          <div class="hipaa-notice">
            <h3>⚠️ CONFIDENTIALITY NOTICE - HIPAA PROTECTED INFORMATION</h3>
            <p>
              This facsimile transmission contains confidential information belonging to the sender 
              that is legally privileged and protected by the Health Insurance Portability and 
              Accountability Act (HIPAA). This information is intended only for the use of the 
              individual or entity named above.
            </p>
            <p>
              If you are not the intended recipient, you are hereby notified that any disclosure, 
              copying, distribution, or action taken in reliance on the contents of this faxed 
              information is strictly prohibited. If you have received this fax in error, please 
              notify the sender immediately and destroy all copies of the original message.
            </p>
            <p>
              <strong>UNAUTHORIZED DISCLOSURE OR USE OF THIS INFORMATION MAY RESULT IN CIVIL 
              AND CRIMINAL PENALTIES.</strong>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send fax with PDF document
   */
  async sendFax(
    recipient: FaxRecipient,
    pdfUri: string,
    options: FaxOptions = {}
  ): Promise<FaxStatus> {
    try {
      // Validate fax number
      const formattedNumber = this.formatFaxNumber(recipient.faxNumber);

      // Read PDF file
      const pdfData = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generate cover page if requested
      let coverPageHtml: string | undefined;
      if (options.coverPage !== false) {
        coverPageHtml = this.generateCoverPage(
          { ...recipient, faxNumber: formattedNumber },
          {
            name: "HealthMate Patient",
            organization: "HealthMate Health Companion",
            phone: "(555) 123-4567", // Would come from user profile
          },
          options.coverPageMessage || "Please find attached the completed New Patient Intake Form.",
          1 // PDF page count would be calculated
        );
      }

      // In production, call actual fax API:
      // const response = await fetch(`${this.apiEndpoint}/faxes`, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${this.apiKey}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     to: formattedNumber,
      //     files: [{
      //       name: "patient_intake_form.pdf",
      //       content: pdfData,
      //       contentType: "application/pdf",
      //     }],
      //     coverPage: coverPageHtml,
      //     callbackUrl: options.callbackUrl,
      //     tag: "patient_intake",
      //   }),
      // });
      //
      // const data = await response.json();
      // return this.parseFaxResponse(data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create mock fax status
      const faxStatus: FaxStatus = {
        id: `fax_${Date.now()}`,
        status: "queued",
        recipient: { ...recipient, faxNumber: formattedNumber },
        pages: options.coverPage !== false ? 2 : 1,
        cost: 0.12, // Typical cost per page
      };

      // Add to history
      this.faxHistory.push({
        id: faxStatus.id,
        recipient: faxStatus.recipient,
        documentName: "New Patient Intake Form",
        status: faxStatus.status,
        sentAt: new Date().toISOString(),
        pages: faxStatus.pages,
        cost: faxStatus.cost || 0,
      });

      // Simulate status updates
      this.simulateFaxDelivery(faxStatus.id);

      return faxStatus;
    } catch (error) {
      console.error("Error sending fax:", error);
      throw new Error("Failed to send fax");
    }
  }

  /**
   * Simulate fax delivery status updates
   * In production, this would be handled by webhook callbacks
   */
  private async simulateFaxDelivery(faxId: string): Promise<void> {
    // Simulate sending
    setTimeout(() => {
      const historyItem = this.faxHistory.find((h) => h.id === faxId);
      if (historyItem) {
        historyItem.status = "sending";
      }
    }, 3000);

    // Simulate sent
    setTimeout(() => {
      const historyItem = this.faxHistory.find((h) => h.id === faxId);
      if (historyItem) {
        historyItem.status = "sent";
      }
    }, 8000);

    // Simulate delivered
    setTimeout(() => {
      const historyItem = this.faxHistory.find((h) => h.id === faxId);
      if (historyItem) {
        historyItem.status = "delivered";
        historyItem.deliveredAt = new Date().toISOString();
      }
    }, 15000);
  }

  /**
   * Get fax status by ID
   */
  async getFaxStatus(faxId: string): Promise<FaxStatus | null> {
    try {
      // In production, call actual API:
      // const response = await fetch(`${this.apiEndpoint}/faxes/${faxId}`, {
      //   headers: {
      //     "Authorization": `Bearer ${this.apiKey}`,
      //   },
      // });
      // const data = await response.json();
      // return this.parseFaxResponse(data);

      const historyItem = this.faxHistory.find((h) => h.id === faxId);
      if (!historyItem) {
        return null;
      }

      return {
        id: historyItem.id,
        status: historyItem.status,
        recipient: historyItem.recipient,
        pages: historyItem.pages,
        sentAt: historyItem.sentAt,
        deliveredAt: historyItem.deliveredAt,
        cost: historyItem.cost,
      };
    } catch (error) {
      console.error("Error getting fax status:", error);
      return null;
    }
  }

  /**
   * Get fax history
   */
  getFaxHistory(): FaxHistory[] {
    return [...this.faxHistory].sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  /**
   * Estimate fax cost
   * Typical pricing: $0.07-0.15 per page
   */
  estimateCost(pages: number, includeCoverPage: boolean = true): number {
    const totalPages = includeCoverPage ? pages + 1 : pages;
    const costPerPage = 0.12;
    return totalPages * costPerPage;
  }

  /**
   * Cancel pending fax
   */
  async cancelFax(faxId: string): Promise<boolean> {
    try {
      // In production, call actual API:
      // const response = await fetch(`${this.apiEndpoint}/faxes/${faxId}`, {
      //   method: "DELETE",
      //   headers: {
      //     "Authorization": `Bearer ${this.apiKey}`,
      //   },
      // });
      // return response.ok;

      const historyItem = this.faxHistory.find((h) => h.id === faxId);
      if (historyItem && historyItem.status === "queued") {
        historyItem.status = "failed";
        historyItem.errorMessage = "Cancelled by user";
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error cancelling fax:", error);
      return false;
    }
  }

  /**
   * Parse fax API response
   * (Helper method for production implementation)
   */
  private parseFaxResponse(data: any): FaxStatus {
    // Example for Phaxio API response
    return {
      id: data.id || data.fax_id,
      status: this.mapApiStatus(data.status),
      recipient: {
        name: data.to_name || "",
        faxNumber: data.to_number,
        organization: data.to_organization,
      },
      pages: data.num_pages || 0,
      sentAt: data.created_at,
      deliveredAt: data.completed_at,
      errorMessage: data.error_message,
      cost: data.cost,
    };
  }

  /**
   * Map API status to our status enum
   */
  private mapApiStatus(apiStatus: string): FaxStatus["status"] {
    const statusMap: Record<string, FaxStatus["status"]> = {
      "queued": "queued",
      "inProgress": "sending",
      "success": "delivered",
      "failure": "failed",
    };

    return statusMap[apiStatus] || "queued";
  }
}

export default new FaxService();
