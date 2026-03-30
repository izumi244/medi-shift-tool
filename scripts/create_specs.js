const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak
} = require('docx');

// ============================
// 共通ヘルパー
// ============================
const commonStyles = {
  default: { document: { run: { font: "Yu Gothic", size: 22 } } },
  paragraphStyles: [
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 36, bold: true, font: "Yu Gothic", color: "4F46E5" },
      paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
    { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 28, bold: true, font: "Yu Gothic", color: "6366F1" },
      paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 24, bold: true, font: "Yu Gothic", color: "7C3AED" },
      paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
  ]
};

const bulletConfig = {
  config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ]
};

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(text, opts = {}) {
  return new TableCell({
    borders, width: { size: opts.w || 3000, type: WidthType.DXA },
    shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: opts.b || false, size: opts.s || 18, font: "Yu Gothic" })] })]
  });
}

function h(text, level) { return new Paragraph({ heading: level, children: [new TextRun(text)] }); }
function p(text, opts = {}) { return new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text, size: 20, font: "Yu Gothic", ...opts })] }); }
function b(text) { return new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text, size: 20, font: "Yu Gothic" })] }); }
function n(text) { return new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text, size: 20, font: "Yu Gothic" })] }); }
function br() { return new Paragraph({ children: [new PageBreak()] }); }

function title(main, sub, date) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
      children: [new TextRun({ text: "Shift M", size: 56, bold: true, font: "Yu Gothic", color: "4F46E5" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
      children: [new TextRun({ text: "\u30B7\u30D5\u30C8\u7BA1\u7406\u30C4\u30FC\u30EB", size: 36, font: "Yu Gothic", color: "6366F1" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
      children: [new TextRun({ text: sub, size: 32, bold: true, font: "Yu Gothic" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
      children: [new TextRun({ text: `\u4F5C\u6210\u65E5: ${date}`, size: 20, color: "666666", font: "Yu Gothic" })] }),
    br()
  ];
}

function makeHeader(text) {
  return new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: `Shift M \u2014 ${text}`, size: 16, color: "999999", font: "Yu Gothic" })] })] });
}

const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Page ", size: 16, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999" })] })] });

function makeTable(headers, rows, colWidths) {
  const tw = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: tw, type: WidthType.DXA }, columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => cell(h, { w: colWidths[i], b: true, bg: "EEF2FF" })) }),
      ...rows.map(row => new TableRow({ children: row.map((c, i) => cell(c, { w: colWidths[i] })) }))
    ]
  });
}

const pageProps = {
  page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1100, bottom: 1440, left: 1100 } }
};

