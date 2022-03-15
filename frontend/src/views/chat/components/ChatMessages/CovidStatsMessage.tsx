import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import React from 'react';
import './CovidStatsMessage.css';
type CovidStatsProps = {
  newCases: number;
  activeCases: number;
};
const CovidFigure = (props: any) => {
  return (
    <div className="covid-figure-container">
      <Typography variant="h3" component="p" className="covid-figure-number">
        {props.figure}
      </Typography>
      <Typography variant="body1" component="p">
        {props.description}
      </Typography>
    </div>
  );
};
const CovidStats = (props: CovidStatsProps) => {
  return (
    <div>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
      >
        <CovidFigure figure={props.newCases} description={'new'} />
        <CovidFigure figure={props.activeCases} description={'active'} />
      </Stack>
    </div>
  );
};
export default CovidStats;
