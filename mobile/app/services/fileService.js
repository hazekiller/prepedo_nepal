import api from '../config/api';

class FileService {
  // Get all user files
  async getUserFiles() {
    try {
      const response = await api.get('/api/files');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload a file
  async uploadFile(fileData) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileData.uri,
        type: 'application/pdf',
        name: fileData.name || 'document.pdf',
      });

      const response = await api.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get file by ID
  async getFile(fileId) {
    try {
      const response = await api.get(`/api/files/${fileId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete file
  async deleteFile(fileId) {
    try {
      const response = await api.delete(`/api/files/${fileId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Download file
  async downloadFile(fileId) {
    try {
      const response = await api.get(`/api/files/${fileId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle errors
  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new FileService();