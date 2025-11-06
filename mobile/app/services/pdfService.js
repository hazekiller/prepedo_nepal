import api from '../config/api';

class PDFService {
  // Compress PDF
  async compressPDF(fileData) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileData.uri,
        type: 'application/pdf',
        name: fileData.name || 'document.pdf',
      });

      const response = await api.post('/api/pdf/compress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Merge PDFs
  async mergePDFs(files) {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', {
          uri: file.uri,
          type: 'application/pdf',
          name: file.name || `document${index}.pdf`,
        });
      });

      const response = await api.post('/api/pdf/merge', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Split PDF
  async splitPDF(fileData, pages) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileData.uri,
        type: 'application/pdf',
        name: fileData.name || 'document.pdf',
      });
      formData.append('pages', JSON.stringify(pages));

      const response = await api.post('/api/pdf/split', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Protect PDF
  async protectPDF(fileData, password) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileData.uri,
        type: 'application/pdf',
        name: fileData.name || 'document.pdf',
      });
      formData.append('password', password);

      const response = await api.post('/api/pdf-protect/protect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Unlock PDF
  async unlockPDF(fileData, password) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileData.uri,
        type: 'application/pdf',
        name: fileData.name || 'document.pdf',
      });
      formData.append('password', password);

      const response = await api.post('/api/pdf-protect/unlock', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Organize PDF (rotate, reorder)
  async organizePDF(fileData, operations) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileData.uri,
        type: 'application/pdf',
        name: fileData.name || 'document.pdf',
      });
      formData.append('operations', JSON.stringify(operations));

      const response = await api.post('/api/pdf-organize/organize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Convert PDF to Excel
  async pdfToExcel(fileData) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileData.uri,
        type: 'application/pdf',
        name: fileData.name || 'document.pdf',
      });

      const response = await api.post('/api/excel/pdf-to-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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

export default new PDFService();