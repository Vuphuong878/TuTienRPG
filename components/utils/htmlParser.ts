// components/utils/htmlParser.ts

export interface ParsedHTMLContent {
  isHTML: boolean;
  sections?: HTMLSection[];
  rawContent?: string;
}

export interface HTMLSection {
  id: string;
  title: string;
  content: string;
  isOpen: boolean;
}

/**
 * Detects if content contains HTML status panel markup
 */
export function isHTMLContent(text: string): boolean {
  return text.includes('<div class="status-panel-dl">') && text.includes('</div>');
}

/**
 * Extracts HTML content from mixed text and HTML
 */
export function extractHTMLContent(text: string): { beforeHTML: string; htmlContent: string; afterHTML: string } {
  const startIndex = text.indexOf('<div class="status-panel-dl">');
  const endIndex = text.lastIndexOf('</div>') + 6; // Include the closing </div>
  
  if (startIndex === -1 || endIndex === -1) {
    return { beforeHTML: text, htmlContent: '', afterHTML: '' };
  }
  
  return {
    beforeHTML: text.substring(0, startIndex).trim(),
    htmlContent: text.substring(startIndex, endIndex).trim(),
    afterHTML: text.substring(endIndex).trim()
  };
}

/**
 * Parses HTML status panel content into structured sections
 */
export function parseHTMLContent(htmlString: string): ParsedHTMLContent {
  if (!isHTMLContent(htmlString)) {
    return {
      isHTML: false,
      rawContent: htmlString
    };
  }

  try {
    const sections: HTMLSection[] = [];
    
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    
    // Find all details elements
    const detailsElements = tempDiv.querySelectorAll('details');
    
    detailsElements.forEach((details, index) => {
      const summary = details.querySelector('summary');
      const contentBox = details.querySelector('.content-box');
      
      if (summary && contentBox) {
        sections.push({
          id: `section-${index}`,
          title: summary.textContent?.trim() || `Section ${index + 1}`,
          content: contentBox.innerHTML.trim(),
          isOpen: details.hasAttribute('open')
        });
      }
    });

    return {
      isHTML: true,
      sections
    };
  } catch (error) {
    console.warn('Failed to parse HTML content:', error);
    return {
      isHTML: false,
      rawContent: htmlString
    };
  }
}

/**
 * Sanitizes HTML content by removing potentially dangerous elements and attributes
 */
export function sanitizeHTML(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}