import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import './TicketDetail.css';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';

import { useAppSelector } from '../../store';
import { useSnackbar } from 'notistack';
import { useHistory, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../../api';
import PageTitle from '../components/PageTitle';
import { trim } from 'lodash';
const renderOption = (num: number) => {
  switch (num) {
    case 0:
      return 'No';
    case 1:
      return 'Yes';
    default:
      return 'Not sure';
  }
};
type TicketDetailResponse = {
  profile: {
    diabetes: number;
    hypertension: number;
    overweight: number;
    smoking: number;
    highChlesterol: number;
  };
  symptoms: string[];
  dateOfBirth: string;
  name: string;
  email: string;
  message: string;
  gender: string;
};
const useTicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector((state) => state.user);
  const { enqueueSnackbar } = useSnackbar();
  const [ticketDetail, setTicketDetail] =
    React.useState<TicketDetailResponse | null>(null);
  React.useEffect(() => {
    api
      .get<TicketDetailResponse>(`/tickets/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => setTicketDetail(res.data))
      .catch((err) => {
        enqueueSnackbar(err.message, { variant: 'error' });
      });
  }, []);
  return ticketDetail;
};

const PatientDetailSection = (props: {
  name: string;
  dateOfBirth: string;
  email: string;
  profile: TicketDetailResponse['profile'];
  gender: string;
}) => {
  const profile = props.profile;
  const now = dayjs();
  const dob = dayjs(props.dateOfBirth, 'YYYY-MM-DD');
  console.log(now, dob, now.diff(dob));
  const age = now.diff(dob, 'year');
  return (
    <Grid container spacing={2} className="TicketDetail-spacing">
      <Grid item xs={6}>
        <Typography variant="body1">
          <b>Name: </b>
          {props.name}
        </Typography>
        <Typography variant="body1">
          <b>Age: </b>
          {age}
        </Typography>
        <Typography variant="body1">
          <b>Email: </b>
          {props.email}
        </Typography>
        <Typography variant="body1">
          <b>Gender: </b>
          {props.gender}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body1">
          <b>Overweight: </b>
          {renderOption(profile.overweight)}
        </Typography>
        <Typography variant="body1">
          <b>Diabetes: </b>
          {renderOption(profile.diabetes)}
        </Typography>
        <Typography variant="body1">
          <b>High cholesterol: </b>
          {renderOption(profile.overweight)}
        </Typography>
        <Typography variant="body1">
          <b>Hypertension: </b>
          {renderOption(profile.overweight)}
        </Typography>
        <Typography variant="body1">
          <b>Smoking: </b>
          {renderOption(profile.overweight)}
        </Typography>
      </Grid>
    </Grid>
  );
};

const DiagnosisResultSection = (props: { symptoms: string[] }) => {
  return (
    <>
      <Typography variant="h5" className="TicketDetail-spacing">
        Diagnosis Result
      </Typography>
      <Divider />
      <Grid container spacing={2} className="TicketDetail-spacing">
        <Grid item xs={12}>
          <span>Symptoms: </span>
          <ul className="TicketDetail-list">
            {props.symptoms.map((v, i) => (
              <li key={`symptom-${i}`}>{v}</li>
            ))}
          </ul>
        </Grid>
      </Grid>
    </>
  );
};

const PatientMessage = (props: { message: string }) => {
  return (
    <>
      <Typography variant="h5" className="TicketDetail-spacing">
        Patient Message
      </Typography>
      <Divider />
      <Typography variant="body1" className="TicketDetail-Message">
        {props.message}
      </Typography>
    </>
  );
};
const useResponseSection = () => {
  const token = useAppSelector((state) => state.user.token);
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams<{ id: string }>();
  const [response, setResponse] = React.useState('');
  const [error, setError] = React.useState('');

  const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setResponse(e.target.value);
  };
  const onSubmit = () => {
    const trimmed = trim(response);
    if (trimmed === '') {
      setError('Please enter a response');
      return;
    }
    api
      .post(
        `/tickets/${id}/reply`,
        { message: response },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then(() => {
        enqueueSnackbar('Reply sent', { variant: 'success' });
        history.push('/tickets');
      })
      .catch(() =>
        enqueueSnackbar('Failed to send your response', { variant: 'error' }),
      );
  };
  return { response, onChange, onSubmit, error };
};
const ResponseSection = () => {
  const { response, onChange, onSubmit, error } = useResponseSection();
  return (
    <div className="TicketDetail-spacing">
      <Typography variant="h5" className="TicketDetail-spacing">
        Response
      </Typography>
      <Divider />
      <TextField
        fullWidth
        error={!!error}
        helperText={error}
        minRows={3}
        multiline
        value={response}
        onChange={onChange}
        placeholder="Type your response here"
        className="TicketDetail-spacing"
      />
      <Button variant="contained" onClick={onSubmit}>
        SUBMIT
      </Button>
    </div>
  );
};

type LoadedTicketDetailProgressProps = {
  ticketDetail: TicketDetailResponse;
};
const LoadedTicketsDetail = (props: LoadedTicketDetailProgressProps) => {
  const { ticketDetail } = props;
  return (
    <>
      <PageTitle title="Ticket Detail" />
      <div className="tickets-container">
        <Container maxWidth="md" component={Paper}>
          <Typography variant="h5" className="TicketDetail-spacing">
            Patient Detail
          </Typography>
          <Divider />
          <PatientDetailSection
            name={ticketDetail.name}
            gender={ticketDetail.gender}
            dateOfBirth={ticketDetail.dateOfBirth}
            email={ticketDetail.email}
            profile={ticketDetail.profile}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <DiagnosisResultSection symptoms={ticketDetail.symptoms} />
            </Grid>
            <Grid item xs={6}>
              <PatientMessage message={ticketDetail.message} />
            </Grid>
            <Grid item xs={12}>
              <ResponseSection />
            </Grid>
          </Grid>
        </Container>
      </div>
    </>
  );
};
const TicketDetail = () => {
  const ticketDetail = useTicketDetail();
  return ticketDetail === null ? (
    <CircularProgress />
  ) : (
    <LoadedTicketsDetail ticketDetail={ticketDetail} />
  );
};
export default TicketDetail;
