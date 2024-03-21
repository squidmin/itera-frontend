import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Box, Fade, Grid, IconButton, InputAdornment, Paper, TextField, Typography} from '@mui/material';
import {ArrowDownward, ArrowUpward, Send as SendIcon,} from '@mui/icons-material';
import {sendMessage} from "../features/chat/chatSlice";
import {AppDispatch, RootState} from "../app/store";
import ContentRenderer from "./ContentRenderer";

import {styled} from '@mui/system';

const StyledTextField = styled(TextField)(({theme}) => ({
  '& .MuiInputBase-root': {
    paddingRight: theme.spacing(2),
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(2), // Adjust vertical padding as necessary
    // Ensure the line-height is enough to center the text vertically if the field has a specified height.
    lineHeight: 'normal', // Try 'normal' or a specific unit (e.g., '1.5em') as needed.
  },
  '& .MuiOutlinedInput-inputMultiline': {
    padding: 0,
  },
  '& .MuiOutlinedInput-root': {
    paddingRight: '0 !important',
    alignItems: 'center',
  },
  // This targets the placeholder specifically
  '& .MuiInputBase-input::placeholder': {
    textAlign: 'center', // Ensure placeholder text is also centered if needed
    lineHeight: 'inherit'
  },
}));

const StyledIconButton = styled(IconButton)(({theme}) => ({
  marginLeft: theme.spacing(1),
}));

