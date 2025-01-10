import React from 'react';
import { Stepper, Step, StepLabel, StepConnector, Box } from '@mui/material';
import { styled } from '@mui/system';




const StepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    zIndex: 1,
    color: '#fff',
    top: '50px',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState.active && {
        backgroundColor: '#c4534b',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    }),
    ...(ownerState.completed && {
        backgroundColor: '#c4534b',
    }),
}));

function StepIcon(props) {
    const { active, completed, className } = props;



    return (
        <StepIconRoot ownerState={{ completed, active }} className={className}>
            {props.icon}
        </StepIconRoot>
    );
}

const StepTracker = ({ currentStep }) => {

    const type = sessionStorage.getItem('type')
    var steps

    if (type === 'exist') {
        steps = ['Input KU', 'Input DC', 'Input ODP/ODCB', 'Input Kompetitor & Evidence'];
    } else if (type === 'new') {
        steps = ['Input Detail Tiang', 'Input KU', 'Input DC', 'Input ODP/ODCB', 'Input Kompetitor & Evidence']
    }

    if (type === 'new' ) {
        currentStep++
    }

    const calculateTranslateX = () => {
        const stepWidth = 150; // Lebar setiap langkah
        const totalSteps = steps.length;
        const currentIndex = currentStep;
        const stepsBeforeCurrent = currentIndex;
        const translateX = `calc(50% - ${stepWidth}px / 2 - ${stepWidth * stepsBeforeCurrent}px)`;
        return translateX;
    };

    const containerWidth = (currentStep + 1) * 269;

    return (
        <Box sx={{ width: `100vw`, overflowY: 'hidden', overflowX: 'hidden', boxSizing: 'border-box' }}>
            <Stepper
                alternativeLabel
                activeStep={currentStep}
                sx={{
                    pt: 3,
                    pb: 2,
                    transform: `translateX(${calculateTranslateX()})`,
                    // display: 'flex',
                    // justifyContent: 'space-between',
                    // overflow: 'hidden'
                }} // Translasi horizontal untuk menempatkan di tengah
                connector={<StepConnector style={{ top: '25px' }} />} // Menambahkan kelas custom-connector
                orientation="horizontal"
            >
                {steps.map((label, index) => (
                    <Step key={label}
                        sx={{
                            minWidth: '150px'
                        }}
                    >
                        <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};

export default StepTracker;
