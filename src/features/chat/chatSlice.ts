import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "axios";

export interface ChatState {
  messages: { id: string; text: string; sender: 'user' | 'bot'; }[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: ChatState = {
  messages: [],
  status: 'idle',
};

export function shouldRenderHTML(prompt: string): boolean {
  // List of keywords that indicate HTML rendering should be enabled
  // const htmlKeywords = ['<html>', '<body>', '<div>', '<p>', '<h1>', '<h2>', '<h3>', '<h4>', '<h5>', '<h6>', '<span>'];
  const htmlKeywords = ['render'];
  // Convert the prompt to lowercase for case-insensitive matching
  const lowercasePrompt = prompt.toLowerCase();
  // Check if any of the keywords are present in the prompt
  return htmlKeywords.some(keyword => lowercasePrompt.includes(keyword));
}

// Define sendMessage async action
export const sendMessage = createAsyncThunk<
  string, // Type of the return value from the payload creator
  string,
  { rejectValue: string } // Types for ThunkAPI parameters
>('chat/sendMessage', async (messageText, { rejectWithValue }) => {
  // Construct the URL with the prompt as a query parameter
  let apiUrl: string;
  if (shouldRenderHTML(messageText)) {
    apiUrl = `http://localhost:8000/generate-html?prompt=${encodeURIComponent(messageText)}`;
  } else {
    apiUrl = `http://localhost:8000/generate-text?prompt=${encodeURIComponent(messageText)}`;
  }

  try {
    // Note: No need to send the 'prompt' in the body, so it's omitted here
    const response = await axios.post(apiUrl, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response:', response.data.response);
    return response.data.response; // Assuming the API responds with an object that has a 'response' field
  } catch (error: any) {
    // It's good to check if error.response and error.response.data exist
    return rejectWithValue(error.response?.data ?? 'Unknown error');
  }
});


export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // You can add synchronous actions here if needed
    // Assuming you have other reducers
    addMessage: (state, action: PayloadAction<{ id: string; text: string; sender: 'user' | 'bot' }>) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<string, string, { arg: string }>) => {
        state.status = 'idle';
        // Here, action.payload is the bot's response, and action.meta.arg is the original message sent by the user
        const userMessage = action.meta.arg; // User's original message
        const botResponse = action.payload; // Bot's response

        // Add both messages to the chat state
        state.messages.push({ id: `u_${Date.now()}`, text: userMessage, sender: 'user' });
        state.messages.push({ id: `b_${Date.now()}`, text: botResponse, sender: 'bot' });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        console.error('SendMessage Error:', action.payload);
        // Handle error state or message here if necessary
      });
  },
});

export const { addMessage } = chatSlice.actions;

export default chatSlice.reducer;
