import apiClient from "../services/apiClient";

export const uploadApi = {
  /**
   * Uploads a pharmaceutical complaint document to be processed by the AI.
   * @param {File} file The PDF, DOCX, or MSG file to upload.
   * @returns {Promise<any>} Response data on success.
   */
  processDocument: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/v1/upload/process", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // 30 seconds custom timeout for heavy AI pipeline steps:
      // text parsing, two Groq model completions, embedding extraction, and DB-wide duplicate check
      timeout: 30000,
    });

    return response.data;
  },

  /**
   * Sends a conversational QA question about a complaint.
   * @param {string} complaintText The context complaint narrative.
   * @param {string} question The user question.
   * @returns {Promise<any>} Response answer.
   */
  chatAssistant: async (complaintText, question) => {
    const response = await apiClient.post("/v1/upload/chat", {
      complaint_text: complaintText,
      question: question,
    });
    return response.data;
  },

  /**
   * Ingests plain narrative text to be processed by the AI.
   * @param {string} text The complaint text narrative.
   * @returns {Promise<any>} Response data on success.
   */
  processText: async (text) => {
    const response = await apiClient.post("/v1/upload/text", { text }, {
      timeout: 30000,
    });
    return response.data;
  },
};
