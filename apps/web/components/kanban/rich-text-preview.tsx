import React from "react";

export interface RichTextPreviewProps {
  content: string;
  className?: string;
}

/**
 * Renders rich text/markdown/HTML preview for task descriptions.
 * You can swap out the implementation for a markdown or HTML renderer as needed.
 */
export const RichTextPreview: React.FC<RichTextPreviewProps> = ({
  content,
  className,
}) => {
  // For now, render as HTML (sanitize in production!)
  return (
    <div
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