export const ChatComponent = () => {
  const [input, setInput] = useState('');
  const [inputHistory, setInputHistory] = useState<string[]>([]); // New state for input history
  const [historyIndex, setHistoryIndex] = useState<number>(-1); // Index for navigating history
  const [hasMessages, setHasMessages] = useState(false); // New state to track message submission
  const [category, setCategory] = useState('Uncategorized'); // Add this line
  const [inputHeight, setInputHeight] = useState<number>(0);
  const dispatch: AppDispatch = useDispatch();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const inputRef = useRef<HTMLTextAreaElement>(null); // Ref for accessing the input element
  const [arrowDirection, setArrowDirection] = useState(''); // New state for arrow direction ('up', 'down', or '')
  const [showArrow, setShowArrow] = useState(false); // State to control Fade component
  const arrowTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newHeight = Math.max(10, input.split('\n').length * 20); // Adjust '20' based on your styling
    setInputHeight(newHeight);
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      // Calculate the height based on scrollHeight, adjust as needed
      const newHeight = inputRef.current.scrollHeight;
      setInputHeight(newHeight);
    }
  }, [input]); // Recalculate when input changes

  useEffect(() => {
    console.log("Updated Category: ", category); // Debugging
  }, [category]);

  const handleSend = async () => {
    if (input.trim()) {
      // Dispatch user's message to Redux store
      //dispatch(addMessage({ id: Date.now().toString(), text: input, sender: 'user' }));
      dispatch(sendMessage(input));
      setInputHistory([...inputHistory, input]); // Add the new input to the history
      setHistoryIndex(inputHistory.length); // Point to the latest message (which will be added)
      setInput(''); // Optionally clear the input field here or in the .then() after dispatch if you want to ensure it clears after a successful send
      setCategory('Uncategorized'); // Reset the category back to default
      setHasMessages(true); // Update state to reflect that a message has been submitted
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInput(inputValue);
    console.log("Detected Category: ", category); // Debugging
    setCategory(categorizePrompt(inputValue)); // Update the category based on the new input
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Check if Enter is pressed without Shift
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend(); // Send the message
      event.preventDefault(); // Prevent the default behavior of pressing Enter
    }
    // Allow Shift+Enter to insert a newline
    else if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      setInput(prevInput => `${prevInput}\n`);
    }
    // Navigate history with Shift+Up
    else if (event.key === 'ArrowUp' && event.altKey && historyIndex > 0) {
      event.preventDefault();
      if (historyIndex > 0 || historyIndex === 0 && inputHistory.length > 0) {
        setInputHistoryState(-1); // Adjust historyIndex to navigate back
      }
      setArrowDirection('up'); // Show the up arrow
      // Clear the existing timeout
      if (arrowTimeoutRef.current) {
        clearTimeout(arrowTimeoutRef.current);
      }
      setShowArrow(true); // Make arrow visible
      // Hide the arrow after a delay
      // Set a new timeout to hide the arrow
      arrowTimeoutRef.current = setTimeout(() => {
        setShowArrow(false);
        setArrowDirection(''); // Also clear the arrow direction
        arrowTimeoutRef.current = null;
      }, 1000); // Adjust time as needed
    }
    // Navigate history with Shift+Down
    else if (event.key === 'ArrowDown' && event.altKey && historyIndex < inputHistory.length) {
      event.preventDefault();
      if (historyIndex < inputHistory.length - 1) {
        setInputHistoryState(1); // Navigate forward in history
      } else {
        setInput(''); // Clear the input if at the end of history
        setHistoryIndex(-1);
      }
      setArrowDirection('down'); // Show the down arrow
      // Clear the existing timeout
      if (arrowTimeoutRef.current) {
        clearTimeout(arrowTimeoutRef.current);
      }
      setShowArrow(true); // Make arrow visible
      // Hide the arrow after a delay
      // Set a new timeout to hide the arrow
      arrowTimeoutRef.current = setTimeout(() => {
        setShowArrow(false);
        setArrowDirection(''); // Also clear the arrow direction
        arrowTimeoutRef.current = null;
      }, 1000); // Adjust time as needed
    }
  };

  useEffect(() => {
    let fadeOutTimeout: any;
    if (showArrow) {
      fadeOutTimeout = setTimeout(() => {
        setShowArrow(false);
      }, 1000); // Match this duration with your Fade timeout for consistency
    }
    return () => clearTimeout(fadeOutTimeout); // Cleanup on unmount or before a new timeout is set
  }, [showArrow]);

  const setInputHistoryState = (direction: number) => {
    setHistoryIndex((currentIndex) => {
      const newIndex = currentIndex + direction;
      // Ensure newIndex stays within bounds
      if (newIndex >= 0 && newIndex < inputHistory.length) {
        setInput(inputHistory[newIndex]);
        return newIndex;
      }
      return currentIndex;
    });
  };

  const categorizePrompt = (input: string) => {
    const categories = {
      'Question and Answer': ['who', 'what', 'where', 'when', 'why', 'how'],
      'Conversational': ['hi', 'hello', 'hey'],
      'Text Generation': ['write', 'a paragraph', 'plain text'],
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
      <Box sx={{position: 'relative', width: '100%', p: 1,}}>
        <Typography sx={{position: 'relative', textAlign: 'right', paddingRight: 20, fontStyle: 'italic'}}>
          <strong>Category</strong>: {category}
        </Typography>
      </Box>
      <Grid container justifyContent="center" sx={{maxHeight: '100vh', overflow: 'hidden'}}>
        <Grid item xs={11} md={8} lg={6}>
          {hasMessages && ( // Conditionally render this block
            <Paper sx={{
              maxHeight: 'calc(100vh - 140px)',
              overflowY: 'auto',
              p: 2,
              mb: 1,
              backgroundColor: 'rgba(20, 20, 20, 0.9)'
            }}>
              {messages.map((msg) => (
                <Box key={msg.id} sx={{textAlign: msg.sender === 'user' ? 'right' : 'left', mb: 2}}>
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
              <div ref={messagesEndRef}/>
            </Paper>
          )}
          <Box sx={{pt: 1, display: 'flex', alignItems: 'center'}}>
            <StyledTextField
              fullWidth
              variant="outlined"
              label="Type a message..."
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              multiline
              inputRef={inputRef}
              // rows={Math.max(1, input.split('\n').length)}
              InputProps={{
                style: {height: inputHeight}, // Apply the dynamic height here
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
            <Box sx={{
              width: showArrow ? 48 : 0,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Fade in={showArrow} timeout={1000} style={{position: 'absolute'}}>
                <Box sx={{visibility: showArrow ? 'visible' : 'hidden'}}>
                  {arrowDirection === 'up' ? <ArrowUpward sx={{color: 'primary.main'}}/> : null}
                  {arrowDirection === 'down' ? <ArrowDownward sx={{color: 'primary.main'}}/> : null}
                </Box>
              </Fade>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
