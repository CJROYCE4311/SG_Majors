import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("outputs/pga_championship_handicaps");
const outputPath = path.join(outputDir, "PGA Championship Player Handicaps.xlsx");

const players = [
  ["James Feutz", "+0.6"],
  ["Eric Weiss", "0.4"],
  ["Jon Vrolyks", "4.8"],
  ["Zane Eisenbarth", "5.4"],
  ["Paul Benga", "6.4"],
  ["Travis Ingram", "6.9"],
  ["Michael Falagrady", "6.9"],
  ["Mark Lewis", "9.4"],
  ["Shane Bolosan", "9.4"],
  ["Christopher Royce", "13.5"],
  ["Vasan Srinivasan", "15.1"],
  ["Patrick Schueppert", "16.5"],
  ['Robert Hill ("Captain")', "19.4"],
];

async function main() {
  const workbook = Workbook.create();
  const sheet = workbook.worksheets.add("PGA Championship");

  sheet.showGridLines = false;

  sheet.getRange("A1:B1").merge();
  sheet.getRange("A1").values = [["PGA Championship Handicaps"]];
  sheet.getRange("A1").format = {
    font: { bold: true, color: "#FFFFFF", size: 14 },
    fill: "#14532D",
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };

  sheet.getRange("A2:B2").merge();
  sheet.getRange("A2").values = [["Current player handicaps from Squabbit"]];
  sheet.getRange("A2").format = {
    font: { italic: true, color: "#334155", size: 11 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };

  sheet.getRange("A4:A17").values = [
    ["Player"],
    ...players.map(([name]) => [name]),
  ];
  sheet.getRange("B4").values = [["Handicap"]];
  sheet.getRange("B5:B17").formulas = players.map(([, handicap]) => [`="${handicap}"`]);

  sheet.getRange("A4:B4").format = {
    font: { bold: true, color: "#FFFFFF" },
    fill: "#166534",
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };

  sheet.getRange("A5:A17").format = {
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };

  sheet.getRange("B5:B17").format = {
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
  sheet.getRange("B5:B17").format.numberFormat = "@";

  sheet.getRange("A4:B17").format.wrapText = true;
  sheet.getRange("A1:B17").format.rowHeight = 22;
  sheet.getRange("A1:B1").format.rowHeight = 28;
  sheet.getRange("A1:A17").format.columnWidth = 30;
  sheet.getRange("B1:B17").format.columnWidth = 14;

  sheet.freezePanes.freezeRows(4);

  for (let row = 5; row <= 17; row += 1) {
    const fill = row % 2 === 1 ? "#CFE9F6" : "#FFFFFF";
    sheet.getRange(`A${row}:B${row}`).format.fill = fill;
  }

  await fs.mkdir(outputDir, { recursive: true });
  const xlsx = await SpreadsheetFile.exportXlsx(workbook);
  await xlsx.save(outputPath);

  const preview = await workbook.render({
    sheetName: "PGA Championship",
    range: "A1:B17",
    scale: 2,
  });
  const previewPath = path.join(outputDir, "PGA Championship Player Handicaps.png");
  await fs.writeFile(previewPath, Buffer.from(await preview.arrayBuffer()));

  const inspection = await workbook.inspect({
    kind: "table",
    range: "PGA Championship!A1:B17",
    include: "values",
    tableMaxRows: 20,
    tableMaxCols: 4,
  });

  console.log(JSON.stringify({ outputPath, previewPath, inspection: inspection.ndjson }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
