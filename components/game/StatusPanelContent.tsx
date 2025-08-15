// components/game/StatusPanelContent.tsx
import React, { memo, useState, useCallback } from 'react';
import { parseHTMLContent, sanitizeHTML, extractHTMLContent, type HTMLSection } from '../utils/htmlParser';
import type { KnownEntities } from '../types';
import { OptimizedInteractiveText } from '../OptimizedInteractiveText';

interface StatusPanelContentProps {
  htmlContent: string;
  knownEntities: KnownEntities;
  onEntityClick: (entityName: string) => void;
}

interface CollapsibleSectionProps {
  section: HTMLSection;
  knownEntities: KnownEntities;
  onEntityClick: (entityName: string) => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = memo(({
  section,
  knownEntities,
  onEntityClick
}) => {
  const [isOpen, setIsOpen] = useState(section.isOpen);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Convert HTML content to plain text for entity processing
  const getTextContent = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizeHTML(html);
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const textContent = getTextContent(section.content);

  return (
    <details open={isOpen} className="transition-all duration-300">
      <summary onClick={handleToggle} className="list-none">
        {section.title}
      </summary>
      <div className="content-box">
        {/* Check if content has HTML formatting */}
        {section.content.includes('<') ? (
          <div 
            dangerouslySetInnerHTML={{ 
              __html: sanitizeHTML(section.content) 
            }} 
          />
        ) : (
          <OptimizedInteractiveText
            text={textContent}
            onEntityClick={onEntityClick}
            knownEntities={knownEntities}
          />
        )}
      </div>
    </details>
  );
});

CollapsibleSection.displayName = 'CollapsibleSection';

export const StatusPanelContent: React.FC<StatusPanelContentProps> = memo(({
  htmlContent,
  knownEntities,
  onEntityClick
}) => {
  // Extract HTML content from mixed text
  const { beforeHTML, htmlContent: extractedHTML, afterHTML } = extractHTMLContent(htmlContent);
  const parsedContent = parseHTMLContent(extractedHTML);

  if (!parsedContent.isHTML || !parsedContent.sections) {
    // Fallback to regular text rendering
    return (
      <OptimizedInteractiveText
        text={parsedContent.rawContent || htmlContent}
        onEntityClick={onEntityClick}
        knownEntities={knownEntities}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Render text before HTML */}
      {beforeHTML && (
        <OptimizedInteractiveText
          text={beforeHTML}
          onEntityClick={onEntityClick}
          knownEntities={knownEntities}
        />
      )}
      
      {/* Render HTML sections */}
      <div className="status-panel-dl">
        {parsedContent.sections.map((section) => (
          <CollapsibleSection
            key={section.id}
            section={section}
            knownEntities={knownEntities}
            onEntityClick={onEntityClick}
          />
        ))}
      </div>

      {/* Render text after HTML */}
      {afterHTML && (
        <OptimizedInteractiveText
          text={afterHTML}
          onEntityClick={onEntityClick}
          knownEntities={knownEntities}
        />
      )}
    </div>
  );
});

StatusPanelContent.displayName = 'StatusPanelContent';