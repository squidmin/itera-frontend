import React from "react";
import {Box, useTheme,} from '@mui/material';
import {ChatComponent} from "../components/ChatComponent";

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  return (
    <div>
      <Box
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          color: isDarkMode ? '#e0e0e0' : '#4d4d4d',
        }}
      >
        <ChatComponent/>
      </Box>
    </div>
  );

};

export default HomePage;
