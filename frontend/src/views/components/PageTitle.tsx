import React from 'react';
import Typography from '@mui/material/Typography';
import './PageTitle.css';

type PageTitleProps = {
  title: string;
};

const PageTitle = (props: PageTitleProps) => {
  return (
    <Typography
      variant="h4"
      component="p"
      className="PageTitle-root"
      sx={{ backgroundColor: (theme) => theme.palette.grey['500'] }}
    >
      {props.title}
    </Typography>
  );
};

export default PageTitle;