// ============================
// 1. システム仕様書
// ============================
function createSystemSpec() {
  return new Document({
    styles: commonStyles, numbering: bulletConfig,
    sections: [{
      properties: pageProps, headers: { default: makeHeader("\u30B7\u30B9\u30C6\u30E0\u4ED5\u69D8\u66F8") }, footers: { default: footer },
      children: [
        ...title("Shift M", "\u30B7\u30B9\u30C6\u30E0\u4ED5\u69D8\u66F8", "2026\u5E743\u670830\u65E5"),

        h("\u2460 \u30B7\u30B9\u30C6\u30E0\u6982\u8981", HeadingLevel.HEADING_1),
        p("AI\u3092\u6D3B\u7528\u3057\u305F\u533B\u7642\u6A5F\u95A2\u5411\u3051\u30B7\u30D5\u30C8\u7BA1\u7406\u30C4\u30FC\u30EB"),
        b("\u30D5\u30EC\u30FC\u30E0\u30EF\u30FC\u30AF: Next.js 14.2 + React 18.2 + TypeScript 5.3"),
        b("DB: Supabase (PostgreSQL)"),
        b("AI: Dify Workflow (Claude Sonnet 4.5)"),
        b("CSS: Tailwind CSS 3.4"),
        b("\u30C7\u30D7\u30ED\u30A4: Vercel"),
        b("\u8A8D\u8A3C: \u30BB\u30C3\u30B7\u30E7\u30F3\u30C8\u30FC\u30AF\u30F3 + httpOnly Cookie"),
        b("E2E\u30C6\u30B9\u30C8: Playwright"),

        h("\u2461 \u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u8A2D\u8A08", HeadingLevel.HEADING_1),

        h("employees\uFF08\u5F93\u696D\u54E1\uFF09", HeadingLevel.HEADING_2),
        makeTable(["\u30AB\u30E9\u30E0", "\u578B", "\u8AAC\u660E"], [
          ["id", "UUID PK", "\u4E00\u610F\u8B58\u5225\u5B50"],
          ["name", "VARCHAR(100)", "\u6C0F\u540D"],
          ["employment_type", "ENUM", "\u5E38\u52E4/\u30D1\u30FC\u30C8"],
          ["job_type", "ENUM", "\u770B\u8B77\u5E2B/\u81E8\u5E8A\u691C\u67FB\u6280\u5E2B/\u770B\u8B77\u52A9\u624B"],
          ["employee_number", "VARCHAR(10) UNIQUE", "emp001\u5F62\u5F0F"],
          ["password_hash", "TEXT", "bcrypt\u30CF\u30C3\u30B7\u30E5"],
          ["role", "VARCHAR(20)", "admin/employee/developer"],
          ["available_days", "TEXT[]", "\u51FA\u52E4\u53EF\u80FD\u66DC\u65E5"],
          ["assignable_workplaces_by_day", "JSONB", "\u66DC\u65E5\u5225\u914D\u7F6E\u53EF\u80FD\u5834\u6240"],
          ["assignable_shift_pattern_ids", "UUID[]", "\u5BFE\u5FDC\u30B7\u30D5\u30C8\u30D1\u30BF\u30FC\u30F3"],
          ["day_constraints", "JSONB", "\u66DC\u65E5\u9593\u5236\u7D04"],
          ["is_system_account", "BOOLEAN", "\u30B7\u30B9\u30C6\u30E0\u30A2\u30AB\u30A6\u30F3\u30C8\u30D5\u30E9\u30B0"],
          ["is_active", "BOOLEAN", "\u6709\u52B9\u30D5\u30E9\u30B0"],
        ], [3000, 3200, 3500]),

        h("shifts\uFF08\u30B7\u30D5\u30C8\uFF09", HeadingLevel.HEADING_2),
        makeTable(["\u30AB\u30E9\u30E0", "\u578B", "\u8AAC\u660E"], [
          ["id", "UUID PK", "\u4E00\u610F\u8B58\u5225\u5B50"],
          ["employee_id", "UUID FK", "\u5F93\u696D\u54E1ID"],
          ["date", "DATE", "\u30B7\u30D5\u30C8\u65E5\u4ED8"],
          ["shift_pattern_id", "UUID FK", "\u30B7\u30D5\u30C8\u30D1\u30BF\u30FC\u30F3ID"],
          ["am_workplace", "VARCHAR(100)", "AM\u914D\u7F6E\u5834\u6240\u540D"],
          ["pm_workplace", "VARCHAR(100)", "PM\u914D\u7F6E\u5834\u6240\u540D"],
          ["am_workplace_id", "UUID", "AM\u914D\u7F6E\u5834\u6240ID"],
          ["pm_workplace_id", "UUID", "PM\u914D\u7F6E\u5834\u6240ID"],
          ["is_rest", "BOOLEAN", "\u4F11\u307F\u30D5\u30E9\u30B0"],
          ["status", "ENUM", "draft/confirmed/modified"],
        ], [3000, 3200, 3500]),

        h("workplaces\uFF08\u914D\u7F6E\u5834\u6240\uFF09", HeadingLevel.HEADING_2),
        makeTable(["\u30AB\u30E9\u30E0", "\u578B", "\u8AAC\u660E"], [
          ["id", "UUID PK", "\u4E00\u610F\u8B58\u5225\u5B50"],
          ["name", "VARCHAR(100)", "\u914D\u7F6E\u5834\u6240\u540D"],
          ["facility", "ENUM", "\u30AF\u30EA\u30CB\u30C3\u30AF\u68DF/\u5065\u8A3A\u68DF"],
          ["time_slot", "ENUM", "AM/PM"],
          ["day_of_week", "ENUM", "\u66DC\u65E5"],
          ["required_count", "INTEGER", "\u5FC5\u8981\u4EBA\u6570"],
          ["remarks", "TEXT", "\u5099\u8003"],
        ], [3000, 3200, 3500]),

        h("leave_requests\uFF08\u5E0C\u671B\u4F11\uFF09", HeadingLevel.HEADING_2),
        makeTable(["\u30AB\u30E9\u30E0", "\u578B", "\u8AAC\u660E"], [
          ["id", "UUID PK", "\u4E00\u610F\u8B58\u5225\u5B50"],
          ["employee_id", "UUID FK", "\u5F93\u696D\u54E1ID"],
          ["date", "DATE", "\u7533\u8ACB\u65E5\u4ED8"],
          ["leave_type", "ENUM", "\u5E0C\u671B\u4F11/\u6709\u4F11/\u5FCC\u5F15/\u75C5\u6B20/\u305D\u306E\u4ED6/\u51FA\u52E4\u53EF\u80FD"],
          ["status", "ENUM", "\u7533\u8ACB\u4E2D/\u627F\u8A8D/\u5374\u4E0B"],
          ["approved_by", "UUID FK", "\u627F\u8A8D\u8005ID"],
        ], [3000, 3200, 3500]),

        h("\u305D\u306E\u4ED6\u30C6\u30FC\u30D6\u30EB", HeadingLevel.HEADING_2),
        b("shift_patterns: \u30B7\u30D5\u30C8\u30D1\u30BF\u30FC\u30F3\uFF08\u540D\u524D\u3001\u958B\u59CB/\u7D42\u4E86\u6642\u523B\u3001\u4F11\u61A9\u3001\u8272\uFF09"),
        b("ai_constraint_guidelines: AI\u5236\u7D04\u6761\u4EF6\uFF08\u81EA\u7136\u8A00\u8A9E\u30C6\u30AD\u30B9\u30C8\uFF09"),
        b("employee_sequences: \u5F93\u696D\u54E1\u756A\u53F7\u63A1\u756A\u7528\uFF08\u5358\u4E00\u884C\u30C6\u30FC\u30D6\u30EB\uFF09"),

        h("\u2462 \u8A8D\u8A3C\u30D5\u30ED\u30FC", HeadingLevel.HEADING_1),
        p("\u30BB\u30C3\u30B7\u30E7\u30F3\u30C8\u30FC\u30AF\u30F3\u578B\u8A8D\u8A3C\uFF08bcrypt + Supabase\uFF09"),
        n("\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u304C /api/auth/login \u306B user_id + password \u3092\u9001\u4FE1"),
        n("Supabase\u304B\u3089employee_number\u3067\u691C\u7D22\u3001bcrypt\u3067\u30D1\u30B9\u30EF\u30FC\u30C9\u691C\u8A3C"),
        n("64\u6587\u5B57\u306E\u30E9\u30F3\u30C0\u30E0\u30BB\u30C3\u30B7\u30E7\u30F3\u30C8\u30FC\u30AF\u30F3\u3092\u751F\u6210\u3001DB\u306B\u4FDD\u5B58"),
        n("httpOnly Cookie\u3068localStorage\u306B\u30C8\u30FC\u30AF\u30F3\u3092\u4FDD\u5B58"),
        p(""),
        p("\u30ED\u30FC\u30EB\u4F53\u5236:", { bold: true }),
        b("admin: \u7BA1\u7406\u8005\uFF08\u30B7\u30D5\u30C8\u4F5C\u6210\u3001\u5F93\u696D\u54E1\u7BA1\u7406\u3001\u5E0C\u671B\u4F11\u627F\u8A8D\u7B49\uFF09"),
        b("employee: \u5F93\u696D\u54E1\uFF08\u30B7\u30D5\u30C8\u78BA\u8A8D\u3001\u5E0C\u671B\u4F11\u7533\u8ACB\uFF09"),
        b("developer: \u958B\u767A\u8005\uFF08admin\u3068\u540C\u7B49\u6A29\u9650\uFF09"),

        h("\u2463 AI\u30B7\u30D5\u30C8\u751F\u6210\u30D5\u30ED\u30FC", HeadingLevel.HEADING_1),
        n("DB\u304B\u3089\u5F93\u696D\u54E1\u30FB\u914D\u7F6E\u5834\u6240\u30FB\u30D1\u30BF\u30FC\u30F3\u30FB\u5E0C\u671B\u4F11\u30FB\u5236\u7D04\u3092\u53D6\u5F97"),
        n("\u5236\u7D04\u3092\u5F93\u696D\u54E1\u3054\u3068\u306B\u7D10\u3065\u3051\uFF08applicable_constraints\uFF09"),
        n("\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u6982\u8981\u3092\u4E8B\u524D\u8A08\u7B97\uFF08\u51FA\u52E4\u53EF\u80FD\u65E5\u6570\u3001\u524D\u6708\u672B\u9023\u52E4\u7B49\uFF09"),
        n("\u914D\u7F6E\u5834\u6240\u306E\u9700\u8981\u30B5\u30DE\u30EA\u30FC\u3092\u96C6\u8A08"),
        n("Dify Workflow API\u306B\u30B9\u30C8\u30EA\u30FC\u30DF\u30F3\u30B0\u30E2\u30FC\u30C9\u3067\u9001\u4FE1"),
        n("AI\u51FA\u529B\u3092\u30D0\u30EA\u30C7\u30FC\u30B7\u30E7\u30F3\uFF08\u65E5\u4ED8\u3001\u5F93\u696D\u54E1\u3001\u66DC\u65E5\u3001\u5E0C\u671B\u4F11\u3001\u91CD\u8907\u7B49\uFF09"),
        n("\u65E2\u5B58\u30B7\u30D5\u30C8\u3092\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u2192\u524A\u9664\u2192\u65B0\u898F\u633F\u5165\uFF08\u5931\u6557\u6642\u5FA9\u5143\uFF09"),

        h("\u2464 \u74B0\u5883\u5909\u6570", HeadingLevel.HEADING_1),
        makeTable(["\u30AD\u30FC", "\u8AAC\u660E", "\u516C\u958B"], [
          ["NEXT_PUBLIC_SUPABASE_URL", "Supabase URL", "\u516C\u958B"],
          ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase\u533F\u540D\u30AD\u30FC", "\u516C\u958B"],
          ["SUPABASE_SERVICE_ROLE_KEY", "Supabase\u30B5\u30FC\u30D3\u30B9\u30ED\u30FC\u30EB\u30AD\u30FC", "\u79D8\u5BC6"],
          ["DIFY_API_KEY", "Dify API\u30AD\u30FC", "\u79D8\u5BC6"],
          ["DIFY_API_URL", "Dify API URL", "\u79D8\u5BC6"],
        ], [3500, 4000, 2200]),
      ]
    }]
  });
}

