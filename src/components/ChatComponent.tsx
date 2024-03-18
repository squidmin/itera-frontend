import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Box, Grid, IconButton, InputAdornment, Paper, TextField, Typography,} from '@mui/material';
import {Send as SendIcon} from '@mui/icons-material';
import {sendMessage} from "../features/chat/chatSlice";
import {AppDispatch, RootState} from "../app/store";
import ContentRenderer from "./ContentRenderer";
import {styled} from '@mui/system';

// Using MUI's system styled utility
const StyledTextField = styled(TextField)(({theme}) => ({
  '& .MuiInputBase-root': {
    paddingRight: theme.spacing(2),
  },
  '& .MuiOutlinedInput-inputMultiline': {
    padding: 0,
  },
  '& .MuiOutlinedInput-root': {
    paddingRight: '0 !important',
  },
}));

const StyledIconButton = styled(IconButton)(({theme}) => ({
  marginLeft: theme.spacing(1),
}));

export const ChatComponent = () => {
  const [input, setInput] = useState('');
  const [hasMessages, setHasMessages] = useState(false); // New state to track message submission
  const [category, setCategory] = useState('Uncategorized'); // Add this line
  const [inputHeight, setInputHeight] = useState<number>(0);
  const dispatch: AppDispatch = useDispatch();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const messages = useSelector((state: RootState) => state.chat.messages);

  useEffect(() => {
    const newHeight = Math.max(10, input.split('\n').length * 20); // Adjust '20' based on your styling
    setInputHeight(newHeight);
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      // Dispatch user's message to Redux store
      //dispatch(addMessage({ id: Date.now().toString(), text: input, sender: 'user' }));
      dispatch(sendMessage(input));
      setInput(''); // Optionally clear the input field here or in the .then() after dispatch if you want to ensure it clears after a successful send
      setHasMessages(true); // Update state to reflect that a message has been submitted
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInput(inputValue);
    setCategory(categorizePrompt(inputValue)); // Update the category based on the new input
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Check if Enter is pressed without Shift
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend(); // Send the message
      event.preventDefault(); // Prevent the default behavior of pressing Enter
    }
    // Check if Enter and Shift keys are pressed
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      setInput(prevInput => prevInput + '\n');
    }
  };

  const categorizePrompt = (input: string) => {
    const categories = {
      'Question and Answer': ['who', 'what', 'where', 'when', 'why', 'how'],
      'Conversational': ['hi', 'hello', 'hey'],
      'Text Completion': ['complete', 'finish'],
      'Code Translation': [
        "translate", "translate code from", "convert code to", "from python to javascript",
        "c++ to java conversion", "javascript to typescript", "python to c#",
        "java to python", "translate function from", "how to write this in",
        "code conversion", "syntax translation", "implement in python",
        "version in java", "equivalent in c++", "rewrite in", "from ruby to",
        "to swift", "to c++", "to java", "to python", "to javascript", "java to c++",
      ],
      'Code Generation': ['generate code', 'code snippet for', 'implement', 'algorithm', 'python', 'javascript', 'java', 'function', 'class', 'method', 'loop', 'array', 'list', 'dictionary', 'object'],
    };

    let bestMatchCategory = 'Uncategorized';
    let highestScore = 0;

    const sanitizedInput = input.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const inputWords = sanitizedInput.split(/\s+/);

    Object.entries(categories).forEach(([category, keywords]) => {
      let score = 0;

      keywords.forEach(keyword => {
        if (keyword.includes(' ')) { // Handle multi-word keywords
          if (sanitizedInput.includes(keyword)) {
            score += keyword.split(' ').length; // Give more weight to multi-word matches
          }
        } else {
          inputWords.forEach(word => {
            if (word === keyword) {
              score += 1;
            }
          });
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatchCategory = category;
      }
    });

    return bestMatchCategory;
  };


  return (
    <Box sx={{position: 'fixed', bottom: 0, width: '100%', zIndex: 'tooltip'}}>
      {/* Category display at the top */}
      <Box sx={{ position: 'relative', width: '100%', p: 1, }}>
        <Typography sx={{ position: 'relative', textAlign: 'right', paddingRight: 50, fontStyle: 'italic' }}>
          <strong>Category</strong>: {category}
        </Typography>
      </Box>
      <Grid container justifyContent="center" sx={{maxHeight: '100vh', overflow: 'hidden'}}>
        <Grid item xs={11} md={8} lg={6}>
          {hasMessages && ( // Conditionally render this block
            <Paper sx={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', p: 2, mb: 1, backgroundColor: 'rgba(20, 20, 20, 0.9)' }}>
              {messages.map((msg) => (
                <Box key={msg.id} sx={{ textAlign: msg.sender === 'user' ? 'right' : 'left', mb: 2 }}>
                  {msg.sender === 'bot' ? (
                    <ContentRenderer
                      block={{
                        type: 'text',
                        content: msg.text,
                        isCode: true,
                      }}
                    />
                  ) : (
                    <Typography variant="body1">{msg.text}</Typography>
                  )}
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Paper>
          )}
          <Box sx={{pt: 1}}>
            <StyledTextField
              fullWidth
              variant="outlined"
              label="Type a message..."
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              multiline
              rows={Math.max(1, input.split('\n').length)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <StyledIconButton onClick={handleSend}>
                      <SendIcon/>
                    </StyledIconButton>
                  </InputAdornment>
                ),
              }}
              autoFocus
              autoComplete="off"
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
