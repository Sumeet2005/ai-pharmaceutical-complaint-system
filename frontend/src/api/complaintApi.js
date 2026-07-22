import apiClient from "../services/apiClient";

export const complaintApi = {
  /**
   * Fetches all complaints from the database.
   * @returns {Promise<any>} List of complaints.
   */
  getComplaints: async () => {
    const response = await apiClient.get("/v1/complaints");
    return response.data;
  },

  /**
   * Fetches a single complaint by its database UUID.
   * @param {string} id The UUID primary key.
   * @returns {Promise<any>} The complaint data.
   */
  getComplaint: async (id) => {
    const response = await apiClient.get(`/v1/complaints/${id}`);
    return response.data;
  },

  /**
   * Updates a complaint's fields in the database.
   * @param {string} id The UUID primary key of the complaint record.
   * @param {object} payload The fields to update.
   * @returns {Promise<any>} The updated complaint data.
   */
  updateComplaint: async (id, payload) => {
    const response = await apiClient.patch(`/v1/complaints/${id}`, payload);
    return response.data;
  },

  /**
   * Deletes a complaint from the database by UUID.
   * @param {string} id The UUID primary key of the complaint record.
   * @returns {Promise<any>} Deletion status message.
   */
  deleteComplaint: async (id) => {
    const response = await apiClient.delete(`/v1/complaints/${id}`);
    return response.data;
  },
};