// ============================
// 2. 導入ガイド
// ============================
function createDeployGuide() {
  return new Document({
    styles: commonStyles, numbering: bulletConfig,
    sections: [{
      properties: pageProps, headers: { default: makeHeader("\u5C0E\u5165\u30AC\u30A4\u30C9") }, footers: { default: footer },
      children: [
        ...title("Shift M", "\u5C0E\u5165\u30AC\u30A4\u30C9", "2026\u5E743\u670830\u65E5"),

        h("\u2460 \u524D\u63D0\u6761\u4EF6", HeadingLevel.HEADING_1),
        b("Node.js 18\u4EE5\u4E0A"),
        b("npm 9\u4EE5\u4E0A"),
        b("GitHub\u30A2\u30AB\u30A6\u30F3\u30C8"),
        b("Supabase\u30A2\u30AB\u30A6\u30F3\u30C8\uFF08Pro\u30D7\u30E9\u30F3\u63A8\u5968\uFF09"),
        b("Vercel\u30A2\u30AB\u30A6\u30F3\u30C8"),
        b("Dify\u30A2\u30AB\u30A6\u30F3\u30C8"),

        h("\u2461 Supabase\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7", HeadingLevel.HEADING_1),
        n("\u65B0\u898F\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u4F5C\u6210"),
        n("SQL Editor\u3067supabase/schema.sql\u3092\u5B9F\u884C\uFF08\u30C6\u30FC\u30D6\u30EB\u4F5C\u6210\uFF09"),
        n("API Settings\u304B\u3089URL\u3001anon key\u3001service role key\u3092\u53D6\u5F97"),
        n("RLS\u30DD\u30EA\u30B7\u30FC\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u3053\u3068\u3092\u78BA\u8A8D"),

        h("\u2462 Dify\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7", HeadingLevel.HEADING_1),
        n("\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u3092\u4F5C\u6210\uFF08\u958B\u59CB \u2192 LLM \u2192 \u7D42\u4E86\uFF09"),
        n("LLM\u30CE\u30FC\u30C9\u306BClaude Sonnet 4.5\u3092\u8A2D\u5B9A"),
        n("\u958B\u59CB\u30CE\u30FC\u30C9\u306B9\u3064\u306E\u5165\u529B\u30D5\u30A3\u30FC\u30EB\u30C9\u3092\u8FFD\u52A0:"),
        b("target_month, employees, leave_requests, shift_patterns, constraints, calendar, workplaces, employee_summaries, workplace_demand"),
        n("LLM\u30CE\u30FC\u30C9\u306EUSER\u30D7\u30ED\u30F3\u30D7\u30C8\u306B\u30B7\u30D5\u30C8\u751F\u6210\u6307\u793A\u3092\u8A2D\u5B9A"),
        n("API\u30AD\u30FC\u3092\u53D6\u5F97\uFF08app-\u304B\u3089\u59CB\u307E\u308B\u6587\u5B57\u5217\uFF09"),

        h("\u2463 \u30EA\u30DD\u30B8\u30C8\u30EA\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7", HeadingLevel.HEADING_1),
        n("GitHub\u30EA\u30DD\u30B8\u30C8\u30EA\u3092\u30AF\u30ED\u30FC\u30F3"),
        n(".env.local\u3092\u4F5C\u6210\u3057\u3001\u74B0\u5883\u5909\u6570\u3092\u8A2D\u5B9A"),
        n("npm install \u3067\u4F9D\u5B58\u95A2\u4FC2\u3092\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB"),
        n("npm run build \u3067\u30D3\u30EB\u30C9\u78BA\u8A8D"),

        h("\u2464 \u521D\u671F\u30C7\u30FC\u30BF\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7", HeadingLevel.HEADING_1),
        n("\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u4F5C\u6210\uFF08admin123\uFF09"),
        n("\u958B\u767A\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u4F5C\u6210\uFF08dev123\uFF09"),
        n("\u5F93\u696D\u54E1\u30C7\u30FC\u30BF\u3092\u767B\u9332\uFF08\u5F93\u696D\u54E1\u7BA1\u7406\u30DA\u30FC\u30B8\u304B\u3089\uFF09"),
        n("\u914D\u7F6E\u5834\u6240\u3092\u767B\u9332\uFF08\u914D\u7F6E\u5834\u6240\u7BA1\u7406\u30DA\u30FC\u30B8\u304B\u3089\uFF09"),
        n("\u30B7\u30D5\u30C8\u30D1\u30BF\u30FC\u30F3\u3092\u767B\u9332\uFF08\u30B7\u30D5\u30C8\u30D1\u30BF\u30FC\u30F3\u7BA1\u7406\u30DA\u30FC\u30B8\u304B\u3089\uFF09"),
        n("AI\u5236\u7D04\u6761\u4EF6\u3092\u767B\u9332\uFF08AI\u5236\u7D04\u6761\u4EF6\u7BA1\u7406\u30DA\u30FC\u30B8\u304B\u3089\uFF09"),

        h("\u2465 Vercel\u30C7\u30D7\u30ED\u30A4", HeadingLevel.HEADING_1),
        n("Vercel\u306B\u30EA\u30DD\u30B8\u30C8\u30EA\u3092\u63A5\u7D9A"),
        n("\u74B0\u5883\u5909\u6570\u3092Vercel\u306E\u8A2D\u5B9A\u753B\u9762\u3067\u767B\u9332"),
        n("main\u30D6\u30E9\u30F3\u30C1\u3092\u672C\u756A\u74B0\u5883\u306B\u8A2D\u5B9A"),
        n("\u30C7\u30D7\u30ED\u30A4\u5B8C\u4E86\u5F8C\u3001URL\u3092\u78BA\u8A8D"),

        h("\u2466 \u30A2\u30AB\u30A6\u30F3\u30C8\u914D\u5E03", HeadingLevel.HEADING_1),
        p("\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u60C5\u5831:", { bold: true }),
        makeTable(["\u9805\u76EE", "\u5024"], [
          ["\u30E6\u30FC\u30B6\u30FCID", "admin123"],
          ["\u521D\u671F\u30D1\u30B9\u30EF\u30FC\u30C9", "admin123\uFF08\u5909\u66F4\u63A8\u5968\uFF09"],
        ], [3000, 6700]),
        p(""),
        p("\u5F93\u696D\u54E1\u30A2\u30AB\u30A6\u30F3\u30C8:", { bold: true }),
        b("\u5F93\u696D\u54E1\u7BA1\u7406\u30DA\u30FC\u30B8\u3067\u300C\uFF0B\u65B0\u898F\u5F93\u696D\u54E1\u8FFD\u52A0\u300D\u304B\u3089\u4F5C\u6210"),
        b("\u5F93\u696D\u54E1\u756A\u53F7\u3068\u521D\u671F\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u81EA\u52D5\u751F\u6210\u3055\u308C\u308B"),
        b("\u5404\u5F93\u696D\u54E1\u306B\u500B\u5225\u306B\u901A\u77E5\uFF08\u5F93\u696D\u54E1\u756A\u53F7 + \u521D\u671F\u30D1\u30B9\u30EF\u30FC\u30C9\uFF09"),
        b("\u521D\u56DE\u30ED\u30B0\u30A4\u30F3\u6642\u306B\u30D1\u30B9\u30EF\u30FC\u30C9\u5909\u66F4\u304C\u5FC5\u8981"),
      ]
    }]
  });
}

