export interface PrdExportData {
  title: string;
  content: string;
  createdBy: string;
  lastModified: string;
  version: number;
  workspaceName?: string;
}

export class PrdExportService {
  /**
   * Export PRD using browser's native print-to-PDF functionality
   * This is the most reliable method with zero dependencies
   */
  static async exportToPDF(data: PrdExportData): Promise<void> {
    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        throw new Error("Unable to open print window. Please check your popup blocker.");
      }

      const htmlContent = this.generatePrintHTML(data);
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Optional: close window after printing
          // printWindow.close();
        }, 100);
      };
    } catch (error) {
      console.error("Error exporting PDF:", error);
      throw new Error("Failed to export PDF. Please try again.");
    }
  }

  /**
   * Alternative: Download as HTML file
   */
  static async exportAsHTML(data: PrdExportData): Promise<void> {
    try {
      const htmlContent = this.generatePrintHTML(data);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_v${data.version}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting HTML:", error);
      throw new Error("Failed to export HTML. Please try again.");
    }
  }

  /**
   * Generate clean, print-optimized HTML
   */
  private static generatePrintHTML(data: PrdExportData): string {
    const markdownContent = this.parseMarkdownToHTML(data.content);

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${data.title}</title>
          <style>
            /* Print-optimized styles */
            @page {
              margin: 2cm;
              size: A4;
              /* Hide browser headers and footers */
              @top-left { content: ""; }
              @top-center { content: ""; }
              @top-right { content: ""; }
              @bottom-left { content: ""; }
              @bottom-center { content: ""; }
              @bottom-right { content: ""; }
            }

            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .no-print {
                display: none !important;
              }
              .page-break {
                page-break-before: always;
              }
              .avoid-break {
                page-break-inside: avoid;
              }
              /* Hide browser's default headers and footers */
              @page { margin: 2cm; }
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              margin: 0;
              padding: 20px;
              font-size: 14px;
            }

            .container {
              max-width: 800px;
              margin: 0 auto;
            }

            .header {
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
              background: white;
            }

            .title {
              font-size: 28px;
              font-weight: bold;
              margin: 0 0 15px 0;
              color: #111827;
            }

            .metadata {
              display: flex;
              gap: 20px;
              font-size: 14px;
              color: #6b7280;
              flex-wrap: wrap;
            }

            .metadata span {
              white-space: nowrap;
            }

            .content {
              font-size: 14px;
              line-height: 1.7;
              color: #374151;
            }

            /* Typography */
            h1, h2, h3, h4, h5, h6 {
              color: #111827;
              margin-top: 30px;
              margin-bottom: 15px;
              font-weight: 600;
            }

            h1 { font-size: 24px; }
            h2 { font-size: 20px; }
            h3 { font-size: 18px; }
            h4 { font-size: 16px; }
            h5 { font-size: 14px; }
            h6 { font-size: 13px; }

            p {
              margin: 12px 0;
            }

            /* Code styling */
            pre {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-left: 4px solid #007bff;
              padding: 15px;
              border-radius: 4px;
              margin: 15px 0;
              font-family: 'Courier New', monospace;
              font-size: 13px;
              overflow-x: auto;
              page-break-inside: avoid;
            }

            code {
              background: #f8f9fa;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 13px;
              border: 1px solid #e9ecef;
            }

            /* Lists */
            ul, ol {
              margin: 15px 0;
              padding-left: 30px;
            }

            li {
              margin: 8px 0;
            }

            /* Blockquotes */
            blockquote {
              border-left: 4px solid #e9ecef;
              margin: 20px 0;
              padding: 10px 20px;
              background: #f8f9fa;
              color: #6c757d;
              font-style: italic;
            }

            /* Tables */
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 20px 0;
              border: 1px solid #dee2e6;
            }

            th, td {
              border: 1px solid #dee2e6;
              padding: 8px 12px;
              text-align: left;
            }

            th {
              background: #f8f9fa;
              font-weight: 600;
            }

            /* Links */
            a {
              color: #007bff;
              text-decoration: underline;
            }

            /* Horizontal rules */
            hr {
              border: none;
              border-top: 1px solid #dee2e6;
              margin: 30px 0;
            }

            /* Print instruction */
            .print-instruction {
              background: #e3f2fd;
              border: 1px solid #2196f3;
              border-radius: 4px;
              padding: 15px;
              margin-bottom: 20px;
              font-size: 14px;
              color: #1976d2;
            }

            @media print {
              .print-instruction {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="print-instruction no-print">
              <strong>💡 Print Instructions:</strong> Press Ctrl+P (or Cmd+P on Mac) and select "Save as PDF" as your destination to save this document as a PDF file.
            </div>

            <div class="header avoid-break">
              <h1 class="title">${data.title}</h1>
              <div class="metadata">
                <span><strong>Version:</strong> ${data.version}</span>
                <span><strong>Last Modified:</strong> ${new Date(data.lastModified).toLocaleDateString()}</span>
                <span><strong>Created By:</strong> ${data.createdBy}</span>
                ${data.workspaceName ? `<span><strong>Workspace:</strong> ${data.workspaceName}</span>` : ""}
              </div>
            </div>

            <div class="content">
              ${markdownContent}
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Enhanced markdown to HTML parser
   */
  private static parseMarkdownToHTML(markdown: string): string {
    if (!markdown || markdown.trim() === "") {
      return "<p>No content available.</p>";
    }

    let html = markdown;

    // Escape HTML entities first
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Headers (process from h4 to h1 to avoid conflicts)
    html = html.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
    html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");

    // Code blocks (before inline code)
    html = html.replace(/```([^`]*?)```/gs, "<pre><code>$1</code></pre>");

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold and italic
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">');

    // Horizontal rules
    html = html.replace(/^---$/gm, "<hr>");

    // Blockquotes
    html = html.replace(/^> (.+$)/gm, "<blockquote>$1</blockquote>");

    // Lists - numbered
    html = html.replace(/^\d+\.\s+(.+$)/gm, "<li>$1</li>");

    // Lists - bullet points
    html = html.replace(/^[\*\-]\s+(.+$)/gm, "<li>$1</li>");

    // Wrap consecutive list items
    html = html.replace(/(<li>.*?<\/li>(\n|$))+/gs, (match) => {
      if (markdown.includes("1.") || markdown.includes("2.")) {
        return `<ol>${match}</ol>`;
      }
      return `<ul>${match}</ul>`;
    });

    // Paragraphs - convert double line breaks to paragraph breaks
    html = html.replace(/\n\s*\n/g, "</p><p>");

    // Single line breaks to <br>
    html = html.replace(/\n/g, "<br>");

    // Wrap in paragraphs if not already wrapped
    if (!html.startsWith("<") && html.trim() !== "") {
      html = `<p>${html}</p>`;
    }

    return html;
  }
}
