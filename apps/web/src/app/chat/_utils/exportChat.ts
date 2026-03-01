import { jsPDF } from "jspdf";
import type { ChatMessage } from "../_types";

const MARGIN = 20;
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const CONTENT_WIDTH = PAGE_WIDTH_MM - 2 * MARGIN;
const LINE_HEIGHT = 6;
const TITLE_FONT_SIZE = 16;
const AUTHOR_FONT_SIZE = 9;
const BODY_FONT_SIZE = 11;

/**
 * Generates a PDF of the chat and triggers a download.
 */
export const exportChatAsPdf = (
  messages: ChatMessage[],
  title: string = "Smart Assist Chat",
): void => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  doc.setFontSize(TITLE_FONT_SIZE);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(title, CONTENT_WIDTH);
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * LINE_HEIGHT + 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_FONT_SIZE);

  for (const m of messages) {
    const author =
      m.role === "assistant"
        ? m.author ?? "Smart Assist"
        : m.author ?? "You";

    if (y > PAGE_HEIGHT_MM - MARGIN - 20) {
      doc.addPage();
      y = MARGIN;
    }

    doc.setFontSize(AUTHOR_FONT_SIZE);
    doc.setFont("helvetica", "bold");
    doc.text(author, MARGIN, y);
    y += LINE_HEIGHT;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(BODY_FONT_SIZE);
    const paragraphs = m.content.split(/\r?\n/);
    const bodyLines = paragraphs.flatMap((p) =>
      doc.splitTextToSize(p, CONTENT_WIDTH),
    );
    for (const line of bodyLines) {
      if (y > PAGE_HEIGHT_MM - MARGIN - 10) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
    y += 8;
  }

  const filename = `${title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "Smart-Assist-Chat"}.pdf`;
  doc.save(filename);
};
