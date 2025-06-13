"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { useEffect, useState } from "react";

interface PRDPreviewProps {
  title: string;
  content: string;
}

export function PRDPreview({ title, content }: PRDPreviewProps) {
  const [previewContent, setPreviewContent] = useState(content);
  const [previewTitle, setPreviewTitle] = useState(title);

  useEffect(() => {
    setPreviewContent(content);
    setPreviewTitle(title);
  }, [content, title]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold border-b pb-4">{previewTitle}</h1>
            <div className="border rounded-md overflow-hidden">
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  padding: "20px",
                  backgroundColor: "transparent",
                  color: "inherit",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
