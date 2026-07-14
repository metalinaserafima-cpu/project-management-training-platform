import { designDocSections } from '@/data/designDocSections';
import { projectTypeLabels, ProjectType } from '@/data/designDocSections';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const sanitizeFilename = (name: string) => name.replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 120) || 'Документ';

async function fetchImageData(url: string): Promise<{ data: ArrayBuffer; type: 'png' | 'jpg' | 'gif' | 'bmp' } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    const buf = await res.arrayBuffer();
    let type: 'png' | 'jpg' | 'gif' | 'bmp' = 'png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) type = 'jpg';
    else if (contentType.includes('gif')) type = 'gif';
    else if (contentType.includes('bmp')) type = 'bmp';
    else type = 'png';
    return { data: buf, type };
  } catch {
    return null;
  }
}

type DocxModule = typeof import('docx');

async function nodeToRuns(node: ChildNode, TextRun: DocxModule['TextRun'], bold = false, italic = false, underline = false): Promise<InstanceType<DocxModule['TextRun']>[]> {
  const runs: InstanceType<DocxModule['TextRun']>[] = [];
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (text) runs.push(new TextRun({ text, bold, italics: italic, underline: underline ? {} : undefined, font: 'Times New Roman', size: 24 }));
    return runs;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const nextBold = bold || tag === 'b' || tag === 'strong';
    const nextItalic = italic || tag === 'i' || tag === 'em';
    const nextUnderline = underline || tag === 'u';
    if (tag === 'br') {
      runs.push(new TextRun({ text: '', break: 1 }));
      return runs;
    }
    for (const child of Array.from(el.childNodes)) {
      runs.push(...(await nodeToRuns(child, TextRun, nextBold, nextItalic, nextUnderline)));
    }
  }
  return runs;
}

async function htmlToDocxBlocks(
  html: string,
  docx: DocxModule
): Promise<(InstanceType<DocxModule['Paragraph']> | InstanceType<DocxModule['Table']>)[]> {
  const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ImageRun } = docx;
  const blocks: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];

  if (!html || !html.trim()) {
    return [new Paragraph({ children: [new TextRun({ text: 'Не заполнено', italics: true, color: '999999', font: 'Times New Roman', size: 24 })], spacing: { line: 360, lineRule: docx.LineRuleType.AUTO } })];
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;

  for (const node of Array.from(body.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push(new Paragraph({ children: [new TextRun({ text, font: 'Times New Roman', size: 24 })], spacing: { line: 360, lineRule: docx.LineRuleType.AUTO }, alignment: docx.AlignmentType.JUSTIFIED }));
      }
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === 'p' || tag === 'div') {
      const img = el.querySelector('img');
      if (img && el.children.length === 1) {
        const src = img.getAttribute('src') || '';
        const imgData = await fetchImageData(src);
        if (imgData) {
          blocks.push(
            new Paragraph({
              children: [
                new ImageRun({
                  type: imgData.type,
                  data: imgData.data,
                  transformation: { width: 420, height: 280 },
                } as never),
              ],
              spacing: { after: 200 },
            })
          );
          continue;
        }
      }
      const runs = await nodeToRuns(el, TextRun);
      blocks.push(new Paragraph({ children: runs.length ? runs : [new TextRun('')], spacing: { line: 360, lineRule: docx.LineRuleType.AUTO }, alignment: docx.AlignmentType.JUSTIFIED }));
      continue;
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === 'li');
      for (const li of items) {
        const runs = await nodeToRuns(li, TextRun);
        blocks.push(
          new Paragraph({
            children: runs.length ? runs : [new TextRun('')],
            spacing: { line: 360, lineRule: docx.LineRuleType.AUTO },
            bullet: tag === 'ul' ? { level: 0 } : undefined,
            numbering: tag === 'ol' ? { reference: 'design-doc-numbering', level: 0 } : undefined,
          })
        );
      }
      continue;
    }

    if (tag === 'table') {
      const rows: InstanceType<typeof TableRow>[] = [];
      const trs = el.querySelectorAll('tr');
      for (const tr of Array.from(trs)) {
        const cells: InstanceType<typeof TableCell>[] = [];
        const tds = tr.querySelectorAll('td,th');
        for (const td of Array.from(tds)) {
          const runs = await nodeToRuns(td, TextRun);
          cells.push(
            new TableCell({
              children: [new Paragraph({ children: runs.length ? runs : [new TextRun('')] })],
              width: { size: 100 / (tds.length || 1), type: WidthType.PERCENTAGE },
            })
          );
        }
        rows.push(new TableRow({ children: cells }));
      }
      if (rows.length) {
        blocks.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
        blocks.push(new Paragraph({ text: '', spacing: { after: 150 } }));
      }
      continue;
    }

    if (tag === 'img') {
      const src = el.getAttribute('src') || '';
      const imgData = await fetchImageData(src);
      if (imgData) {
        blocks.push(
          new Paragraph({
            children: [new ImageRun({ type: imgData.type, data: imgData.data, transformation: { width: 420, height: 280 } } as never)],
            spacing: { after: 200 },
          })
        );
      }
      continue;
    }

    const runs = await nodeToRuns(el, TextRun);
    if (runs.length) {
      blocks.push(new Paragraph({ children: runs, spacing: { line: 360, lineRule: docx.LineRuleType.AUTO }, alignment: docx.AlignmentType.JUSTIFIED }));
    }
  }

  return blocks.length ? blocks : [new Paragraph({ children: [new TextRun({ text: 'Не заполнено', italics: true, color: '999999', font: 'Times New Roman', size: 24 })] })];
}

