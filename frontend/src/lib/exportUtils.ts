import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Evidence } from "./mockData";
import { format } from "date-fns";

export const exportToExcel = async (data: Evidence[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Evidencias");

  // Define columns
  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Fecha", key: "createdAt", width: 20 },
    { header: "Nombre", key: "fullName", width: 30 },
    { header: "Tipo de Actividad", key: "activityType", width: 20 },
    { header: "Confianza (%)", key: "confidence", width: 15 },
    { header: "Estado", key: "status", width: 15 },
    { header: "URL Imagen", key: "imageUrl", width: 40 },
  ];

  // Style headers
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" }, // Indigo 600
  };

  // Add rows
  data.forEach((item) => {
    worksheet.addRow({
      id: item.id,
      createdAt: format(new Date(item.createdAt), "dd/MM/yyyy HH:mm"),
      fullName: item.fullName,
      activityType: item.activityType,
      confidence: `${(item.confidence * 100).toFixed(1)}%`,
      status: item.status,
      imageUrl: item.imageUrl,
    });
  });

  // Generate buffer and save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `CheckMate_Evidencias_${format(new Date(), "dd-MM-yyyy")}.xlsx`);
};
