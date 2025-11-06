import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";

// Upload PDF
export const uploadPDF = createAsyncThunk(
  "pdf/upload",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/pdf/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload PDF"
      );
    }
  }
);

// Get user PDFs
export const getUserPDFs = createAsyncThunk(
  "pdf/getUserPDFs",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pdf/user/${userId}`);
      return response.data.pdfs;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch PDFs"
      );
    }
  }
);

// Delete PDF
export const deletePDF = createAsyncThunk(
  "pdf/delete",
  async (pdfId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/pdf/${pdfId}`);
      return { pdfId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete PDF"
      );
    }
  }
);

const initialState = {
  pdfs: [],
  currentPDF: null,
  loading: false,
  uploadLoading: false,
  error: null,
  message: null,
};

const pdfSlice = createSlice({
  name: "pdf",
  initialState,
  reducers: {
    setCurrentPDF: (state, action) => {
      state.currentPDF = action.payload;
    },
    clearPDFs: (state) => {
      state.pdfs = [];
      state.currentPDF = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload PDF
      .addCase(uploadPDF.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadPDF.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.message = "PDF uploaded successfully";
        if (action.payload.pdf) {
          state.pdfs.unshift(action.payload.pdf);
        }
      })
      .addCase(uploadPDF.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      })

      // Get user PDFs
      .addCase(getUserPDFs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPDFs.fulfilled, (state, action) => {
        state.loading = false;
        state.pdfs = action.payload;
      })
      .addCase(getUserPDFs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete PDF
      .addCase(deletePDF.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePDF.fulfilled, (state, action) => {
        state.loading = false;
        state.pdfs = state.pdfs.filter((pdf) => pdf.id !== action.payload.pdfId);
        state.message = action.payload.message;
      })
      .addCase(deletePDF.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentPDF, clearPDFs, clearError, clearMessage } =
  pdfSlice.actions;

export const selectPDFs = (state) => state.pdf.pdfs;
export const selectCurrentPDF = (state) => state.pdf.currentPDF;
export const selectPDFLoading = (state) => state.pdf.loading;
export const selectUploadLoading = (state) => state.pdf.uploadLoading;
export const selectPDFError = (state) => state.pdf.error;
export const selectPDFMessage = (state) => state.pdf.message;

export default pdfSlice.reducer;