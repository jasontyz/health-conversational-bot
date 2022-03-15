import React from 'react';
import PageTitle from '../components/PageTitle';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { trim } from 'lodash';
import './NewRequest.css';
import api from '../../api';
import { useAppSelector } from '../../store';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { UserTicketResponse } from '../../typings';

const useNewRequest = () => {
  const [requestText, setRequestText] = React.useState('');
  const [disabled, setDisabled] = React.useState<null | boolean>(null);
  const [error, setError] = React.useState('');
  const user = useAppSelector((state) => state.user);
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const onTextChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    setRequestText(ev.target.value);
  };
  React.useEffect(() => {
    api
      .get<UserTicketResponse>(`/users/${user.id}/ticket`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        if (res.data.ticketId === '') {
          setDisabled(false);
        } else {
          enqueueSnackbar(
            'You already have a ticket, Please dismiss it first',
            { variant: 'info' },
          );
          setDisabled(true);
        }
      })
      .catch(() =>
        enqueueSnackbar('Error fetching user ticket', { variant: 'error' }),
      );
  }, []);
  const onTextSubmit = async () => {
    const trimedText = trim(requestText);
    if (trimedText.length === 0) {
      setError('You cannot submit an empty request');
      return;
    } else {
      setError('');
    }
    api
      .post(
        '/tickets/',
        { message: trimedText, patient_id: user.id },
        { headers: { Authorization: `Bearer ${user.token}` } },
      )
      .then(() => {
        enqueueSnackbar('Request submitted successfully', {
          variant: 'success',
        });
        history.push('/');
      })
      .catch(() => {
        enqueueSnackbar('Error submitting request', {
          variant: 'error',
        });
      });
  };
  return { requestText, error, onTextChange, onTextSubmit, disabled };
};
const NewRequest = () => {
  const { requestText, error, onTextChange, onTextSubmit, disabled } =
    useNewRequest();
  return (
    <div>
      <PageTitle title="New Request" />
      <Container maxWidth="md" className="NewRequest-alert">
        {disabled === true && (
          <Alert severity="error" className="NewRequest-alert">
            You already have a ticket
          </Alert>
        )}
        <Alert severity="warning">
          Please note,by submitting, you&apos;re sharing the following data with
          the doctors
          <ul>
            <li>Personal information</li>
            <li>Email address</li>
            <li>Health profile</li>
            <li>Diagnosis result</li>
          </ul>
        </Alert>
      </Container>
      <Container component={Paper} maxWidth="md" className="NewRequest-spacing">
        <TextField
          disabled={!!disabled}
          value={requestText}
          error={error !== ''}
          helperText={error}
          onChange={onTextChange}
          multiline
          fullWidth
          minRows={3}
          className="NewRequest-spacing"
          placeholder="Please describe what you symptoms and concerns here."
        />
        <Button
          disabled={!!disabled}
          variant="contained"
          onClick={() => onTextSubmit()}
        >
          SUBMIT
        </Button>
      </Container>
    </div>
  );
};

export default NewRequest;
