const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak
} = require('docx');

// ============================
// 共通スタイル
// ============================
const commonStyles = {
  default: {
    document: { run: { font: "Yu Gothic", size: 22 } }
  },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 36, bold: true, font: "Yu Gothic", color: "4F46E5" },
      paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 }
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 28, bold: true, font: "Yu Gothic", color: "6366F1" },
      paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 }
    },
    {
      id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 24, bold: true, font: "Yu Gothic", color: "7C3AED" },
      paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 }
    },
  ]
};

const bulletConfig = {
  config: [
    {
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "numbers",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
  ]
};

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function makeCell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.width || 4680, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      children: [new TextRun({ text, bold: opts.bold || false, size: opts.size || 20, font: "Yu Gothic" })]
    })]
  });
}

function heading(text, level) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, font: "Yu Gothic", ...opts })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 22, font: "Yu Gothic" })]
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [new TextRun({ text, size: 22, font: "Yu Gothic" })]
  });
}

// ============================
// 管理者向け取扱説明書
// ============================
function createAdminManual() {
  return new Document({
    styles: commonStyles,
    numbering: bulletConfig,
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Shift M \u2014 \u7BA1\u7406\u8005\u5411\u3051\u53D6\u6271\u8AAC\u660E\u66F8", size: 16, color: "999999", font: "Yu Gothic" })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Page ", size: 16, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999" })]
          })]
        })
      },
      children: [
        // タイトル
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Shift M", size: 56, bold: true, font: "Yu Gothic", color: "4F46E5" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "\u30B7\u30D5\u30C8\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0", size: 36, font: "Yu Gothic", color: "6366F1" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: "\u7BA1\u7406\u8005\u5411\u3051\u53D6\u6271\u8AAC\u660E\u66F8", size: 32, bold: true, font: "Yu Gothic" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: "\u4F5C\u6210\u65E5: 2026\u5E743\u670830\u65E5", size: 20, color: "666666", font: "Yu Gothic" })]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // 1. ログイン
        heading("\u2460 \u30ED\u30B0\u30A4\u30F3", HeadingLevel.HEADING_1),
        para("\u30D6\u30E9\u30A6\u30B6\u3067\u30B7\u30B9\u30C6\u30E0\u306EURL\u306B\u30A2\u30AF\u30BB\u30B9\u3057\u3001\u4EE5\u4E0B\u306E\u60C5\u5831\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u307E\u3059\u3002"),
        new Table({
          width: { size: 9506, type: WidthType.DXA },
          columnWidths: [3000, 6506],
          rows: [
            new TableRow({ children: [
              makeCell("\u30E6\u30FC\u30B6\u30FCID", { width: 3000, bold: true, shading: "EEF2FF" }),
              makeCell("admin123", { width: 6506 })
            ]}),
            new TableRow({ children: [
              makeCell("\u30D1\u30B9\u30EF\u30FC\u30C9", { width: 3000, bold: true, shading: "EEF2FF" }),
              makeCell("\u7BA1\u7406\u8005\u306B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044", { width: 6506 })
            ]}),
          ]
        }),
        para(""),
        para("\u30ED\u30B0\u30A4\u30F3\u5F8C\u3001\u300C\u30B7\u30D5\u30C8\u4F5C\u6210\u30C4\u30FC\u30EB\u300D\u306E\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002"),

        // 2. 画面構成
        heading("\u2461 \u753B\u9762\u69CB\u6210", HeadingLevel.HEADING_1),
        para("\u5DE6\u5074\u306E\u30B5\u30A4\u30C9\u30D0\u30FC\u304B\u30897\u3064\u306E\u30DA\u30FC\u30B8\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u3059\u3002"),

        // 2-1 シフト作成
        heading("\u30B7\u30D5\u30C8\u4F5C\u6210\u30DA\u30FC\u30B8\uFF08\u30DB\u30FC\u30E0\uFF09", HeadingLevel.HEADING_2),
        para("AI\u304C\u81EA\u52D5\u3067\u30B7\u30D5\u30C8\u3092\u751F\u6210\u3059\u308B\u30DA\u30FC\u30B8\u3067\u3059\u3002"),
        bullet("\u300C\u5BFE\u8C61\u6708\u300D\u3092\u9078\u629E\u3057\u3001\u300CAI\u30B7\u30D5\u30C8\u4F5C\u6210\u958B\u59CB\u300D\u30DC\u30BF\u30F3\u3092\u62BC\u3059"),
        bullet("\u300C\u7279\u5225\u8981\u671B\u300D\u6B04\u306B\u8FFD\u52A0\u306E\u8981\u671B\u3092\u5165\u529B\u53EF\u80FD\uFF08\u4F8B\uFF1A\u300C\u25CB\u25CB\u3055\u3093\u306F\u4ECA\u6708\u306F\u5348\u524D\u306E\u307F\u300D\uFF09"),
        bullet("\u751F\u6210\u306B\u306F1\uFF5E3\u5206\u304B\u304B\u308A\u307E\u3059"),
        bullet("\u4E0B\u90E8\u306E\u30AB\u30E9\u30FC\u30AB\u30FC\u30C9\u304B\u3089\u5404\u7BA1\u7406\u30DA\u30FC\u30B8\u306B\u76F4\u63A5\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u3059"),

        // 2-2 従業員管理
        heading("\u5F93\u696D\u54E1\u7BA1\u7406\u30DA\u30FC\u30B8", HeadingLevel.HEADING_2),
        para("\u5F93\u696D\u54E1\u306E\u57FA\u672C\u60C5\u5831\u3068\u30B7\u30D5\u30C8\u8A2D\u5B9A\u3092\u7BA1\u7406\u3057\u307E\u3059\u3002"),
        bullet("\u5F93\u696D\u54E1\u4E00\u89A7\u304C\u8868\u793A\u3055\u308C\u307E\u3059\uFF08\u6C0F\u540D\u3001\u96C7\u7528\u5F62\u614B\u3001\u8077\u7A2E\u3001\u5BFE\u5FDC\u30B7\u30D5\u30C8\u3001\u52E4\u52D9\u53EF\u80FD\u66DC\u65E5\uFF09"),
        bullet("\u300C\uFF0B\u65B0\u898F\u5F93\u696D\u54E1\u8FFD\u52A0\u300D\u3067\u5F93\u696D\u54E1\u3092\u8FFD\u52A0\uFF08\u5F93\u696D\u54E1\u756A\u53F7\u3068\u521D\u671F\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u81EA\u52D5\u751F\u6210\u3055\u308C\u307E\u3059\uFF09"),
        bullet("\u5F93\u696D\u54E1\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u7DE8\u96C6\uFF08\u914D\u7F6E\u53EF\u80FD\u5834\u6240\u3001\u5BFE\u5FDC\u30B7\u30D5\u30C8\u30D1\u30BF\u30FC\u30F3\u7B49\u3092\u8A2D\u5B9A\uFF09"),
        bullet("\u30D1\u30B9\u30EF\u30FC\u30C9\u30EA\u30BB\u30C3\u30C8\u6A5F\u80FD\u3042\u308A\uFF08\u5F93\u696D\u54E1\u304C\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5FD8\u308C\u305F\u5834\u5408\uFF09"),
        bullet("\u691C\u7D22\u6A5F\u80FD\u3067\u5F93\u696D\u54E1\u540D\u3092\u7D5E\u308A\u8FBC\u307F\u53EF\u80FD"),
        bullet("\u4E0A\u4E0B\u77E2\u5370\u30DC\u30BF\u30F3\u3067\u8868\u793A\u9806\u3092\u5909\u66F4\u53EF\u80FD"),

        // 2-3 配置場所管理
        heading("\u914D\u7F6E\u5834\u6240\u7BA1\u7406\u30DA\u30FC\u30B8", HeadingLevel.HEADING_2),
        para("\u66DC\u65E5\u5225\u30FB\u6642\u9593\u5E2F\u5225\u306E\u914D\u7F6E\u5834\u6240\u3092\u7BA1\u7406\u3057\u307E\u3059\u3002"),
        bullet("\u66DC\u65E5\u30BF\u30D6\u3067\u66DC\u65E5\u3092\u5207\u308A\u66FF\u3048"),
        bullet("AM\uFF08\u5348\u524D\uFF09\u3068PM\uFF08\u5348\u5F8C\uFF09\u3067\u5206\u96E2\u8868\u793A"),
        bullet("\u65BD\u8A2D\u5225\uFF08\u30AF\u30EA\u30CB\u30C3\u30AF\u68DF\u30FB\u5065\u8A3A\u68DF\uFF09\u3067\u30B0\u30EB\u30FC\u30D4\u30F3\u30B0"),
        bullet("\u5404\u914D\u7F6E\u5834\u6240\u306B\u5FC5\u8981\u4EBA\u6570\u3092\u8A2D\u5B9A"),
        bullet("\u5099\u8003\u6B04\u306B\u30E1\u30E2\u3092\u8A18\u8F09\u53EF\u80FD\uFF08\u4F8B\uFF1A\u300CAM\u3001CF\u4E0D\u53EF\u300D\uFF09"),
        bullet("\u4E0A\u4E0B\u77E2\u5370\u30DC\u30BF\u30F3\u3067\u8868\u793A\u9806\u3092\u5909\u66F4\u53EF\u80FD"),

        // 2-4 シフトパターン管理
        heading("\u30B7\u30D5\u30C8\u30D1\u30BF\u30FC\u30F3\u7BA1\u7406\u30DA\u30FC\u30B8", HeadingLevel.HEADING_2),
        para("\u52E4\u52D9\u6642\u9593\u5E2F\u306E\u30D1\u30BF\u30FC\u30F3\u3092\u7BA1\u7406\u3057\u307E\u3059\u3002"),
        bullet("\u65E9\u756A\u3001\u9045\u756A\u3001\u30D1\u30FC\u30C8\u7B49\u306E\u30D1\u30BF\u30FC\u30F3\u3092\u767B\u9332"),
        bullet("\u958B\u59CB\u6642\u523B\u3001\u7D42\u4E86\u6642\u523B\u3001\u4F11\u61A9\u6642\u9593\u3001\u8272\u5206\u3051\u3092\u8A2D\u5B9A"),

        // 2-5 希望休管理
        heading("\u5E0C\u671B\u4F11\u7BA1\u7406\u30DA\u30FC\u30B8", HeadingLevel.HEADING_2),
        para("\u5F93\u696D\u54E1\u304B\u3089\u306E\u5E0C\u671B\u4F11\u7533\u8ACB\u3092\u7BA1\u7406\u3057\u307E\u3059\u3002"),
        bullet("\u30AB\u30EC\u30F3\u30C0\u30FC\u8868\u793A\u307E\u305F\u306F\u30EA\u30B9\u30C8\u8868\u793A\u3067\u5168\u5F93\u696D\u54E1\u306E\u5E0C\u671B\u4F11\u3092\u78BA\u8A8D"),
        bullet("\u300C\u627F\u8A8D\u300D\u300C\u5374\u4E0B\u300D\u30DC\u30BF\u30F3\u3067\u7533\u8ACB\u3092\u51E6\u7406"),
        bullet("\u7BA1\u7406\u8005\u304C\u4EE3\u7406\u3067\u5E0C\u671B\u4F11\u3092\u7533\u8ACB\u3059\u308B\u3053\u3068\u3082\u53EF\u80FD"),
        bullet("\u627F\u8A8D\u6E08\u307F\u306E\u5E0C\u671B\u4F11\u306F\u81EA\u52D5\u7684\u306BAI\u30B7\u30D5\u30C8\u751F\u6210\u306B\u53CD\u6620\u3055\u308C\u307E\u3059"),
        bullet("\u30B9\u30C6\u30FC\u30BF\u30B9\u30D5\u30A3\u30EB\u30BF\u30FC\uFF08\u7533\u8ACB\u4E2D/\u627F\u8A8D/\u5374\u4E0B\uFF09\u3067\u7D5E\u308A\u8FBC\u307F\u53EF\u80FD"),
        bullet("\u5F93\u696D\u54E1\u540D\u3067\u691C\u7D22\u53EF\u80FD"),

        // 2-6 AI制約条件管理
        heading("AI\u5236\u7D04\u6761\u4EF6\u7BA1\u7406\u30DA\u30FC\u30B8", HeadingLevel.HEADING_2),
        para("AI\u30B7\u30D5\u30C8\u4F5C\u6210\u6642\u306B\u5B88\u308B\u3079\u304D\u30EB\u30FC\u30EB\u3092\u81EA\u7136\u8A00\u8A9E\u3067\u8A2D\u5B9A\u3057\u307E\u3059\u3002"),
        bullet("\u4F8B\uFF1A\u300C\u30D1\u30FC\u30C8\u306E5\u9023\u7D9A\u52E4\u52D9\u7981\u6B62\u300D"),
        bullet("\u4F8B\uFF1A\u300C\u585A\u539F\u306E\u30B7\u30D5\u30C8\u306FAM\u306F\u5065\u8A3A\u68DF\u300D"),
        bullet("\u4F8B\uFF1A\u300C\u4E2D\u5D8B\u306E\u30B7\u30D5\u30C8\u306F\u6C34\u66DC\u65E5\u3001\u91D1\u66DCPM\u4EE5\u5916\u306F\u30AF\u30EA\u30CB\u30C3\u30AF\u300D"),

        // 2-7 シフト表示
        heading("\u30B7\u30D5\u30C8\u8868\u793A\u30DA\u30FC\u30B8", HeadingLevel.HEADING_2),
        para("\u751F\u6210\u3055\u308C\u305F\u30B7\u30D5\u30C8\u8868\u3092\u78BA\u8A8D\u30FB\u7DE8\u96C6\u3057\u307E\u3059\u3002"),
        bullet("\u6708\u5225\u3067\u30B7\u30D5\u30C8\u8868\u3092\u78BA\u8A8D"),
        bullet("\u300C\u7DE8\u96C6\u300D\u30DC\u30BF\u30F3\u3067\u7DE8\u96C6\u30E2\u30FC\u30C9\u306B\u5207\u308A\u66FF\u3048\u3001\u30BB\u30EB\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u624B\u52D5\u7DE8\u96C6"),
        bullet("\u7DE8\u96C6\u30E2\u30FC\u30C0\u30EB\u3067\u30B7\u30D5\u30C8\u30D1\u30BF\u30FC\u30F3\u3001AM/PM\u914D\u7F6E\u5834\u6240\u3092\u5909\u66F4\u53EF\u80FD"),
        bullet("\u4F11\u307F\u8A2D\u5B9A\u3084\u30AB\u30B9\u30BF\u30E0\u6642\u9593\uFF08\u958B\u59CB\u30FB\u7D42\u4E86\uFF09\u3082\u8A2D\u5B9A\u53EF\u80FD"),

        // 3. 運用フロー
        heading("\u2462 \u6708\u6B21\u904B\u7528\u30D5\u30ED\u30FC", HeadingLevel.HEADING_1),
        para("\u6BCE\u6708\u306E\u30B7\u30D5\u30C8\u4F5C\u6210\u306F\u4EE5\u4E0B\u306E\u6D41\u308C\u3067\u884C\u3044\u307E\u3059\u3002"),
        numbered("\u5F93\u696D\u54E1\u306B\u5E0C\u671B\u4F11\u306E\u7533\u8ACB\u3092\u4FC3\u3059"),
        numbered("\u5E0C\u671B\u4F11\u7BA1\u7406\u30DA\u30FC\u30B8\u3067\u7533\u8ACB\u3092\u78BA\u8A8D\u30FB\u627F\u8A8D"),
        numbered("AI\u5236\u7D04\u6761\u4EF6\u3092\u5FC5\u8981\u306B\u5FDC\u3058\u3066\u66F4\u65B0"),
        numbered("\u30B7\u30D5\u30C8\u4F5C\u6210\u30DA\u30FC\u30B8\u3067\u300CAI\u30B7\u30D5\u30C8\u4F5C\u6210\u958B\u59CB\u300D\u3092\u5B9F\u884C"),
        numbered("\u30B7\u30D5\u30C8\u8868\u793A\u30DA\u30FC\u30B8\u3067\u7D50\u679C\u3092\u78BA\u8A8D\u30FB\u5FAE\u8ABF\u6574"),
        numbered("\u78BA\u5B9A\u5F8C\u3001\u5F93\u696D\u54E1\u306B\u5468\u77E5"),

        // 4. 注意事項
        heading("\u2463 \u6CE8\u610F\u4E8B\u9805", HeadingLevel.HEADING_1),
        bullet("AI\u751F\u6210\u3092\u5B9F\u884C\u3059\u308B\u3068\u3001\u305D\u306E\u6708\u306E\u65E2\u5B58\u30B7\u30D5\u30C8\u306F\u4E0A\u66F8\u304D\u3055\u308C\u307E\u3059\uFF08\u624B\u52D5\u7DE8\u96C6\u3057\u305F\u5185\u5BB9\u3082\u542B\u3080\uFF09"),
        bullet("\u5E0C\u671B\u4F11\u306E\u627F\u8A8D\u306FAI\u751F\u6210\u524D\u306B\u5B8C\u4E86\u3055\u305B\u3066\u304F\u3060\u3055\u3044"),
        bullet("\u5F93\u696D\u54E1\u306E\u914D\u7F6E\u53EF\u80FD\u5834\u6240\u3084\u5BFE\u5FDC\u30B7\u30D5\u30C8\u304C\u672A\u8A2D\u5B9A\u306E\u5834\u5408\u3001AI\u304C\u6B63\u3057\u304F\u914D\u7F6E\u3067\u304D\u307E\u305B\u3093"),
        bullet("\u30D1\u30B9\u30EF\u30FC\u30C9\u30EA\u30BB\u30C3\u30C8\u5F8C\u3001\u65B0\u3057\u3044\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5F93\u696D\u54E1\u306B\u78BA\u5B9F\u306B\u4F1D\u3048\u3066\u304F\u3060\u3055\u3044"),
      ]
    }]
  });
}