interface DesignDocForExport {
  title: string;
  project_type: ProjectType;
  student_name?: string;
  sections: Record<string, string>;
}

export const exportDesignDocToDocx = async (doc: DesignDocForExport) => {
  const docx = await import('docx');
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Header,
    Footer,
    PageNumber,
    AlignmentType,
    TableOfContents,
    LevelFormat,
  } = docx;

  const titleParagraphs = [
    new Paragraph({ text: '', spacing: { before: 2000 } }),
    new Paragraph({
      children: [new TextRun({ text: doc.title, bold: true, size: 36, font: 'Times New Roman' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Дизайн-документ проекта', size: 28, font: 'Times New Roman' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Тип проекта: ${projectTypeLabels[doc.project_type]}`, size: 24, font: 'Times New Roman' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    ...(doc.student_name
      ? [
          new Paragraph({
            children: [new TextRun({ text: `Автор: ${doc.student_name}`, size: 24, font: 'Times New Roman' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
        ]
      : []),
    new Paragraph({
      children: [new TextRun({ text: new Date().toLocaleDateString('ru-RU'), size: 24, font: 'Times New Roman' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 2000 },
    }),
    new Paragraph({ pageBreakBefore: true, text: '' }),
    new Paragraph({ text: 'Оглавление', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
    new TableOfContents('Оглавление', { hyperlink: true, headingStyleRange: '1-2' }),
    new Paragraph({ pageBreakBefore: true, text: '' }),
  ];

  const contentSections = designDocSections.filter((s) => s.key !== 'title_page' && s.key !== 'toc');

  const bodyChildren: (InstanceType<typeof Paragraph> | InstanceType<typeof docx.Table>)[] = [];
  let counter = 1;
  for (const sec of contentSections) {
    bodyChildren.push(
      new Paragraph({
        text: `${counter}. ${sec.title}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 },
      })
    );
    const html = doc.sections[sec.key] || '';
    const blocks = await htmlToDocxBlocks(html, docx);
    bodyChildren.push(...blocks);
    counter++;
  }

  const document = new Document({
    numbering: {
      config: [
        {
          reference: 'design-doc-numbering',
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: doc.title, size: 18, font: 'Times New Roman', color: '888888' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Times New Roman', color: '888888' }),
                ],
              }),
            ],
          }),
        },
        children: [...titleParagraphs, ...bodyChildren],
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  downloadBlob(blob, `${sanitizeFilename(doc.title)}.docx`);
};
