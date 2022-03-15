import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import './Tickets.css';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Link from '@mui/material/Link';

import { Ticket } from '../../typings';
import api from '../../api';
import { useAppSelector } from '../../store';
import { useSnackbar } from 'notistack';
import { useHistory } from 'react-router-dom';
type TicketListResponse = { tickets: Ticket[] };

const useTicketListView = () => {
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const user = useAppSelector((state) => state.user);
  React.useEffect(() => {
    api
      .get<TicketListResponse>('/tickets/', {
        params: { doctor_id: user.id },
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => setTickets(res.data.tickets))
      .catch((err) => enqueueSnackbar(err.message, { variant: 'error' }));
  }, []);

  return tickets;
};
const TicketsListView = () => {
  const tickets = useTicketListView();
  const history = useHistory();
  return (
    <div className="tickets-container">
      <Container maxWidth="md" className="tickets-title-container">
        <Typography variant="h3">Tickets</Typography>
      </Container>
      <Container component={Paper} maxWidth="md">
        <TableContainer>
          <Table aria-lable="tickets table">
            <TableHead>
              <TableRow>
                <TableCell>Created Date</TableCell>
                <TableCell>Messasge</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((row) => (
                <TableRow key={`tickets-table-row-${row.id}`}>
                  <TableCell>{row.createdAt}</TableCell>
                  <TableCell>{row.message}</TableCell>
                  <TableCell>
                    <Link onClick={() => history.push(`/tickets/${row.id}`)}>
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </div>
  );
};

export default TicketsListView;
