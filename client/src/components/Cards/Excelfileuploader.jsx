import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./Excelfileuploader.css";
import { Input, Button, Box, Text, Tooltip } from "@chakra-ui/react";

export default function ExcelFileUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  //const deploy_host = import.meta.env.VITE_DEPLOY_HOST;
  const deploy_host = "https://validatecreditcard-production.up.railway.app";

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = event.target.result;
      const workbook = XLSX.read(fileData, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const requestBody = {
        cards: jsonData.flat().filter((str) => str),
      };

      axios
        .post(`${deploy_host}/validate`, requestBody)
        .then((response) => {
          const responseData = response.data;

          const validData = responseData.valid.map((item) => ({
            columnName: item,
          }));
          const invalidData = responseData.invalid.map((item) => ({
            columnName: item,
          }));

          const validWs = XLSX.utils.json_to_sheet(validData, {
            header: ["columnName"],
          });
          const invalidWs = XLSX.utils.json_to_sheet(invalidData, {
            header: ["columnName"],
          });

          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, validWs, "Valid Cards");
          XLSX.utils.book_append_sheet(wb, invalidWs, "Invalid Cards");

          // Generate the download link
          const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
          const blob = new Blob([wbout], { type: "application/octet-stream" });
          const url = URL.createObjectURL(blob);

          // Create a temporary anchor element and click it to trigger download
          const link = document.createElement("a");
          link.href = url;
          link.download = "response.xlsx";
          link.click();

          // Clean up the URL object
          URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <Box width="full" boxShadow="dark-lg" p="4" rounded="xl">
      <Text as="b" fontSize={{ base: "20px", md: "30px", lg: "40px" }}>
        Validate Cards on Excel File
      </Text>
      <Tooltip
        hasArrow
        label="Upload XLSX file only with card numbers in the first column"
        bg="blue.500"
      >
      <Input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        w="65%"
        m={[2, 3]}
      />
      </Tooltip>
        <Button onClick={handleFileUpload}>Upload</Button>
    </Box>
  );
}
