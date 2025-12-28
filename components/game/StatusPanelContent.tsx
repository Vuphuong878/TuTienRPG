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

  // Map section titles to CSS classes for proper styling
  const getSectionClassName = (title: string): string => {
    const titleLower = title.toLowerCase().trim();
    
    if (titleLower.includes('thế giới') || titleLower.includes('thời gian') || titleLower.includes('world') || titleLower.includes('clock')) {
      return 'section-world-clock';
    } else if (titleLower.includes('thông tin') || titleLower.includes('cơ bản') || titleLower.includes('basic') || titleLower.includes('info')) {
      return 'section-basic-info';
    } else if (titleLower.includes('trạng thái') || titleLower.includes('nhiệm vụ') || titleLower.includes('status') || titleLower.includes('mission')) {
      return 'section-status-mission';
    } else if (titleLower.includes('kho đồ') || titleLower.includes('inventory') || titleLower.includes('items')) {
      return 'section-inventory';
    } else if (titleLower.includes('sự kiện') || titleLower.includes('parallel') || titleLower.includes('events')) {
      return 'section-parallel-events';
    } else if (titleLower.includes('thành viên club') || titleLower.includes('club members')) {
      return 'section-club-members';
    } else if (titleLower.includes('nô lệ của bạn') || titleLower.includes('your slaves')) {
      return 'section-your-slaves';
    } else if (titleLower.includes('hoàn cảnh nô lệ') || titleLower.includes('slave circumstance')) {
      return 'section-slave-circumstance';
    } else if (titleLower.includes('nô lệ thành viên khác') || titleLower.includes('other members slaves')) {
      return 'section-other-members-slaves';
    } else if (titleLower.includes('hoàn cảnh nô lệ thành viên khác') || titleLower.includes('other members slaves circumstance')) {
      return 'section-other-members-slaves-circumstance';
    } else if (titleLower.includes('quan hệ') || titleLower.includes('relations')) {
      return 'section-relations';
    } else if (titleLower.includes('nsfw') || titleLower.includes('adult')) {
      return 'section-nsfw-relations';
    } else if (titleLower.includes('quan sát') || titleLower.includes('observation')) {
      return 'section-observation';
    }
    
    return '';
  };

  const textContent = getTextContent(section.content);
  const sectionClassName = getSectionClassName(section.title);

  return (
    <details open={isOpen} className={`transition-all duration-300 ${sectionClassName}`}>
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