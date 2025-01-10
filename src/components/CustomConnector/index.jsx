import { StepConnector } from '@mui/material';
import { styled } from '@mui/system';

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${StepConnector.alternativeLabel}`]: {
    top: '50px !important',
  },
  [`&.${StepConnector.active}`]: {
    [`& .${StepConnector.line}`]: {
      backgroundImage: 'linear-gradient( 95deg, rgb(33, 203, 243) 0%, rgb(0, 188, 212) 50%, rgb(0, 150, 136) 100%)',
    },
  },
  [`&.${StepConnector.completed}`]: {
    [`& .${StepConnector.line}`]: {
      backgroundImage: 'linear-gradient( 95deg, rgb(33, 203, 243) 0%, rgb(0, 188, 212) 50%, rgb(0, 150, 136) 100%)',
    },
  },
  [`& .${StepConnector.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

export default CustomConnector;