// ============================
// 従業員向け取扱説明書
// ============================
function createEmployeeManual() {
  return new Document({
    styles: commonStyles,
    numbering: bulletConfig,
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Shift M \u2014 \u5F93\u696D\u54E1\u5411\u3051\u53D6\u6271\u8AAC\u660E\u66F8", size: 16, color: "999999", font: "Yu Gothic" })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Page ", size: 16, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999" })]
          })]
        })
      },
      children: [
        // タイトル
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Shift M", size: 56, bold: true, font: "Yu Gothic", color: "4F46E5" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "\u30B7\u30D5\u30C8\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0", size: 36, font: "Yu Gothic", color: "6366F1" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: "\u5F93\u696D\u54E1\u5411\u3051\u53D6\u6271\u8AAC\u660E\u66F8", size: 32, bold: true, font: "Yu Gothic" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: "\u4F5C\u6210\u65E5: 2026\u5E743\u670830\u65E5", size: 20, color: "666666", font: "Yu Gothic" })]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // 1. ログイン
        heading("\u2460 \u30ED\u30B0\u30A4\u30F3\u65B9\u6CD5", HeadingLevel.HEADING_1),
        para("\u7BA1\u7406\u8005\u304B\u3089\u901A\u77E5\u3055\u308C\u305F\u60C5\u5831\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u307E\u3059\u3002"),
        new Table({
          width: { size: 9506, type: WidthType.DXA },
          columnWidths: [3000, 6506],
          rows: [
            new TableRow({ children: [
              makeCell("\u30E6\u30FC\u30B6\u30FCID", { width: 3000, bold: true, shading: "EEF2FF" }),
              makeCell("\u7BA1\u7406\u8005\u304B\u3089\u901A\u77E5\u3055\u308C\u305F\u5F93\u696D\u54E1\u756A\u53F7\uFF08\u4F8B: emp001\uFF09", { width: 6506 })
            ]}),
            new TableRow({ children: [
              makeCell("\u30D1\u30B9\u30EF\u30FC\u30C9", { width: 3000, bold: true, shading: "EEF2FF" }),
              makeCell("\u7BA1\u7406\u8005\u304B\u3089\u901A\u77E5\u3055\u308C\u305F\u521D\u671F\u30D1\u30B9\u30EF\u30FC\u30C9", { width: 6506 })
            ]}),
          ]
        }),
        para(""),
        para("\u203B \u521D\u56DE\u30ED\u30B0\u30A4\u30F3\u6642\u306B\u30D1\u30B9\u30EF\u30FC\u30C9\u5909\u66F4\u753B\u9762\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002\u65B0\u3057\u3044\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002", { bold: true }),
        para("\u30D1\u30B9\u30EF\u30FC\u30C9\u306E\u6761\u4EF6: 6\u6587\u5B57\u4EE5\u4E0A\u3001\u82F1\u5B57\u3068\u6570\u5B57\u3092\u542B\u3080"),

        // 2. シフト確認
        heading("\u2461 \u30B7\u30D5\u30C8\u78BA\u8A8D", HeadingLevel.HEADING_1),
        para("\u30ED\u30B0\u30A4\u30F3\u5F8C\u3001\u300C\u30B7\u30D5\u30C8\u78BA\u8A8D\u300D\u30BF\u30D6\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002"),
        bullet("\u6708\u5225\u306E\u30B7\u30D5\u30C8\u8868\u304C\u8868\u793A\u3055\u308C\u307E\u3059"),
        bullet("\u81EA\u5206\u306E\u884C\u304C\u5148\u982D\u306B\u30CF\u30A4\u30E9\u30A4\u30C8\u8868\u793A\u3055\u308C\u307E\u3059\uFF08\u300C\u81EA\u5206\u300D\u30D0\u30C3\u30B8\u4ED8\u304D\uFF09"),
        bullet("\u5168\u5F93\u696D\u54E1\u306E\u30B7\u30D5\u30C8\u3082\u78BA\u8A8D\u3067\u304D\u307E\u3059"),
        bullet("\u5DE6\u53F3\u306E\u77E2\u5370\u3067\u6708\u3092\u5207\u308A\u66FF\u3048"),
        para(""),
        para("\u30B7\u30D5\u30C8\u8868\u306E\u898B\u65B9:", { bold: true }),
        bullet("\u5404\u30BB\u30EB\u306B\u300C\u5348\u524D\u914D\u7F6E/\u5348\u5F8C\u914D\u7F6E\u300D\u3068\u52E4\u52D9\u6642\u9593\u304C\u8868\u793A\u3055\u308C\u307E\u3059"),
        bullet("\u7A7A\u767D\u306E\u30BB\u30EB\u306F\u4F11\u307F\u306E\u65E5\u3067\u3059\uFF08\u300C\u4F11\u307F\u300D\u3068\u8D64\u6587\u5B57\u3067\u8868\u793A\uFF09"),
        bullet("\u65E5\u66DC\u65E5\u306F\u30D4\u30F3\u30AF\u80CC\u666F\u3001\u571F\u66DC\u65E5\u306F\u9752\u80CC\u666F\u3001\u6C34\u66DC\u65E5\u306F\u7DD1\u80CC\u666F\u3067\u8868\u793A"),
        bullet("\u300C\u51FA\u52E4\u53EF\u80FD\u300D\u7533\u8ACB\u65E5\u306F\u30B7\u30A2\u30F3\u8272\u6587\u5B57\u3067\u8868\u793A\u3055\u308C\u307E\u3059"),

        // 3. 希望休申請
        heading("\u2462 \u5E0C\u671B\u4F11\u7533\u8ACB", HeadingLevel.HEADING_1),
        para("\u300C\u5E0C\u671B\u4F11\u7533\u8ACB\u300D\u30BF\u30D6\u3067\u4F11\u307F\u306E\u5E0C\u671B\u3092\u7533\u8ACB\u3067\u304D\u307E\u3059\u3002"),

        heading("\u7533\u8ACB\u306E\u624B\u9806", HeadingLevel.HEADING_2),
        numbered("\u300C\uFF0B\u65B0\u898F\u7533\u8ACB\u300D\u30DC\u30BF\u30F3\u3092\u62BC\u3059"),
        numbered("\u7A2E\u985E\u3092\u9078\u629E\uFF08\u5E0C\u671B\u4F11\u3001\u6709\u4F11\u3001\u5FCC\u5F15\u3001\u75C5\u6B20\u3001\u305D\u306E\u4ED6\uFF09"),
        numbered("\u30AB\u30EC\u30F3\u30C0\u30FC\u304B\u3089\u65E5\u4ED8\u3092\u9078\u629E\uFF08\u8907\u6570\u9078\u629E\u53EF\uFF09"),
        numbered("\u7406\u7531\u3092\u5165\u529B\uFF08\u4EFB\u610F\uFF09"),
        numbered("\u300C\u7533\u8ACB\u3059\u308B\u300D\u30DC\u30BF\u30F3\u3092\u62BC\u3059"),
        para(""),
        para("\u7533\u8ACB\u5F8C\u3001\u30AB\u30EC\u30F3\u30C0\u30FC\u3068\u4E00\u89A7\u306B\u5373\u5EA7\u306B\u53CD\u6620\u3055\u308C\u307E\u3059\u3002"),

        // ステータスの見方
        heading("\u30B9\u30C6\u30FC\u30BF\u30B9\u306E\u898B\u65B9", HeadingLevel.HEADING_2),
        new Table({
          width: { size: 9506, type: WidthType.DXA },
          columnWidths: [2000, 3000, 4506],
          rows: [
            new TableRow({ children: [
              makeCell("\u8272", { width: 2000, bold: true, shading: "F3F4F6" }),
              makeCell("\u30B9\u30C6\u30FC\u30BF\u30B9", { width: 3000, bold: true, shading: "F3F4F6" }),
              makeCell("\u610F\u5473", { width: 4506, bold: true, shading: "F3F4F6" })
            ]}),
            new TableRow({ children: [
              makeCell("\u9EC4\u8272", { width: 2000, shading: "FEF3C7" }),
              makeCell("\u7533\u8ACB\u4E2D", { width: 3000 }),
              makeCell("\u7BA1\u7406\u8005\u306E\u627F\u8A8D\u5F85\u3061", { width: 4506 })
            ]}),
            new TableRow({ children: [
              makeCell("\u7DD1\u8272", { width: 2000, shading: "D1FAE5" }),
              makeCell("\u627F\u8A8D\u6E08\u307F", { width: 3000 }),
              makeCell("\u4F11\u307F\u304C\u78BA\u5B9A\u3057\u307E\u3057\u305F", { width: 4506 })
            ]}),
            new TableRow({ children: [
              makeCell("\u8D64\u8272", { width: 2000, shading: "FEE2E2" }),
              makeCell("\u5374\u4E0B", { width: 3000 }),
              makeCell("\u7533\u8ACB\u304C\u5374\u4E0B\u3055\u308C\u307E\u3057\u305F", { width: 4506 })
            ]}),
          ]
        }),

        // 申請の管理
        heading("\u7533\u8ACB\u306E\u7BA1\u7406", HeadingLevel.HEADING_2),
        bullet("\u30AB\u30EC\u30F3\u30C0\u30FC\u3084\u30EA\u30B9\u30C8\u306E\u7533\u8ACB\u3092\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3068\u8A73\u7D30\u30E2\u30FC\u30C0\u30EB\u304C\u958B\u304D\u307E\u3059"),
        bullet("\u7533\u8ACB\u4E2D\u306E\u5E0C\u671B\u4F11\u306F\u30B4\u30DF\u7BB1\u30A2\u30A4\u30B3\u30F3\u307E\u305F\u306F\u300C\u7533\u8ACB\u3092\u53D6\u308A\u6D88\u3059\u300D\u30DC\u30BF\u30F3\u3067\u524A\u9664\u3067\u304D\u307E\u3059"),
        bullet("\u627F\u8A8D\u6E08\u307F\u30FB\u5374\u4E0B\u6E08\u307F\u306E\u5E0C\u671B\u4F11\u306F\u524A\u9664\u3067\u304D\u307E\u305B\u3093"),

        // 4. 注意事項
        heading("\u2463 \u6CE8\u610F\u4E8B\u9805", HeadingLevel.HEADING_1),
        bullet("\u4ED6\u306E\u5F93\u696D\u54E1\u306E\u5E0C\u671B\u4F11\u306E\u7A2E\u985E\u3084\u7406\u7531\u306F\u8868\u793A\u3055\u308C\u307E\u305B\u3093\uFF08\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC\u4FDD\u8B77\uFF09"),
        bullet("\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5FD8\u308C\u305F\u5834\u5408\u306F\u7BA1\u7406\u8005\u306B\u9023\u7D61\u3057\u3066\u30EA\u30BB\u30C3\u30C8\u3057\u3066\u3082\u3089\u3063\u3066\u304F\u3060\u3055\u3044"),
        bullet("\u5E0C\u671B\u4F11\u306E\u7533\u8ACB\u306F\u30B7\u30D5\u30C8\u4F5C\u6210\u524D\u306B\u884C\u3063\u3066\u304F\u3060\u3055\u3044"),
        bullet("\u627F\u8A8D\u3055\u308C\u305F\u5E0C\u671B\u4F11\u306F\u30B7\u30D5\u30C8\u306B\u81EA\u52D5\u53CD\u6620\u3055\u308C\u307E\u3059"),

        // 5. 困ったときは
        heading("\u2464 \u56F0\u3063\u305F\u3068\u304D\u306F", HeadingLevel.HEADING_1),
        new Table({
          width: { size: 9506, type: WidthType.DXA },
          columnWidths: [4000, 5506],
          rows: [
            new TableRow({ children: [
              makeCell("\u56F0\u3063\u305F\u3053\u3068", { width: 4000, bold: true, shading: "F3F4F6" }),
              makeCell("\u5BFE\u51E6\u6CD5", { width: 5506, bold: true, shading: "F3F4F6" })
            ]}),
            new TableRow({ children: [
              makeCell("\u30ED\u30B0\u30A4\u30F3\u3067\u304D\u306A\u3044", { width: 4000 }),
              makeCell("\u7BA1\u7406\u8005\u306B\u30D1\u30B9\u30EF\u30FC\u30C9\u30EA\u30BB\u30C3\u30C8\u3092\u4F9D\u983C", { width: 5506 })
            ]}),
            new TableRow({ children: [
              makeCell("\u30B7\u30D5\u30C8\u304C\u8868\u793A\u3055\u308C\u306A\u3044", { width: 4000 }),
              makeCell("\u30B7\u30D5\u30C8\u304C\u307E\u3060\u4F5C\u6210\u3055\u308C\u3066\u3044\u306A\u3044\u53EF\u80FD\u6027\u3002\u7BA1\u7406\u8005\u306B\u78BA\u8A8D", { width: 5506 })
            ]}),
            new TableRow({ children: [
              makeCell("\u5E0C\u671B\u4F11\u304C\u7533\u8ACB\u3067\u304D\u306A\u3044", { width: 4000 }),
              makeCell("\u540C\u3058\u65E5\u4ED8\u306B\u65E2\u306B\u7533\u8ACB\u304C\u3042\u308B\u53EF\u80FD\u6027\u3002\u307E\u305F\u306F\u904E\u53BB\u306E\u65E5\u4ED8\u306F\u7533\u8ACB\u4E0D\u53EF", { width: 5506 })
            ]}),
            new TableRow({ children: [
              makeCell("\u753B\u9762\u304C\u304A\u304B\u3057\u3044", { width: 4000 }),
              makeCell("\u30D6\u30E9\u30A6\u30B6\u3092\u30EA\u30ED\u30FC\u30C9\uFF08F5\u30AD\u30FC\uFF09\u3057\u3066\u304F\u3060\u3055\u3044", { width: 5506 })
            ]}),
          ]
        }),
      ]
    }]
  });
}

// ============================
// 生成実行
// ============================
async function main() {
  const adminDoc = createAdminManual();
  const employeeDoc = createEmployeeManual();

  const adminBuffer = await Packer.toBuffer(adminDoc);
  const employeeBuffer = await Packer.toBuffer(employeeDoc);

  fs.writeFileSync('docs/manual_admin.docx', adminBuffer);
  fs.writeFileSync('docs/manual_employee.docx', employeeBuffer);

  console.log('管理者向け取扱説明書: docs/manual_admin.docx');
  console.log('従業員向け取扱説明書: docs/manual_employee.docx');
}

main().catch(console.error);
