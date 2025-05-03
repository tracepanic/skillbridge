import pdfToText from "react-pdftotext";

export async function extractTextFromPDFUrl(
  url: string,
): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const text = await pdfToText(blob);
    return text;
  } catch (error) {
    console.log("Failed to extract text from PDF:", error);
    return null;
  }
}