// ============================
// 3. 運用保守マニュアル
// ============================
function createOpsManual() {
  return new Document({
    styles: commonStyles, numbering: bulletConfig,
    sections: [{
      properties: pageProps, headers: { default: makeHeader("\u904B\u7528\u4FDD\u5B88\u30DE\u30CB\u30E5\u30A2\u30EB") }, footers: { default: footer },
      children: [
        ...title("Shift M", "\u904B\u7528\u4FDD\u5B88\u30DE\u30CB\u30E5\u30A2\u30EB", "2026\u5E743\u670830\u65E5"),

        h("\u2460 \u30C8\u30E9\u30D6\u30EB\u30B7\u30E5\u30FC\u30C6\u30A3\u30F3\u30B0", HeadingLevel.HEADING_1),

        h("\u30ED\u30B0\u30A4\u30F3\u3067\u304D\u306A\u3044", HeadingLevel.HEADING_2),
        b("Supabase\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3067\u5F93\u696D\u54E1\u30C6\u30FC\u30D6\u30EB\u3092\u78BA\u8A8D\uFF08is_active=true\u304B\uFF09"),
        b("\u7BA1\u7406\u8005\u304C\u30D1\u30B9\u30EF\u30FC\u30C9\u30EA\u30BB\u30C3\u30C8\u3092\u5B9F\u884C\uFF08\u5F93\u696D\u54E1\u7BA1\u7406\u30DA\u30FC\u30B8\u306E\u9375\u30A2\u30A4\u30B3\u30F3\uFF09"),
        b("Cookie\u304C\u30D6\u30E9\u30A6\u30B6\u3067\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u3066\u3044\u306A\u3044\u304B\u78BA\u8A8D"),

        h("AI\u30B7\u30D5\u30C8\u751F\u6210\u304C\u5931\u6557\u3059\u308B", HeadingLevel.HEADING_2),
        b("Dify\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3067\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u304C\u516C\u958B\u6E08\u307F\u304B\u78BA\u8A8D"),
        b("DIFY_API_KEY\u304C\u6709\u52B9\u304B\u78BA\u8A8D\uFF08Vercel\u306E\u74B0\u5883\u5909\u6570\uFF09"),
        b("Supabase\u306E\u63A5\u7D9A\u304C\u6B63\u5E38\u304B\u78BA\u8A8D"),
        b("\u5F93\u696D\u54E1\u30C7\u30FC\u30BF\u304C0\u4EF6\u306E\u5834\u5408\u3001\u30B7\u30D5\u30C8\u751F\u6210\u304C\u5931\u6557\u3059\u308B\uFF08\u5F93\u696D\u54E1\u3092\u767B\u9332\uFF09"),

        h("AI\u306E\u7CBE\u5EA6\u304C\u60AA\u3044", HeadingLevel.HEADING_2),
        b("AI\u5236\u7D04\u6761\u4EF6\u306E\u8A18\u8FF0\u3092\u898B\u76F4\u3059\uFF08\u5177\u4F53\u7684\u3067\u660E\u78BA\u306A\u8A18\u8FF0\u306B\uFF09"),
        b("\u5F93\u696D\u54E1\u306E\u914D\u7F6E\u53EF\u80FD\u5834\u6240\u30FB\u5BFE\u5FDC\u30B7\u30D5\u30C8\u304C\u6B63\u3057\u304F\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u304B\u78BA\u8A8D"),
        b("\u5E0C\u671B\u4F11\u304C\u627F\u8A8D\u6E08\u307F\u306B\u306A\u3063\u3066\u3044\u308B\u304B\u78BA\u8A8D\uFF08\u7533\u8ACB\u4E2D\u306E\u307E\u307EAIG\u751F\u6210\u3059\u308B\u3068\u53CD\u6620\u3055\u308C\u306A\u3044\uFF09"),
        b("\u7279\u5225\u8981\u671B\u6B04\u3092\u6D3B\u7528\u3059\u308B"),

        h("\u30DA\u30FC\u30B8\u304C\u8868\u793A\u3055\u308C\u306A\u3044/\u30A8\u30E9\u30FC", HeadingLevel.HEADING_2),
        b("\u30D6\u30E9\u30A6\u30B6\u3092\u30EA\u30ED\u30FC\u30C9\uFF08F5\uFF09"),
        b("Vercel\u306E\u30C7\u30D7\u30ED\u30A4\u30B9\u30C6\u30FC\u30BF\u30B9\u3092\u78BA\u8A8D"),
        b("\u30D6\u30E9\u30A6\u30B6\u306E\u30AD\u30E3\u30C3\u30B7\u30E5\u3092\u30AF\u30EA\u30A2"),

        h("\u2461 \u30D0\u30C3\u30AF\u30A2\u30C3\u30D7", HeadingLevel.HEADING_1),

        h("Supabase\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7", HeadingLevel.HEADING_2),
        b("Supabase Pro\u30D7\u30E9\u30F3\u3067\u81EA\u52D5\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u6709\u52B9\uFF087\u65E5\u9593\u4FDD\u6301\uFF09"),
        b("\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9 \u2192 Settings \u2192 Database \u2192 Backups\u3067\u78BA\u8A8D"),
        b("\u624B\u52D5\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7: SQL Editor\u3067pg_dump\u76F8\u5F53\u306E\u30AF\u30A8\u30EA\u3092\u5B9F\u884C"),

        h("\u30B3\u30FC\u30C9\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7", HeadingLevel.HEADING_2),
        b("GitHub\u30EA\u30DD\u30B8\u30C8\u30EA\u306B\u5168\u5C65\u6B74\u304C\u4FDD\u5B58\u3055\u308C\u3066\u3044\u308B"),
        b("\u30D6\u30E9\u30F3\u30C1\u69CB\u6210: main\uFF08\u672C\u756A\uFF09\u3001staging\uFF08\u30C6\u30B9\u30C8\uFF09\u3001develop\uFF08\u958B\u767A\uFF09"),

        h("\u2462 \u76E3\u8996", HeadingLevel.HEADING_1),
        b("Vercel\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3067\u30C7\u30D7\u30ED\u30A4\u30B9\u30C6\u30FC\u30BF\u30B9\u3092\u78BA\u8A8D"),
        b("Supabase\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3067DB\u63A5\u7D9A\u72B6\u6CC1\u3092\u78BA\u8A8D"),
        b("Dify\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3067AI\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u306E\u5B9F\u884C\u30ED\u30B0\u3092\u78BA\u8A8D"),
        b("\u5404\u30B5\u30FC\u30D3\u30B9\u306E\u8ACB\u6C42\u72B6\u6CC1\u3092\u6708\u6B21\u78BA\u8A8D"),

        h("\u2463 \u30A2\u30C3\u30D7\u30C7\u30FC\u30C8\u624B\u9806", HeadingLevel.HEADING_1),
        n("develop\u30D6\u30E9\u30F3\u30C1\u3067\u4FEE\u6B63\u3092\u5B9F\u65BD"),
        n("TypeScript\u578B\u30C1\u30A7\u30C3\u30AF + ESLint + \u30D3\u30EB\u30C9\u304C\u901A\u308B\u3053\u3068\u3092\u78BA\u8A8D"),
        n("develop \u2192 main \u3078PR\u3092\u4F5C\u6210"),
        n("CI\uFF08GitHub Actions\uFF09\u304C\u30D1\u30B9\u3059\u308B\u3053\u3068\u3092\u78BA\u8A8D"),
        n("PR\u3092\u30DE\u30FC\u30B8 \u2192 Vercel\u304C\u81EA\u52D5\u30C7\u30D7\u30ED\u30A4"),
        n("\u672C\u756A\u74B0\u5883\u3067\u52D5\u4F5C\u78BA\u8A8D"),

        h("\u2464 \u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u6CE8\u610F\u4E8B\u9805", HeadingLevel.HEADING_1),
        b(".env.local\u3092Git\u306B\u30B3\u30DF\u30C3\u30C8\u3057\u306A\u3044\uFF08.gitignore\u6E08\u307F\uFF09"),
        b("SUPABASE_SERVICE_ROLE_KEY\u3092\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u5074\u306B\u9732\u51FA\u3055\u305B\u306A\u3044"),
        b("\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u30D1\u30B9\u30EF\u30FC\u30C9\u306F\u5B9A\u671F\u7684\u306B\u5909\u66F4"),
        b("\u5F93\u696D\u54E1\u304C\u9000\u8077\u3057\u305F\u5834\u5408\u306F\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u7121\u52B9\u5316\uFF08is_active=false\uFF09"),
        b("GitHub\u30EA\u30DD\u30B8\u30C8\u30EA\u306F\u30D7\u30E9\u30A4\u30D9\u30FC\u30C8\u8A2D\u5B9A"),

        h("\u2465 \u9023\u7D61\u5148", HeadingLevel.HEADING_1),
        makeTable(["\u62C5\u5F53", "\u9023\u7D61\u5148", "\u5099\u8003"], [
          ["\u958B\u767A\u62C5\u5F53", "\uFF08\u958B\u767A\u30C1\u30FC\u30E0\uFF09", "\u30B3\u30FC\u30C9\u4FEE\u6B63\u30FBDB\u5909\u66F4"],
          ["Supabase", "supabase.com/dashboard", "DB\u7BA1\u7406\u30FB\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7"],
          ["Vercel", "vercel.com/dashboard", "\u30C7\u30D7\u30ED\u30A4\u30FB\u74B0\u5883\u5909\u6570"],
          ["Dify", "cloud.dify.ai", "AI\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u7BA1\u7406"],
        ], [2500, 4000, 3200]),
      ]
    }]
  });
}

// ============================
// 生成実行
// ============================
async function main() {
  const spec = createSystemSpec();
  const deploy = createDeployGuide();
  const ops = createOpsManual();

  fs.writeFileSync('docs/system_specification.docx', await Packer.toBuffer(spec));
  fs.writeFileSync('docs/deployment_guide.docx', await Packer.toBuffer(deploy));
  fs.writeFileSync('docs/operations_manual.docx', await Packer.toBuffer(ops));

  console.log('1. システム仕様書: docs/system_specification.docx');
  console.log('2. 導入ガイド: docs/deployment_guide.docx');
  console.log('3. 運用保守マニュアル: docs/operations_manual.docx');
}

main().catch(console.error);
